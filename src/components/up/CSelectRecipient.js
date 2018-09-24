import React, { Component } from 'react';
import DMailbox from '../../services/DMailbox';

class CSelectRecipient extends Component{
  
  constructor(props) {
    super(props);
    this.handleSelectRecipient = this.handleSelectRecipient.bind(this);    
    this.handleUploadAndEncrypt = this.handleUploadAndEncrypt.bind(this);    

    this.state = {
      feedbackMessage: "",
      mailboxName: false,
      password: false,
    }

  }

  handleSelectRecipient(){
    this.props.setParentState({
      addressee: this.refs.dtSelectRecipient.value,
    });
  }

  handleUploadAndEncrypt(){

    let mailboxName = this.props.parentState.addressee;

    this.setState({
      mailboxName: mailboxName,
      feedbackMessage: "Finding mailbox..."        
    });

    DMailbox.getPubKey(mailboxName).then((result) => {
      this.setState({
        feedbackMessage: "Mailbox found"        
      });
      this.props.setParentState({
          uiState: 3,
          shouldEncrypt: true
        }); 
      }).catch((error) => {
        if(error.toString() === 'Error: Invalid JSON RPC response: ""'){
          this.setState({
            mailboxName: mailboxName,
            feedbackMessage: "Network error - please try again..."        
          });
        }else{
          this.setState({
            mailboxName: mailboxName,
            feedbackMessage: "Couldn't find that mailbox, please try again..."        
          });
        }
      })
  }

  render(){
    return (
      <div id="dt-select-recipient" className={"dt-select-recipient dt-green dt-page-wrapper " + (this.props.parentState.uiState === 2 ? "dt-fade-in" : "dt-hidden")}> 
        <div className="dt-select-recipient-ui dt-page-inner-centered">
          <div className="dt-select-recipient dt-page-inner-wrapper">
            <h1 className="dt-select-account-header">Select Recipient*</h1>
              <div className="dt-form-group dt-form-group-last">
                <input 
                  id="dt-select-recipient-address"
                  className="dt-select-recipient-address"
                  type="text" 
                  placeholder="mailbox name"
                  onChange={this.handleSelectRecipient}
                  name="selectRecipient"
                  ref="dtSelectRecipient"
                />
                <div className="dt-feedback-unlock-ui">{this.state.feedbackMessage}</div>
              </div>
              <div className="dt-btn-group clearfix">
                <button className="dt-select-select-recipient dt-btn dt-btn-lg dt-btn-green dt-btn-float-left" onClick={this.handleUploadAndEncrypt}>Upload and Encrypt</button>
              </div>
              <div className="dt-page-smallprint">
                *For somebody to receive a file they need a mailbox first
              </div>
          </div>
        </div>
      </div>
    )
  }
}

export default CSelectRecipient;