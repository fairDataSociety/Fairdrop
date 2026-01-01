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
import Dropzone from 'dropzone';
import App from '../../App';
import { track, Events } from '../../lib/analytics';

class ASelectFile extends Component{

  getInitialState(){
    return {
      hasDropped: false,
      isDragging: false,
      showModeModal: false,
      pendingFile: null
    }
  }

  constructor(props) {
    super(props);

    this.handleClickSelectFile = this.handleClickSelectFile.bind(this);
    this.handleClickStoreFile = this.handleClickStoreFile.bind(this);
    this.handleClickQuickFile = this.handleClickQuickFile.bind(this);
    this.handleModeSelect = this.handleModeSelect.bind(this);

    // Single unified dropzone
    this.dtUnifiedDropzone = React.createRef();
    // Hidden file inputs for click-to-select (used by menu items)
    this.dtSelectSaveFile = React.createRef();
    this.dtSelectStoreFile = React.createRef();
    this.dtSelectQuickFile = React.createRef();

    this.state = this.getInitialState();
  }

  resetToInitialState(){
    window.files = [];
    this.props.setFileIsSelecting(false, 0);
    this.props.setFileIsSelecting(false, 1);
    this.setState(this.getInitialState());
  }

  componentDidMount(){
    App.aSelectFile = this;
    this.initUnifiedDropzone();
    this.initHiddenDropzones();

    // Handle menu-initiated file selections
    if(this.props.isSendingFile){
      this.handleClickSelectFile();
    }else if(this.props.isStoringFile){
      this.handleClickStoreFile();
    }else if(this.props.isQuickFile){
      this.handleClickQuickFile();
    }
  }

  // Initialize the main unified dropzone for drag-and-drop
  initUnifiedDropzone(){
    let self = this;
    let dropzone = new Dropzone(this.dtUnifiedDropzone.current, {
      url: 'dummy://',
      ignoreHiddenFiles: true,
      previewsContainer: false,
      maxFilesize: 1000,
      uploadMultiple: false,
      accept: function(file, done) {
        window.files = [];
        window.files.push(file);
        self.props.setParentState({
          selectedFileName: file.name,
          selectedFileSize: file.size,
        });
      }
    });

    dropzone.on("dragenter", (event) => {
      event.preventDefault();
      this.setState({ isDragging: true });
      this.props.setFileIsSelecting(true, 0);
    });

    dropzone.on("dragover", (event) => {
      if (!this.state.isDragging) {
        this.setState({ isDragging: true });
        this.props.setFileIsSelecting(true, 0);
      }
      // Clear any pending drag leave
      if (this.dragLeaveTimer) {
        clearTimeout(this.dragLeaveTimer);
      }
      this.dragLeaveTimer = setTimeout(() => {
        this.setState({ isDragging: false });
        this.props.setFileIsSelecting(false, 0);
      }, 100);
    });

    dropzone.on("drop", (event) => {
      this.setState({ isDragging: false, hasDropped: true });
      this.props.fileWasSelected(true);
    });

    dropzone.on("addedfile", (file) => {
      // Check file size limits
      const maxSize = localStorage.getItem('hasEnabledEasterEgg') === "true"
        ? (1024 * 1024 * 500)
        : (1024 * 1024 * 100);

      if(file.size > maxSize){
        const limitMB = maxSize / (1024 * 1024);
        alert(`Sorry, proof of concept is restricted to ${limitMB}mb`);
        this.resetToInitialState();
        return false;
      }

      this.props.fileWasSelected(true);
      this.setState({
        hasDropped: true,
        pendingFile: file,
        showModeModal: true  // Show modal to select mode
      });
    });
  }

  // Hidden dropzones for menu-initiated click-to-select
  initHiddenDropzones(){
    this.initClickDropzone(this.dtSelectSaveFile.current, 'send');
    this.initClickDropzone(this.dtSelectStoreFile.current, 'store');
    this.initClickDropzone(this.dtSelectQuickFile.current, 'quick');
  }

  initClickDropzone(element, mode){
    let self = this;
    let isQuick = mode === 'quick';

    let dropzone = new Dropzone(element, {
      url: 'dummy://',
      init: function(){
        if(isQuick){
          this.hiddenFileInput.setAttribute("webkitdirectory", true);
        }
      },
      ignoreHiddenFiles: true,
      previewsContainer: false,
      maxFilesize: 1000,
      uploadMultiple: isQuick,
      accept: function(file, done) {
        if(!isQuick){
          window.files = [];
        }
        window.files.push(file);
        if(window.files.length === 1){
          self.props.setParentState({
            selectedFileName: file.name,
            selectedFileSize: file.size,
          });
        }else{
          let totalCount = window.files.length;
          let totalSize = 0;
          for (var i = window.files.length - 1; i >= 0; i--) {
            totalSize += window.files[i].size;
          }
          self.props.setParentState({
            selectedFileName: `${totalCount} files`,
            selectedFileSize: totalSize,
          });
        }
      }
    });

    dropzone.on("addedfile", (file) => {
      const maxSize = localStorage.getItem('hasEnabledEasterEgg') === "true"
        ? (1024 * 1024 * 500)
        : (1024 * 1024 * 100);

      if(file.size > maxSize){
        const limitMB = maxSize / (1024 * 1024);
        alert(`Sorry, proof of concept is restricted to ${limitMB}mb`);
        this.resetToInitialState();
        return false;
      }

      this.props.fileWasSelected(true);
      this.setState({ hasDropped: true });

      // Directly proceed with the pre-selected mode
      this.proceedWithMode(mode);
    });
  }

  handleModeSelect(mode){
    this.setState({ showModeModal: false });
    // Track mode selection
    track(Events.MODE_SELECTED, { mode });
    this.proceedWithMode(mode);
  }

  proceedWithMode(mode){
    let newUIState;

    if(mode === 'store'){
      this.props.setParentState({isSendingFile: false, isStoringFile: true, isQuickFile: false});
      newUIState = this.props.selectedMailbox === false ? 1 : 3;
    } else if(mode === 'quick'){
      this.props.setParentState({isSendingFile: false, isStoringFile: false, isQuickFile: true});
      newUIState = 4;
    } else {
      // send
      this.props.setParentState({isSendingFile: true, isStoringFile: false, isQuickFile: false});
      newUIState = 1;
    }

    setTimeout(() => {
      this.props.setFileIsSelecting(false);
      this.props.fileWasSelected(false);
      this.props.setParentState({
        fileIsSelected: true,
        uiState: newUIState
      });
    }, 300);
  }

  handleClickQuickFile(e){
    if(e) e.preventDefault();
    this.props.setParentState({
      isQuickFile: true,
      isSendingFile: false,
      isStoringFile: false,
    });
    this.dtSelectQuickFile.current.click();
  }

  handleClickSelectFile(e){
    if(e) e.preventDefault();
    this.props.setParentState({
      isSendingFile: true,
      isStoringFile: false,
      isQuickFile: false,
    });
    this.dtSelectSaveFile.current.click();
  }

  handleClickStoreFile(e){
    if(e) e.preventDefault();
    this.props.setParentState({
      isStoringFile: true,
      isSendingFile: false,
      isQuickFile: false,
    });
    this.dtSelectStoreFile.current.click();
  }

  renderModeModal(){
    if(!this.state.showModeModal) return null;

    const fileName = this.props.parentState.selectedFileName || 'your file';

    return (
      <div className="mode-modal-overlay">
        <div className="mode-modal">
          <h2>What would you like to do with {fileName}?</h2>
          <div className="mode-options">
            <button
              className="mode-option mode-option-send"
              onClick={() => this.handleModeSelect('send')}
            >
              <span className="mode-icon">🔐</span>
              <span className="mode-title">Send Encrypted</span>
              <span className="mode-desc">Send securely to a recipient</span>
            </button>
            <button
              className="mode-option mode-option-store"
              onClick={() => this.handleModeSelect('store')}
            >
              <span className="mode-icon">📦</span>
              <span className="mode-title">Store File</span>
              <span className="mode-desc">Save encrypted for yourself</span>
            </button>
            <button
              className="mode-option mode-option-quick"
              onClick={() => this.handleModeSelect('quick')}
            >
              <span className="mode-icon">⚡</span>
              <span className="mode-title">Quick Share</span>
              <span className="mode-desc">Unencrypted, no login needed</span>
            </button>
          </div>
          <button
            className="mode-cancel"
            onClick={() => { this.setState({ showModeModal: false }); this.resetToInitialState(); }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  render(){
    const { isDragging, hasDropped, showModeModal } = this.state;
    const { fileIsSelecting0, fileIsSelecting1, parentState } = this.props;
    const isSelecting = isDragging || fileIsSelecting0 || fileIsSelecting1;

    return (
      <div id="select-file" className={"select-file " + (parentState.fileIsSelected && !showModeModal ? "is-selected " + (parentState.uiState !== 1 ? "hidden" : "fade-in") : "")}>

        {/* Hidden dropzones for menu-initiated selections */}
        <div ref={this.dtSelectStoreFile} style={{display: 'none'}}></div>
        <div ref={this.dtSelectSaveFile} style={{display: 'none'}}></div>
        <div ref={this.dtSelectQuickFile} style={{display: 'none'}}></div>

        {/* Unified dropzone - full screen */}
        <div
          ref={this.dtUnifiedDropzone}
          className={"select-file-main drop unified-dropzone " + (isSelecting ? "is-selecting " : "") + (hasDropped && !showModeModal ? "has-dropped" : "")}
        >
          <div className="dropzone-highlight">
            <div className="dropzone-highlight-inner">
              <h2>Drop your file here</h2>
            </div>
          </div>
        </div>

        {/* Instructions overlay */}
        <div className={"select-file-instruction " + (isSelecting ? "is-selecting " : "") + (hasDropped && !showModeModal ? "has-dropped" : "")}>
          <div className="select-file-instruction-inner">
            <h2>
              An easy and secure way to send your files.
            </h2>
            <h2 className="last">
              <span className="avoid-wrap">No central server.&nbsp;</span>
              <span className="avoid-wrap">No tracking.&nbsp;</span>
              <span className="avoid-wrap">No backdoors.&nbsp;</span>
            </h2>
            <h3 className="hide-mobile">
              <img alt="click to select a file" src="assets/images/fairdrop-select.svg"/> <span className="select-file-action" onClick={this.handleClickSelectFile}>select</span> or <img alt="drop file glyph" src="assets/images/fairdrop-drop.svg"/> drop a file
            </h3>
            <h3 className="show-mobile">
              <button className="btn btn-white btn-lg send-file-unencrypted" onClick={this.handleClickQuickFile}>Quick Share</button><br/>
              <button className="btn btn-white btn-lg send-file-encrypted" onClick={this.handleClickSelectFile}>Send Encrypted</button><br/>
              <button className="btn btn-white btn-lg store-file-encrypted" onClick={this.handleClickStoreFile}>Store File</button>
            </h3>
          </div>
        </div>

        {/* Mode selection modal */}
        {this.renderModeModal()}
      </div>
    )
  }
}

export default ASelectFile;
