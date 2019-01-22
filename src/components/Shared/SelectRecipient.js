import React, { Component } from 'react';

class SelectRecipient extends Component{
  
  constructor(props) {
    super(props);

    this.FDS = props.FDS;

    this.state = {
      feedbackMessage: "",
      mailboxName: false,
      password: false,
    }

  }

  render(){
    return (
      <div className="select-recipient">
          <h2 className="select-account-header">Select recipient*</h2>
          <div className="form-group form-group-last">
            <input 
              id="select-recipient-address"
              className="select-recipient-address"
              type="text" 
              placeholder="mailbox name"
              onChange={this.props.handleSelectRecipient}
              name="selectRecipient"
              ref="dtSelectRecipient"
            />
            <div className="ui-feedback">{this.state.feedbackMessage}</div>
          </div>
      </div>
    )
  }
}

export default SelectRecipient;