import React, { Component } from 'react';
import DWallet from "./components/DWallet";
import DTransfer from "./services/Dtransfer";
import Dropzone from 'dropzone'
import zxcvbn from 'zxcvbn'

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      fileIsSelecting: false,
      fileIsSelected: false,
      shouldEncrypt: false,
      selectedFileName: null,
      selectedFileSize: null,
      passwordsMatch: false
    };

    this.handleSelectFileForUpload = this.handleSelectFileForUpload.bind(this);
    this.handleSymEncryptToggle = this.handleSymEncryptToggle.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.calculateEntropy = this.calculateEntropy.bind(this);

    this.fireSelectFile = this.fireSelectFile.bind(this);

  }

  handleSelectFileForUpload(e){
    e.preventDefault();    
    this.setState({fileIsSelecting: !this.state.fileIsSelecting});
  }

  fireSelectFile(e){
    this.setState({fileIsSelecting: true});
    this.refs.dtSelectFile.click();
  }

  calculateEntropy(e){
    let entropyMessage = zxcvbn(e.target.value).crack_times_display.offline_fast_hashing_1e10_per_second;

    this.setState({entropyMessage: "Estimated time to crack - " + entropyMessage});
  }

  handleSymEncryptToggle(e){

    if(this.state.shouldEncrypt){
      //reset
        this.setState({
          passwordsMatchError: '',
          shouldEncrypt: false,
          encryptMessage: 'unencrypted'
        });
        return false; 
    }else{
      if(this.refs.dtSymEncPasswordInput.value === ""){
          this.setState({
            passwordsMatchError: 'You must enter a password.',
            shouldEncrypt: false
          });
          return false; 
      }

      if(this.refs.dtSymEncPasswordInput.value !== this.refs.dtSymEncPasswordInputConfirm.value){
        this.setState({
          passwordsMatchError: 'Passwords must match.',
          shouldEncrypt: false        
        });
        return false
      }

      if(this.refs.dtSymEncPasswordInput.value == this.refs.dtSymEncPasswordInputConfirm.value){
        this.setState({
          passwordsMatchError: '',
          password: this.refs.dtSymEncPasswordInput.value,
          encryptMessage: "will encrypt",
          shouldEncrypt: true
        });
      }
    }

  }

  handleUpload(){
    if(
      window.selectedFileArrayBuffer.constructor === ArrayBuffer &&
      window.selectedFileArrayBuffer.byteLength > 0
      )
    {
      DT.encryptBuffer();
    }
  }

  humanFileSize(size) {
      var i = Math.floor( Math.log(size) / Math.log(1024) );
      return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['bytes', 'kB', 'MB', 'GB', 'TB'][i];
  }

  componentDidMount(){
    this.dropzone = new Dropzone(this.refs.dtSelectFile, { 
      url: 'dummy://',
      accept: (file, done) => {
        var reader = new FileReader();
        reader.addEventListener("loadend", 
          function(event) { 
            // for now, todo -> encrypt this into local file system!
            window.selectedFileArrayBuffer = event.target.result;
          });
        reader.readAsArrayBuffer(file);
      }
    });
    this.dropzone.on("dragenter", (event) => {
     this.setState({fileIsSelecting: true});
    }); 
    this.dropzone.on("dragleave", (event) => {
      if(event.fromElement === null){
        this.setState({fileIsSelecting: false});
      }
    });    
    this.dropzone.on("addedfile", (file) => {
      this.setState({
        fileIsSelected: true,
        selectedFileName: file.name,        
        selectedFileSize: this.humanFileSize(file.size)
      });
    });
  }

  render() {
    return (
      <div className="dt-wrapper">
        <div className="dt-nav-header"> {/* this bit should always overlay (or perhaps be hidden unless mouseover?) */}
          <div className="dt-logo">
          </div>
        </div>
        <div id="dt-select-file" className="dt-select-file" ref="dtSelectFile" > 
          <div className={"dt-select-file-header " + (this.state.fileIsSelecting && "is-selecting")} onClick={this.fireSelectFile}> {/* this bit should slide up out of view using transform */}
            <h1>Send and store files securely and privately<br/>that's how we do on the decentralised web 3.0</h1>
          </div> {/* dt-header */}
          <div className={"dt-select-file-main " + (this.state.fileIsSelecting && "is-selecting")} > {/* this bit should expand to fill the viewport */}

          </div> {/* dt-select-file-main */}
          <div className={"dt-select-file-instruction " + (this.state.fileIsSelecting && "is-selecting")} onClick={this.fireSelectFile}> {/* this bit should be centered vertically in the surrounding div which overlays the other two siblings */}
            <h2>choose or drag and drop a file</h2>
          </div> {/* dt-select-file-instruction */}
        </div> {/* dt-select-file */}
        <div className={"dt-info " + (this.state.fileIsSelected && "is-selected")}> {/* this bit could slide in from left over the top of dt-select-file */}
          <div className="dt-info-content">
            <img/>
            <div className="dt-info-filename">{this.state.selectedFileName}</div>
            <div className="dt-info-filesize">{this.state.selectedFileSize}</div>
            <div className="dt-info-is-encrytped">{this.state.encryptMessage}</div>
            <div className="dt-network-status">...</div>
          </div>
        </div> {/* dt-info */}
        <div className={"dt-ui " + (this.state.fileIsSelected && "is-selected")}> {/* this bit could slide in from right over the top of dt-select-file */}
          <div className="dt-ui-wrapper">
            <div className="dt-sym-enc">
              <p>choose and confirm your password to encrypt</p>
              <input disabled={this.state.shouldEncrypt ? "disabled" : false} id="dt-sym-enc-password-input" autoComplete="off" className="dt-sym-enc-password-input" type="password" ref="dtSymEncPasswordInput" onChange={this.calculateEntropy}/>
              <p>{this.state.entropyMessage}</p>
              <p>{this.state.passwordsMatchError}</p>
              <button id="dt-generate-password" className="dt-copy-password" onClick={this.generatePassword}>Generate</button>
              <button id="dt-copy-password" className="dt-copy-password" onClick={this.copyPassword}>Copy</button>
              <input disabled={this.state.shouldEncrypt ? "disabled" : false} id="dt-sym-enc-password-input-confirm" autoComplete="off" className="dt-sym-enc-password-input-confirm" type="password" ref="dtSymEncPasswordInputConfirm" />              
              <button id="dt-sym-enc-password-button" className="dt-toggle-button" onClick={this.handleSymEncryptToggle}>{this.state.shouldEncrypt ? "Encrypting..." : "Encrypt"}</button>
            </div>
            <div className="dt-send-mail">
              <p>add emails to send</p>
              <input id="dt-send-mail-mails-input" autoComplete="off" className="dt-send-mail-mails-input" type="password" placeholder="info@datafund.io, hi@datafund.io" />
            </div>
            <div className="dt-ui-footer">
              <button id="dt-send" className="dt-send-button" onClick={this.handleUpload}>Upload</button>
            </div>
          </div>
        </div> {/* dt-ui */}
        <div className="dt-network-status">
          <div className="dt-network-status-ethereum">
            
          </div> {/* dt-network-status-ethereum */}
          <div className="dt-network-status-swarm">
            
          </div> {/* dt-network-status-swarm */}
        </div>
      </div>
    );
  }
}

export default App;