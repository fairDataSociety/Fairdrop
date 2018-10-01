import React, { Component } from 'react';

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
              {this.props.mailboxName.substring(0,1)} {this.isSelected() ? "Selected" : ""}
            </div>
          </div>
        </button>
        <div onClick={ (e) => {this.props.mailboxAction(e, this.props.mailbox)} } className="dt-mailbox-description">
          {this.props.mailboxDescription}
        </div>
      </div>
    )
  }
}

export default MailboxIcon;