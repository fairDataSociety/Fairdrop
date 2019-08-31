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
import MenuItem from './MenuItem';

class App extends Component {

  constructor(props){
    super(props);

    this.state = {
      isShown: false,
      screenIsShown: false,
      screenIsFadedIn: false,
      debouncingToggle: false
    };

  }

  debounceToggle(){
    if(this.state.debouncingToggle === true){
      return true;
    }
    this.setState({'debouncingToggle': true});
    setTimeout(()=>{
      this.setState({'debouncingToggle': false});
    }, 1000);
    return false;
  }

  toggleMenu(){
    if(this.debounceToggle()){
      return false;
    }

    if(this.state.isShown){
      //hide content
        this.props.toggleContent(false);
      //hide
      this.setState({
        isShown: false,
        screenIsFadedIn: false
      },()=>{
        setTimeout(()=>{
          this.setState({screenIsShown: false});
        }, 1000);
      });
    }else{
      //show
      this.setState({
        isShown: true,
        screenIsShown: true
      },()=>{
        setTimeout(()=>{
          this.setState({screenIsFadedIn: true});
        }, 100);
      });
    }
  }

  closeAll(){
    let promises = [
      this.refs.send.closeItem(true),
      this.refs.myFiles.closeItem(true),
      this.refs.settings.closeItem(true),
      this.refs.about.closeItem(true)
    ]
    return Promise.all(promises);
  }

  resetMailboxState(){
    this.toggleMenu();
    this.props.resetMailboxState();
  }

  render(props){
    return <div className={'menu-wrapper ' + (this.state.isShown ? 'menuShown ' : '') + (this.state.screenIsShown ? 'showScreen ' : '') + (this.state.screenIsFadedIn ? 'fadeInScreen ' : '')}>
      <div 
        className="menu-toggle"
        onDragOver={this.props.disableNav}
        onDragEnter={this.props.disableNav}
        onDragEnd={this.props.enableNav}
        onDragExit={this.props.enableNav}
      >
        <button className={ "hamburger hamburger--spin " + (this.state.isShown === true ? "is-active" : "") } type="button" onClick={this.toggleMenu.bind(this)}>
          <span className="hamburger-box">
            <span className="hamburger-inner"></span>
          </span>
        </button>
      </div>
      <div className={"menu-background-screen"} onClick={this.toggleMenu.bind(this)}></div>
      <div
        className={"menu " + (this.state.isShown === false ? '' : 'show')}>
        <div className="menu-header">
          <img alt="fairdrop logo" src={this.props.appRoot+"/assets/images/fairdrop-logo.svg"}/>
        </div>
        <div className="menu-main">
          <MenuItem
            header="Upload"
            items={[
                    ['Store', this.props.handleStoreFile],
                    ['Send', this.props.handleSendFile],
                    ['Quick (Unencrypted)', this.props.handleQuickFile]
                  ]}
            closeAll={this.closeAll.bind(this)}
            toggleMenu={this.toggleMenu.bind(this)}
            ref={'send'}
          />
          <MenuItem
            header="My Files"
            items={[
                    ['Inbox', ()=>{this.props.handleNavigateTo('/mailbox/recieved')}],
                    ['Sent Files', ()=>{this.props.handleNavigateTo('/mailbox/sent')}],
                    ['Stored Files', ()=>{this.props.handleNavigateTo('/mailbox/stored')}]
                  ]}
            closeAll={this.closeAll.bind(this)}
            toggleMenu={this.toggleMenu.bind(this)}
            ref={'myFiles'}
          />
          <MenuItem
            header="Settings"
            items={[
                    ['Import Mailbox', this.props.importMailbox],
                    ['Export Mailboxes', this.props.exportMailboxes],
                    ['Export Legacy Mailboxes', this.props.exportLegacyMailboxes]
                    // ,
                    // ['Pro Mode', (c)=>{console.log(c)}]
                  ]}
            closeAll={this.closeAll.bind(this)}
            toggleMenu={this.toggleMenu.bind(this)}
            ref={'settings'}
          />
          <MenuItem
            header="About"
            items={[
                    ['About Fairdrop', ()=>{this.props.showContent('AboutFairdrop')}],
                    ['About Fair Data Society', ()=>{this.props.showContent('AboutFDS')}],
                    ['FAQs', ()=>{this.props.showContent('FAQ')}],
                    ['Terms of Usage', ()=>{this.props.showContent('Terms')}],
                    ['Bug Disclosure', ()=>{window.open('https://github.com/fairDataSociety/vulnerability-disclosure-policy')}]
                  ]}
            closeAll={this.closeAll.bind(this)}
            toggleMenu={()=>{}}
            ref={'about'}
          /> 
          {this.props.selectedMailbox.subdomain &&
            <div className={"menu-section"}>
              <div
                className="menu-item-header"
                onClick={this.resetMailboxState.bind(this)}
              >
                  Log Out
              </div>
            </div>
          }
        </div>

        <div className="menu-footer">
          <div className="menu-footer-item"><a rel="noopener noreferrer" target="_blank" href="https://github.com/fairDataSociety"><img alt="github logo" src={this.props.appRoot + "/assets/images/github-logo.svg"}/></a></div>
          <div className="menu-footer-item"><a rel="noopener noreferrer" target="_blank" href="https://twitter.com/DataFundProject"><img alt="twitter logo" src={this.props.appRoot + "/assets/images/twitter-logo.svg"}/></a></div>
          <div className="menu-footer-item"><a rel="noopener noreferrer" target="_blank" href="https://gitter.im/fairdatasociety/community"><img alt="gitter logo" src={this.props.appRoot + "/assets/images/gitter-logo.svg"}/></a></div>
          <div className="menu-footer-item"><a rel="noopener noreferrer" target="_blank" href="https://datafund.io"><img alt="datafund logo" src={this.props.appRoot + "/assets/images/datafund-footer-logo.svg"}/></a></div>
          <div className="menu-footer-item"><a rel="noopener noreferrer" target="_blank" href="https://riot.im/app/#/room/#fairdatasociety:matrix.org"><img alt="riot logo" src={this.props.appRoot + "/assets/images/riot-logo.svg"}/></a></div>
        </div>
      </div>
    </div>
  }
}

export default App;
