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
import 'react-dropdown/style.css'

import AddMailbox from '../Shared/AddMailbox'
import UnlockMailbox from '../Shared/UnlockMailbox'
import SelectRecipient from '../Shared/SelectRecipient';

class BSelectMailbox extends Component{

  getInitialState(){
    let mailboxes = this.FDS.GetAccounts();

    let mailboxName;
    if(this.props.selectedMailbox){
      mailboxName = this.props.selectedMailbox.subdomain;
    }else{
      mailboxName = false;
    }

    if(mailboxes.length === 0){
      return {
        isAddingMailbox: true,
        isUnlockingMailbox: false,
        mailboxes: mailboxes,
        activeMailboxSubDomain: false,
        dropDownValue: false,
        mailboxesExist: false,
        feedbackMessage: '',
        checkingAvailability: false,
        recipientWasSelected: false,
        processingAddMailbox: false,
        mailboxName: mailboxName
      }
    }else if(mailboxes.length > 0){
      return {
        isAddingMailbox: false,
        isUnlockingMailbox: true,
        mailboxes: mailboxes,
        unlockingMailbox: mailboxes[0].subdomain,
        activeMailboxSubDomain: false,
        dropDownValue: mailboxes[0].subdomain,
        mailboxesExist: true,
        feedbackMessage: '',
        checkingAvailability: false,
        recipientWasSelected: false,
        processingAddMailbox: false,
        mailboxName: mailboxName
      }
    }
  }

  constructor(props) {
    super(props);

    this.FDS = this.props.FDS;
    this.state = this.getInitialState();

    this.addMailbox = this.addMailbox.bind(this);
    this.handleSelectMailbox = this.handleSelectMailbox.bind(this);
    this.mailboxUnlocked = this.mailboxUnlocked.bind(this);
    this.cancelAddMailbox = this.cancelAddMailbox.bind(this);
    this.handleSelectRecipient = this.handleSelectRecipient.bind(this);

  }

  addMailbox(){
    this.setState({
      isAddingMailbox: true,
      isUnlockingMailbox: false
    });
  }

  cancelAddMailbox(){
    this.setState({
      isAddingMailbox: false,
      isUnlockingMailbox: true
    });
    this.props.resetToInitialState();
  }

  setUnlockingMailbox(subdomain){
    this.setState({
      unlockingMailbox: subdomain,
      isUnlockingMailbox: true,
      isAddingMailbox: false,
      dropDownValue: subdomain
    });
  }

  handleSelectMailbox(option){
    if(option.value === 'new-mailbox'){
      this.addMailbox();
    }else{
      this.setUnlockingMailbox(option.value);
    }
  }

  getDropDownOptions(mailboxes){
    return this.state.mailboxes.map((m)=>{
      return {label: m.subdomain, value:  m.subdomain};
    }).concat({label: 'new mailbox +', value: "new-mailbox" });
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
      });
      return false;
    }

    if(password === passwordVerification){
      this.setState({
        feedbackMessage: 'Passwords match!',
        passwordsValid: true
      });
      return true;
    }
  }

  handleSelectRecipient(e){
    e.preventDefault();
    this.processSelectRecipient(e.target.value);
  }

  processSelectRecipient(mailboxName){
    return this.FDS.Account.isMailboxNameAvailable(mailboxName).then((result) => {
      if(result === true){
        throw new Error("Couldn't find that mailbox, please try again...")
      }
      this.setState({
        feedbackMessage: "Mailbox found!",
        recipientWasSelected: true
      });
      this.props.setParentState({
        addressee: mailboxName
      });
      return true;
    }).catch((error) => {
      if(error.toString() === 'Error: Invalid JSON RPC response: ""'){
        this.setState({
          feedbackMessage: "Network error - please try again...",
          recipientWasSelected: false
        });
      }else{
        this.setState({
          feedbackMessage: error.message,
          recipientWasSelected: false
        });
      }
      return false;
    })
  }

  mailboxUnlocked(){
    this.props.setParentState({
      uiState: 3
    });
  }

  handleUnlockMailboxUploadAndEncrypt(e){
    let subdomain = this.state.unlockingMailbox;
    let password = this.state.password;
    this.FDS.UnlockAccount(subdomain, password).then((account)=>{
      this.setState({
        feedbackMessage: 'Mailbox unlocked.',
        mailboxIsUnlocked: true,
      });
      this.props.setSelectedMailbox(this.FDS.currentAccount);
      this.mailboxUnlocked();
    }).catch((error)=>{
      this.setState({
        feedbackMessage: 'Password invalid, please try again.',
        mailboxIsUnlocked: false
      });
    });
  }

  handleAddMailboxUploadAndEncrypt(e){
    this.setState({processingAddMailbox: true});
    this.FDS.CreateAccount(this.state.mailboxName, this.state.password, (message) => {
      this.setState({feedbackMessage: message});
    }).then((account)=>{
      this.FDS.UnlockAccount(this.state.mailboxName, this.state.password).then((account)=>{
        this.setState({
          feedbackMessage: 'Mailbox unlocked.',
          mailboxIsUnlocked: true,
        });
        this.props.setSelectedMailbox(this.FDS.currentAccount);
        this.mailboxUnlocked();
      })
    }).catch((error)=>{
      this.setState({processingAddMailbox: false});
      this.setState({feedbackMessage: error});
    });
  }

  handleAction(action){
      //unlock or create mailbox or just go to next stage
      switch(action) {
        case 'add':
          this.handleAddMailboxUploadAndEncrypt();
          break;
        case 'unlock':
          this.handleUnlockMailboxUploadAndEncrypt()
          break;
        default:
          this.mailboxUnlocked();
      }
  }

  handleSendOrStore(action=false){
    console.log('send or store')
    if(this.props.parentState.isStoringFile === false){
      console.log('send', action)
      //sending file
      //check recipient mailbox
      return this.processSelectRecipient(this.props.parentState.addressee).then((valid)=>{
        if(!valid) return false;
        this.handleAction(action);
      });
    }else{
      console.log('store')
      //storing file
      //unlock or create mailbox and go to next stage
      this.handleAction(action);
    }
  }

  handleContinue(e){
    e.preventDefault();

    if(this.props.selectedMailbox){
      //already logged in
        return this.handleSendOrStore();
    }else{
      //must log in or add mailbox
      if(this.state.isAddingMailbox){
        //adding mailbox
        //check mailbox name is valid and available
        return this.processMailboxName(this.state.mailboxName).then((valid)=>{
          if(!valid) return false;
          //check passwords
          if(!this.processMailboxPassword()){
            return false;
          }
          return this.handleSendOrStore('add');
        });
      }else{
        //unlocking mailbox
        console.log('unlocking')
        if(!this.processMailboxPassword()){
          return false;
        }else{

        }
        return this.handleSendOrStore('unlock');
      }
    }

  }

  render(){
    return (
      <div id="select-mailbox" className={"select-mailbox green page-wrapper " + (this.props.parentState.uiState === 1 ? "fade-in" : "hidden")}>
        <div className="select-mailbox-ui page-inner-centered">
        <div className="page-inner-wrapper">
          <div className="select-mailbox">
            {(this.state.isUnlockingMailbox && !this.state.mailboxName) &&
              <div className="unlock-mailbox">
                <div className="page-inner-wrapper">
                  <h1 className="select-account-header">Log in to encrypt</h1>
                  <UnlockMailbox
                    dropDownOptions={this.getDropDownOptions()}
                    dropDownValue={this.state.unlockingMailbox}
                    handleSelectMailbox={this.handleSelectMailbox}
                    handleInputPassword={this.handleInputPassword.bind(this)}
                  />
                </div>
              </div>
            }
            {this.state.isAddingMailbox &&
              <div className="select-mailbox">
                <div className="page-inner-wrapper">
                  <h1 className="select-account-header">Create Mailbox</h1>
                    <AddMailbox
                      handleInputMailboxName={this.handleInputMailboxName.bind(this)}
                      handleInputPassword={this.handleInputPassword.bind(this)}
                      handleInputPasswordVerification={this.handleInputPasswordVerification.bind(this)}
                    />
                </div>
              </div>
            }
          </div>
          {!this.props.parentState.isStoringFile &&
            <SelectRecipient
              FDS={this.props.FDS}
              handleSelectRecipient={this.handleSelectRecipient}
            />
          }
          <div className="ui-feedback">
            {this.state.feedbackMessage}
            <img className="in-progress-icon" src={this.props.appRoot + "assets/images/black-progress.svg"} alt="Spinning"/>
          </div>
          <div className="actions">
            <button 
              className="btn btn-lg btn-green btn-float-left" 
              onClick={this.handleContinue.bind(this)}
              disabled={this.state.processingAddMailbox}
            >
              {(this.state.isAddingMailbox && !this.props.parentState.isStoringFile) &&
                "Create Mailbox and Send"
              }
              {(!this.state.mailboxName && this.state.isUnlockingMailbox && !this.props.parentState.isStoringFile) &&
                "Unlock Mailbox and Send"
              }
              {(this.state.isAddingMailbox && this.props.parentState.isStoringFile) &&
                "Create Mailbox and Store"
              }
              {(this.state.isUnlockingMailbox && this.props.parentState.isStoringFile) &&
                "Unlock Mailbox and Store"
              }
              {(!this.state.isAddingMailbox && this.state.mailboxName && !this.props.parentState.isStoringFile) &&
                "Send"
              }
            </button>
            {this.state.mailboxesExist &&
              <button className="btn btn-sm select-encryption-no-button btn btn-lg btn-link btn-float-right" onClick={this.cancelAddMailbox}><img alt="cancel" src={this.props.appRoot + "assets/images/x.svg"}/>Cancel</button>
            }
          </div>
        </div>
        </div>
      </div>
    )
  }
}

export default BSelectMailbox;
