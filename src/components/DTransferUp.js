import React, { Component } from 'react';
import DTransfer from '../services/DTransfer';
import DMailbox from '../services/DMailbox';
import DMessage from '../services/DMessage';

import ASelectFile from '../components/up/ASelectFile';
import BSelectMailbox from '../components/up/BSelectMailbox';
import CSelectRecipient from '../components/up/CSelectRecipient';
import DConfirm from '../components/up/DConfirm';
import EInProgress from '../components/up/EInProgress';
import FCompleted from '../components/up/FCompleted';
import ProgressBar from '../components/up/ProgressBar';

class DTransferUp extends Component{

  // initialise

  getInitialState() {
    return {
      shouldEncrypt: false,
      fileIsSelecting: false,
      fileIsSelected: false,

      selectedFileName: null,
      selectedFileSize: null,

      feedBackMessage: false,

      isSignedIn: false,

      isSending: false,
      sendToEmails: [],

      uiState: 0,

      selectedMailbox: false,
      selectedWallet: false,

      addressee: false,

      mailboxPassword: false,

      fileWasEncrypted: false,
      fileWasUploaded: false,

      dTransferLink: null,
      uploadedFileHash: null,
      encryptMessage: 'Unencrypted',      
      sendButtonMessage: 'Upload Unencrypted',

    };
  }

  resetToInitialState(){
    this.setState(this.getInitialState());
  }

  constructor(props){
    super(props);

    this.DT = new DTransfer(process.env.REACT_APP_SWARM_GATEWAY);

    this.state = this.getInitialState();

    window.setUIState = this.setUIState.bind(this);
  }

  setUIState(state){
    this.setState({uiState: state});
  }

  handleUpload(){
    let timeStart = new Date();
    if( // ensure that we have a file saved from dropzone
      window.selectedFileArrayBuffer.constructor === ArrayBuffer &&
      window.selectedFileArrayBuffer.byteLength > 0
      )
    {
      if(this.state.shouldEncrypt){
        let senderMailbox = this.state.selectedMailbox;
        let senderWallet = this.state.selectedWallet;
        let addressee = this.state.addressee;
        let sharedSecret = DMailbox.getSharedSecret(senderMailbox, senderWallet, addressee);
        this.setState({encryptMessage: 'Encrypting...'});
        return this.DT.encryptBlob(this.DT.bufferToBlob(window.selectedFileArrayBuffer), sharedSecret).then((encryptedBuffer)=>{
          let encryptedFile = this.DT.bufferToBlob(encryptedBuffer, this.state.selectedFileName, this.state.selectedFileType);
          this.setState({encryptMessage: 'Encrypted'});
          this.setState({feedBackMessage: "File was encrypted, uploading file..."}); 
          this.setState({fileWasEncrypted: true});

          return this.DT.postFile(encryptedFile).then((response)=>{
            let timeEnd = new Date();
            let dTransferLink = process.env.REACT_APP_DTRANSFER_HOST + "?swarmHash="+response+"&fileName="+encodeURI(this.state.selectedFileName)+"&mimeType="+this.state.selectedFileType+"&isEncrypted=true";
            this.setState({fileWasUploaded: true});
            this.setState({dTransferLink: dTransferLink});
            this.setState({uploadedFileHash: response});
            this.setState({feedBackMessage: "File uploaded in "+(timeEnd-timeStart)/1000+"s!"});     
            let message = new DMessage({
              to: addressee,              
              from: senderMailbox.subdomain,
              swarmhash: response,
              filename: this.state.selectedFileName,
              mime: this.state.selectedFileType,
              size: this.state.selectedFileSize
            });
            DMailbox.saveMessage(message);
          }).catch((error)=>{
            console.log(error)
            this.setState({feedBackMessage: "Upload failed, please try again..."});
          });
        });
      }else{
        let isSure = window.confirm('This will expose your file to the public - are you sure?');
        if(isSure){
          return this.DT.postFile(new File([window.selectedFileArrayBuffer], this.state.selectedFileName, { type: this.state.selectedFileType })).then((response)=>{
            let timeEnd = new Date();
            let dTransferLink = process.env.REACT_APP_DTRANSFER_HOST + "?swarmHash="+response+"&fileName="+encodeURI(this.state.selectedFileName)+"&mimeType="+this.state.selectedFileType+"&isEncrypted=false";
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

  render() {
    return (
        <div className="dt-upload">
          <ASelectFile parentState={this.state} setParentState={this.setState.bind(this)} setIsSelecting={this.props.setIsSelecting}/>
          <BSelectMailbox parentState={this.state} setParentState={this.setState.bind(this)}/>
          <CSelectRecipient parentState={this.state} setParentState={this.setState.bind(this)}/>
          <DConfirm parentState={this.state} setParentState={this.setState.bind(this)} handleUpload={this.handleUpload.bind(this)}/>
          <EInProgress parentState={this.state} setParentState={this.setState.bind(this)}/>
          <FCompleted parentState={this.state} setParentState={this.setState.bind(this)}/>
          <ProgressBar parentState={this.state} setParentState={this.setState.bind(this)}/>
        </div>
    );
  }
}

export default DTransferUp;