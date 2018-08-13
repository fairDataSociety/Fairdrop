import React, { Component } from 'react';

class FCompleted extends Component{
  
  constructor(props) {
    super(props);
  }

  render(){
    return (
      <div id="dt-completed" className={"dt-confirm dt-green dt-page-wrapper dt-hidden " + (this.props.parentState.uiState === 5 ? "dt-fade-in" : "")}> 
          <div className={"dt-info " + (this.props.parentState.fileIsSelected && "is-selected")}> {/* this bit slides in from left over the top of dt-select-file */}
            <div className="dt-info-content">
              <img className="dt-file-icon" src="/assets/images/file-icon.svg" alt="File Icon"/>
              <div className="dt-info-filename">{this.props.parentState.selectedFileName}</div>
              <div className="dt-info-filesize">{this.props.parentState.selectedFileSize}</div>
              <div className="dt-info-is-encrypted">{this.props.parentState.encryptMessage}</div>
              <div className="dt-feedback-message">{this.props.parentState.feedBackMessage}</div>
            </div>
          </div> {/* dt-info */}
          <div className={"dt-ui " + (this.props.parentState.fileIsSelected && "is-selected")}> {/* this bit slides in from right over the top of dt-select-file */}
              {this.props.parentState.fileWasUploaded &&
                <div className="dt-ui-wrapper">
                  <div className="dt-feedback">
                    <div>
                      <p>Swarmhash: <input type="text" value={this.props.parentState.uploadedFileHash} readOnly="true"/></p>
                      <p>
                        <a href={this.props.parentState.dTransferLink} target="_blank" className="dt-file-link">DTransferLink: </a>
                        <input type="text" value={this.props.parentState.dTransferLink} readOnly="true"/>
                      </p>
                    {this.props.parentState.emails && this.props.parentState.emails.count > 0 && 
                      <div>
                      <p>Sent to: </p>
                      <ul>
                        {this.props.parentState.emails.map((email, i) => <li>email</li> )}
                      </ul>
                      </div>
                    }
                    </div>
                    <button id="dt-send-another-button" className="dt-btn dt-btn-lg dt-btn-green dt-send-another-button" onClick={this.resetToInitialState}>Send Another</button>
                  </div>
                </div>
              }
          </div> {/* dt-ui */}
      </div>
    )
  }
}

export default FCompleted;