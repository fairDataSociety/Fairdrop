import React, { Component } from 'react';
import DTransfer from '../../services/DTransfer';
import DMailbox from '../../services/DMailbox';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css'

import AddMailbox from '../up/BSelectMailbox/AddMailbox'
import UnlockMailbox from '../up/BSelectMailbox/UnlockMailbox'

class ASelectFile extends Component{
  
  getInitialState(){
    let mailboxes = DMailbox.getAll();

    if(mailboxes.length === 0){
      return {
        isAddingMailbox: true,        
        isUnlockingMailbox: false,
        mailboxes: mailboxes,
        activeMailboxSubDomain: false,
        dropDownValue: false
      }
    }else if(mailboxes.length > 0){
      return {
        isAddingMailbox: false,        
        isUnlockingMailbox: true,
        mailboxes: mailboxes,
        unlockingMailbox: mailboxes[0],
        activeMailboxSubDomain: false,
        dropDownValue: mailboxes[0].subdomain
      }
    }
  }

  constructor(props) {
    super(props);

    this.state = this.getInitialState();

    this.addMailbox = this.addMailbox.bind(this);    
    this.handleUploadUnencrypted = this.handleUploadUnencrypted.bind(this);
    this.handleSelectMailbox = this.handleSelectMailbox.bind(this);

    this.DT = new DTransfer(process.env.REACT_APP_SWARM_GATEWAY);
  }

  setSelectedMailbox(mailbox, wallet){
    this.props.setParentState({
      selectedMailbox: mailbox,
      selectedWallet: wallet
    });
  }

  addMailbox(){
    this.setState({
      isAddingMailbox: true,
      isUnlockingMailbox: false
    })
  }

  cancelAddMailbox(){
    this.setState({
      isAddingMailbox: false,
      isUnlockingMailbox: true
    })    
  }

  setUnlockingMailbox(subdomain){
    let mailbox = DMailbox.get(subdomain);
    this.setState({
      unlockingMailbox: mailbox,
      isUnlockingMailbox: true,
      isAddingMailbox: false
    });
  }

  handleUploadUnencrypted(){
    this.props.setParentState({
      uiState: 3,
      shouldEncrypt: false
    });
  }

  mailboxUnlocked(){
    this.props.setParentState({
      uiState: 2
    });
  }

  handleSelectMailbox(option){
    if(option.value === 'dt-new-mailbox'){
      this.addMailbox();
    }else{
      this.setUnlockingMailbox(option.value);
    }
  }

  getDropDownOptions(mailboxes){
    return this.state.mailboxes.map((m)=>{
      return {label: m.subdomain, value:  m.subdomain};
    }).concat({label: 'new mailbox', value: "dt-new-mailbox" });
  }

  render(){
    return (
      <div id="dt-select-mailbox" className={"dt-select-mailbox dt-green dt-page-wrapper dt-hidden " + (this.props.parentState.uiState === 1 ? "dt-fade-in" : "")}> 
        <div className="dt-select-mailbox-ui dt-page-inner-centered">
          <div className="dt-select-mailbox">            
            {this.state.isUnlockingMailbox &&
              <div className="dt-page-inner-wrapper">
                <h1 className="dt-select-account-header">Encrypt and Send</h1>
                <div className="dt-form-group clearfix">
                  <div className="dt-select-mailbox-mailboxes">
                    <Dropdown options={this.getDropDownOptions()} value={this.state.dropDownValue} onChange={this.handleSelectMailbox.bind(this)} placeholder="Select a mailbox" />
                  </div>
                  <label className="dt-select-mailbox-label">Select mailbox</label>
                </div>
                {this.state.isUnlockingMailbox &&
                  <UnlockMailbox 
                    mailbox={this.state.unlockingMailbox} 
                    setSelectedMailbox={this.setSelectedMailbox.bind(this)}
                    mailboxUnlocked={this.mailboxUnlocked.bind(this)}
                  />
                }   
              </div>
            }         
            {this.state.isAddingMailbox &&
              <div className="dt-page-inner-wrapper">
                <h1 className="dt-select-account-header">New Mailbox</h1>
                <AddMailbox 
                  setSelectedMailbox={this.setSelectedMailbox.bind(this)}
                  mailboxUnlocked={this.mailboxUnlocked.bind(this)}
                  cancelAddMailbox={this.cancelAddMailbox.bind(this)}
                />
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

export default ASelectFile;