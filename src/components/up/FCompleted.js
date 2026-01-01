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
import Utils from '../../services/Utils';

//deal with xbrowser copy paste issues
var ua = window.navigator.userAgent;
var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
var webkit = !!ua.match(/WebKit/i);
var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

class FCompleted extends Component{

  constructor(props) {
    super(props);
    this.state = {
      hashCopied: false
    };
    this.handleCopyGatewayLink = this.handleCopyGatewayLink.bind(this);
    this.handleCopySwarmHash = this.handleCopySwarmHash.bind(this);
  }

  getSwarmHash() {
    const link = this.props.parentState.uploadedHashLink;
    if (!link) return '';

    // Extract hash from URL (format: /download/{hash}/{filename} or /download-list/{hash}/)
    const match = link.match(/\/download(?:-list)?\/([a-f0-9]{64})\//i);
    return match ? match[1] : '';
  }

  handleCopySwarmHash(){
    const hash = this.getSwarmHash();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(hash).then(() => {
        this.setState({ hashCopied: true });
        setTimeout(() => this.setState({ hashCopied: false }), 2000);
      });
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = hash;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.setState({ hashCopied: true });
      setTimeout(() => this.setState({ hashCopied: false }), 2000);
    }
  }

  handleCopyGatewayLink(){

    if(iOSSafari){
      var el = document.querySelector(".feedback-gateway-link input");
      var oldContentEditable = el.contentEditable,
          oldReadOnly = el.readOnly,
          range = document.createRange();

      el.contentEditable = true;
      el.readOnly = false;
      range.selectNodeContents(el);

      var s = window.getSelection();
      s.removeAllRanges();
      s.addRange(range);

      el.setSelectionRange(0, 999999); // A big number, to cover anything that could be inside the element.

      el.contentEditable = oldContentEditable;
      el.readOnly = oldReadOnly;

      document.execCommand('copy');
    }else{
      var copyText = document.querySelector(".feedback-gateway-link input");
      copyText.select();
      document.execCommand("copy");
    }
  }

  render(){
    return (
      <div id="completed" className={"confirm page-wrapper " + (this.props.parentState.uiState === 5 ? "fade-in" : "hidden")}>
          <div className="info">
            <div className="info-content">
              <div className="file-was-sent">
                <img className="circle-tick" src={this.props.appRoot+"/assets/images/circle-tick.svg"} alt="Circle Tick"/>
                {this.props.parentState.isStoringFile === false ? 'Sent.' : 'Stored.'}
              </div>
              <div className="info-filename">
                <span className="info-filename-truncated">{this.props.parentState.selectedFileName}</span>
                <span className="info-filesize"> { Utils.humanFileSize(this.props.parentState.selectedFileSize) }</span>
              </div>

              {this.props.parentState.isQuickFile === false &&
                <div className="info-is-encrypted">
                  <img className="fairdrop-lock" src="assets/images/fairdrop-lock.svg" alt="fairdrop-logo"/> Encrypted
                </div>
              }

              {this.props.parentState.uploadedHashLink &&
                <div>
                  <div className="feedback-swarmhash-message">File Download Link</div>
                  {this.props.parentState.uploadedHashLink &&
                    <div className="feedback-gateway-link">
                      <input onChange={()=>{/*do nothing*/}} contentEditable={true} type="text" value={this.props.parentState.uploadedHashLink || ""}/>
                    </div>
                  }
                  <button className="copy-gateway-link" onClick={this.handleCopyGatewayLink}>Copy link.</button>

                  {this.props.parentState.isQuickFile && this.getSwarmHash() && (
                    <div className="swarm-hash-display">
                      <div className="feedback-swarmhash-message">Swarm Hash</div>
                      <div className="swarm-hash-row">
                        <code className="swarm-hash-value">
                          {this.getSwarmHash().slice(0, 8)}...{this.getSwarmHash().slice(-8)}
                        </code>
                        <button
                          className="copy-hash-btn"
                          onClick={this.handleCopySwarmHash}
                          title="Copy full Swarm hash"
                        >
                          {this.state.hashCopied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              }


              <div className="info-actions">
                {this.props.parentState.isStoringFile === false && 
                  <button className="info-action" onClick={()=>{this.props.handleNavigateTo('/mailbox')}}>Click to go to files.</button>
                }
                {this.props.parentState.isStoringFile === true && 
                  <button className="info-action" onClick={()=>{this.props.handleNavigateTo('/mailbox/stored')}}>Click to go to files.</button>
                }
              </div>
            </div>
          </div> {/* ui */}
      </div>
    )
  }
}

export default FCompleted;
