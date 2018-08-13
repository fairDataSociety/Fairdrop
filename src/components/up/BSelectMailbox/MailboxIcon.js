import React, { Component } from 'react';
import DTransfer from '../../../services/Dtransfer';

class MailboxIcon extends Component{
  
  constructor(props) {
    super(props);
    this.state = {
      isSelected: this.isSelected()
    }
  }

  isSelected(){
    return (this.props.activeMailbox && this.props.activeMailbox.subdomain === this.props.mailbox.subdomain)
  }

  render(){
    return (
      <div className="dt-mailbox-icon">
        <button onClick={ (e) => {this.props.mailboxAction(e, this.props.mailbox)} }>
          <div className="dt-mailbox">
            <div className="dt-mailbox-name">
              {this.props.mailboxName} {this.isSelected() ? "Selected" : ""}
            </div>
            <div className="dt-mailbox-description">
              {this.props.mailboxDescription}
            </div>
          </div>
        </button>
      </div>
    )
  }
}

export default MailboxIcon;