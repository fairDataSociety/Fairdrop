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

      isErrored: false,

      isStoringFile: this.props.isStoringFile,
      isQuickFile: this.props.isQuickFile
    };
  }

  resetToInitialState(){
    this.setState(this.getInitialState());
    this.props.setFileIsSelecting(false, 0);
    this.props.setFileIsSelecting(false, 1);
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
    let multiboxPath = localStorage.getItem('fairdrop_application_domain') || '/shared/fairdrop/encrypted';
    if(
      window.files.length > 0
      )
    {
      if(
        this.state.isStoringFile === false &&
        this.state.isQuickFile === false
        ){
        let addressee = this.state.addressee;
        return this.FDS.currentAccount.send(
          addressee,
          window.files[0],
          multiboxPath,
          ()=>{
            this.setState({encryptMessage: 'Encrypted'});
            this.setState({feedbackMessage: "file was encrypted, uploading file..."});
            this.setState({encryptionComplete: true});
          },
          (response)=>{
            this.setUploadProgress(response);
            if(response === 100){
              this.setState({feedbackMessage: "file uploaded, processing into Swarm."});              
              this.setState({fileWasUploaded: true}); 
            }
          },
          (message)=>{
            this.setState({feedbackMessage: message});
          }
        ).catch((error) => {
          this.setState({feedbackMessage: error.message});
          this.setState({fileWasUploaded: true});
        }).then(()=>{
            this.setState({feedbackMessage: "file uploaded, processing into Swarm."});              
            this.setState({fileWasUploaded: true}); 
        });
      }else if(
        this.state.isStoringFile === false &&
        this.state.isQuickFile === true
      ){
        this.setState({encryptionComplete: true});
        let files = window.files;
        let newFiles = [];
        for (var i = files.length - 1; i >= 0; i--) {
          let newFile = new File(
            [files[i]],
            files[i].name.replace(/ /g,'_'),
            {type: files[i].type}
          );
          let fullPath = files[i].fullPath || files[i].webkitRelativePath;
          newFile.fullPath = fullPath.replace(/ /g,'_');
          newFiles.push(newFile);
        }
        return this.FDS.Account.Store.storeFilesUnencrypted(
          newFiles,
          (response)=>{
            this.setUploadProgress(response);
            if(response === 100){
              this.setState({feedbackMessage: "file uploaded, processing into Swarm."});              
              this.setState({fileWasUploaded: true}); 
              this.props.enableNav();
            }
          },
          (message)=>{
            this.setState({feedbackMessage: message});
          }
        ).then((hash)=>{
          let index_index = null;
          for (var i = files.length - 1; i >= 0; i--) {
            var fullPath = files[i].fullPath || files[i].webkitRelativePath;   
            if(fullPath.split('/')[1] === 'index.html'){
              index_index = i;
            }
          }
          if(index_index !== null){
            return window.location.protocol + '//' + window.location.host + this.props.appRoot + '/download/'+ hash.address + '/' + hash.file.name + '?size=' + hash.file.size; 
          }else{
            if(files.length > 1){
              return window.location.protocol + '//' + window.location.host + this.props.appRoot + '/download-list/'+ hash.address + '/';
            }else{
              return window.location.protocol + '//' + window.location.host + this.props.appRoot + '/download/'+ hash.address + '/' + hash.file.name + '?size=' + hash.file.size; 
            }
          }          
        });
      }else{
        return this.FDS.currentAccount.store(
          window.files[0],
          ()=>{
            this.setState({encryptMessage: 'Encrypted'});
            this.setState({feedbackMessage: "file was encrypted, uploading file..."});
            this.setState({encryptionComplete: true});
          },
          (response)=>{
            this.setUploadProgress(response);
            if(response === 100){
              this.setState({feedbackMessage: "file uploaded, processing into Swarm."});          
            }
          },
          (message)=>{
            this.setState({feedbackMessage: message});
          },
          {pinned: true},
          true,
          true
        ).then(async (response)=>{
          await this.props.fdsPin.pin(response.storedFile.address);
          console.log('pinned', response.storedFile.address);
          return response;
        }).then(async (response)=>{
            if(response.oldStoredManifestAddress !== undefined){
              try{
                await this.props.fdsPin.unpin(response.oldStoredManifestAddress);
              }catch{
                console.log("couldn't unpin", response.oldStoredManifestAddress)
              }
            }
            try{
              await this.props.fdsPin.pin(response.storedManifestAddress);
            }catch{
              console.log("couldn't pin", response.storedManifestAddress)
            }
            return response;
        }).then((response)=>{
          setTimeout(this.props.updateStoredStats, 1000);
        }).catch((error) => {
          this.setState({feedbackMessage: error.message});
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
            isQuickFile={this.props.isQuickFile}
            fileIsSelecting0={this.props.fileIsSelecting0}
            fileIsSelecting1={this.props.fileIsSelecting1}
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
            fdsPin={this.props.fdsPin}
            updateBalance={this.props.updateBalance}    
            saveAppState={this.props.saveAppState}    
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
            appRoot={this.props.appRoot}
            parentState={this.state}
            setParentState={this.setState.bind(this)}
            resetToInitialState={this.resetToInitialState.bind(this)}
          />
          <FCompleted
            appRoot={this.props.appRoot}
            parentState={this.state}
            setParentState={this.setState.bind(this)}
            isStoringFile={this.props.isStoringFile}
            handleNavigateTo={this.props.handleNavigateTo}
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
