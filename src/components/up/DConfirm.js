import React, { Component } from 'react';

class DConfirm extends Component{
  
  constructor(props) {
    super(props);

    this.state = {
      feedbackMessage: ""
    }

    this.handleEncryptAndSend = this.handleEncryptAndSend.bind(this);    
    this.handleUploadUnencrypted = this.handleUploadUnencrypted.bind(this);    
    this.handleCancel = this.handleCancel.bind(this);
  }

  handleCancel(){
    alert('tbc');
  }

  handleEncryptAndSend(){
    this.props.setParentState({
      uiState: 4,
    });
    this.props.handleUpload().then(()=>{
       this.props.setParentState({
        uiState: 5
      });     
    })
  }

  handleUploadUnencrypted(){
    this.props.setParentState({
      uiState: 4,
    });
    this.props.handleUpload().then(()=>{
       this.props.setParentState({
        uiState: 5
      });     
    })    
  }

  render(){
    return (
      <div id="dt-confirm" className={"dt-confirm dt-green dt-page-wrapper dt-hidden " + (this.props.parentState.uiState === 3 ? "dt-fade-in" : "")}> 
        <div className="dt-confirm-ui dt-page-inner-centered">
          <div className="dt-confirm">
            <h1 className="dt-confirm-header">Confirm</h1>          
            {this.props.parentState.shouldEncrypt && 
              <div>
                <p>File: {this.props.parentState.selectedFileName} {this.props.parentState.selectedFileSize}</p>
                <p>Sender: {this.props.parentState.selectedMailbox.subdomain}.datafund.eth</p>
                <p>Recipient: {this.props.parentState.addressee}.datafund.eth</p>
                <button className="dt-confirm-encrypt-and-send dt-btn dt-btn-lg dt-btn-green" onClick={this.handleEncryptAndSend}>Encrypt and Send</button>              
                <button className="dt-confirm-cancel dt-btn dt-btn-lg dt-btn-green" onClick={this.handleCancel}>Cancel</button>                
              </div>
            }
            {!this.props.parentState.shouldEncrypt && 
              <div>
                <p>File: {this.props.parentState.selectedFileName} {this.props.parentState.selectedFileSize}</p>
                <button className="dt-confirm-upload-unencrypted dt-btn dt-btn-lg dt-btn-green" onClick={this.handleUploadUnencrypted}>Upload Unencrypted</button>              
                <button className="dt-confirm-cancel dt-btn dt-btn-lg dt-btn-green" onClick={this.handleCancel}>Cancel</button>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

export default DConfirm;