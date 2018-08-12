import React, { Component } from 'react';
import DTransfer from '../../services/Dtransfer';
import Dropzone from 'dropzone';

import MailboxIcon from '../up/CSelectMailbox/MailboxIcon'
import AddMailbox from '../up/CSelectMailbox/AddMailbox'


class ASelectFile extends Component{
  
  constructor(props) {
    super(props);

    this.state = {
      isAddingMailbox: false
    }

    this.addMailbox = this.addMailbox.bind(this);    

    this.DT = new DTransfer(process.env.REACT_APP_SWARM_GATEWAY);
  }

  unlockMailbox(e){
    debugger
    e.preventDefault();
  }

  addMailbox(e){
    this.setState({
      isAddingMailbox: true
    })
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
            {this.state.isAddingMailbox && 
              <AddMailbox/>
            }
          </div>
        </div>
      </div>
    )
  }
}

export default ASelectFile;