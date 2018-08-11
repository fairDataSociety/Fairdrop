import React, { Component } from 'react';
import DTransfer from '../../services/Dtransfer';
import Dropzone from 'dropzone';

class ASelectFile extends Component{
  
  constructor(props) {
    super(props);
    this.DT = new DTransfer(process.env.REACT_APP_SWARM_GATEWAY);
    this.handleClickShouldEncrypt = this.handleClickShouldEncrypt.bind(this);
    this.handleClickShouldNotEncrypt = this.handleClickShouldNotEncrypt.bind(this);
  }

  handleClickShouldEncrypt(e){
    e.preventDefault();
    this.props.setParentState({
      shouldEncrypt: true,
      uiState: 2
    });
  } 

  handleClickShouldNotEncrypt(e){
    e.preventDefault();
    this.props.setParentState({
      shouldEncrypt: false,
      uiState: 2
    });
  }

  render(){
    return (
      <div id="dt-select-encryption" className={"dt-select-encryption dt-page-wrapper dt-hidden dt-green " + (this.props.parentState.uiState === 1 ? "dt-fade-in" : "")}> 
        <div className="dt-select-encryption-ui dt-page-inner-centered">
          <div className="dt-toggle-should-encrypt">
            <h1 className="dt-select-encryption-header">Encrypt</h1>
            <div className="dt-select-encryption-file-info">
              <span>File: {this.props.parentState.selectedFileName} {this.props.parentState.selectedFileSize}</span>
            </div>
            <div className="dt-select-encryption-buttons">
              <button className="dt-btn dt-btn-lg dt-select-encryption-yes-button dt-btn-green" onClick={this.handleClickShouldEncrypt}>
                {this.props.parentState.isSignedIn ? 'Upload Encrypted' : 'Sign Up to Upload Encrypted'}
              </button>
              <button className="dt-btn dt-btn-lg dt-select-encryption-no-button dt-btn-green" onClick={this.handleClickShouldNotEncrypt}>No</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ASelectFile;