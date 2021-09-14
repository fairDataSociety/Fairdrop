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

import React, { Component } from 'react'
import Dropzone from 'dropzone'
// import DDrop from '../../lib/DDrop';
import App from '../../_App'

class ASelectFile extends Component {
  getInitialState() {
    return {
      hasDropped: false,
      willDragLeave0: true,
      willDragLeave1: true,
    }
  }

  constructor(props) {
    super(props)

    this.handleClickSelectFile = this.handleClickSelectFile.bind(this)
    this.handleClickStoreFile = this.handleClickStoreFile.bind(this)
    this.handleClickQuickFile = this.handleClickQuickFile.bind(this)

    this.state = this.getInitialState()
  }

  resetToInitialState() {
    window.files = []
    this.props.setFileIsSelecting(false, 0)
    this.props.setFileIsSelecting(false, 1)
    this.setState(this.getInitialState())
  }

  componentDidMount() {
    App.aSelectFile = this
    this.dropZone()

    if (this.props.isSendingFile) {
      this.handleClickSelectFile()
    } else if (this.props.isStoringFile) {
      this.handleClickStoreFile()
    } else if (this.props.isQuickFile) {
      this.handleClickQuickFile()
    }
  }

  initDropzone(element, isStoring = false, isQuick = false, i) {
    // let dd = new DDrop();
    let self = this;
    let multiple = isQuick === true;
    let dropzone = new Dropzone(element, {
      url: 'dummy://', //dropzone requires a url even if we're not using it
      init: function(){
          if(multiple){
            this.hiddenFileInput.setAttribute("webkitdirectory", true);
          }
      },
      ignoreHiddenFiles: true,
      previewsContainer: false,
      maxFilesize: 1000,
      uploadMultiple: multiple,
      // clickable: false,
      accept: function(file, done) {
        if(isQuick === false){
          window.files = [];
        }
        window.files.push(file);
        if(window.files.length === 1){
          self.props.setParentState({
            selectedFileName: file.name,
            selectedFileSize: file.size,
          })
        } else {
          let totalCount = window.files.length
          let totalSize = 0
          for (var i = window.files.length - 1; i >= 0; i--) {
            totalSize += window.files[i].size
          }
          self.props.setParentState({
            selectedFileName: `${totalCount} files`,
            selectedFileSize: totalSize,
          })
        }
      },
    })

    dropzone.on('dragenter', (event) => {
      event.preventDefault()
      this.props.setFileIsSelecting(true, i)
    })

    dropzone.on('dragover', (event) => {
      this.handleDragOver(i)
    })

    dropzone.on('drop', (event) => {
      this.props.fileWasSelected(true)
      this.setState({ hasDropped: true })
      if (isStoring === true) {
        this.props.setParentState({ isSendingFile: false })
        this.props.setParentState({ isStoringFile: true })
        this.props.setParentState({ isQuickFile: false })
      } else if (isQuick === true) {
        this.props.setParentState({ isSendingFile: false })
        this.props.setParentState({ isStoringFile: false })
        this.props.setParentState({ isQuickFile: true })
      } else {
        this.props.setParentState({ isSendingFile: true })
        this.props.setParentState({ isStoringFile: false })
        this.props.setParentState({ isQuickFile: false })
      }
    })

    dropzone.on('addedfile', (file) => {
      if (localStorage.getItem('hasEnabledEasterEgg') === 'true') {
        if (file.size > 1024 * 1024 * 500) {
          alert('Sorry, proof of concept is restricted to 500mb')
          this.resetToInitialState()
          return false
        }
      } else {
        if (file.size > 1024 * 1024 * 100) {
          alert('Sorry, proof of concept is restricted to 100mb')
          this.resetToInitialState()
          return false
        }
      }

      this.props.fileWasSelected(true)
      if (this.state.hasDropped === false) {
        this.setState({ hasDropped: true })
        // dd.drop('drop');
      }

      let newUIState

      if (this.props.parentState.isStoringFile === true) {
        //skip sign in if signed in
        if (this.props.selectedMailbox === false) {
          newUIState = 1
        } else {
          newUIState = 3
        }
      }
      if (this.props.parentState.isQuickFile === true) {
        //skip sign in regardless
        newUIState = 3
      }
      if (this.props.parentState.isSendingFile === true) {
        //select recipient
        newUIState = 1
      }

      setTimeout(() => {
        this.props.setFileIsSelecting(false)
        this.props.fileWasSelected(false)
        this.props.setParentState({
          fileIsSelected: true,
          uiState: newUIState,
        })
      }, 555)
    })
  }

  handleDragOver(i) {
    //tricky but more robust fix because dragleave event does not work for dropzone in Safari
    let p = `fileIsSelecting${i}`;
      if(this.props[p] === false){
        this.props.setFileIsSelecting(true, i);
      }
      if(this.t){
        clearTimeout(this.t);
      }
      this.t = setTimeout(()=>{
        this.props.setFileIsSelecting(false, i);
      }, 100);
  }

  dropZone() {
    this.initDropzone(this.refs.dtSelectSaveFile, false, false, 0)
    this.initDropzone(this.refs.dtSelectStoreFile, true, false, 1)
    this.initDropzone(this.refs.dtSelectQuickFile, false, true, 2)
  }

  handleClickQuickFile(e) {
    if (e) {
      e.preventDefault()
    }
    this.props.setParentState({
      isQuickFile: true,
      isSendingFile: false,
      isStoringFile: false,
    })
    this.setState({ isHandlingClick: true })
    this.refs.dtSelectQuickFile.click()
  }

  handleClickSelectFile(e) {
    if (e) {
      e.preventDefault()
    }
    this.props.setParentState({
      isSendingFile: true,
      isStoringFile: false,
      isQuickFile: false,
    })
    this.setState({ isHandlingClick: true })
    this.refs.dtSelectSaveFile.click()
  }

  handleClickStoreFile(e) {
    if (e) {
      e.preventDefault()
    }
    this.props.setParentState({
      isStoringFile: true,
      isSendingFile: false,
      isQuickFile: false,
    })
    this.setState({ isHandlingClick: true })
    this.refs.dtSelectStoreFile.click()
  }

  render() {
    return (
      <div
        id="select-file"
        className={
          'select-file ' +
          (this.props.parentState.fileIsSelected &&
            'is-selected ' + (this.props.parentState.uiState !== 1 ? 'hidden' : 'fade-in'))
        }
      >
        <div
          className={
            'select-file-main hide-mobile drop ' +
            (this.props.fileIsSelecting0 || this.props.fileIsSelecting1 ? 'is-selecting ' : ' ') +
            (this.state.hasDropped && 'has-dropped')
          }
        >
          {' '}
          {/* this bit expands to fill the viewport */}
          <div ref="dtSelectStoreFile" className="select-file-store no-events-mobile " style={{ display: 'none' }}>
            <div className="select-file-drop-inner">
              <h2>Store encrypted</h2>
              <div>Requires logging in to your mailbox</div>
            </div>
          </div>
          <div ref="dtSelectSaveFile" className="select-file-send">
            <div className="select-file-drop-inner">
              <h2>Send encrypted</h2>
              <div>Requires logging in to your mailbox</div>
            </div>
          </div>
          <div ref="dtSelectQuickFile" className="select-file-quick">
            <div className="select-file-drop-inner">
              <h2>Send in a quick way</h2>
              <div>Send a file or folder unencrypted - no mailboxes required</div>
            </div>
          </div>
        </div>
        <div
          className={
            'select-file-instruction ' +
            ((this.props.fileIsSelecting0 || this.props.fileIsSelecting1) && 'is-selecting ') +
            (this.state.hasDropped && 'has-dropped')
          }
        >
          {' '}
          {/* this bit is centered vertically in the surrounding div which overlays the other two siblings */}
          <div className="select-file-instruction-inner">
            <h2>An easy and secure way to send your files.</h2>
            <h2 className="last">
              <span className="avoid-wrap">No central server.&nbsp;</span>
              <span className="avoid-wrap">No tracking.&nbsp;</span>
              <span className="avoid-wrap">No backdoors.&nbsp;</span>
            </h2>
            <h3 className="hide-mobile">
              <img alt="click to select a file" src="assets/images/fairdrop-select.svg" />{' '}
              <span className="select-file-action" onClick={this.handleClickSelectFile}>
                select
              </span>{' '}
              or <img alt="drop file glyph" src="assets/images/fairdrop-drop.svg" /> drop a file
            </h3>
            <h3 className="show-mobile">
              <button className="btn btn-white btn-lg send-file-unencrypted" onClick={this.handleClickQuickFile}>
                Send Unencrypted
              </button>
              <br />
              <button className="btn btn-white btn-lg send-file-encrypted" onClick={this.handleClickSelectFile}>
                Send Encrypted
              </button>
              <br />
              <button className="btn btn-white btn-lg store-file-encrypted" onClick={this.handleClickStoreFile}>
                Store Encrypted
              </button>
            </h3>
          </div>
        </div>
      </div>
    )
  }
}

export default ASelectFile
