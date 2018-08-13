import React, { Component } from 'react';
import DTransfer from '../../services/Dtransfer';
import DMailbox from '../../services/DMailbox';

import Dropzone from 'dropzone';

import MailboxIcon from '../up/BSelectMailbox/MailboxIcon'
import AddMailbox from '../up/BSelectMailbox/AddMailbox'
import UnlockMailbox from '../up/BSelectMailbox/UnlockMailbox'

class ASelectFile extends Component{
  
  constructor(props) {
    super(props);

    this.state = {
      isAddingMailbox: false,
      mailboxes: DMailbox.getAll(),
      activeMailboxSubDomain: false
    }

    this.addMailbox = this.addMailbox.bind(this);    
    this.unlockMailbox = this.unlockMailbox.bind(this);    
    this.handleSelectRecipient = this.handleSelectRecipient.bind(this);    
    this.handleUploadUnencrypted = this.handleUploadUnencrypted.bind(this);

    this.DT = new DTransfer(process.env.REACT_APP_SWARM_GATEWAY);
  }

  unlockMailbox(e, mailbox){
    this.setState({
      unlockingMailbox: mailbox,
      isUnlockingMailbox: true,
      isAddingMailbox: false
    })
    e.preventDefault();
  }

  addMailbox(e){
    this.setState({
      isAddingMailbox: true,
      isUnlockingMailbox: false
    })
    e.preventDefault();
  }

  handleSelectRecipient(e){
    this.props.setParentState({
      uiState: 2
    });
  }

  setSelectedMailbox(mailbox, wallet){
    this.props.setParentState({
      selectedMailbox: mailbox,
      selectedWallet: wallet
    });
  }

  mailboxUnlocked(){
    return this.props.parentState.selectedWallet !== false;
  }

  handleUploadUnencrypted(){
    this.props.setParentState({
      uiState: 3,
      shouldEncrypt: false
    });     
  }


  render(){
    return (
      <div id="dt-select-mailbox" className={"dt-select-mailbox dt-green dt-page-wrapper dt-hidden " + (this.props.parentState.uiState === 1 ? "dt-fade-in" : "")}> 
        <div className="dt-select-mailbox-ui dt-page-inner-centered">
          <div className="dt-select-mailbox">
            <h1 className="dt-select-account-header">Select Mailbox</h1>
            <div className="dt-select-mailbox-mailboxes">
              <div className="dt-select-mailbox-mailboxes-existing">
                {this.state.mailboxes && this.state.mailboxes.map(
                  (mailbox)=>{
                    return <MailboxIcon activeMailbox={this.props.parentState.activeMailbox} mailbox={mailbox} mailboxAction={this.unlockMailbox} mailboxName={mailbox.subdomain} mailboxDescription="Unlock Mailbox"/>
                  }
                )}
              </div>
              <MailboxIcon mailboxAction={this.addMailbox} mailboxName="+" mailboxDescription="Add Mailbox"/>
            </div>
            {this.state.isAddingMailbox && 
              <AddMailbox/>
            }
            {this.state.isUnlockingMailbox && 
              <UnlockMailbox mailbox={this.state.unlockingMailbox} setSelectedMailbox={this.setSelectedMailbox.bind(this)}/>
            }
          </div>
          {this.mailboxUnlocked() !== false &&
            <button className="dt-select-recipient dt-btn dt-btn-lg dt-btn-green" onClick={this.handleSelectRecipient}>Select Recipient</button>
          }
          <button className="dt-select-select-recipient dt-btn dt-btn-lg dt-btn-green" onClick={this.handleUploadUnencrypted}>upload unencrypted</button>
        </div>
      </div>
    )
  }
}

export default ASelectFile;