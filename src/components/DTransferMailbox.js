import React, { Component } from 'react';
import DTransfer from '../services/DTransfer';
import Dropdown from 'react-dropdown';
import DMailbox from '../services/DMailbox';
import FileSaver from 'file-saver';
import DMist from '../lib/DMist';
import Utils from '../services/DTransferUtils';

import UnlockMailbox from './Shared/UnlockMailbox'
import AddMailbox from './Shared/AddMailbox'


class DTransferMailbox extends Component{

  componentDidMount(){
    let dm = new DMist();
    // dm.mist('dt-mist');
  }  

  getInitialState(){
    this.FDS = this.props.FDS;
    let mailboxes = this.FDS.GetAccounts();

    if(mailboxes.length === 0){
      return {
        selectedMailbox: null,
        selectedWallet: null,
        unlockingMailbox: null,
        uiState: 0,
        shownMessages: [],

        isAddingMailbox: true,        
        isUnlockingMailbox: false,
        mailboxes: mailboxes,
        activeMailboxSubDomain: false,
        dropDownValue: false,
        mailboxesExist: false
      };
    }else if(mailboxes.length > 0){
      return {
        selectedMailbox: null,
        selectedWallet: null,
        uiState: 0,
        shownMessages: [],

        isAddingMailbox: false,        
        isUnlockingMailbox: true,
        mailboxes: mailboxes,
        unlockingMailbox: mailboxes[0],
        activeMailboxSubDomain: false,
        dropDownValue: mailboxes[0].subdomain,
        mailboxesExist: true
      };
    }
  }  

  resetToInitialState(){
    this.setState(this.getInitialState());
  }

  constructor(props) {
    super(props);

    this.DT = new DTransfer(process.env.REACT_APP_SWARM_GATEWAY);

    this.handleSelectMailbox = this.handleSelectMailbox.bind(this);

    this.state = this.getInitialState();
  }

  handleSelectMailbox(option){
    if(option.value === 'dt-new-mailbox'){
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

  setSelectedMailbox(){
    this.setState({
      selectedMailbox: this.FDS.currentAccount
    });
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
    let mailboxes = this.props.FDS.GetAccounts();
    return mailboxes.map((m)=>{
      return {label: m.subdomain, value:  m.subdomain};
    }).concat({label: 'new mailbox +', value: "dt-new-mailbox" });
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
  }

  render() {
    return (
      <div>
        <div id="dt-select-mailbox" className={"dt-select-mailbox dt-green dt-page-wrapper " + (this.state.uiState === 0 ? "dt-fade-in" : "dt-hidden")}> 
          <div className="dt-select-mailbox-ui dt-page-inner-centered">
            <div className="dt-mist"></div>
            {this.state.isUnlockingMailbox &&
              <div className="dt-select-mailbox">
                  <div className="dt-page-inner-wrapper">
                    <h1 className="dt-select-account-header">Mailbox</h1>
                    <div className="dt-form-group clearfix">
                      <div className="dt-select-mailbox-mailboxes">
                        <Dropdown 
                          options={this.getDropDownOptions()} 
                          value={this.state.dropDownValue}
                          onChange={this.handleSelectMailbox.bind(this)}
                          placeholder="Select a mailbox" 
                        />
                      </div>
                      <label className="dt-select-mailbox-label">Select mailbox</label>
                    </div>
                      <UnlockMailbox
                        FDS={this.props.FDS}
                        subdomain={this.state.unlockingMailbox}
                        setSelectedMailbox={this.setSelectedMailbox.bind(this)}
                        mailboxUnlocked={this.mailboxUnlocked.bind(this)}
                      />
                  </div>
              </div>
            }
            {this.state.isAddingMailbox &&
              <div className="dt-select-mailbox">
                  <div className="dt-page-inner-wrapper">
                    <h1 className="dt-select-account-header">Create Mailbox</h1>
                      <AddMailbox 
                        FDS={this.FDS}
                        setSelectedMailbox={this.setSelectedMailbox.bind(this)}
                        mailboxUnlocked={this.mailboxUnlocked.bind(this)}
                        cancelAddMailbox={this.cancelAddMailbox.bind(this)}
                        mailboxesExist={this.state.mailboxesExist}
                      />
                  </div>
              </div>
            }
          </div>
        </div>
        <div id="dt-show-files" className={"dt-show-files dt-green dt-page-wrapper " + (this.state.uiState === 1 ? "dt-fade-in" : "dt-hidden")}>
          <div className="dt-page-inner-centered">
            <div className="dt-show-files-ui">            
              <h1 className="dt-show-files-header">{ this.state.selectedMailbox && this.state.selectedMailbox.subdomain }</h1>
              <div className="dt-show-files-nav">
                <button className={this.state.shownMessageType !== 'received' ? "inactive" : ""} onClick={this.showReceived.bind(this)}>received</button>
                 - <button className={this.state.shownMessageType !== "sent" ? "inactive" : ""} onClick={this.showSent.bind(this)}>sent</button>
                  - <button className={this.state.shownMessageType !== "stored" ? "inactive" : ""} onClick={this.showStored.bind(this)}>stored</button>
              </div>
              <div className="dt-icon-group clearfix">
                {this.state.shownMessageType === 'received' && 
                  <div>
                    {this.state.shownMessages.map((message)=>{
                      return <div key={message.hash.address} className="dt-icon" onClick={ ()=>{ return message.saveAs(); } }>
                          <img className="dt-file-icon" src="assets/images/file-icon.svg" alt="File Icon"/>
                          <div className="dt-info-filename">{ message.hash.file.name.substring(0,24)+'...' }</div>
                          <div className="dt-info-filesize">{ Utils.humanFileSize(message.hash.file.size) }</div>
                          <div className="dt-info-filesender">from: { message.from }</div>
                        </div>
                    })}
                  </div>
                }
                {this.state.shownMessageType === 'sent' && 
                  <div>
                    {this.state.shownMessages.map((message)=>{
                      return <div key={message.hash.address} className="dt-icon" onClick={ ()=>{ return message.saveAs(); } }>
                          <img className="dt-file-icon" src="assets/images/file-icon.svg" alt="File Icon"/>
                          <div className="dt-info-filename">{ message.hash.file.name.substring(0,24)+'...' }</div>
                          <div className="dt-info-filesize">{ Utils.humanFileSize(message.hash.file.size) }</div>
                          <div className="dt-info-filerecipient">to: { message.to }</div>
                        </div>
                    })}
                  </div>
                }
                {this.state.shownMessageType === 'stored' && 
                  <div>
                    {this.state.shownMessages.map((hash)=>{
                      return <div key={hash.address} className="dt-icon" onClick={ ()=>{ return hash.saveAs(); } }>
                          <img className="dt-file-icon" src="assets/images/file-icon.svg" alt="File Icon"/>
                          <div className="dt-info-filename">{ hash.file.name.substring(0,24)+'...' }</div>
                          <div className="dt-info-filesize">{ Utils.humanFileSize(hash.file.size) }</div>
                        </div>
                    })}
                  </div>
                }
              </div>
            </div>
          </div>
        </div>        
      </div>
    );
  }
}

export default DTransferMailbox;