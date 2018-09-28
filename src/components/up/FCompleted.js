import React, { Component } from 'react';
import Utils from '../../services/DTransferUtils';

class FCompleted extends Component{

  render(){
    return (
      <div id="dt-completed" className={"dt-confirm dt-green dt-page-wrapper " + (this.props.parentState.uiState === 5 ? "dt-fade-in" : "dt-hidden")}> 
          <div className={"dt-info " + (this.props.parentState.fileIsSelected && "is-selected")}> {/* this bit slides in from left over the top of dt-select-file */}
            <div className="dt-info-content">
              <img className="dt-file-icon" src="/assets/images/file-icon.svg" alt="File Icon"/>
              <div className="dt-info-filename">{this.props.parentState.selectedFileName}</div>
              <div className="dt-info-filesize">{ Utils.humanFileSize(this.props.parentState.selectedFileSize) }</div>
              <div className="dt-info-is-encrypted">
                <img className="dt-fairdrop-lock" src="/assets/images/fairdrop-lock.svg" alt="fairdrop-logo"/> File is encrypted
              </div>
              <div className="dt-feedback-message">from: { this.props.parentState.selectedMailbox.subdomain }</div>
              <div className="dt-feedback-message">to: { this.props.parentState.addressee }</div>
              <div className="dt-feedback-message">{this.props.parentState.feedBackMessage}</div>
            </div>
          </div> {/* dt-info */}
          <div className={"dt-ui " + (this.props.parentState.fileIsSelected && "is-selected")}> {/* this bit slides in from right over the top of dt-select-file */}
              {this.props.parentState.fileWasUploaded &&
                <div className="dt-ui-wrapper">
                  <div className="dt-feedback">
                    <div className="dt-feedback-content">
                      <div className="dt-link-group">
                        <div className="dt-link-label"><a href={this.props.parentState.dTransferLink} target="_blank">Swarm Hash </a></div>
                        <input type="text" value={this.props.parentState.uploadedFileHash} readOnly="true"/>
                      </div>
                      <div className="dt-link-group">
                        <div className="dt-link-label"><a href={this.props.parentState.dTransferLink} target="_blank">Fairdrop Link </a></div>
                        <input type="text" value={this.props.parentState.dTransferLink} readOnly="true"/>
                      </div>
                    </div>
                  </div>
                </div>
              }
          </div> {/* dt-ui */}
      </div>
    )
  }
}

export default FCompleted;