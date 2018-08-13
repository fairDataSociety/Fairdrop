import React, { Component } from 'react';

class FInProgress extends Component{
  
  constructor(props) {
    super(props);
  }

  render(){
    return (
      <div id="dt-in-progress" className={"dt-confirm dt-green dt-page-wrapper dt-hidden " + (this.props.parentState.uiState === 5 ? "dt-fade-in" : "")}> 
          <div className="dt-in-progress-ui dt-page-inner-centered">
            <h1 className="dt-in-progress-header">Progress</h1>
            { !this.props.parentState.fileWasEncrypted &&
              <p>Encrypting</p>
            }
            { !this.props.parentState.fileWasUploaded &&
              <p>Uploading</p>
            }
          </div>
      </div>
    )
  }
}

export default FInProgress;