import React, { Component } from 'react';

class EConfirm extends Component{
  
  constructor(props) {
    super(props);

    this.state = {
      feedbackMessage: ""
    }

    this.handleEncryptAndSend = this.handleEncryptAndSend.bind(this);    
    this.handleCancel = this.handleCancel.bind(this);
  }

  handleCancel(){
    alert('tbc');
  }

  handleEncryptAndSend(){
    this.props.setParentState({
      uiState: 5,
    });
    this.props.handleUpload().then(()=>{
       this.props.setParentState({
        uiState: 6
      });     
    })
  }

  render(){
    return (
      <div id="dt-confirm" className={"dt-confirm dt-green dt-page-wrapper dt-hidden " + (this.props.parentState.uiState === 4 ? "dt-fade-in" : "")}> 
        <div className="dt-confirm-ui dt-page-inner-centered">
          <div className="dt-confirm">
            <h1 className="dt-confirm-header">Confirm</h1>          
            <p>File: {this.props.parentState.selectedFileName} {this.props.parentState.selectedFileSize}</p>
            <p>Sender: {this.props.parentState.selectedMailbox.subdomain}.datafund.eth</p>
            <p>Recipient: {this.props.parentState.addressee}.datafund.eth</p>
            <button className="dt-confirm-encrypt-and-send dt-btn dt-btn-lg dt-btn-green" onClick={this.handleEncryptAndSend}>Encrypt and Send</button>
            <button className="dt-confirm-cancel dt-btn dt-btn-lg dt-btn-green" onClick={this.handleCancel}>Cancel</button>
          </div>
        </div>
      </div>
    )
  }
}

export default EConfirm;