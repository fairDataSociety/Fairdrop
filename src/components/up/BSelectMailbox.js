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

// MetaMask fox icon (inline SVG)
const MetaMaskIcon = () => (
  <svg width="20" height="20" viewBox="0 0 318.6 318.6" style={{marginRight: '8px', verticalAlign: 'middle'}}>
    <path fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" d="M274.1 35.5l-99.5 73.9L193 65.8z"/>
    <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="M44.4 35.5l98.7 74.6-17.5-44.3zm193.9 171.3l-26.5 40.6 56.7 15.6 16.3-55.3zm-204.4.9L50.1 262l56.7-15.6-26.5-40.6z"/>
    <path fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" d="M103.6 138.2l-15.8 23.9 56.3 2.5-2-60.5zm111.3 0l-39-34.8-1.3 61.2 56.2-2.5zM106.8 247l33.8-16.5-29.2-22.8zm71.1-16.5l33.9 16.5-4.7-39.3z"/>
    <path fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" d="M211.8 247l-33.9-16.5 2.7 22.1-.3 9.3zm-105 0l31.5 14.9-.2-9.3 2.5-22.1z"/>
    <path fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" d="M138.8 193.5l-28.2-8.3 19.9-9.1zm40.9 0l8.3-17.4 20 9.1z"/>
    <path fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" d="M106.8 247l4.8-40.6-31.3.9zM207 206.4l4.8 40.6 26.5-39.7zm23.8-44.7l-56.2 2.5 5.2 28.9 8.3-17.4 20 9.1zm-120.2 23.1l20-9.1 8.2 17.4 5.3-28.9-56.3-2.5z"/>
    <path fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" d="M87.8 161.7l23.6 46-.8-22.9zm120.3 23.1l-1 22.9 23.7-46zm-64-20.6l-5.3 28.9 6.6 34.1 1.5-44.9zm30.5 0l-2.7 18 1.2 45 6.7-34.1z"/>
  </svg>
);

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
    this.handleConnectWallet = this.handleConnectWallet.bind(this);

  }

  async handleConnectWallet(e) {
    if (e) e.preventDefault();

    if (!this.FDS.isMetaMaskAvailable()) {
      this.setState({ feedbackMessage: 'MetaMask is not installed. Please install MetaMask to continue.' });
      return;
    }

    this.setState({ processingAddMailbox: true, feedbackMessage: 'Connecting to MetaMask...' });

    try {
      const account = await this.FDS.ConnectWallet((message) => {
        this.setState({ feedbackMessage: message });
      });

      if (window.Sentry) {
        window.Sentry.configureScope((scope) => {
          scope.setUser({ "username": account.subdomain });
        });
      }

      this.setState({
        feedbackMessage: 'Wallet connected!',
        mailboxIsUnlocked: true,
        processingAddMailbox: false
      });

      this.props.setSelectedMailbox(this.FDS.currentAccount);
      this.mailboxUnlocked();
    } catch (error) {
      console.error('Wallet connection error:', error);
      this.setState({
        feedbackMessage: error.message || 'Failed to connect wallet',
        processingAddMailbox: false
      });
    }
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
        throw new Error("Couldn't find mailbox, try again...")
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
      this.props.setSelectedMailbox(this.FDS.currentAccount);
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
      this.FDS.UnlockAccount(this.state.mailboxName, this.state.password).then(async (account)=>{
        if(window.Sentry){
          window.Sentry.configureScope((scope) => {
            scope.setUser({"username": account.subdomain});
          });
        }
        this.setState({
          feedbackMessage: 'Mailbox unlocked.',
          mailboxIsUnlocked: true,
        });
        this.props.setSelectedMailbox(this.FDS.currentAccount);
        this.mailboxUnlocked();
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
          <div>
            {(this.state.isUnlockingMailbox && !this.state.mailboxName) &&
              <div className="unlock-mailbox">
                  <h1 className="select-account-header hide-mobile">Log in to encrypt</h1>

                  {/* MetaMask Login Option */}
                  <div className="wallet-login-section" style={{marginBottom: '20px', textAlign: 'center'}}>
                    <button
                      className="btn btn-lg btn-metamask"
                      onClick={this.handleConnectWallet}
                      disabled={this.state.processingAddMailbox}
                      style={{
                        background: 'linear-gradient(135deg, #f6851b 0%, #e2761b 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        maxWidth: '300px'
                      }}
                    >
                      <MetaMaskIcon />
                      Connect with MetaMask
                    </button>
                    <div style={{margin: '15px 0', color: '#888', fontSize: '14px'}}>— or —</div>
                  </div>

                  <UnlockMailbox
                    dropDownOptions={this.getDropDownOptions()}
                    dropDownValue={this.state.unlockingMailbox}
                    handleSelectMailbox={this.handleSelectMailbox}
                    handleInputPassword={this.handleInputPassword.bind(this)}
                  />
              </div>
            }
            {this.state.isAddingMailbox &&
              <div className="select-mailbox">
                  <h1 className="select-account-header hide-mobile">Create Mailbox</h1>

                  {/* MetaMask Option */}
                  <div className="wallet-login-section" style={{marginBottom: '20px', textAlign: 'center'}}>
                    <button
                      className="btn btn-lg btn-metamask"
                      onClick={this.handleConnectWallet}
                      disabled={this.state.processingAddMailbox}
                      style={{
                        background: 'linear-gradient(135deg, #f6851b 0%, #e2761b 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        maxWidth: '300px'
                      }}
                    >
                      <MetaMaskIcon />
                      Connect with MetaMask
                    </button>
                    <div style={{margin: '15px 0', color: '#888', fontSize: '14px'}}>— or create a local mailbox —</div>
                  </div>

                    <AddMailbox
                      handleInputMailboxName={this.handleInputMailboxName.bind(this)}
                      handleInputPassword={this.handleInputPassword.bind(this)}
                      handleInputPasswordVerification={this.handleInputPasswordVerification.bind(this)}
                      disabled={this.state.processingAddMailbox}
                    />
              </div>
            }
          </div>
          {!this.props.parentState.isStoringFile &&
            <SelectRecipient
              FDS={this.props.FDS}
              handleSelectRecipient={this.handleSelectRecipient}
              disabled={this.state.processingAddMailbox}
            />
          }
          <div className="ui-feedback">
            {this.state.feedbackMessage}
            {/* <img className="in-progress-icon" src={this.props.appRoot + "assets/images/progress.svg"} alt="Spinning"/> */}
          </div>
          <div className="actions btn-grp">
            <button 
              className="btn btn-lg btn-green btn-float-left" 
              onClick={this.handleContinue.bind(this)}
              disabled={this.state.processingAddMailbox}
            >
              {(this.state.isAddingMailbox && !this.props.parentState.isStoringFile) &&
                "Send File"
              }
              {(!this.state.mailboxName && this.state.isUnlockingMailbox && !this.props.parentState.isStoringFile) &&
                "Send File"
              }
              {(this.state.isAddingMailbox && this.props.parentState.isStoringFile) &&
                "Store File"
              }
              {(this.state.isUnlockingMailbox && this.props.parentState.isStoringFile) &&
                "Store File"
              }
              {(!this.state.isAddingMailbox && this.state.mailboxName && !this.props.parentState.isStoringFile) &&
                "Send File"
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
