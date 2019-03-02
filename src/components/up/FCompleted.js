import React, { Component } from 'react';
import Utils from '../../services/Utils';

class FCompleted extends Component{

  handleCopyGatewayLink(){
    var copyText = document.querySelector(".feedback-gateway-link input");
    copyText.select();
    document.execCommand("copy");
  }

  render(){
    return (
      <div id="completed" className={"confirm page-wrapper " + (this.props.parentState.uiState === 5 ? "fade-in" : "hidden")}> 
          <div className="info">
            <div className="info-content">
              <div className="file-was-sent">
                <img className="circle-tick" src="assets/images/circle-tick.svg" alt="Circle Tick"/>
                File is {this.props.parentState.isStoringFile === false ? 'sent.' : 'stored.'}
              </div>
              <div className="info-filename">
                <span className="info-filename-truncated">{this.props.parentState.selectedFileName}</span>
                <span className="info-filesize"> { Utils.humanFileSize(this.props.parentState.selectedFileSize) }</span>
              </div>
              
              {this.props.parentState.isQuick === false &&
                <div className="info-is-encrypted">
                  <img className="fairdrop-lock" src="assets/images/fairdrop-lock.svg" alt="fairdrop-logo"/> Encrypted
                </div>
              }

              {(this.props.parentState.isQuick === true && this.props.parentState.uploadedHash) &&
                <div>
                  <div className="feedback-swarmhash-message">File Download Link</div>
                  <div className="feedback-gateway-link">
                    <input type="text" value={this.props.parentState.uploadedHash.gatewayLink() || ""} readOnly={true}/>
                  </div>  
                  <a className="copy-gateway-link" onClick={this.handleCopyGatewayLink}>Click to copy link.</a>                  
                  { /* <div className="feedback-swarmhash"><input type="text" value={this.props.parentState.uploadedHash.address || ""} readOnly={true}/></div>  */ }
                </div>
              }
            </div>
          </div> {/* ui */}
      </div>
    )
  }
}

export default FCompleted;