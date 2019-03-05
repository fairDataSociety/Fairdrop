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

import Dropdown from 'react-dropdown';

import DMist from '../lib/DMist';
import Utils from '../services/Utils';

import UnlockMailbox from './Shared/UnlockMailbox'
import AddMailbox from './Shared/AddMailbox'

import Moment from 'moment';


class Mailbox extends Component{

  componentDidMount(){
    let dm = new DMist();
    // dm.mist('mist');
  }

  getInitialState(){
    this.FDS = this.props.FDS;
    let mailboxes = this.FDS.GetAccounts();

    if(this.props.selectedMailbox){

        switch(this.props.routerArgs.match.params.filter){
          case 'sent':
            this.showSent();
          break;
          case 'stored':
            this.showStored();
          break;
          default:
            this.showReceived();
          break;
        }

        return {
          unlockingMailbox: null,
          uiState: 1,
          shownMessages: [],

          isAddingMailbox: false,
          isUnlockingMailbox: false,
          mailboxes: mailboxes,
          activeMailboxSubDomain: this.props.selectedMailbox.subdomain,
          dropDownValue: false,
          mailboxesExist: true,
          checkingAvailability: false,
          feedbackMessage: '',
        mailboxName: false,
        passwordsValid: false
        };
    }else
    if(mailboxes.length === 0){
      return {
        unlockingMailbox: null,
        uiState: 0,
        shownMessages: [],

        isAddingMailbox: true,
        isUnlockingMailbox: false,
        mailboxes: mailboxes,
        activeMailboxSubDomain: false,
        dropDownValue: false,
        mailboxesExist: false,
        checkingAvailability: false,
        feedbackMessage: '',
        mailboxName: false,
        passwordsValid: false
      };
    }else
    if(mailboxes.length > 0){
      return {
        uiState: 0,
        shownMessages: [],

        isAddingMailbox: false,
        isUnlockingMailbox: true,
        mailboxes: mailboxes,
        unlockingMailbox: mailboxes[0].subdomain,
        activeMailboxSubDomain: false,
        dropDownValue: mailboxes[0].subdomain,
        mailboxesExist: true,
        checkingAvailability: false,
        feedbackMessage: '',
        mailboxName: false,
        passwordsValid: false
      };
    }
  }

  resetToInitialState(){
    this.setState(this.getInitialState());
  }

  constructor(props) {
    super(props);

    this.handleSelectMailbox = this.handleSelectMailbox.bind(this);
    this.showReceived = this.showReceived.bind(this);
    this.showSent = this.showSent.bind(this);
    this.showStored = this.showStored.bind(this);

    this.state = this.getInitialState();
  }

  handleSelectMailbox(option){
    if(option.value === 'new-mailbox'){
      this.addMailbox();
    }else{
      this.setUnlockingMailbox(option.value);
    }
  }

  setUnlockingMailbox(subdomain){
    this.setState({
      unlockingMailbox: subdomain,
      isUnlockingMailbox: true,
      isAddingMailbox: false,
      dropDownValue: subdomain
    });
  }

  setSelectedMailbox(account){
    this.props.setSelectedMailbox(account);
    this.showReceived();
  }

  showSent(){
    this.FDS.currentAccount.messages('sent').then((messages)=>{
      this.setState({
        shownMessageType: 'sent',
        shownMessages: messages
      });
    });
  }

  showReceived(){
    this.FDS.currentAccount.messages('received').then((messages)=>{
      this.setState({
        shownMessageType: 'received',
        shownMessages: messages
      });
    });
  }

  showStored(){
    this.FDS.currentAccount.stored().then((messages)=>{
      this.setState({
        shownMessageType: 'stored',
        shownMessages: messages
      });
    });
  }

  retrieveSentFile(message){
    message.saveAs();
  }

  retrieveStoredFile(file){
    file.saveAs();
  }

  mailboxUnlocked(){
    this.FDS.currentAccount.messages('received').then((messages)=>{
      this.setState({
        uiState: 1,
        shownMessageType: 'received',
        shownMessages: messages
      });
    });
  }

  getDropDownOptions(){
    return this.state.mailboxes.map((m)=>{
      return {label: m.subdomain, value:  m.subdomain};
    }).concat({label: 'new mailbox +', value: "new-mailbox" });
  }

  addMailbox(){
    this.setState({
      isAddingMailbox: true,
      isUnlockingMailbox: false
    });
  }

  unlockMailbox(e){
    let subdomain = this.state.unlockingMailbox;
    let password = this.state.password;
    this.FDS.UnlockAccount(subdomain, password).then((account)=>{
      this.setState({
        feedbackMessage: 'Mailbox unlocked.',
        mailboxIsUnlocked: true,
      });
      this.mailboxUnlocked();
      this.setSelectedMailbox(this.FDS.currentAccount);
    }).catch((error)=>{
      this.setState({
        feedbackMessage: 'Password invalid, please try again.',
        mailboxIsUnlocked: false
      });
    });
  }

  handleAddMailbox(e){
    e.preventDefault();

    if(this.state.mailboxName === false){
      this.processMailboxName();
      return false;
    }
    if(this.state.passwordsValid === false){
      this.processMailboxPassword();
      return false;
    }

    this.FDS.CreateAccount(this.state.mailboxName, this.state.password, (message) => {
      this.setState({feedbackMessage: message});
    }).then((account)=>{
      this.FDS.UnlockAccount(this.state.mailboxName, this.state.password).then((account)=>{
        this.setState({
          feedbackMessage: 'Mailbox unlocked.',
          mailboxIsUnlocked: true,
        });
        this.mailboxUnlocked();
        this.setSelectedMailbox(this.FDS.currentAccount);
      })
    }).catch((error)=>{
      this.setState({feedbackMessage: error});
    });

  }

  cancelAddMailbox(){
    this.setState({
      isAddingMailbox: false,
      isUnlockingMailbox: true,
      feedbackMessage: ''
    });
  }

  handleInputMailboxName(e){
    e.preventDefault();
    //check to see if mailbox name is unused/valid

    if(this.state.checkingAvailability === false){
      this.processMailboxName(e.target.value).catch((error)=>{
        //already handled
      });
    }
  }

  processMailboxName(mailboxName){
    this.setState({
      mailboxName: mailboxName,
      checkingAvailability: true,
      feedbackMessage: "Checking availability..."
    });

    return new Promise((resolve, reject)=>{
      // is mailbox name valid, available
      if(mailboxName && this.FDS.Account.isMailboxNameValid(mailboxName)){
        return this.FDS.Account.isMailboxNameAvailable(mailboxName).then((result) => {
          if(result === true){
            this.setState({
              mailboxName: mailboxName,
              checkingAvailability: false,
              feedbackMessage: "Name available!"
            });
            resolve(true);
          }else{
            this.setState({
              mailboxName: false,
              checkingAvailability: false,
              feedbackMessage: "Sorry, that name is not available!"
            });
            resolve(false);
          }
        }).catch((error)=>{
          if(error.toString() === 'Error: Invalid JSON RPC response: ""'){
            this.setState({
              mailboxName: false,
              checkingAvailability: false,
              feedbackMessage: "Network error - try again!"
            });
            resolve(false);
          }
        });
      }else{
        this.setState({
          mailboxName: false,
          checkingAvailability: false,
          feedbackMessage: "Sorry, that name is invalid."
        });
        resolve(false);
      }
    });
  }

  handleInputPassword(e){
    e.preventDefault();
    this.setState({password: e.target.value}, this.processMailboxPassword);
  }

  handleInputPasswordVerification(e){
    e.preventDefault();
    this.setState({passwordVerification: e.target.value}, this.processMailboxPassword);
  }

  processMailboxPassword(){
    let password = this.state.password;
    let passwordVerification = this.state.passwordVerification;

    if(password === ""){
      this.setState({
        feedbackMessage: 'You must enter a password.',
        passwordsValid: false
        // password: false
      });
      return false;
    }

    if(this.state.isUnlockingMailbox === true){
      return true;
    }

    if(password !== passwordVerification){
      this.setState({
        feedbackMessage: 'Passwords must match.',
        passwordsValid: false
        // password: false
      });
      return false
    }

    if(password === passwordVerification){
      this.setState({
        feedbackMessage: 'Passwords match!',
        // password: password
        passwordsValid: true
      });
      return true
    }
  }

  render() {
    return (
      <div>
        <div id="select-mailbox" className={"select-mailbox white page-wrapper " + (this.state.uiState === 0 ? "fade-in" : "hidden")}>
          <div className="select-mailbox-ui page-inner-centered">
            <div className="mist"></div>
            <div className="page-inner-wrapper">
              {this.state.isUnlockingMailbox &&
                <div className="unlock-mailbox">
                    <h1 className="select-account-header">Log in</h1>
                    <UnlockMailbox
                      dropDownOptions={this.getDropDownOptions()}
                      dropDownValue={this.state.unlockingMailbox}
                      handleSelectMailbox={this.handleSelectMailbox}
                      handleInputPassword={this.handleInputPassword.bind(this)}
                      unlockMailbox={this.unlockMailbox.bind(this)}
                    />
                </div>
              }
              {this.state.isAddingMailbox &&
                <div className="select-mailbox">
                    <h1 className="select-account-header">Log in</h1>
                      <AddMailbox
                        handleInputMailboxName={this.handleInputMailboxName.bind(this)}
                        handleInputPassword={this.handleInputPassword.bind(this)}
                        handleInputPasswordVerification={this.handleInputPasswordVerification.bind(this)}
                        handleAddMailbox={this.handleAddMailbox.bind(this)}
                      />
                </div>
              }
              <div class="ui-feedback">{this.state.feedbackMessage}</div>
              {this.state.isAddingMailbox &&
                <div className="actions">
                  <button className="btn btn-lg btn-green btn-float-left" onClick={this.handleAddMailbox.bind(this)}>Add Mailbox</button>
                  {this.state.mailboxesExist &&
                    <button className="btn btn-sm btn-black btn-link btn-float-right" onClick={this.cancelAddMailbox.bind(this)}><img src={this.props.appRoot + "/assets/images/x-black.svg"}/>Cancel</button>              
                  }
                </div>
              }
              {this.state.isUnlockingMailbox &&
                <div className="actions">
                  <button className="btn btn-lg btn-green btn-float-left" onClick={this.unlockMailbox.bind(this)}>Unlock Mailbox</button>
                </div>
              }
            </div>
          </div>
        </div>
        <div id="show-files" className={"show-files page-wrapper " + (this.state.uiState === 1 ? "fade-in" : "hidden")}>
          <div className="page-inner-centered">
            <div className="show-files-ui">
              <div className="inbox clearfix">
                <div className="inbox-nav">
                  <table>
                    <tbody>
                      <tr>
                        {/*<td>
                          <div className="show-files-mailbox-name">{ this.props.selectedMailbox && this.props.selectedMailbox.subdomain }</div>
                        </td>*/}
                      </tr>
                      <tr>
                        <td><button className={this.state.shownMessageType !== 'received' ? "inactive" : ""} onClick={this.showReceived}><img class="inbox-tick" src={this.props.appRoot + "/assets/images/tick.svg"}/>Received</button></td>
                      </tr>
                      <tr>
                        <td><button className={this.state.shownMessageType !== "sent" ? "inactive" : ""} onClick={this.showSent}><img class="inbox-arrow" src={this.props.appRoot + "/assets/images/arrow.svg"}/>Sent</button></td>
                      </tr>
                      <tr>
                        <td><button className={this.state.shownMessageType !== "stored" ? "inactive" : ""} onClick={this.showStored}><img class="inbox-paperclip" src={this.props.appRoot + "/assets/images/paperclip.svg"}/>Stored</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="inbox-header">
                  <table>
                    <thead>
                      <tr>
                        <th className="inbox-col inbox-col-name">Name</th>
                        <th className="inbox-col inbox-col-name">
                          {(() => {
                            switch(this.state.shownMessageType) {
                              case 'sent':
                                return "To";
                              case 'received':
                                return "From";
                              case 'stored':
                                return "";
                              default:
                                return;
                            }
                          })()}
                        </th>
                        <th className="inbox-col inbox-col-time">Time</th>
                        <th className="inbox-col inbox-col-time">Size</th>
                      </tr>
                    </thead>
                  </table>
                </div>
                <div className="inbox-main">
                  <table>
                    <tbody>
                      {(() => {
                        if(this.state.shownMessages.length > 0){
                          switch(this.state.shownMessageType){
                            case 'sent':{
                              return this.state.shownMessages.map((message, i)=>{
                                return <tr
                                  className={
                                    "message-list "
                                    + (i === (this.state.shownMessages.length - 1) ? "last" : "")
                                  }
                                  key={`${message.to}-${message.hash.address}`}
                                  onClick={ ()=>{ return message.saveAs(); } }
                                  >
                                    <td>{ message.hash.file.name }</td>
                                    <td>{ message.to }</td>
                                    <td>{ Moment(message.hash.time).format('D/MM/YYYY hh:mm ') }</td>
                                    <td>{ Utils.humanFileSize(message.hash.file.size) }</td>
                                  </tr>
                              })
                            }
                            case 'received': {
                              return this.state.shownMessages.map((message, i)=>{
                                return <tr
                                  className={
                                    "message-list "
                                    + (i === (this.state.shownMessages.length - 1) ? "last" : "")
                                  }
                                  key={`${message.hash.address}`}
                                  onClick={ ()=>{ return message.saveAs(); } }
                                  >
                                    <td>{ message.hash.file.name }</td>
                                    <td>{ message.from }</td>
                                    <td>{ Moment(message.hash.time).format('D/MM/YYYY hh:mm ') }</td>
                                    <td>{ Utils.humanFileSize(message.hash.file.size) }</td>
                                  </tr>
                              })
                            }
                            case 'stored':
                              return this.state.shownMessages.map((hash, i)=>{
                                return <tr
                                  className={
                                    "message-list "
                                    + (i === (this.state.shownMessages.length - 1) ? "last" : "")
                                  }
                                  key={`${hash.address}`}
                                  onClick=
                                  { ()=>{ return hash.saveAs(); } }>
                                     <td>{ hash.file.name }</td>
                                    <td></td>
                                    <td>{ Moment(hash.time).format('D/MM/YYYY hh:mm ') }</td>
                                    <td>{ Utils.humanFileSize(hash.file.size) }</td>
                                  </tr>
                              })
                            default:
                              return;
                          }
                        }else{
                          return <tr className={
                                    "message-list last"
                                  }>
                                  <td>No messages yet...</td>
                                </tr>
                        }
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Mailbox;
