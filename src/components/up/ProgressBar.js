import React, { Component } from 'react';

class FCompleted extends Component{
  
  constructor(props) {
    super(props);
  }

  render(){
    return (
      <div id='dt-progress' className={'dt-progress dt-ui-state-'+this.props.parentState.uiState}> 
        <div class='dt-progress-indicator'></div>
        <div class='dt-progress-labels'>
          <div class='dt-progress-label'>
            1 Select File
          </div>
          <div class='dt-progress-label'>
            2 Encrypt
          </div>
          <div class='dt-progress-label'>
            3 Add Recipients
          </div>
          <div class='dt-progress-label'>
            4 Upload
          </div>
          <div class='dt-progress-label'>
            5 Summary
          </div>
        </div>
      </div>
    )
  }
}

export default FCompleted;