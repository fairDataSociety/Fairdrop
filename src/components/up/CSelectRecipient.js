import React, { Component } from 'react';
import DEns from '../../services/DEns';

class CSelectRecipient extends Component{
  
  constructor(props) {
    super(props);

    this.state = {
      feedbackMessage: ""
    }

    this.handleSelectRecipient = this.handleSelectRecipient.bind(this);    
    this.handleUploadAndEncrypt = this.handleUploadAndEncrypt.bind(this);    

  }

  handleSelectRecipient(){
    this.props.setParentState({
      addressee: this.refs.dtSelectRecipient.value,
    });
  }

  handleUploadAndEncrypt(){
    this.props.setParentState({
      uiState: 3,
      shouldEncrypt: true
    }); 
  }

  render(){
    return (
      <div id="dt-select-recipient" className={"dt-select-recipient dt-green dt-page-wrapper dt-hidden " + (this.props.parentState.uiState === 2 ? "dt-fade-in" : "")}> 
        <div className="dt-select-recipient-ui dt-page-inner-centered">
          <div className="dt-select-recipient">
            <h1 className="dt-select-account-header">Select Recipient</h1>
              <div className="dt-form-group">
                <input 
                  id="dt-select-recipient-address"
                  className="dt-select-recipient-address"
                  type="text" 
                  placeholder="mailbox name"
                  onChange={this.handleSelectRecipient}
                  name="selectRecipient"
                  ref="dtSelectRecipient"
                />
              </div>
              <button className="dt-select-select-recipient dt-btn dt-btn-lg dt-btn-green" onClick={this.handleUploadAndEncrypt}>Upload and Encrypt</button>
              <p>{this.state.feedbackMessage}</p>
          </div>
        </div>
      </div>
    )
  }
}

export default CSelectRecipient;