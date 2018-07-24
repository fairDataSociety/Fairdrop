import React, { Component } from 'react';
import DWallet from "./components/DWallet";
import DTransfer from "./services/Dtransfer";
import Dropzone from 'dropzone';
import zxcvbn from 'zxcvbn';
import FileSaver from 'file-saver';


import { connect } from 'react-redux';

import './App.css';

let gateway = 'http://swarm-gateways.net/bzz:/';
// let gateway = 'http://localhost:8500/bzz:/'

// let dTransferURL = 'http://localhost:3000/';
let dTransferURL = 'http://dtransfer-staging.s3-website.eu-central-1.amazonaws.com/';

class App extends Component {

  getInitialState() {
    return {
      // upload file
      shouldEncrypt: false,
      fileIsSelecting: false,
      fileIsSelected: false,
      selectedFileName: null,
      selectedFileSize: null,
      passwordsMatch: false,
      fileWasEncrypted: false,
      feedBackMessage: false,
      isSending: false,
      sendToEmails: [],
      dTransferLink: null,
      uploadedFileHash: null,
      feedBackMessage: "",
      fileWasUploaded: false,
      encryptMessage: 'Unencrypted',      
      sendButtonMessage: 'Upload Unencrypted',
      //find file
      findFileFeedBackMessage: 'Trying to find your file...',
      findingFile: true,
      fileIsDecrypting: false
    };
  }

  resetToInitialState(){
    this.setState(this.getInitialState());
  }

  constructor(props) {
    super(props);

    this.DT = new DTransfer(gateway);

    this.state = this.getInitialState();

    this.handleSelectFileForUpload = this.handleSelectFileForUpload.bind(this);
    this.handleSymEncryptToggle = this.handleSymEncryptToggle.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.resetToInitialState = this.resetToInitialState.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.generatePassword = this.generatePassword.bind(this);
    this.copyPassword = this.copyPassword.bind(this);
    this.refreshEmails = this.refreshEmails.bind(this);

    this.fireSelectFile = this.fireSelectFile.bind(this);

  }

  retrieveFile(swarmHash, fileName, mimeType, isEncrypted){
    return this.DT.getFile(swarmHash, fileName).then((retrievedFile)=>{
      this.setState({findFileFeedBackMessage: "Decrypting file..."});
      if(isEncrypted){
        setTimeout(()=>{
          let password = prompt('Please enter your file\'s passphrase');
          if(password){
            let decryptedFileName = fileName.replace(/\.encrypted$/,'');          
            let decryptedFile = this.DT.decryptedFile(retrievedFile, password, decryptedFileName, mimeType);
            this.setState({findFileFeedBackMessage: "Downloading file..."}); 
            FileSaver.saveAs(decryptedFile);
          }else{
            alert('Sorry, you must provide a password to download your file!');
            this.retrieveFile(swarmHash, fileName, mimeType);
          }
        },500);
      }else{
        FileSaver.saveAs(new File([retrievedFile], fileName, {type: mimeType}));
      }
    }).catch((error)=>{
      this.setState({findFileFeedBackMessage: "Sorry, we couldn't find that hash."});      
    })
  }


  // event handlers

  handleSelectFileForUpload(e){
    e.preventDefault();    
    this.setState({fileIsSelecting: !this.state.fileIsSelecting});
  }

  fireSelectFile(e){
    this.setState({fileIsSelecting: true});
    this.refs.dtSelectFile.click();
  }

  calculateEntropy(password){
    let entropyMessage = zxcvbn(password).crack_times_display.offline_fast_hashing_1e10_per_second;
    this.setState({entropyMessage: "Estimated time to crack - " + entropyMessage});
  }

  handleChangePassword(e){
    this.calculateEntropy(e.target.value);
  }

  generatePassword(e){
    this.DT.generatePassword().then((password)=>{
      this.refs.dtSymEncPasswordInput.value = password;
      this.refs.dtSymEncPasswordInputConfirm.value = password;
      this.calculateEntropy(password);
    })
  }

  copyPassword(e){
    if(this.refs.dtSymEncPasswordInput.value == this.refs.dtSymEncPasswordInputConfirm.value){
      if(navigator.clipboard){
        navigator.clipboard.writeText(this.refs.dtSymEncPasswordInput.value);
        this.setState({passwordMessage: 'Password copied to clipboard.'}); 
      }
    }else{
      this.setState({passwordMessage: 'Passwords must match.'});
    }
  }

  refreshEmails(e){
    var re = /([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)/ig;
    let emails = e.target.value.match(re);
    let isSending = (emails && emails.count > 0);
    this.setState({
      sendToEmails: emails,
      isSending: isSending
    });
  }

  handleSymEncryptToggle(e){

    if(this.state.shouldEncrypt){
      //reset
      this.setState({
        shouldEncrypt: false,
        encryptMessage: 'Unencrypted',
        sendButtonMessage: 'Upload Unencrypted',          
      });
      return false; 
    }else{
      if(this.refs.dtSymEncPasswordInput.value === ""){
          this.setState({
            passwordMessage: 'You must enter a password.',
            shouldEncrypt: false
          });
          return false; 
      }

      if(this.refs.dtSymEncPasswordInput.value !== this.refs.dtSymEncPasswordInputConfirm.value){
        this.setState({
          passwordMessage: 'Passwords must match.',
          shouldEncrypt: false        
        });
        return false
      }

      if(this.refs.dtSymEncPasswordInput.value == this.refs.dtSymEncPasswordInputConfirm.value){
        this.setState({
          passwordMessage: '',
          password: this.refs.dtSymEncPasswordInput.value,
          encryptMessage: 'Will Encrypt',
          sendButtonMessage: 'Upload Encrypted',
          shouldEncrypt: true,
        });
      }
    }

  }

  handleUpload(){
    let timeStart = new Date();
    if(
      window.selectedFileArrayBuffer.constructor === ArrayBuffer &&
      window.selectedFileArrayBuffer.byteLength > 0
      )
    {

      if(this.state.shouldEncrypt){
        this.setState({encryptMessage: 'Encrypting...'});
        this.DT.encryptBlob(this.DT.bufferToBlob(window.selectedFileArrayBuffer), this.state.password).then((encryptedBuffer)=>{
          let encryptedFile = this.DT.bufferToBlob(encryptedBuffer, this.state.selectedFileName, this.state.selectedFileType);
          this.setState({encryptMessage: 'Encrypted'});
          this.setState({feedBackMessage: "File was encrypted, uploading file..."}); 
          this.setState({fileWasEncrypted: true});

          return this.DT.postFile(encryptedFile).then((response)=>{
            let timeEnd = new Date();
            let dTransferLink = dTransferURL + "?swarmHash="+response+"&fileName="+encodeURI(this.state.selectedFileName)+"&mimeType="+this.state.selectedFileType+"&isEncrypted=true";
            this.setState({fileWasUploaded: true});
            this.setState({dTransferLink: dTransferLink});
            this.setState({uploadedFileHash: response});
            this.setState({feedBackMessage: "File uploaded in "+(timeEnd-timeStart)/1000+"s!"});     
          }).catch((error)=>{
            this.setState({feedBackMessage: "Upload failed, please try again..."});
          });
        });

      }else{
        let isSure = window.confirm('This will expose your file to the public - are you sure?');
        if(isSure){
          return this.DT.postFile(new File([window.selectedFileArrayBuffer], this.state.selectedFileName, { type: this.state.selectedFileType })).then((response)=>{
            let timeEnd = new Date();
            let dTransferLink = dTransferURL + "?swarmHash="+response+"&fileName="+encodeURI(this.state.selectedFileName)+"&mimeType="+this.state.selectedFileType+"&isEncrypted=false";
            this.setState({
              fileWasUploaded: true,
              dTransferLink: dTransferLink, 
              uploadedFileHash: response, 
              feedBackMessage: "File uploaded in "+(timeEnd-timeStart)/1000+"s!"
            });  
          }).catch((error)=>{
            this.setState({feedBackMessage: "Upload failed, please try again..."});
          });
        }else{
          return false;
        }
      }
    }else{
      this.setState({feedBackMessage: "There was an error, please try again..."});
      return false;
    }

  }

  humanFileSize(size) {
      var i = Math.floor( Math.log(size) / Math.log(1024) );
      return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['bytes', 'KB', 'MB', 'GB', 'TB'][i];
  }

  dropZone(){
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
        selectedFileType: file.type,        
        selectedFileSize: this.humanFileSize(file.size)
      });
    });
  }

  componentDidMount(){
    var urlParams = new URLSearchParams(window.location.search);
    let swarmHash = urlParams.get('swarmHash');      
    let fileName = urlParams.get('fileName'); 
    let mimeType = urlParams.get('mimeType'); 
    let isEncrypted = urlParams.get('isEncrypted') === 'true'; 

    if(swarmHash && fileName){
      this.setState({
        isDownloading: true,
        swarmHash: swarmHash,
        fileName: fileName,
        mimeType: mimeType,
        findingFile: true,
        fileIsDecrypting: false
      });
      this.retrieveFile(swarmHash, fileName, mimeType, isEncrypted);
    }else{
      this.dropZone();
    }
  }

  render() {
    return (
      <div className="dt-wrapper">
        <div className="dt-nav-header"> {/* this bit should always overlay (or perhaps be hidden unless mouseover?) */}
          <div className="dt-nav-header-item">
            <a href="/"><img className="dt-df-logo" src="/assets/images/datafund-logo.svg" alt="Datafund Logo"/></a>
          </div>
        </div>
        <div id="dt-select-file" className={"dt-select-file " + (this.state.fileIsSelected && "is-selected")} ref="dtSelectFile" > 
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
            <img className="dt-file-icon" src="/assets/images/file-icon.svg" alt="File Icon"/>
            <div className="dt-info-filename">{this.state.selectedFileName}</div>
            <div className="dt-info-filesize">{this.state.selectedFileSize}</div>
            <div className="dt-info-is-encrypted">{this.state.encryptMessage}</div>
            <div className="dt-feedback-message">{this.state.feedBackMessage}</div>
          </div>
        </div> {/* dt-info */}
        <div className={"dt-ui " + (this.state.fileIsSelected && "is-selected")}> {/* this bit could slide in from right over the top of dt-select-file */}
            {!this.state.fileWasUploaded &&
              <div className="dt-ui-wrapper">
                <div className="dt-sym-enc">
                  <div className="dt-form-group dt-toggle">
                    <input type="radio" disabled="disabled"/>
                    <p>Choose and confirm your password to encrypt</p>
                  </div>
                  <div className="dt-content-wrap">
                    <p>{this.state.entropyMessage}</p>
                    <p>{this.state.passwordMessage}</p>
                    <div className="dt-form-group dt-form-two-inputs">
                      <input disabled={this.state.shouldEncrypt ? "disabled" : false} id="dt-sym-enc-password-input" autoComplete="off" className="dt-sym-enc-password-input" type="password" ref="dtSymEncPasswordInput" onChange={this.handleChangePassword} placeholder="Password" />
                      <input disabled={this.state.shouldEncrypt ? "disabled" : false} id="dt-sym-enc-password-input-confirm" autoComplete="off" className="dt-sym-enc-password-input-confirm" type="password" ref="dtSymEncPasswordInputConfirm" placeholder="Confirm password" />  
                    </div>
                    <button id="dt-generate-password" className="dt-btn dt-btn-sm dt-generate-password" onClick={this.generatePassword}>Generate</button>
                    <button id="dt-copy-password" className="dt-btn dt-btn-sm dt-copy-password" onClick={this.copyPassword}>Copy</button>             
                    <button id="dt-sym-enc-password-button" className="dt-btn dt-btn-sm dt-toggle-button" onClick={this.handleSymEncryptToggle}>{this.state.shouldEncrypt ? "Will Encrypt" : "Encrypt"}</button>
                    { /* <a href="" className="dt-btn dt-btn-link">This is a link</a> */ }
                  </div>
                </div>
                <div className="dt-send-mail">
                  <div className="dt-form-group dt-toggle">
                    <input type="radio" disabled="disabled"/>
                    <p>Add emails to send</p>
                  </div>
                  <div className="dt-content-wrap">
                    <input id="dt-send-mail-mails-input" autoComplete="off" className="dt-send-mail-mails-input" type="text" placeholder="info@datafund.io, hi@datafund.io" onChange={this.refreshEmails}/>
                  </div>
                </div>
                <div className="dt-ui-footer">
                  <button id="dt-send" className="dt-btn dt-btn-lg dt-send-button dt-btn-green" onClick={this.handleUpload}>{this.state.sendButtonMessage}</button>
                </div>
              </div>
            }
            {this.state.fileWasUploaded &&
              <div className="dt-ui-wrapper">
                <div className="dt-feedback">
                  <div>
                    <p>Swarmhash: <input type="text" value={this.state.uploadedFileHash} readOnly="true"/></p>
                    {this.state.fileWasEncrypted && 
                      <p>Password: <input type="text" value={this.state.password} readOnly="true"/></p>
                    }
                    <p>
                      <a href={this.state.dTransferLink} target="_blank" className="dt-file-link">DTransferLink: </a>
                      <input type="text" value={this.state.dTransferLink} readOnly="true"/>
                    </p>
                  {this.state.emails && this.state.emails.count > 0 && 
                    <div>
                    <p>Sent to: </p>
                    <ul>
                      {this.state.emails.map((email, i) => { <li>email</li>})}
                    </ul>
                    </div>
                  }
                  </div>
                  <button id="dt-send-another-button" className="dt-btn dt-btn-lg dt-btn-green dt-send-another-button" onClick={this.resetToInitialState}>Send Another</button>
                </div>
              </div>
            }
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