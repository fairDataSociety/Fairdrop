import React, { Component } from 'react';

class EInProgress extends Component{
  
  constructor(props) {
    super(props);
  }

  render(){
    return (
      <div id="dt-in-progress" className={"dt-confirm dt-green dt-page-wrapper dt-hidden " + (this.props.parentState.uiState === 4 ? "dt-fade-in" : "")}> 
          <div className="dt-in-progress-ui dt-page-inner-centered">
            { !this.props.parentState.fileWasEncrypted &&
              <div className="dt-in-progress-ui">
                <h1 className="dt-in-progress-header"><img className="dt-in-progress-icon" src="/assets/images/progress.svg" alt="Spinning"/>Encrypting</h1>
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