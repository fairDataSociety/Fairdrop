import React, { Component } from 'react';
import DTransfer from '../../services/Dtransfer';
import Dropzone from 'dropzone';

class ASelectFile extends Component{
  
  constructor(props) {
    super(props);
    this.DT = new DTransfer(process.env.REACT_APP_SWARM_GATEWAY);
    this.handleClickSelectFile = this.handleClickSelectFile.bind(this);
  }

  componentDidMount(){
    this.dropZone();
  }

  dropZone(){
    this.dropzone = new Dropzone(this.refs.dtSelectFile, { 
      url: 'dummy://', //dropzone requires a url even if we're not using it
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
     this.props.setParentState({fileIsSelecting: true});
    });
    this.dropzone.on("dragleave", (event) => {
      if(event.fromElement === null){
        this.props.setParentState({fileIsSelecting: false});
      }
    });
    this.dropzone.on("addedfile", (file) => {
      this.props.setParentState({
        fileIsSelected: true,
        selectedFileName: file.name,  
        selectedFileType: file.type,        
        selectedFileSize: this.DT.humanFileSize(file.size),
        uiState: 1
      });
    });
  }


  handleClickSelectFile(e){
    e.preventDefault();    
    this.props.setParentState({fileIsSelecting: true});
    this.refs.dtSelectFile.click();
  }  

  render(){
    return (
      <div id="dt-select-file" className={"dt-select-file " + (this.props.parentState.fileIsSelected && "is-selected")} ref="dtSelectFile" > 
        <div className={"dt-select-file-header " + (this.props.parentState.fileIsSelecting && "is-selecting")} onClick={this.handleClickSelectFile}> {/* this bit slides up out of view using transform */}
          <h1>Send and store files securely and privately</h1>
        </div> {/* dt-header */}
        <div className={"dt-select-file-main " + (this.props.parentState.fileIsSelecting && "is-selecting")} > {/* this bit expands to fill the viewport */}

        </div> {/* dt-select-file-main */}
        <div className={"dt-select-file-instruction " + (this.props.parentState.fileIsSelecting && "is-selecting")} onClick={this.handleClickSelectFile}> {/* this bit is centered vertically in the surrounding div which overlays the other two siblings */}
          <h2>choose or drag and drop a file</h2>
        </div> {/* dt-select-file-instruction */}
      </div>
    )
  }
}

export default ASelectFile;