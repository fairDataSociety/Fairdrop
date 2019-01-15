import React, { Component } from 'react';

import ASelectFile from '../components/up/ASelectFile';
import BSelectMailbox from '../components/up/BSelectMailbox';
import CSelectRecipient from '../components/up/CSelectRecipient';
import DConfirm from '../components/up/DConfirm';
import EInProgress from '../components/up/EInProgress';
import FCompleted from '../components/up/FCompleted';
import ProgressBar from '../components/up/ProgressBar';


class Upload extends Component{

  // initialise

  getInitialState() {
    return {
      shouldEncrypt: false,
      fileIsSelecting: false,
      fileIsSelected: false,

      selectedFileName: null,
      selectedFileSize: null,

      feedbackMessage: false,

      isSignedIn: false,

      isSending: false,
      sendToEmails: [],

      uiState: 0,

      addressee: false,

      mailboxPassword: false,

      fileWasEncrypted: false,
      fileWasUploaded: false,

      // dTransferLink: null,
      // uploadedFileHash: null,
      // encryptMessage: 'Unencrypted',      
      // sendButtonMessage: 'Upload Unencrypted',
    };
  }

  resetToInitialState(){
    this.setState(this.getInitialState());
  }

  constructor(props){
    super(props);

    this.FDS = this.props.FDS;


    this.aSelectFile = React.createRef();

    this.state = this.getInitialState();
  }

  setSelectedMailbox(account){
    this.props.setSelectedMailbox(account);
  }

  setUIState(state){
    this.setState({
      uiState: state
    });
  }

  componentWillUnmount(){
    this.props.resetFileState();
  }

  handleUpload(){
    if( // ensure that we have a file saved from dropzone
      window.selectedFileArrayBuffer.constructor === ArrayBuffer &&
      window.selectedFileArrayBuffer.byteLength > 0
      )
    {
      if(this.props.isStoringFile === false){
        let addressee = this.state.addressee;
        return this.FDS.currentAccount.send(
          addressee, 
          new File(
            [window.selectedFileArrayBuffer],
            this.state.selectedFileName,
            {type: this.state.selectedFileType}
          ),
          ()=>{
            this.setState({encryptMessage: 'Encrypted'});
            this.setState({feedbackMessage: "file was encrypted, uploading file..."}); 
            this.setState({fileWasEncrypted: true});
          },
          (response)=>{
            this.setState({feedbackMessage: "file uploaded."});
          },
          (message)=>{
            this.setState({feedbackMessage: message});
          }
        ).catch((error) => {
          this.setState({feedbackMessage: error});
          this.setState({fileWasUploaded: true});
        });
      }else{       
        return this.FDS.currentAccount.store(
          new File(
            [window.selectedFileArrayBuffer],
            this.state.selectedFileName,
            {type: this.state.selectedFileType}
          ),
          ()=>{
            this.setState({encryptMessage: 'Encrypted'});
            this.setState({feedbackMessage: "file was encrypted, uploading file..."}); 
            this.setState({fileWasEncrypted: true});
          },
          (response)=>{
            this.setState({feedbackMessage: "file uploaded."});
          },
          (message)=>{
            this.setState({feedbackMessage: message});
          }
        ).catch((error) => {
          this.setState({feedbackMessage: error});
          this.setState({fileWasUploaded: true});
        });
      }
    }else{
      this.setState({feedbackMessage: "there was an error, please try again..."});
      return false;
    }
  }

  render() {
    return (
        <div className="upload">
          <ASelectFile 
            parentState={this.state} 
            setParentState={this.setState.bind(this)} 
            setIsSelecting={this.props.setIsSelecting} 
            fileWasSelected={this.props.fileWasSelected} 
            selectedMailbox={this.props.selectedMailbox}
            isSendingFile={this.props.isSendingFile}            
            isStoringFile={this.props.isStoringFile}
            ref={this.aSelectFile}
          />
          <BSelectMailbox 
            FDS={this.FDS}
            parentState={this.state} 
            setParentState={this.setState.bind(this)}
            selectedMailbox={this.props.selectedMailbox}
            setSelectedMailbox={this.setSelectedMailbox.bind(this)}
          />
          <CSelectRecipient 
            FDS={this.FDS}
            parentState={this.state} 
            setParentState={this.setState.bind(this)}
          />
          <DConfirm 
            parentState={this.state} 
            setParentState={this.setState.bind(this)}
            isStoringFile={this.props.isStoringFile}
            selectedMailbox={this.props.selectedMailbox}
            handleUpload={this.handleUpload.bind(this)}
          />
          <EInProgress 
            parentState={this.state} 
            setParentState={this.setState.bind(this)}
          />
          <FCompleted 
            parentState={this.state} 
            setParentState={this.setState.bind(this)}
            isStoringFile={this.props.isStoringFile}
          />
          <ProgressBar 
            parentState={this.state} 
            setParentState={this.setState.bind(this)} 
            isStoringFile={this.props.isStoringFile}
          />
        </div>
    );
  }
}

export default Upload;