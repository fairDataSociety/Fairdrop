import React, { Component } from 'react';
import DTransfer from '../services/Dtransfer';
import DEns from '../services/DEns';
import Dropdown from 'react-dropdown';
import DMailbox from '../services/DMailbox';

import MailboxIcon from './up/BSelectMailbox/MailboxIcon'
import AddMailbox from './up/BSelectMailbox/AddMailbox'
import UnlockMailbox from './up/BSelectMailbox/UnlockMailbox'

class DTransferMy extends Component{

  // initialise

  getInitialState(){
    let mailboxes = DMailbox.getAll();

    if(mailboxes.length === 0){
      return {
        selectedMailbox: null,
        selectedWallet: null,
        unlockingMailbox: null,

        isAddingMailbox: true,        
        isUnlockingMailbox: false,
        mailboxes: mailboxes,
        activeMailboxSubDomain: false,
        dropDownValue: false
      };
    }else if(mailboxes.length > 0){
      return {
        selectedMailbox: null,
        selectedWallet: null,
        unlockingMailbox: null,

        isAddingMailbox: false,        
        isUnlockingMailbox: true,
        mailboxes: mailboxes,
        unlockingMailbox: mailboxes[0],
        activeMailboxSubDomain: false,
        dropDownValue: mailboxes[0].subdomain
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
      // this.addMailbox();
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
      selectedWallet: wallet
    });
  }

  mailboxUnlocked(){
    this.setState({
      uiState: 1
    });
  }

  getDropDownOptions(){
    let mailboxes = DMailbox.getAll();
    return mailboxes.map((m)=>{
      return {label: m.subdomain, value:  m.subdomain};
    }).concat({label: 'sent', value: 'sent' }).concat({label: 'saved', value: 'saved' });
  }

  render() {
    return (
      <div id="dt-select-mailbox" className={"dt-select-mailbox dt-green dt-page-wrapper dt-hidden " + (this.props.uiState !== 1 ? "dt-fade-in" : "")}> 
        <div className="dt-select-mailbox-ui dt-page-inner-centered">
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
        </div>
      </div>
    );
  }
}

export default DTransferMy;