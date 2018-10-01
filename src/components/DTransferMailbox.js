import React, { Component } from 'react';
import DTransfer from '../services/DTransfer';
import Dropdown from 'react-dropdown';
import DMailbox from '../services/DMailbox';
import FileSaver from 'file-saver';
import DMist from '../lib/DMist';

import UnlockMailbox from './Shared/UnlockMailbox'
import AddMailbox from './Shared/AddMailbox'


class DTransferMailbox extends Component{

  componentDidMount(){
    let dm = new DMist();
    dm.mist('dt-mist');
  }  

  getInitialState(){
    let mailboxes = DMailbox.getAll();

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
    let mailbox = DMailbox.get(subdomain);
    this.setState({
      unlockingMailbox: mailbox,
      isUnlockingMailbox: true,
      isAddingMailbox: false
    });
  }

  setSelectedMailbox(mailbox, wallet){
    this.setState({
      selectedMailbox: mailbox,
      selectedWallet: wallet,
    });
    this.showReceived();
  }

  showSent(){
    DMailbox.getMessages('sent', this.state.selectedMailbox.subdomain).then((messagesSent)=>{
      this.setState({
        shownMessageType: 'sent',
        shownMessages: messagesSent,
      });
    });
  }

  showReceived(){
    DMailbox.getMessages('received', this.state.selectedMailbox.subdomain)
    .then((messagesReceived)=>{
      this.setState({
        shownMessageType: 'received',
        shownMessages: messagesReceived,
      });
    });
  }  

  retrieveFile(message){
    return this.DT.getFileFromManifest(message.swarmhash, message.filename).then((retrievedFile)=>{
      return DMailbox.getSharedSecret(this.state.selectedWallet, message.from).then((secret)=>{
        let decryptedFile = this.DT.decryptedFile(retrievedFile, secret, message.filename, message.mime);      
        FileSaver.saveAs(new File([decryptedFile], message.filename, {type: message.mime}));
      });
    });
  }

  mailboxUnlocked(){
    let messages = DMailbox.getMessages('received',this.state.selectedMailbox.subdomain);
    this.setState({
      uiState: 1,
      messages: messages
    });
  }

  getDropDownOptions(){
    let mailboxes = DMailbox.getAll();
    return mailboxes.map((m)=>{
      return {label: m.subdomain, value:  m.subdomain};
    }).concat({label: 'new mailbox', value: "dt-new-mailbox" });
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
                        mailbox={this.state.unlockingMailbox}
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
                <a className={this.state.shownMessageType !== 'received' && "inactive"} onClick={this.showReceived.bind(this)}>received</a> - <a className={this.state.shownMessageType !== "sent" ? "inactive" : ""} onClick={this.showSent.bind(this)}>sent</a>
              </div>
              <div className="dt-icon-group clearfix">
                {this.state.shownMessages.map((message)=>{
                  return <div key={message.swarmhash} className="dt-icon" onClick={ ()=>{ return this.retrieveFile(message); } }>
                      <img className="dt-file-icon" src="/assets/images/file-icon.svg" alt="File Icon"/>
                      <div className="dt-info-filename">{ message.filename.substring(0,24)+'...' }</div>
                      <div className="dt-info-filesize">{ message.filesize }</div>
                    </div>
                })}
              </div>
            </div>
          </div>
        </div>        
      </div>
    );
  }
}

export default DTransferMailbox;