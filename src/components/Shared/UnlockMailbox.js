import React, { Component } from 'react';
import Dropdown from 'react-dropdown';

class UnlockMailbox extends Component{
  
  constructor(props) {
    super(props);
  }

  render(){
    return (
      <div className="mailbox-unlock-ui">
        <h2 className="select-account-header">Select mailbox</h2>
        <div className="form-group clearfix">
          <div className="select-mailbox-mailboxes">
            <Dropdown
              options={this.props.dropDownOptions}
              value={this.props.dropDownValue}
              onChange={this.props.handleSelectMailbox}
              placeholder="Select a mailbox" 
            />
          </div>
        </div>
        <div className="form-group form-group-last clearfix">
            <input 
              id="mailbox-unlock-password" 
              autoComplete="off" 
              className="mailbox-unlock-password" 
              type="password" 
              placeholder="Password" 
              ref="dtSelectPassword"
              onChange={this.props.handleInputPassword.bind(this)}
            />
        </div>
      </div>
    )
  }
}

export default UnlockMailbox;