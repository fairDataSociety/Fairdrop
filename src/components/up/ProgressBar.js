import React, { Component } from 'react';

class FCompleted extends Component{

  render(){
    return (
      <div id='dt-progress' className={'dt-progress dt-ui-state-'+this.props.parentState.uiState}> 
        <div className='dt-progress-indicator'></div>
        <div className='dt-progress-labels'>
          <div className='dt-progress-label'>
            1 Select File
          </div>
          <div className='dt-progress-label'>
            2 Encrypt
          </div>
          <div className='dt-progress-label'>
            3 Add Recipients
          </div>
          <div className='dt-progress-label'>
            4 Upload
          </div>
          <div className='dt-progress-label'>
            5 Summary
          </div>
        </div>
      </div>
    )
  }
}

export default FCompleted;