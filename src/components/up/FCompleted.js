import React, { Component } from 'react';
import Utils from '../../services/DTransferUtils';

class FCompleted extends Component{

  render(){
    return (
      <div id="dt-completed" className={"dt-confirm dt-page-wrapper " + (this.props.parentState.uiState === 5 ? "dt-fade-in" : "dt-hidden")}> 
          <div className={"dt-info " + (this.props.parentState.fileIsSelected && "is-selected")}> {/* this bit slides in from left over the top of dt-select-file */}
            <div className="dt-info-content">
              <div className="dt-file-was-sent">
                <img className="dt-circle-tick" src="assets/images/circle-tick.svg" alt="Circle Tick"/>
                File is {this.props.isStoringFile === false ? 'sent.' : 'stored.'}
              </div>
              <div className="dt-info-filename">
                {this.props.parentState.selectedFileName}
                <span className="dt-info-filesize"> { Utils.humanFileSize(this.props.parentState.selectedFileSize) }</span>
              </div>
              
              <div className="dt-info-is-encrypted">
                <img className="dt-fairdrop-lock" src="assets/images/fairdrop-lock.svg" alt="fairdrop-logo"/> Encrypted
              </div>

              {this.props.parentState.fileWasUploaded &&
                <div>
                  <div className="dt-feedback-swarmhash-message">Swarm Hash</div>
                  <div className="dt-feedback-swarmhash"><input type="text" value={this.props.parentState.uploadedFileHash || ""} readOnly={true}/></div>  
                </div>
              }
            </div>
          </div> {/* dt-ui */}
      </div>
    )
  }
}

export default FCompleted;