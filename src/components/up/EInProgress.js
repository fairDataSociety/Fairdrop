import React, { Component } from 'react';
import DMist from '../../lib/DMist'

class EInProgress extends Component{

  componentDidMount(){
    let dm = new DMist;
    dm.mist('dt-mist');

    window.DMist = DMist;
  }

  render(){
    return (
      <div id="dt-in-progress" className={"dt-in-progress dt-green dt-page-wrapper " + (this.props.parentState.uiState === 4 ? "dt-fade-in" : "dt-hidden")}> 
          <div className="dt-mist"></div>
          <div className="dt-in-progress-ui dt-page-inner-centered">
            { !this.props.parentState.fileWasEncrypted &&
              <div className="dt-in-progress-ui">
                <h1 className="dt-in-progress-header"><img className="dt-in-progress-icon" src="/assets/images/progress.svg" alt="Spinning"/>Encrypting*</h1>
                <h2 className="dt-in-progress-sub">*AES-256 military grade encryption</h2>
              </div>
            }
            { this.props.parentState.fileWasEncrypted && !this.props.parentState.fileWasUploaded &&
              <div className="dt-in-progress-ui">
                <h1 className="dt-in-progress-header"><img className="dt-in-progress-icon" src="/assets/images/progress.svg" alt="Spinning"/>Uploading</h1>
              </div>
            }
          </div>
      </div>
    )
  }
}

export default EInProgress;