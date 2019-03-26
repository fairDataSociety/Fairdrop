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
            { this.props.parentState.isQuickFile &&
                <div className="in-progress-ui">
                  <h1 className="in-progress-header"><img className="in-progress-icon" src={this.props.appRoot + "/assets/images/progress.svg"} alt="Spinning"/>Uploading</h1>
                  <h2 className="in-progress-sub">Storing Unencrypted in Swarm network</h2>
                  <h3 className="in-progress-sub-2">{this.props.parentState.feedbackMessage}</h3>
                  <h3 className="in-progress-sub-3">
                    {this.props.parentState.uploadProgress}
                  </h3>
                </div>  
            }
            { !this.props.parentState.isQuickFile &&
              <div>
                { !this.props.parentState.encryptionComplete &&
                  <div className="in-progress-ui">
                    <h1 className="in-progress-header"><img className="in-progress-icon" src={this.props.appRoot + "/assets/images/progress.svg"} alt="Spinning"/>Encrypting*</h1>
                    <h2 className="in-progress-sub">*AES-256 military grade encryption</h2>
                    <h3 className="in-progress-sub-2">{this.props.parentState.feedbackMessage}</h3>
                    <h3 className="in-progress-sub-3">
                      {this.props.parentState.encryptionComplete ? this.props.parentState.uploadProgress : " "}
                    </h3>
                  </div>
                }
                { this.props.parentState.encryptionComplete && !this.props.parentState.fileWasUploaded &&
                  <div className="in-progress-ui">
                    <h1 className="in-progress-header"><img className="in-progress-icon" src={this.props.appRoot + "/assets/images/progress.svg"} alt="Spinning"/>Uploading</h1>
                    <h2 className="in-progress-sub">Storing Encrypted in Swarm network</h2>
                    <h3 className="in-progress-sub-2">{this.props.parentState.feedbackMessage}</h3>
                    <h3 className="in-progress-sub-3">
                      {this.props.parentState.encryptionComplete ? this.props.parentState.uploadProgress : " "}
                    </h3>
                  </div>
                }
              </div>
            }
          </div>
      </div>
    )
  }
}

export default EInProgress;
