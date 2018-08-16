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
    this.setState({feedbackMessage: ""});
    this.props.setParentState({
      uiState: 3,
    });
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
            <h1 className="dt-confirm-header">Confirm</h1>          
            {this.props.parentState.shouldEncrypt && 
              <div className="dt-confirm-ui-group">
                <table>
                  <tablebody>
                    <tr>
                      <td>File:</td><td>{this.props.parentState.selectedFileName}</td><td>{this.props.parentState.selectedFileSize}</td>
                    </tr>
                    <tr>
                      <td>Sender:</td><td>{this.props.parentState.selectedMailbox.subdomain}.datafund.eth</td><td></td>
                    </tr>
                    <tr>
                      <td>Recipient:</td><td>{this.props.parentState.addressee}.datafund.eth</td><td></td>
                    </tr>
                  </tablebody>
                </table>
                <button className="dt-confirm-encrypt-and-send dt-btn dt-btn-lg dt-btn-green dt-btn-float-left" onClick={this.handleEncryptAndSend}>Encrypt and Send</button>              
                <button className="dt-confirm-cancel dt-btn dt-btn-lg dt-btn-link dt-btn-float-right" onClick={this.handleCancel}>Cancel</button>              
              </div>
            }
            {!this.props.parentState.shouldEncrypt && 
              <div className="dt-confirm-ui-group">
                <p>File: {this.props.parentState.selectedFileName} {this.props.parentState.selectedFileSize}</p>
                <button className="dt-confirm-upload-unencrypted dt-btn dt-btn-lg dt-btn-green dt-btn-float-left" onClick={this.handleUploadUnencrypted}>Upload Unencrypted</button>              
                <button className="dt-confirm-cancel dt-btn dt-btn-lg dt-btn-link dt-btn-float-right" onClick={this.handleCancel}>Cancel</button>
              </div>
            }
        </div>
      </div>
    )
  }
}

export default DConfirm;