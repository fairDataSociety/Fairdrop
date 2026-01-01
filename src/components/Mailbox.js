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

import Utils from '../services/Utils';

import UnlockMailbox from './Shared/UnlockMailbox'
import AddMailbox from './Shared/AddMailbox'

import Moment from 'moment';
import { Tooltip as ReactTooltip } from 'react-tooltip'

class Mailbox extends Component{

  getInitialState(){

    this.FDS = this.props.FDS;
    let mailboxes = this.FDS.GetAccounts();

    if(this.props.selectedMailbox){

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
          passwordsValid: false,
          processingAddMailbox: false,
          hasErrored: false,
          isLoadingMessages: false,
          debounceUpdate: 0
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
        passwordsValid: false,
        processingAddMailbox: false,
        hasErrored: false,
        isLoadingMessages: false,
        debounceUpdate: 0
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
        passwordsValid: false,
        processingAddMailbox: false,
        hasErrored: false,
        isLoadingMessages: false,
        debounceUpdate: 0
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

  componentDidUpdate(prevProps) {
    let prevLoc = prevProps.routerArgs.location.pathname;
    let newLoc = this.props.routerArgs.location.pathname;
    let messageType = this.props.routerArgs.match.params.filter;
    if(
        (
          prevLoc !== newLoc ||
          (messageType !== undefined && this.state.shownMessageType !== messageType)
        ) && (
          this.debounceUpdate === undefined ||
          this.debounceUpdate + 100 < Date.now()
        )
      )
    {
      this.debounceUpdate = Date.now();
      if(this.props.selectedMailbox){
        switch(messageType){
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
      }
    }
  }


  componentWillUnmount(){
    clearInterval(this.state.checkreceivedInterval);
  }

  updatePinState(hash, state){
    let newShownMessages = this.state.shownMessages.map((h)=>{
      if(h.address === hash){
        h.meta.pinned = state;
        return h;
      }else{
        return h;
      }
    });
    this.setState({shownMessages: newShownMessages});
  }

  pin(hash, state=true){
    if(this.props.isLoading === true){
      return false;
    }
    this.props.setIsLoading(true); //reset then unset by showStored()
    this.updatePinState(hash, state);
    let fdsPin = this.props.fdsPin;
    if(state === true){
      return fdsPin.pin(hash).then(()=>{
        return this.props.selectedMailbox.updateStoredMeta(hash, {pinned: true}).then(()=>{
          this.props.setIsLoading(false);
          setTimeout(()=>{
            this.props.updateStoredStats();
            this.props.setIsLoading(false);
          }, 1000);
        });
      }).catch(()=>{
        this.updatePinState(hash, !state);
      })
    }else{
      return fdsPin.unpin(hash).then(()=>{
        return this.props.selectedMailbox.updateStoredMeta(hash, {pinned: false}).then(()=>{
          setTimeout(()=>{
            this.props.updateStoredStats();
            this.props.setIsLoading(false);
          }, 1000);
        });
      }).catch(()=>{
        this.updatePinState(hash, !state);
      });
    }
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
    this.props.handleNavigateTo('/mailbox/received');
  }

  showSent(){
    this.props.setIsLoading(true);
    this.setState({isLoadingMessages: true});
    this.FDS.currentAccount.messages('sent').then((messages)=>{
      this.setState({
        shownMessageType: 'sent',
        shownMessages: messages.reverse()
      });
      this.props.setIsLoading(false);
      this.setState({isLoadingMessages: false});
    });
  }

  showReceived(e, force = true){
    this.props.setIsLoading(true);
    this.setState({isLoadingMessages: true});
    if(force === true || this.state.shownMessageType === 'received'){
      this.FDS.currentAccount.messages('received', '/shared/fairdrop/encrypted').then((messages)=>{
        localStorage.setItem(`fairdrop_receivedSeenCount_${this.FDS.currentAccount.subdomain}`, messages.length);

        this.setState({
          shownMessageType: 'received',
          shownMessages: messages.reverse(),
          receivedUnseenCount: 0
        });
        this.props.setIsLoading(false);
        this.setState({isLoadingMessages: false});
      });
    }
  }

  showStored(){
    this.props.setIsLoading(true);
    this.setState({isLoadingMessages: true});
    return this.FDS.currentAccount.stored().then((messages)=>{
      if(typeof messages === 'undefined'){
        messages = [];
      }
      this.setState({
        shownMessageType: 'stored',
        shownMessages: messages.reverse()
      });
      this.props.setIsLoading(false);
      this.setState({isLoadingMessages: false});
    });
  }

  retrieveSentFile(message){
    message.saveAs();
  }

  retrieveStoredFile(file){
    file.saveAs();
  }

  mailboxUnlocked(){
    this.setState({
      uiState: 1,
      shownMessageType: 'received',
      isLoadingMessages: true,
    });
    return this.showReceived();
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
    this.props.setIsLoading(true);
    let subdomain = this.state.unlockingMailbox;
    let password = this.state.password;

    this.FDS.UnlockAccount(subdomain, password).then(async (account)=>{
      if(window.Sentry){
        window.Sentry.configureScope((scope) => {
          scope.setUser({"username": account.subdomain});
        });
      }
      this.setState({
        feedbackMessage: 'Mailbox unlocked.',
        mailboxIsUnlocked: true,
      });
      this.mailboxUnlocked()
      let mailbox = await this.setSelectedMailbox(this.FDS.currentAccount);
      let appState = await this.props.getAppState();
      let balance = await account.getBalance();
      if(
        appState.warrantWasCreated === undefined && 
        balance > 0.1
        )
      {
        this.setState({feedbackMessage: "Creating warrant"});
        let warrantBalance = Math.floor(balance*80/100);
        let fdsPin = this.props.fdsPin;
        await fdsPin.createWarrant(warrantBalance);
        await this.props.saveAppState({warrantWasCreated: true});
        this.props.updateBalance();
      }
      return mailbox;
    }).catch((error)=>{
      this.props.setIsLoading(false);      
      this.setState({
        feedbackMessage: 'Password invalid, please try again.',
        mailboxIsUnlocked: false
      });
    })
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

    this.setState({processingAddMailbox: true});

    // Enable navigation prompt
    window.onbeforeunload = function() {
        return true;
    };

    this.FDS.CreateAccount(this.state.mailboxName, this.state.password, (message) => {
      this.setState({feedbackMessage: message});
    }).then((account)=>{
      this.FDS.UnlockAccount(this.state.mailboxName, this.state.password).then((account)=>{
        if(window.Sentry){
          window.Sentry.configureScope((scope) => {
            scope.setUser({"username": this.state.mailboxName});
          });
        }
        this.setState({
          feedbackMessage: 'Mailbox unlocked.',
          mailboxIsUnlocked: true,
        });
        // Remove navigation prompt
        window.onbeforeunload = null;        
        this.mailboxUnlocked();
        this.setSelectedMailbox(this.FDS.currentAccount);
        return account;
      }).then(async (account)=>{
        this.setState({feedbackMessage: "Creating warrant"});
        let balance = await account.getBalance();
        let warrantBalance = Math.floor(balance*80/100);
        let fdsPin = this.props.fdsPin;
        await fdsPin.createWarrant(warrantBalance);
        await this.props.saveAppState({warrantWasCreated: true});
        this.props.updateBalance();
        return account;  
        })
    }).catch((error)=>{
      if(window.Sentry) window.Sentry.captureException(error);
      this.setState(
        {
          feedbackMessage: `${error.toString()} - please try again.`,
          hasErrored: true,
          processingAddMailbox: false
        });
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
    let mailboxName = e.target.value.toLowerCase();
    this.setState({
      mailboxName: mailboxName,
    });
    //check to see if mailbox name is unused/valid
    if(this.state.checkingAvailability === false){
      this.processMailboxName(mailboxName).catch((error)=>{
        //already handled
      });
    }
  }

  processMailboxName(mailboxName){
    this.setState({
      checkingAvailability: true,
      feedbackMessage: "Checking availability..."
    });

    return new Promise((resolve, reject)=>{
      // is mailbox name valid, available
      if(mailboxName && this.FDS.Account.isMailboxNameValid(mailboxName)){
        return this.FDS.Account.isMailboxNameAvailable(mailboxName).then((result) => {
          if(result === true){
            this.setState({
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
                    <h1 className="select-account-header">Log In / Register</h1>
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
                    <h1 className="select-account-header">Log In / Register</h1>
                      <AddMailbox
                        handleInputMailboxName={this.handleInputMailboxName.bind(this)}
                        handleInputPassword={this.handleInputPassword.bind(this)}
                        handleInputPasswordVerification={this.handleInputPasswordVerification.bind(this)}
                        handleAddMailbox={this.handleAddMailbox.bind(this)}
                        disabled={this.state.processingAddMailbox}                        
                      />
                </div>
              }
              <div className="ui-feedback">{this.state.feedbackMessage}</div>
              {this.state.isAddingMailbox &&
                <div className="actions btn-grp">
                  <button 
                    className="btn btn-lg btn-green btn-float-left" 
                    onClick={this.handleAddMailbox.bind(this)}
                    disabled={this.state.processingAddMailbox}
                  >
                    Add Mailbox
                  </button>
                  {this.state.mailboxesExist &&
                    <button className="btn btn-sm btn-black btn-link btn-float-right" onClick={this.cancelAddMailbox.bind(this)}><img src={this.props.appRoot + "/assets/images/x-black.svg"} alt="cancel" />Cancel</button>              
                  }
                </div>
              }
              {this.state.isUnlockingMailbox &&
                <div className="actions btn-grp">
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
                <div className="inbox-nav hide-mobile">
                  <div className="inbox-nav-list">
                    <button className={this.state.shownMessageType !== 'received' ? "inactive" : ""} onClick={()=>{this.props.handleNavigateTo('/mailbox/received')}}>
                      <img alt="inbox" className="inbox-nav-icon" src={this.props.appRoot + "/assets/images/tick.svg"}/>
                      Received
                    </button>
                    <button className={this.state.shownMessageType !== "sent" ? "inactive" : ""} onClick={()=>{this.props.handleNavigateTo('/mailbox/sent')}}>
                      <img alt="sent" className="inbox-nav-icon" src={this.props.appRoot + "/assets/images/arrow.svg"}/>
                      Sent
                    </button>
                    <button className={this.state.shownMessageType !== "stored" ? "inactive" : ""} onClick={()=>{this.props.handleNavigateTo('/mailbox/stored')}}>
                      <img alt="stored" className="inbox-nav-icon" src={this.props.appRoot + "/assets/images/paperclip.svg"}/>
                      Stored
                    </button>
                  </div>
                </div>
                <div className="mobile-inbox-nav show-mobile">
                    <div className="mobile-inbox-nav-cell"><button className={(this.state.shownMessageType !== 'received' ? "inactive" : "")} onClick={this.showReceived}><img alt="tick" className="inbox-tick" src={this.props.appRoot + "/assets/images/tick.svg"}/></button></div>
                    <div className="mobile-inbox-nav-cell"><button className={(this.state.shownMessageType !== "sent" ? "inactive" : "")} onClick={this.showSent}><img alt="arrow" className="inbox-arrow" src={this.props.appRoot + "/assets/images/arrow.svg"}/></button></div>
                    <div className="mobile-inbox-nav-cell"><button className={(this.state.shownMessageType !== "stored" ? "inactive" : "")} onClick={this.showStored}><img alt="paperclip" className="inbox-paperclip" src={this.props.appRoot + "/assets/images/paperclip.svg"}/></button></div>
                </div>
                <div className="inbox-content">
                <div className="inbox-header">
                  <table className="files-table">
                    <thead>
                      <tr>
                        <th className="inbox-col col-name">Name</th>
                        <th className="inbox-col col-pin hide-mobile" data-tip="Pinned files will be retained by your data provider.">
                          {this.state.shownMessageType === 'stored' &&
                            <img src={this.props.appRoot + "/assets/images/thumbtack-solid.svg"} alt="Pin" className="inbox-pin"/>
                          }
                        </th>
                        <th className="inbox-col col-recipient">
                          {this.state.shownMessageType === 'sent' && "To"}
                          {this.state.shownMessageType === 'received' && "From"}
                          {this.state.shownMessageType === 'stored' && "Expires"}
                        </th>
                        <th className="inbox-col col-time hide-mobile">
                          {this.state.shownMessageType === 'stored' ? 'Stored' : 'Time'}
                        </th>
                        <th className="inbox-col col-size">Size</th>
                        <th className="inbox-col col-actions hide-mobile">Actions</th>
                      </tr>
                    </thead>
                  </table>
                </div>
                <div className="inbox-main">
                  <table className="files-table">
                    <tbody>
                      {(() => {
                        if(this.state.isLoadingMessages === true){
                          return <tr className="message-list last">
                                      <td colSpan="6">Loading...</td>
                                    </tr>
                        }
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
                                  >
                                    <td className="col-name" onClick={ ()=>{ return message.saveAs(); } }><div className="no-overflow">{ message.hash.file.name }</div></td>
                                    <td className="col-pin hide-mobile"></td>
                                    <td className="col-recipient"><div className="no-overflow">{ message.to }</div></td>
                                    <td className="col-time hide-mobile"><div className="no-overflow">{ Moment(message.hash.time).format('D/MM/YYYY HH:mm') }</div></td>
                                    <td className="col-size">{ Utils.humanFileSize(message.hash.file.size) }</td>
                                    <td className="col-actions hide-mobile">
                                      <button className="action-btn" onClick={(e)=>{ e.stopPropagation(); message.saveAs(); }} title="Download">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                      </button>
                                    </td>
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
                                  >
                                    <td className="col-name" onClick={ ()=>{ return message.saveAs(); } }><div className="no-overflow">{ message.hash.file.name }</div></td>
                                    <td className="col-pin hide-mobile"></td>
                                    <td className="col-recipient"><div className="no-overflow">{ message.from }</div></td>
                                    <td className="col-time hide-mobile"><div className="no-overflow">{ Moment(message.hash.time).format('D/MM/YYYY HH:mm') }</div></td>
                                    <td className="col-size">{ Utils.humanFileSize(message.hash.file.size) }</td>
                                    <td className="col-actions hide-mobile">
                                      <button className="action-btn" onClick={(e)=>{ e.stopPropagation(); message.saveAs(); }} title="Download">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                      </button>
                                      <button className="action-btn" onClick={(e)=>{ e.stopPropagation(); this.props.handleForwardFile && this.props.handleForwardFile(message); }} title="Forward">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 17 20 12 15 7"/><path d="M4 18v-2a4 4 0 0 1 4-4h12"/></svg>
                                      </button>
                                    </td>
                                  </tr>
                              })
                            }
                            case 'stored':
                              return this.state.shownMessages.map((hash, i)=>{
                                const expiryDate = Moment(hash.time).add(14, 'days');
                                const isExpiringSoon = expiryDate.diff(Moment(), 'days') <= 3;
                                return <tr
                                  className={
                                    "message-list "
                                    + (i === (this.state.shownMessages.length - 1) ? "last" : "")
                                  }
                                  key={`${hash.address}`}
                                  >
                                    <td className="col-name" onClick={ ()=>{ return hash.saveAs(); } }>
                                      <div className="no-overflow">{ hash.file.name }</div>
                                    </td>
                                    <td
                                      className="col-pin hide-mobile"
                                      onClick={ ()=>{
                                          return this.pin(hash.address, (hash.meta && hash.meta.pinned === true) ? false : true);
                                        }
                                      }
                                    >
                                      {(hash.meta && hash.meta.pinned === true) &&
                                        <img src={this.props.appRoot + "/assets/images/thumbtack-solid.svg"} alt="Pinned" className="inbox-pin"/>
                                      }
                                      {(hash.meta && hash.meta.pinned !== true) &&
                                        <img src={this.props.appRoot + "/assets/images/thumbtack-hollow.svg"} alt="Not Pinned" className="inbox-pin"/>
                                      }
                                    </td>
                                    <td className={"col-recipient" + (isExpiringSoon ? " expiry-warning" : "")}>
                                      <span className="expiry-date">{ expiryDate.format('D/MM/YYYY') }</span>
                                      {isExpiringSoon && <button className="btn-topup" onClick={(e)=>{ e.stopPropagation(); }} disabled>Extend</button>}
                                    </td>
                                    <td className="col-time hide-mobile">{ Moment(hash.time).format('D/MM/YYYY HH:mm') }</td>
                                    <td className="col-size">{ Utils.humanFileSize(hash.file.size) }</td>
                                    <td className="col-actions hide-mobile">
                                      <button className="action-btn" onClick={(e)=>{ e.stopPropagation(); hash.saveAs(); }} title="Download">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                      </button>
                                      <button className="action-btn" onClick={(e)=>{ e.stopPropagation(); this.props.handleSendStoredFile && this.props.handleSendStoredFile(hash); }} title="Send">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
                                      </button>
                                    </td>
                                  </tr>
                              })
                            default:
                              return;
                          }
                        }else{
                          switch(this.state.shownMessageType){
                            case 'stored':
                              return <tr className="message-list last empty-state">
                                      <td colSpan="6" style={{textAlign: 'center', padding: '60px 20px', color: '#666'}}>
                                        <div style={{fontSize: '18px', fontWeight: 500, marginBottom: '8px'}}>No stored files yet</div>
                                        <div style={{fontSize: '14px', color: '#999'}}>Files you store will appear here</div>
                                      </td>
                                    </tr>
                            case 'sent':
                              return <tr className="message-list last empty-state">
                                      <td colSpan="6" style={{textAlign: 'center', padding: '60px 20px', color: '#666'}}>
                                        <div style={{fontSize: '18px', fontWeight: 500, marginBottom: '8px'}}>No sent files yet</div>
                                        <div style={{fontSize: '14px', color: '#999'}}>Files you send will appear here</div>
                                      </td>
                                    </tr>
                            case 'received':
                            default:
                              return <tr className="message-list last empty-state">
                                      <td colSpan="6" style={{textAlign: 'center', padding: '60px 20px', color: '#666'}}>
                                        <div style={{fontSize: '18px', fontWeight: 500, marginBottom: '8px'}}>No received files yet</div>
                                        <div style={{fontSize: '14px', color: '#999'}}>Files sent to you will appear here</div>
                                      </td>
                                    </tr>
                          }
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
        <ReactTooltip className="react-tooltip"/>
      </div>
    );
  }
}

export default Mailbox;
