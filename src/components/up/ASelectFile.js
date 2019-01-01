import React, { Component } from 'react';
import Dropzone from 'dropzone';
import DDrop from '../../lib/DDrop';
import App from '../../App';

class ASelectFile extends Component{
  
  constructor(props) {
    super(props);
    this.state = { hasDropped: false }
    this.handleClickSelectFile = this.handleClickSelectFile.bind(this);
  }

  componentDidMount(){
    App.aSelectFile = this;
    this.dropZone();

    if(this.props.isSendingFile){
      this.handleClickSelectFile();
    }else 
    if(this.props.isStoringFile){
      this.handleClickStoreFile();
    }
  }

  dropZone(){
    let dd = new DDrop();    
    this.dropzone = new Dropzone(this.refs.dtSelectFile, { 
      url: 'dummy://', //dropzone requires a url even if we're not using it
      accept: (file, done) => {
        var reader = new FileReader();
        reader.addEventListener("loadend", 
          function(event) { 
            // for now, todo -> encrypt this into local file system?
            window.selectedFileArrayBuffer = event.target.result;
          });
        reader.readAsArrayBuffer(file);
      }
    });
    this.dropzone.on("dragenter", (event) => {
     this.props.setIsSelecting();      
     this.props.setParentState({fileIsSelecting: true});
    });
    this.dropzone.on("dragleave", (event) => {
      if(event.fromElement === null){
        this.props.setIsSelecting(false);    
        this.props.setParentState({fileIsSelecting: false});
      }
    });
    this.dropzone.on("drop", (event) => {
      this.setState({ hasDropped: true });
      this.props.fileWasSelected(true);
      setTimeout(()=>{
        dd.drop('dt-drop', event.clientX, event.clientY);
      }, 233);
    })
    this.dropzone.on("addedfile", (file) => {
      if(file.size > (1024 * 1024 * 5)){
        alert('Sorry, proof of concept is restricted to 5mb');
        window.location.reload();
        return false;
      }
      this.props.fileWasSelected(true);      
      if(this.state.hasDropped === false){
        this.setState({ hasDropped: true });
        dd.drop('dt-drop');
      }

    if(this.props.parentState.isStoringFile){
      //skip select recipient
      if(this.props.selectedMailbox){
        var newUIState = 3;
      }else{
        var newUIState = 2;
      }      
    }else{
      //select recipient
      if(this.props.selectedMailbox){
        var newUIState = 2;
      }else{
        var newUIState = 1;
      }
    }

      setTimeout(()=>{
        this.props.setParentState({
          fileIsSelected: true,
          selectedFileName: file.name,  
          selectedFileType: file.type,        
          selectedFileSize: file.size,
          uiState: newUIState
        });
      }, 1555)
    });
  }

  handleClickSelectFile(e){
    if(e){
      e.preventDefault();
    }
    this.props.setIsSelecting();
    this.props.setParentState({fileIsSelecting: true});
    this.refs.dtSelectFile.click();
  }

  handleClickStoreFile(e){
    if(e){
      e.preventDefault();
    }
    this.props.setIsSelecting();
    this.props.setParentState({
      isStoringFile: true,
      fileIsSelecting: true
    });
    this.refs.dtSelectFile.click();
  }  

  render(){
    return (
      <div id="dt-select-file" className={"dt-select-file " + (this.props.parentState.fileIsSelected && "is-selected")} ref="dtSelectFile" > 
        <div className={"dt-select-file-header " + (this.props.parentState.fileIsSelecting && "is-selecting")} onClick={this.handleClickSelectFile}> {/* this bit slides up out of view using transform */}
          <h1><span className="dt-select-file-header-inverted">FAIR</span> WAY TO STORE AND SEND DATA</h1>
        </div> {/* dt-header */}
        <div className={"dt-select-file-main dt-drop " + (this.props.parentState.fileIsSelecting && "is-selecting")} > {/* this bit expands to fill the viewport */}

        </div> {/* dt-select-file-main */}
        <div className={"dt-select-file-instruction " + (this.props.parentState.fileIsSelecting && "is-selecting ") + (this.state.hasDropped && "has-dropped")} onClick={this.handleClickSelectFile}> {/* this bit is centered vertically in the surrounding div which overlays the other two siblings */}
          <div className="dt-select-file-instruction-gradient-overlay"></div>
          <h2><span className="dt-select-file-header-underlined">select</span> or drop a file</h2>
        </div> {/* dt-select-file-instruction */}
      </div>
    )
  }
}

export default ASelectFile;