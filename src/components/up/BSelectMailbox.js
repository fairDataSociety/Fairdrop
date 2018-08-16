import React, { Component } from 'react';
import DTransfer from '../../services/Dtransfer';
import DMailbox from '../../services/DMailbox';
import DWallet from '../../services/DWallet';


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

  unlockMailbox(e, mailbox){
    this.setState({
      unlockingMailbox: mailbox,
      isUnlockingMailbox: true,
      isAddingMailbox: false
    });
    e.preventDefault();
  }

  unlockMailboxWallet(mailbox, password){
    let dWallet = new DWallet();
    let wallet = dWallet.fromJSON(mailbox.wallet.walletV3, password).then((wallet)=>{
        this.setSelectedMailbox(mailbox, wallet);
        this.setState({
          feedbackMessage: 'Mailbox unlocked.',
          mailboxIsUnlocked: true,
          isUnlockingMailbox: true,
        });
      }).catch((error)=>{
        this.setSelectedMailbox(false, false);
        this.setState({
          feedbackMessage: 'Password invalid, please try again.',
          mailboxIsUnlocked: false,
          isUnlockingMailbox: true,
        });
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

  hideUnlockMailbox(){
    this.setState({unlockingMailbox: false})
  }


  render(){
    return (
      <div id="dt-select-mailbox" className={"dt-select-mailbox dt-green dt-page-wrapper dt-hidden " + (this.props.parentState.uiState === 1 ? "dt-fade-in" : "")}> 
        <div className="dt-select-mailbox-ui dt-page-inner-centered">
          <div className="dt-select-mailbox">
            <h1 className="dt-select-account-header">
              {this.state.mailboxes.length === 0 ? 'Add Mailbox' : 'Select Mailbox'}
            </h1>
            <div className="dt-select-mailbox-mailboxes">
              <div className="dt-select-mailbox-mailboxes-existing">
                {this.state.mailboxes.map(
                  (mailbox)=>{
                    return <MailboxIcon activeMailbox={this.props.parentState.activeMailbox} mailbox={mailbox} mailboxAction={this.unlockMailbox.bind(this)} mailboxName={mailbox.subdomain} mailboxDescription={mailbox.subdomain+".datafund.eth"}/>
                  }
                )}
                {this.state.mailboxes.length > 0 &&
                  <MailboxIcon activeMailbox={this.props.parentState.activeMailbox} mailboxAction={this.addMailbox} mailboxName="+" mailboxDescription="Add Mailbox"/>
                }
              </div>
            </div>
            {this.state.mailboxes.length === 0 &&
              <AddMailbox 
                setSelectedMailbox={this.setSelectedMailbox.bind(this)}
              />
            }
            {this.state.isUnlockingMailbox && this.props.parentState.selectedWallet == false &&
              <UnlockMailbox 
                mailbox={this.state.unlockingMailbox} 
                setSelectedMailbox={this.setSelectedMailbox.bind(this)}
                hideUnlockMailbox={this.hideUnlockMailbox.bind(this)}
              />
            }
          </div>
          {this.mailboxUnlocked() !== false &&
            <button className="dt-select-recipient dt-btn dt-btn-lg dt-btn-green" onClick={this.handleSelectRecipient}>Select Recipient</button>
          }
        </div>
      </div>
    )
  }
}

export default ASelectFile;