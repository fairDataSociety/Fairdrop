import React, { Component } from 'react';
import Dropzone from 'dropzone';
import DDrop from '../../lib/DDrop';
import App from '../../App';

class ASelectFile extends Component{
  
  constructor(props) {
    super(props);
    this.state = { hasDropped: false }
    this.handleClickSelectFile = this.handleClickSelectFile.bind(this);
    this.handleClickStoreFile = this.handleClickStoreFile.bind(this);
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
      previewsContainer: false,
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
     this.props.setParentState({fileIsSelecting: true});
    });
    this.dropzone.on("dragleave", (event) => {
      if(event.fromElement === null){
        this.props.setParentState({fileIsSelecting: false});
      }
    });
    this.dropzone.on("drop", (event) => {
      console.log(event.clientX, event.clientY);
      this.setState({ hasDropped: true });
      this.props.fileWasSelected(true);
      setTimeout(()=>{
        dd.drop('drop', event.clientX, event.clientY);
      }, 233);
    })
    this.dropzone.on("addedfile", (file) => {
      if(file.size > (1024 * 1024 * 5)){
        alert('Sorry, proof of concept is restricted to 5mb');
        window.location.reload();
        return false;
      }

      // solves the problem that there is no event to capture 'cancel' by doing the animation after
      var animationTimeout = 0;
      if(this.state.isHandlingClick === true){
        animationTimeout =  200;
        this.props.setParentState({fileIsSelecting: true});
      }else{
        animationTimeout =  0;
      }
      setTimeout(()=>{
        this.props.fileWasSelected(true);      
        if(this.state.hasDropped === false){
          this.setState({ hasDropped: true });
          dd.drop('drop');
        }
        
        let newUIState;

        if(this.props.parentState.isStoringFile === true){
          //skip select recipient
          if(this.props.selectedMailbox === false){
            newUIState = 1;
          }else{
            newUIState = 3;
          }      
        }else{
          //select recipient
          if(this.props.selectedMailbox){
            newUIState = 2;
          }else{
            newUIState = 1;
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
        }, 1555);

      }, animationTimeout);
    });
  }

  handleClickSelectFile(e){
    if(e){
      e.preventDefault();
    }
    this.setState({'isHandlingClick': true});
    this.refs.dtSelectFile.click();
  }

  handleClickStoreFile(e){
    if(e){
      e.preventDefault();
    }
    this.props.setParentState({
      isStoringFile: true,
    });
    this.setState({'isHandlingClick': true});
    this.refs.dtSelectFile.click();
  }  

  render(){
    return (
      <div id="select-file" className={"select-file " + (this.props.parentState.fileIsSelected && "is-selected " + (this.props.parentState.uiState !== 1 ? "hidden" : "fade-in"))} > 
        <div className={"select-file-header " + (this.props.parentState.fileIsSelecting && "is-selecting")}> {/* this bit slides up out of view using transform */}
          
        </div> {/* header */}
        <div ref="dtSelectFile" className={"select-file-main drop " + (this.props.parentState.fileIsSelecting && "is-selecting")} > {/* this bit expands to fill the viewport */}

        </div> {/* select-file-main */}
        <div className={"select-file-instruction " + (this.props.parentState.fileIsSelecting && "is-selecting ") + (this.state.hasDropped && "has-dropped")}> {/* this bit is centered vertically in the surrounding div which overlays the other two siblings */}
          <div className="select-file-instruction-gradient-overlay"></div>
          <h2>
            <span className="select-file-header-inverted">Fair</span> way to <span onClick={this.handleClickStoreFile} className="select-file-action">store</span> and <span onClick={this.handleClickSelectFile} className="select-file-action">send</span> data<br/>
            <span onClick={this.handleClickSelectFile} className="select-file-action">select</span> or drop a file
          </h2>
        </div> {/* select-file-instruction */}
      </div>
    )
  }
}

export default ASelectFile;