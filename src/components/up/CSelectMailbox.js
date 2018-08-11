import React, { Component } from 'react';
import DTransfer from '../../services/Dtransfer';
import Dropzone from 'dropzone';

import MailboxIcon from '../up/CSelectMailbox/MailboxIcon'


class ASelectFile extends Component{
  
  constructor(props) {
    super(props);

    this.DT = new DTransfer(process.env.REACT_APP_SWARM_GATEWAY);
    this.selectMailboxName = this.selectMailboxName.bind(this);
    this.selectPassword = this.selectPassword.bind(this);
    this.selectPasswordVerification = this.selectPasswordVerification.bind(this);
    this.addMailbox = this.addMailbox.bind(this);
  }

  selectMailboxName(e){
    e.preventDefault();
  }

  selectPassword(e){
    e.preventDefault();
  }

  selectPasswordVerification(e){
    e.preventDefault();
  }

  unlockMailbox(e){
    debugger
    e.preventDefault();
  }

  addMailbox(e){
    debugger
    e.preventDefault();
  }  

  render(){
    return (
      <div id="dt-select-mailbox" className={"dt-select-mailbox dt-green dt-page-wrapper dt-hidden " + (this.props.parentState.uiState === 2 ? "dt-fade-in" : "")}> 
        <div className="dt-select-mailbox-ui dt-page-inner-centered">
          <div className="dt-select-mailbox">
            <h1 className="dt-select-account-header">Select Mailbox</h1>
            <div className="dt-select-mailbox-mailboxes">
              <MailboxIcon mailboxAction={this.unlockMailbox} mailboxName="Bob" mailboxDescription="bob.datafund.eth"/>
              <MailboxIcon mailboxAction={this.addMailbox} mailboxName="+" mailboxDescription="Add Mailbox"/>
            </div>
            <div className="dt-mailbox-add-ui">
              <input id="dt-mailbox-add-name" autoComplete="off" className="dt-mailbox-add-name" type="text" placeholder="mailbox name" onChange={this.selectMailboxName}/>
              <input id="dt-mailbox-add-password" autoComplete="off" className="dt-mailbox-add-password" type="text" placeholder="password" onChange={this.selectPassword}/>
              <input id="dt-mailbox-add-password-verification" autoComplete="off" className="dt-mailbox-add-password-verification" type="text" placeholder="password verification" onChange={this.selectPasswordVerification}/>
              <button className="dt-btn dt-btn-lg dt-select-encryption-no-button dt-btn-green" onClick={this.addMailbox}>Add Mailbox</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ASelectFile;