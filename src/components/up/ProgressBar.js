import React, { Component } from 'react';

class FCompleted extends Component{

  render(){
    return (
      <div id='progress' className={'progress ui-state-'+this.props.parentState.uiState+(this.props.isStoringFile === true ? ' is-storing' : '')}> 
        <div className='progress-indicator'></div>
        {this.props.isStoringFile === false && 
          <div className='progress-labels'>
            <div className='progress-label'>
              1 Select File
            </div>
            <div className='progress-label'>
              2 Encrypt
            </div>
            <div className='progress-label'>
              3 Add Recipients
            </div>
            <div className='progress-label'>
              4 Upload
            </div>
            <div className='progress-label'>
              5 Summary
            </div>
          </div>
        }
        {this.props.isStoringFile === true && 
          <div className='progress-labels'>
            <div className='progress-label'>
              1 Select File
            </div>
            <div className='progress-label'>
              2 Encrypt
            </div>
            <div className='progress-label'>
              3 Upload
            </div>
            <div className='progress-label'>
              4 Summary
            </div>
          </div>
        }
      </div>
    )
  }
}

export default FCompleted;