import React, { Component } from 'react';
import Dropdown from 'react-dropdown';

class AddMailbox extends Component{
  
  constructor(props) {
    super(props);
  }

  render(){
    return (
      <div>
        <h2 className="select-account-header">Create mailbox</h2>
        <div className="mailbox-add-ui">
          <div className="form-group">      
            <input 
              className="mailbox-add-name" 
              type="text" 
              autoComplete="new-name"    
              placeholder="Mailbox name" 
              onChange={this.props.handleInputMailboxName}
              ref="dtSelectMailboxName"
            />
          </div>
          <div className="form-group"> 
            <input 
              className="mailbox-add-password" 
              type="password" 
              placeholder="Password"
              autoComplete="off"       
              onChange={this.props.handleInputPassword}
              ref="dtSelectPassword"
            />
          </div>
          <div className="form-group-last clearfix">
            <input 
              autoComplete="off"            
              className="mailbox-add-password-verification" 
              type="password" 
              placeholder="Verify password" 
              onChange={this.props.handleInputPasswordVerification}
              ref="dtSelectPasswordVerification"  
            />
          </div>
        </div>
      </div>
    )
  }
}

export default AddMailbox;