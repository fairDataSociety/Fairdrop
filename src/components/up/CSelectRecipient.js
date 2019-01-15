import React, { Component } from 'react';

class CSelectRecipient extends Component{
  
  constructor(props) {
    super(props);

    this.FDS = props.FDS;

    this.handleSelectRecipient = this.handleSelectRecipient.bind(this);    
    this.handleUploadAndEncrypt = this.handleUploadAndEncrypt.bind(this);    

    this.state = {
      feedbackMessage: "",
      mailboxName: false,
      password: false,
    }

  }

  handleSelectRecipient(e){
    e.preventDefault();
    this.props.setParentState({
      addressee: this.refs.dtSelectRecipient.value,
    });
  }

  handleUploadAndEncrypt(e){
    e.preventDefault();

    let mailboxName = this.props.parentState.addressee;

    this.setState({
      mailboxName: mailboxName,
      feedbackMessage: "Finding mailbox..."        
    });



    this.FDS.Account.isMailboxNameAvailable(mailboxName).then((result) => {
      if(result === true){
        throw new Error("Couldn't find that mailbox, please try again...")
      }
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
      <div id="select-recipient" className={"select-recipient green page-wrapper " + (this.props.parentState.uiState === 2 ? "fade-in" : "hidden")}> 
        <div className="select-recipient-ui page-inner-centered">
          <div className="select-recipient page-inner-wrapper">
            <form onSubmit={this.handleUploadAndEncrypt}>
              <h1 className="select-account-header">Select Recipient*</h1>
              <div className="form-group form-group-last">
                <input 
                  id="select-recipient-address"
                  className="select-recipient-address"
                  type="text" 
                  placeholder="mailbox name"
                  onChange={this.handleSelectRecipient}
                  name="selectRecipient"
                  ref="dtSelectRecipient"
                />
                <div className="feedback-unlock-ui">{this.state.feedbackMessage}</div>
              </div>
              <div className="btn-group clearfix">
                <button className="select-select-recipient btn btn-lg btn-green btn-float-left" onClick={this.handleUploadAndEncrypt}>Upload and Encrypt</button>
              </div>
              <div className="page-smallprint">
                *For somebody to receive a file they need a mailbox first
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default CSelectRecipient;