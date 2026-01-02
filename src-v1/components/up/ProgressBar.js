// Copyright 2019 The FairDataSociety Authors
// This file is part of the FairDataSociety library.
//
// The FairDataSociety library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The FairDataSociety library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the FairDataSociety library. If not, see <http://www.gnu.org/licenses/>.

import React, { Component } from 'react';

class FCompleted extends Component{

  render(){
    return (
      <div id='progress' className={'hide-mobile ui-state-'+this.props.parentState.uiState+(this.props.isStoringFile === true || this.props.parentState.isQuickFile === true ? ' is-storing' : '')}>
        <div className='progress-indicator'></div>
        {this.props.isStoringFile === false && this.props.parentState.isQuickFile === false &&
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
              2 Confirm
            </div>
            <div className='progress-label'>
              3 Upload
            </div>
            <div className='progress-label'>
              4 Summary
            </div>
          </div>
        }
        {this.props.parentState.isQuickFile === true &&
          <div className='progress-labels'>
            <div className='progress-label'>
              1 Select File
            </div>
            <div className='progress-label'>
              2 Confirm
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
