import React, { Component } from 'react';
import DTransfer from '../services/DTransfer';
import DMailbox from '../services/DMailbox';
import DMessage from '../services/DMessage';
import DFileData from '../services/DFileData';

import ASelectFile from '../components/up/ASelectFile';
import BSelectMailbox from '../components/up/BSelectMailbox';
import CSelectRecipient from '../components/up/CSelectRecipient';
import DConfirm from '../components/up/DConfirm';
import EInProgress from '../components/up/EInProgress';
import FCompleted from '../components/up/FCompleted';
import ProgressBar from '../components/up/ProgressBar';


window.DMailbox = DMailbox;

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

      isStoringFile: false,

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

    this.aSelectFile = React.createRef();    

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
      if(this.state.isStoringFile === false){
        let senderMailbox = this.state.selectedMailbox;
        let senderWallet = this.state.selectedWallet;
        let addressee = this.state.addressee;
        return DMailbox.getSharedSecret(senderWallet, addressee).then((sharedSecret) => {
          this.setState({encryptMessage: 'Encrypting...'});
          return this.DT.encryptBuffer(window.selectedFileArrayBuffer, sharedSecret).then((encryptedBuffer)=>{
            this.setState({encryptMessage: 'Encrypted'});
            this.setState({feedBackMessage: "File was encrypted, uploading file..."}); 
            this.setState({fileWasEncrypted: true});
            return this.DT.postData(encryptedBuffer).then((response)=>{
              let timeEnd = new Date();
              // let dTransferLink = process.env.REACT_APP_DTRANSFER_HOST + "?swarmHash="+response+"&fileName="+encodeURI(this.state.selectedFileName)+"&mimeType="+this.state.selectedFileType+"&isEncrypted=true";
              // this.setState({dTransferLink: dTransferLink});
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
              return DMailbox.saveMessage(message).then(()=>{
                this.setState({fileWasUploaded: true});
              });
            }).catch((error)=>{
              throw new Error(error);
            });
          });
        }).catch((error)=>{
          throw new Error(error);
        });
      }else{
        let privateKey = this.state.selectedWallet.privateKey;
        this.setState({encryptMessage: 'Encrypting...'});
        return this.DT.encryptBuffer(window.selectedFileArrayBuffer, privateKey).then((encryptedBuffer)=>{
          this.setState({encryptMessage: 'Encrypted'});
          this.setState({feedBackMessage: "File was encrypted, uploading file..."}); 
          this.setState({fileWasEncrypted: true});
          return this.DT.postData(encryptedBuffer).then((response)=>{
            let timeEnd = new Date();
            // let dTransferLink = process.env.REACT_APP_DTRANSFER_HOST + "?swarmHash="+response+"&fileName="+encodeURI(this.state.selectedFileName)+"&mimeType="+this.state.selectedFileType+"&isEncrypted=true";
            // this.setState({dTransferLink: dTransferLink});
            this.setState({uploadedFileHash: response});
            this.setState({feedBackMessage: "File uploaded in "+(timeEnd-timeStart)/1000+"s!"});     
            let fileData = new DFileData({
              swarmhash: response,
              filename: this.state.selectedFileName,
              mime: this.state.selectedFileType,
              size: this.state.selectedFileSize
            });
            return DMailbox.storeFile(this.state.selectedWallet, fileData).then(()=>{
              this.setState({fileWasUploaded: true});
            });
          }).catch((error)=>{
            throw new Error(error);
          });
        }).catch((error)=>{
          throw new Error(error);
        });
      }
    }else{
      this.setState({feedBackMessage: "There was an error, please try again..."});
      return false;
    }
  }

  render() {
    return (
        <div className="dt-upload">
          <ASelectFile parentState={this.state} setParentState={this.setState.bind(this)} setIsSelecting={this.props.setIsSelecting} fileWasSelected={this.props.fileWasSelected} ref={this.aSelectFile}/>
          <BSelectMailbox parentState={this.state} setParentState={this.setState.bind(this)}/>
          <CSelectRecipient parentState={this.state} setParentState={this.setState.bind(this)}/>
          <DConfirm parentState={this.state} setParentState={this.setState.bind(this)} handleUpload={this.handleUpload.bind(this)}/>
          <EInProgress parentState={this.state} setParentState={this.setState.bind(this)}/>
          <FCompleted parentState={this.state} setParentState={this.setState.bind(this)}/>
          <ProgressBar parentState={this.state} setParentState={this.setState.bind(this)} isStoringFile={this.props.isStoringFile}/>
        </div>
    );
  }
}

export default DTransferUp;