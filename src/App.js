// Copyright 2019 The FairDataSociety Authors
// This file is part of the FairDataSociety library.
//
// The FairDataSociety library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The FairDataSociety library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the FairDataSociety library. If not, see <http://www.gnu.org/licenses/>.

import React, { Component } from 'react';
import { withRouter, Link, Route } from 'react-router-dom'
import FDS from 'fds.js';
import JSZip from 'jszip';
import FileSaver from 'filesaver.js';
import Upload from "./components/Upload";
import Mailbox from "./components/Mailbox";
import DisclaimerSplash from "./components/DisclaimerSplash"
import Menu from "./components/Menu"
import Content from "./components/Content"

import FairdropLogo from "./components/Shared/svg/FairdropLogo.js"
import MailboxGlyph from "./components/Shared/svg/MailboxGlyph.js"

import './App.css';
import './lib/DMist.css';
import './lib/DDrop.css';

import {version} from '../package.json';

class App extends Component {

  getInitialState() {
    let hasNotHiddenDisclaimers = localStorage.getItem('hasHiddenDisclaimers') !== "true";

    return {
      navState: true,
      selectedMailbox: false,
      isStoringFile: false,
      isSendingFile: false,
      isQuickFile: false,
      fileIsSelected: false,
      fileWasSelected: false,
      fileIsSelecting: false,
      disclaimersAreShown: hasNotHiddenDisclaimers,
      menuState: false,
      appRoot: this.props.appRoot
    };
  }

  resetMailboxState(){
    this.setState({
      selectedMailbox: false,
      isStoringFile: false,
      isSendingFile: false,
      isQuickFile: false,
      fileIsSelected: false,
      fileWasSelected: false,
      fileIsSelecting: false
    });
    this.props.history.push('/');
  }

  resetFileState(){
    this.setState({
      isStoringFile: false,
      isSendingFile: false,
      isQuickFile: false,
      fileIsSelected: false,
      fileWasSelected: false,
      fileIsSelecting: false
    });
  }

  constructor(props) {
    super(props);

    let config = {
      tokenName: 'gas',      
      swarmGateway: process.env.REACT_APP_SWARM_GATEWAY,
      ethGateway: process.env.REACT_APP_GETH_GATEWAY,
      faucetAddress: process.env.REACT_APP_FAUCET_URL,
      chainID: process.env.REACT_APP_CHAIN_ID,
      httpTimeout: 1000,
      gasPrice: 0.1, //gwei
      ensConfig: {
        domain: process.env.REACT_APP_DOMAIN_NAME,
        registryAddress: process.env.REACT_APP_ENS_ADDRESS,
        subdomainRegistrarAddress: process.env.REACT_APP_FIFS_REGISTRAR_ADDRESS,
        resolverContractAddress: process.env.REACT_APP_RESOLVER_ADDRESS
      }
    };

    this.FDS = new FDS(config);

    window.FDS = this.FDS;

    this.uploadComponent = React.createRef();
    this.importMailboxInput = React.createRef();
    this.contentComponent = React.createRef();

    this.setSelectedMailbox = this.setSelectedMailbox.bind(this);
    this.fileWasSelected = this.fileWasSelected.bind(this);
    this.hideDisclaimer = this.hideDisclaimer.bind(this);
    this.handleSendFile = this.handleSendFile.bind(this);
    this.handleStoreFile = this.handleStoreFile.bind(this);
    this.handleQuickFile = this.handleQuickFile.bind(this);
    this.resetFileState = this.resetFileState.bind(this);
    this.resetMailboxState = this.resetMailboxState.bind(this);
    this.handleNavigateTo = this.handleNavigateTo.bind(this);
    this.exportMailboxes = this.exportMailboxes.bind(this);
    this.importMailbox = this.importMailbox.bind(this);
    this.showContent = this.showContent.bind(this);
    this.toggleContent = this.toggleContent.bind(this);
    this.setFileIsSelecting = this.setFileIsSelecting.bind(this);
    this.disableNav = this.disableNav.bind(this);
    this.enableNav = this.enableNav.bind(this);

    this.state = this.getInitialState();

  }

  unlockMailboxWallet(subdomain, password){
    this.FDS.UnlockAccount(subdomain, password).then((account)=>{
      this.setState({
        feedbackMessage: 'Mailbox unlocked.',
        mailboxIsUnlocked: true,
      });
      this.props.mailboxUnlocked();
      this.props.setSelectedMailbox(this.FDS.currentAccount);
    }).catch((error)=>{
      this.setState({
        feedbackMessage: 'Password invalid, please try again.',
        mailboxIsUnlocked: false
      });
    });
  }

  setSelectedMailbox(selectedMailbox){
    this.setState({selectedMailbox: selectedMailbox});
  }

  setFileIsSelecting(state = true){
    this.setState({fileIsSelecting: state});    
  }

  fileWasSelected(state = true){
    this.setState({fileWasSelected: state});
  }

  handleSendFile(e){
    this.setState({isSendingFile: true});
    this.props.history.push('/');
    if(this.uploadComponent.current){
      this.uploadComponent.current.resetToInitialState();
      this.uploadComponent.current.aSelectFile.current.handleClickSelectFile();
    }
  }

  handleStoreFile(e){
    this.setState({isStoringFile: true});
    this.props.history.push('/');
    if(this.uploadComponent.current){
      this.uploadComponent.current.resetToInitialState();
      this.uploadComponent.current.aSelectFile.current.handleClickStoreFile();
    }
  }

  handleQuickFile(e){
    this.setState({isQuickFile: true});
    this.props.history.push('/');
    if(this.uploadComponent.current){
      this.uploadComponent.current.resetToInitialState();
      this.uploadComponent.current.aSelectFile.current.handleClickQuickFile();
    }
  }

  hideDisclaimer(e){
    localStorage.setItem('hasHiddenDisclaimers', true);
    this.setState({disclaimersAreShown: false});
  }

  importMailbox(e){
    this.importMailboxInput.current.click();
  }

  handleImportMailbox(e){
    if(e.target.files.length === 1){
      let file = e.target.files[0];
      this.FDS.RestoreAccount(file).then((o)=>{
        alert('Import successful!');
        window.location.reload();
      }).catch((e)=>{
        alert('Sorry, there was an error - please try again!');
      });
    }
  }

  handleNavigateTo(url){
    this.props.history.push(this.state.appRoot + url);
  }

  toggleContent(forceOpen){
    this.contentComponent.current.toggleContent(forceOpen);
  }

  showContent(type){
    this.toggleContent(true);
    this.setState({displayContent: false});
    this.setState({displayedContent: type});
    setTimeout(()=>{
      this.setState({displayContent: true});
    }, 1000);
  }

  exportMailboxes(){
    let zip = new JSZip();
    let accounts = this.FDS.GetAccounts();
    for (var i = accounts.length - 1; i >= 0; i--) {
      var file = accounts[i].getBackup();
      zip.file(file.name, file.data);
    }
    zip.generateAsync({type:"blob"})
    .then(function(content) {
        FileSaver.saveAs(content, "fairdrop-mailboxes.zip");
    });
  }

  enableNav(e){
    this.setState({navState: true});
  }

  disableNav(e){
    this.setState({navState: false});
  }  

  render() {
    return (
      <div>
        <div className="mobile-soon-overlay">
          <img alt="Fairdrop Logo" src={this.props.appRoot+"/assets/images/fairdrop-logo.svg"}/>
          Mobile version coming soon.
        </div>
        <div
          className={
          "parent-wrapper "+ 
          + (this.state.disclaimersAreShown ? "disclaimers-shown" : "")
          + (this.state.menuState ? "menu-shown " : "")
          + ((this.props.location.pathname.substring(0,8) === '/mailbox') ? "nav-black white " : " nav-white red ")
          + (this.state.fileIsSelecting ? "is-selecting" : "")
          }
        >
          <DisclaimerSplash
            disclaimersAreShown={this.state.disclaimersAreShown}
            hideDisclaimer={this.hideDisclaimer}
          />
          <Menu
            isShown={false}
            menuToggled={(s)=>{this.setState({menuState: s})}}
            handleSendFile={this.handleSendFile}
            handleStoreFile={this.handleStoreFile}
            handleQuickFile={this.handleQuickFile}
            handleNavigateTo={this.handleNavigateTo}
            exportMailboxes={this.exportMailboxes}
            importMailbox={this.importMailbox}
            appRoot={this.state.appRoot}
            toggleContent={this.toggleContent}
            showContent={this.showContent}
            disableNav={this.disableNav}
            enableNav={this.enableNav}
          />
          <Content
            isShown={false}
            displayedContent={this.state.displayedContent}
            displayContent={this.state.displayContent}
            handleNavigateTo={this.handleNavigateTo}
            appRoot={this.state.appRoot}
            ref={this.contentComponent}
          />
          <div 
            className={ 
              "wrapper " 
              + ((this.props.location.pathname.substring(0,8) === '/mailbox') ? " nav-black white" : "nav-white green")
              + (this.state.navState ? " nav-enabled" : " nav-disabled")
            } 
            onDragOver={this.disableNav}
            onDragEnter={this.disableNav}
            onDragEnd={this.enableNav}
            onDragExit={this.enableNav}
          >
            <div className="nav-header">
              <div className="nav-header-item-left">
                <div className="nav-header-spacer"></div>
              </div>
              <div className="nav-header-item-left">
                <Link to={"/"}>
                  <FairdropLogo/>
                </Link>
              </div>
              <div className="nav-header-item-left">
                <div className="version-number">{version} {process.env.REACT_APP_ENV_NAME !== 'production' ? `- ${process.env.REACT_APP_ENV_NAME}` : ""}</div>
              </div>

              <div className="nav-header-item-right">
                <Link className="nav-key" to={'/mailbox'}>
                  <MailboxGlyph/>
                </Link>
              </div>
              {this.state.selectedMailbox.subdomain &&
                <div className="nav-header-item-right">
                  <button className="nav-header-item-button nav-header-sign-out" onClick={this.resetMailboxState}>
                    Log out
                  </button>
                </div>
              }
              {this.state.selectedMailbox.subdomain &&
                <div className="nav-header-item-right">
                  <Link className="nav-context" to={'mailbox'}>
                    {this.state.selectedMailbox.subdomain}
                  </Link>
                </div>
              }
            </div>
    
            <Route exact={true} path={"/"} render={ () => {
                return <Upload 
                  FDS={this.FDS}
                  unlockMailboxWallet={this.unlockMailboxWallet}
                  selectedMailbox={this.state.selectedMailbox}
                  setSelectedMailbox={this.setSelectedMailbox}
                  fileWasSelected={this.fileWasSelected}
                  fileIsSelecting={this.state.fileIsSelecting}
                  setFileIsSelecting={this.setFileIsSelecting}
                  isSendingFile={this.state.isSendingFile}
                  isStoringFile={this.state.isStoringFile}
                  isQuickFile={this.state.isQuickFile}
                  resetFileState={this.resetFileState}
                  appRoot={this.state.appRoot}
                  ref={this.uploadComponent}
                />
              }
            }/>

            <Route path={"/mailbox" || "/mailbox/:filter"} render={(routerArgs) => {
                return <Mailbox
                  FDS={this.FDS}
                  unlockMailboxWallet={this.unlockMailboxWallet}
                  setSelectedMailbox={this.setSelectedMailbox}
                  selectedMailbox={this.state.selectedMailbox}
                  routerArgs={routerArgs}
                  appRoot={this.state.appRoot}
                />
              }
            }/>

            <input
              ref={this.importMailboxInput}
              style={{display:"none"}}
              type="file"
              onChange={this.handleImportMailbox.bind(this)}
            />

          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(App);
