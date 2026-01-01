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
import Utils from '../services/Utils';

// Simple user icon SVG
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', position: 'relative', top: '2px', opacity: 0.7}}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// X (formerly Twitter) icon
const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

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

  balance(){
    return Utils.formatBalance(this.props.selectedMailboxBalance);
  }

  closeAll(){
    let promises = [
      this.refs.about.closeItem(true)
    ]
    return Promise.all(promises);
  }

  resetMailboxState(){
    this.toggleMenu();
    this.props.resetMailboxState();
  }

  render(props){
    const isLoggedIn = this.props.selectedMailbox && this.props.selectedMailbox.subdomain;

    return <div className={'menu-wrapper ' + (this.state.isShown ? 'menuShown ' : '') + (this.state.screenIsShown ? 'showScreen ' : '') + (this.state.screenIsFadedIn ? 'fadeInScreen ' : '')}>
      {this.props.isRendered === true &&
        <div>
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
              {/* Login (not logged in) */}
              {!isLoggedIn &&
                <div className={"menu-section"}>
                  <div
                    className="menu-item-header"
                    onClick={()=>{this.props.handleNavigateTo('/mailbox')}}
                  >
                    Login &gt;
                  </div>
                </div>
              }
              {!isLoggedIn && <div className="menu-separator"></div>}

              {/* Actions */}
              <div className={"menu-section"}>
                <div
                  className="menu-item-header"
                  onClick={() => { this.toggleMenu(); this.props.handleSendFile(); }}
                >
                  Send Encrypted
                </div>
              </div>
              <div className={"menu-section"}>
                <div
                  className="menu-item-header"
                  onClick={() => { this.toggleMenu(); this.props.handleStoreFile(); }}
                >
                  Store File
                </div>
              </div>
              <div className={"menu-section"}>
                <div
                  className="menu-item-header"
                  onClick={() => { this.toggleMenu(); this.props.handleQuickFile(); }}
                >
                  Quick Share
                </div>
              </div>

              {/* Mailbox Views (logged in only) */}
              {isLoggedIn && <div className="menu-separator"></div>}
              {isLoggedIn &&
                <div className={"menu-section"}>
                  <div
                    className="menu-item-header"
                    onClick={() => { this.toggleMenu(); this.props.handleNavigateTo('/mailbox/received'); }}
                  >
                    Inbox
                  </div>
                </div>
              }
              {isLoggedIn &&
                <div className={"menu-section"}>
                  <div
                    className="menu-item-header"
                    onClick={() => { this.toggleMenu(); this.props.handleNavigateTo('/mailbox/sent'); }}
                  >
                    Sent
                  </div>
                </div>
              }
              {isLoggedIn &&
                <div className={"menu-section"}>
                  <div
                    className="menu-item-header"
                    onClick={() => { this.toggleMenu(); this.props.handleNavigateTo('/mailbox/stored'); }}
                  >
                    Stored
                  </div>
                </div>
              }

              {/* Settings (logged in only) */}
              {isLoggedIn && <div className="menu-separator"></div>}
              {isLoggedIn &&
                <div className={"menu-section"}>
                  <div
                    className="menu-item-header"
                    onClick={() => { this.toggleMenu(); this.props.showContent('Settings'); }}
                  >
                    Settings
                  </div>
                </div>
              }

              <div className="menu-separator"></div>

              {/* About */}
              <MenuItem
                header="About >"
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

              {/* User & Log Out (logged in only) */}
              {isLoggedIn && <div className="menu-separator"></div>}
              {isLoggedIn &&
                <div className={"menu-section"}>
                  <div
                    className="menu-item-header logged-in"
                    onClick={()=>{this.props.showContent('Settings')}}
                  >
                    <UserIcon />{this.props.selectedMailbox.subdomain} ({this.balance()})
                  </div>
                </div>
              }
              {isLoggedIn &&
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
              <div className="menu-footer-item"><a rel="noopener noreferrer" target="_blank" href="https://x.com/DataFundProject"><XIcon /></a></div>
              <div className="menu-footer-item"><a rel="noopener noreferrer" target="_blank" href="https://datafund.io"><img alt="datafund logo" src={this.props.appRoot + "/assets/images/datafund-footer-logo.svg"}/></a></div>
            </div>
          </div>
        </div>
      }
    </div>
  }
}

export default App;
