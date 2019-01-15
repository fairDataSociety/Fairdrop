import React, { Component } from 'react';
import DMist from '../../lib/DMist'

class EInProgress extends Component{

  componentDidMount(){
    let dm = new DMist();
    dm.mist('mist');
  }

  render(){
    return (
      <div id="in-progress" className={"in-progress green page-wrapper " + (this.props.parentState.uiState === 4 ? "fade-in" : "hidden")}> 
          <div className="mist"></div>
          <div className="in-progress-ui page-inner-centered">
            { !this.props.parentState.fileWasEncrypted &&
              <div className="in-progress-ui">
                <h1 className="in-progress-header"><img className="in-progress-icon" src="assets/images/progress.svg" alt="Spinning"/>Encrypting*</h1>
                <h2 className="in-progress-sub">*AES-256 military grade encryption</h2>
                <h3 className="in-progress-sub-2">{this.props.parentState.feedbackMessage}</h3>
              </div>
            }
            { this.props.parentState.fileWasEncrypted && !this.props.parentState.fileWasUploaded &&
              <div className="in-progress-ui">
                <h1 className="in-progress-header"><img className="in-progress-icon" src="assets/images/progress.svg" alt="Spinning"/>Uploading</h1>
                <h2 className="in-progress-sub">Storing Encrypted in Swarm network</h2>
                <h3 className="in-progress-sub-2">{this.props.parentState.feedbackMessage}</h3>
              </div>
            }
          </div>
      </div>
    )
  }
}

export default EInProgress;