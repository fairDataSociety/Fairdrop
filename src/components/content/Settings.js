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
import {notificationPermission} from '../../lib/FDSNotify.js';
import QRCode from 'qrcode.react';
import Utils from '../../services/Utils';

class Settings extends Component{

  constructor(props){
    super(props);
    
    // console.log(props)

    this.togglePinFiles = this.togglePinFiles.bind(this);

    this.state = {
      storedFilesArePinned: false
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
    return Utils.formatBalance(this.props.selectedMailboxBalance)
  }

  togglePinFiles(){
    this.setState({storedFilesArePinned: !this.state.storedFilesArePinned});
  }

  render(){
    return (
      <div className="content-outer content-fds">
        <div className="content-inner">
          <div className="content-header">
            <div className="settings-inner">
            {this.props.selectedMailbox && 
              <div className="settings-inner">
                <h1>Mailbox Settings</h1>
                <div className="settings-form-group">
                  <label>Address</label>
                  <div>
                    <input className="mailbox-address-input" type="text" value={this.mailboxAddress()}/>
                    <div onClick={this.handleCopyGatewayLink} className="settings-copy-address">Copy</div>
                  </div>
                </div>
                <div className="settings-form-group">
                  <label>QR Code Address</label>
                  <QRCode value={'fds://'+this.mailboxAddress()} />
                </div>
                <div className="settings-form-group">
                  <label>Balance</label>
                  <div className="settings-inner-content">{this.balance()}</div>
                </div>
                <div className="settings-form-group">
                  <label>Storage Provider</label>
                  <Dropdown
                    options={["FDS EUROPA POOL (1)"]}
                    value={"FDS EUROPA POOL (1)"}
                    placeholder="Select a mailbox"
                  />
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
                  <label>Opt in for Analytics</label>
                  <Switch onChange={this.handleChangeAnalytics} checked={this.props.savedAppState.analytics} />
                </div>
                <div className="settings-form-group">
                  <label>Opt in for Pin Files</label>
                  <Switch onChange={this.handleChangePinFiles} checked={this.props.savedAppState.pinFiles} />
                </div>
                <div className="settings-form-group">
                  <label>Opt in for Honest Inbox</label>
                  <Switch onChange={this.handleChangeHonestInbox} checked={this.props.savedAppState.honestInbox} />
                </div>

              </div>
            }
            {/*
            <p>
              {this.state.storedFilesArePinned ? "Stored Files are Pinned" : "Stored Files are not Pinned"}
            </p>
            <p>
              <button onClick={this.togglePinFiles}>
                {this.state.storedFilesArePinned ? "Unpin" : "Pin"}
              </button>
            </p>
          */}
          </div>
          <div className="content-text">
	        <QRCode value="http://facebook.github.io/react/" />
            <p>
              Imagine a society of a completely private digital life where your privacy is not weaponised against you just to sell you more things.
            </p>
          </div>
        </div>
      </div>
    )
  }
}

export default Settings;
