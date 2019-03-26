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

import ASelectFile from '../components/up/ASelectFile';
import BSelectMailbox from '../components/up/BSelectMailbox';
import DConfirm from '../components/up/DConfirm';
import EInProgress from '../components/up/EInProgress';
import FCompleted from '../components/up/FCompleted';
import ProgressBar from '../components/up/ProgressBar';

import App from '../App';

class Upload extends Component{

  getInitialState() {
    return {
      shouldEncrypt: false,
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

      encryptionComplete: false,
      fileWasUploaded: false,
      uploadProgress: '000%',

      isStoringFile: this.props.isStoringFile,
      isQuickFile: this.props.isQuickFile
    };
  }

  resetToInitialState(){
    this.setState(this.getInitialState());
    this.props.setFileIsSelecting(false);
    App.aSelectFile.resetToInitialState();
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

  setUploadProgress(progress){
    if (progress<=999) { progress = ("00"+progress).slice(-3); }
    this.setState({uploadProgress: `${progress}%`});   
  }

  handleUpload(){
    if( // ensure that we have a file saved from dropzone
      window.selectedFileArrayBuffer.constructor === ArrayBuffer &&
      window.selectedFileArrayBuffer.byteLength > 0
      )
    {
      if(
        this.state.isStoringFile === false &&
        this.state.isQuickFile === false
        ){
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
            this.setState({encryptionComplete: true});
          },
          (response)=>{
            this.setUploadProgress(response);
          },
          (message)=>{
            this.setState({feedbackMessage: message});
          }
        ).catch((error) => {
          this.setState({feedbackMessage: error});
          this.setState({fileWasUploaded: true});
        }).then(()=>{
            this.setState({feedbackMessage: "file uploaded."});              
            this.setState({fileWasUploaded: true}); 
        });
      }else if(
        this.state.isStoringFile === false &&
        this.state.isQuickFile === true
      ){
        this.setState({encryptionComplete: true});
        return this.FDS.Account.Swarm.storeFileUnencrypted(
          new File(
            [window.selectedFileArrayBuffer],
            this.state.selectedFileName,
            {type: this.state.selectedFileType}
          ),
          (response)=>{
            this.setUploadProgress(response);
          },
          (message)=>{
            this.setState({feedbackMessage: message});
          }
        ).catch((error) => {
          this.setState({feedbackMessage: error});
          this.setState({fileWasUploaded: true});
        }).then(()=>{
            this.setState({feedbackMessage: "file uploaded."});              
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
            this.setState({encryptionComplete: true});
          },
          (response)=>{
            this.setUploadProgress(response);
          },
          (message)=>{
            this.setState({feedbackMessage: message});
          }
        ).catch((error) => {
          this.setState({feedbackMessage: error});
          this.setState({fileWasUploaded: true});
        }).then(()=>{
            this.setState({feedbackMessage: "file uploaded."});              
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
            fileWasSelected={this.props.fileWasSelected}
            selectedMailbox={this.props.selectedMailbox}
            isSendingFile={this.props.isSendingFile}
            isStoringFile={this.props.isStoringFile}
            fileIsSelecting={this.props.fileIsSelecting}
            setFileIsSelecting={this.props.setFileIsSelecting}
            ref={this.aSelectFile}
          />
          <BSelectMailbox
            FDS={this.FDS}
            parentState={this.state}
            setParentState={this.setState.bind(this)}
            selectedMailbox={this.props.selectedMailbox}
            isStoringFile={this.props.isStoringFile}
            setSelectedMailbox={this.setSelectedMailbox.bind(this)}
            appRoot={this.props.appRoot}
            resetToInitialState={this.resetToInitialState.bind(this)}            
          />
          <DConfirm
            parentState={this.state}
            setParentState={this.setState.bind(this)}
            isStoringFile={this.props.isStoringFile}
            selectedMailbox={this.props.selectedMailbox}
            handleUpload={this.handleUpload.bind(this)}
            resetToInitialState={this.resetToInitialState.bind(this)}
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
