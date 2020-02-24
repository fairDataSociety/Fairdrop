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
import QRCode from 'qrcode.react';
import Utils from '../../services/Utils';
import Dropdown from 'react-dropdown';
import Switch from "react-switch";


//deal with xbrowser copy paste issues
var ua = window.navigator.userAgent;
var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
var webkit = !!ua.match(/WebKit/i);
var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

class Settings extends Component{

  constructor(props){
    super(props);
    
    this.state = {
      storedFilesArePinned: false,
      analyticsState: this.analyticsState()
    }
    
    this.handleChangeAnalytics = this.handleChangeAnalytics.bind(this);
    this.handleChangePinFiles = this.handleChangePinFiles.bind(this);
    this.handleChangeHonestInbox = this.handleChangeHonestInbox.bind(this);

  }

  handleCopyGatewayLink(){

    if(iOSSafari){
      var el = document.querySelector(".mailbox-address-input");
      var oldContentEditable = el.contentEditable,
          oldReadOnly = el.readOnly,
          range = document.createRange();

      el.contentEditable = true;
      el.readOnly = false;
      range.selectNodeContents(el);

      var s = window.getSelection();
      s.removeAllRanges();
      s.addRange(range);

      el.setSelectionRange(0, 999999); // A big number, to cover anything that could be inside the element.

      el.contentEditable = oldContentEditable;
      el.readOnly = oldReadOnly;

      document.execCommand('copy');
    }else{
      var copyText = document.querySelector(".mailbox-address-input");
      copyText.select();
      document.execCommand("copy");
    }
  }  

  fileSize(){
    if(this.props.savedAppState.totalStoredSize){
      return Utils.humanFileSize(this.props.savedAppState.totalStoredSize);
    }else{
      return " - "
    }
  }

  pinnedFileSize(){
    if(this.props.savedAppState.totalPinnedSize){
      return Utils.humanFileSize(this.props.savedAppState.totalPinnedSize);
    }else{
      return " - "
    }
  }

  pinnedTimeRemaining(){
    if(this.props.savedAppState.pinnedTimeRemainingInSecs){
      return Utils.humanTime(this.props.savedAppState.pinnedTimeRemainingInSecs);
    }else{
      return " - "
    }
  }

  mailboxAddress(){
    return this.props.selectedMailbox.address;
  }

  balance(){
    if(this.props.selectedMailboxWarrantBalance){
      return Utils.formatBalance(this.props.selectedMailboxWarrantBalance);
    }else{
      return " - "
    }
  }

  handleChangeAnalytics(input){
    if(input === true){
      this.props.initSentry();
    }else{
      window.Sentry = undefined;
    }
    localStorage.setItem('sentryEnabled', input);
    this.setState({analyticsState: input});
  }

  analyticsState(){
    let state = localStorage.getItem('sentryEnabled') === "true";

    return state;
  }

  handleChangePinFiles(input){
    this.props.saveAppState({
      pinFiles: input
    });
  }

  handleChangeHonestInbox(input){
    this.props.saveAppState({
      honestInbox: input
    });
  }


  render(){
    return (
      <div className="content-outer content-settings">
        <div className="settings-outer">
            <button className={ "close-settings hamburger hamburger--spin is-active" } type="button" onClick={()=>{this.props.toggleContent(false)}}>
              <span className="hamburger-box">
                <span className="hamburger-inner"></span>
              </span>
            </button>
        </div>
        <div className="content-inner">
          <div className="content-text">
            {this.props.selectedMailbox && 
              <div className="settings-inner">
                <h1>Mailbox Settings</h1>
                <div className="settings-form-group">
                  <label>Mailbox Name</label>
                  <div>
                   <h2>{this.props.selectedMailbox.subdomain}</h2>
                  </div>
                </div>
                <div className="settings-form-group address-input">
                  <label>Address</label>
                  <div className="settings-form-address-input">
                    <input className="mailbox-address-input" type="text" value={this.mailboxAddress()}/>
                    <div onClick={this.handleCopyGatewayLink} className="settings-copy-address">Copy</div>
                  </div>
                </div>
                <div className="settings-form-group hide-mobile">
                  <label>QR Code Address</label>
                  <QRCode value={'fds://'+this.mailboxAddress()} />
                </div>
                <div className="settings-form-group settings-balance">
                  <label>Balance</label>
                  <input className="mailbox-balance-input" type="text" value={this.balance()}/>
                  <div className="settings-get-more">Get More</div>
                </div>
                <div className="settings-form-group storage-provider">
                  <label>Storage Provider</label>
                  <div className="settings-dropdown-wrapper">
                    <Dropdown
                      options={["DATAFUND (1)"]}
                      value={"DATAFUND (1)"}
                      placeholder="Select a mailbox"
                      readOnly
                    />
                  </div>
                </div>
                <div className="settings-form-group">
                  <label>Stored Currently</label>
                  <div className="settings-inner-content">{this.fileSize()}({this.pinnedFileSize()})</div>
                </div>
                <div className="settings-form-group">
                  <label>Stored Time Remaining</label>
                  <div className="settings-inner-content">{this.pinnedTimeRemaining()}</div>
                </div>
                <div className="settings-form-group">
                  <label>Analytics</label>
                  <Switch onChange={this.handleChangeAnalytics} checked={this.state.analyticsState} />
                </div>
                <div className="settings-form-group">
                  <label>Pin Files</label>
                  <Switch onChange={this.handleChangePinFiles} checked={this.props.savedAppState.pinFiles} />
                </div>
                <div className="settings-form-group">
                  <label>Honest Inbox</label>
                  <Switch onChange={this.handleChangeHonestInbox} checked={this.props.savedAppState.honestInbox} />
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

export default Settings;
