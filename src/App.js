import React, { Component } from 'react';
import { withRouter, Link, Route } from 'react-router-dom'
import FDS from 'fds';

import Upload from "./components/Upload";
import Mailbox from "./components/Mailbox";
import DisclaimerSplash from "./components/DisclaimerSplash"

import FairdropLogo from "./components/Shared/svg/FairdropLogo.js"
import MailboxGlyph from "./components/Shared/svg/MailboxGlyph.js"

import './App.css';
import './lib/DMist.css';
import './lib/DDrop.css';

import {version} from '../package.json'

class App extends Component {

  getInitialState() {
    let hasNotHiddenDisclaimers = localStorage.getItem('hasHiddenDisclaimers') !== "true";

    return {
      selectedMailbox: false,
      isStoringFile: false,      
      fileIsSelected: false,
      fileWasSelected: false,
      disclaimersAreShown: hasNotHiddenDisclaimers
    };
  }

  resetMailboxState(){
    this.setState({
      selectedMailbox: false,
      isStoringFile: false,      
      fileIsSelected: false,
      fileWasSelected: false,
      fileIsSelecting: false
    });
    this.props.history.push('/');
  }

  resetFileState(){
    this.setState({
      isStoringFile: false,      
      fileIsSelected: false,
      fileWasSelected: false,
      fileIsSelecting: false
    });
  }

  constructor(props) {
    super(props);

    this.FDS = new FDS({
      swarmGateway: process.env.REACT_APP_SWARM_GATEWAY, 
      ethGateway: process.env.REACT_APP_GETH_GATEWAY, 
      faucetAddress: process.env.REACT_APP_FAUCET_URL,
      httpTimeout: 1000,
      ensConfig: {
        domain: process.env.REACT_APP_DOMAIN_NAME,
        registryAddress: process.env.REACT_APP_ENS_ADDRESS,
        fifsRegistrarContractAddress: process.env.REACT_APP_FIFS_REGISTRAR_ADDRESS,
        resolverContractAddress: process.env.REACT_APP_RESOLVER_ADDRESS
      }
    });

    this.uploadComponent = React.createRef();

    this.setSelectedMailbox = this.setSelectedMailbox.bind(this);
    this.fileWasSelected = this.fileWasSelected.bind(this);
    this.hideDisclaimer = this.hideDisclaimer.bind(this);
    this.handleSendFile = this.handleSendFile.bind(this);
    this.handleStoreFile = this.handleStoreFile.bind(this);
    this.resetFileState = this.resetFileState.bind(this);
    this.resetMailboxState = this.resetMailboxState.bind(this);

    this.state = this.getInitialState();
  }

  setSelectedMailbox(selectedMailbox){
    this.setState({selectedMailbox: selectedMailbox});
  }

  fileWasSelected(state = true){
    this.setState({fileWasSelected: state});
  }  

  handleSendFile(e){
    this.setState({isSendingFile: true});
    this.props.history.push('/');
  }

  handleStoreFile(e){
    this.setState({isStoringFile: true});
    this.props.history.push('/');
  }

  hideDisclaimer(e){
    localStorage.setItem('hasHiddenDisclaimers', true);
    this.setState({disclaimersAreShown: false});
  }

  render() {
    return (
      <div className="parent-wrapper">
        <DisclaimerSplash 
          disclaimersAreShown={this.state.disclaimersAreShown}
          hideDisclaimer={this.hideDisclaimer}
        />
        <div className={ "wrapper " + ((this.state.fileIsSelecting || this.props.location.pathname === '/mailbox') ? "nav-black white" : "nav-white green")}>
          <div className="nav-header">
            <div className="nav-header-item-left">
              <Link to={"/"}>
                <FairdropLogo/>
              </Link>
              <span className="version-number">{version}</span>
            </div>
            {this.state.fileWasSelected === false && this.props.location.pathname === '/mailbox' &&
              <div className="nav-header-item-left">
                <button className="nav-header-item-button" onClick={this.handleStoreFile} >
                  Store File
                </button>
              </div>
            }
            {this.state.fileWasSelected === false && this.props.location.pathname === '/mailbox' && 
              <div className="nav-header-item-left">
                <button className="nav-header-item-button" onClick={this.handleSendFile} >
                  Send File
                </button>                
              </div>
            }


            <div className="nav-header-item-right">
              <Link className="nav-key" to={'mailbox'}>
                <MailboxGlyph/> 
              </Link>                
            </div>
            {this.state.selectedMailbox.subdomain && 
              <div className="nav-header-item-right">
                <button className="nav-header-item-button nav-header-sign-out" onClick={this.resetMailboxState}>
                  (Sign Out)
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

  
          <Route exact={true} path="/" render={ () => {
              return <Upload 
                FDS={this.FDS}
                setSelectedMailbox={this.setSelectedMailbox}
                selectedMailbox={this.state.selectedMailbox}
                fileWasSelected={this.fileWasSelected} 
                isSendingFile={this.state.isSendingFile}
                isStoringFile={this.state.isStoringFile}
                resetFileState={this.resetFileState}
                ref={this.uploadComponent} 
              />
            }
          }/>

          <Route path="/mailbox" render={() => {
              return <Mailbox 
                FDS={this.FDS}              
                setSelectedMailbox={this.setSelectedMailbox}
                selectedMailbox={this.state.selectedMailbox}
              />
            }
          }/>
  
        </div>
      </div>
    );
  }
}

export default withRouter(App);