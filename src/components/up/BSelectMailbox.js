import React, { Component } from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css'

import AddMailbox from '../Shared/AddMailbox'
import UnlockMailbox from '../Shared/UnlockMailbox'

class BSelectMailbox extends Component{
  
  constructor(props) {
    super(props);

    this.FDS = this.props.FDS;

    this.state = this.getInitialState();

    this.addMailbox = this.addMailbox.bind(this);    
    this.handleSelectMailbox = this.handleSelectMailbox.bind(this);

  }

  getInitialState(){
    let mailboxes = this.FDS.GetAccounts();

    if(mailboxes.length === 0){
      return {
        isAddingMailbox: true,        
        isUnlockingMailbox: false,
        mailboxes: mailboxes,
        activeMailboxSubDomain: false,
        dropDownValue: false,
        mailboxesExist: false
      }
    }else if(mailboxes.length > 0){
      return {
        isAddingMailbox: false,        
        isUnlockingMailbox: true,
        mailboxes: mailboxes,
        unlockingMailbox: mailboxes[0].subdomain,
        activeMailboxSubDomain: false,
        dropDownValue: mailboxes[0].subdomain,
        mailboxesExist: true
      }
    }
  }

  setSelectedMailbox(account){
    this.props.setParentState({
      selectedMailbox: account.subdomain
    });
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

  setUnlockingMailbox(subdomain){
    this.setState({
      unlockingMailbox: subdomain,
      isUnlockingMailbox: true,
      isAddingMailbox: false,
      dropDownValue: subdomain
    });
  }

  mailboxUnlocked(){
    if(this.props.parentState.isStoringFile){
      //skip select recipient 
      this.props.setParentState({
        uiState: 3
      });
    }else{
      //select recipient 
      this.props.setParentState({
        uiState: 2
      });
    }
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
    }).concat({label: 'new mailbox +', value: "dt-new-mailbox" });
  }

  render(){
    return (
      <div id="dt-select-mailbox" className={"dt-select-mailbox dt-green dt-page-wrapper " + (this.props.parentState.uiState === 1 ? "dt-fade-in" : "dt-hidden")}> 
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
                    FDS={this.FDS}
                    subdomain={this.state.unlockingMailbox}
                    mailboxUnlocked={this.mailboxUnlocked.bind(this)}
                    setSelectedMailbox={this.setSelectedMailbox.bind(this)}
                  />
                }   
              </div>
            }         
            {this.state.isAddingMailbox &&
              <div className="dt-page-inner-wrapper">
                <h1 className="dt-select-account-header">New Mailbox</h1>
                <AddMailbox 
                  FDS={this.FDS}
                  mailboxUnlocked={this.mailboxUnlocked.bind(this)}
                  cancelAddMailbox={this.cancelAddMailbox.bind(this)}
                  mailboxesExist={this.state.mailboxesExist}
                  setSelectedMailbox={this.setSelectedMailbox.bind(this)}                  
                />
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

export default BSelectMailbox;