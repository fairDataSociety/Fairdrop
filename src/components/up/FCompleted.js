import React, { Component } from 'react';
import Utils from '../../services/DTransferUtils';

class FCompleted extends Component{

  render(){
    return (
      <div id="completed" className={"confirm page-wrapper " + (this.props.parentState.uiState === 5 ? "fade-in" : "hidden")}> 
          <div className={"info " + (this.props.parentState.fileIsSelected && "is-selected")}> {/* this bit slides in from left over the top of select-file */}
            <div className="info-content">
              <div className="file-was-sent">
                <img className="circle-tick" src="assets/images/circle-tick.svg" alt="Circle Tick"/>
                File is {this.props.isStoringFile === false ? 'sent.' : 'stored.'}
              </div>
              <div className="info-filename">
                {this.props.parentState.selectedFileName}
                <span className="info-filesize"> { Utils.humanFileSize(this.props.parentState.selectedFileSize) }</span>
              </div>
              
              <div className="info-is-encrypted">
                <img className="fairdrop-lock" src="assets/images/fairdrop-lock.svg" alt="fairdrop-logo"/> Encrypted
              </div>

              {this.props.parentState.fileWasUploaded &&
                <div>
                  <div className="feedback-swarmhash-message">Swarm Hash</div>
                  <div className="feedback-swarmhash"><input type="text" value={this.props.parentState.uploadedFileHash || ""} readOnly={true}/></div>  
                </div>
              }
            </div>
          </div> {/* ui */}
      </div>
    )
  }
}

export default FCompleted;