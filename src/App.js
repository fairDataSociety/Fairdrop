import React, { Component } from 'react';
import DTransfer from "./services/Dtransfer";
import FileSaver from 'file-saver';
import DTransferUp from "./components/DTransferUp";
import './App.css';

class App extends Component {

  getInitialState() {
    return {
      // download file
      findFileFeedBackMessage: 'Trying to find your file...',
      findingFile: true,
      fileIsDecrypting: false
    };
  }

  resetToInitialState(){
    this.setState(this.getInitialState());
  }

  constructor(props) {
    super(props);

    this.DT = new DTransfer(process.env.REACT_APP_SWARM_GATEWAY);

    this.state = this.getInitialState();

  }

  retrieveFile(swarmHash, fileName, mimeType, isEncrypted){
    return this.DT.getFile(swarmHash, fileName).then((retrievedFile)=>{
      this.setState({findFileFeedBackMessage: "Decrypting file..."});
      if(isEncrypted){
        setTimeout(()=>{
          let password = prompt('Please enter your file\'s passphrase');
          if(password){
            let decryptedFileName = fileName.replace(/\.encrypted$/,'');          
            let decryptedFile = this.DT.decryptedFile(retrievedFile, password, decryptedFileName, mimeType);
            this.setState({findFileFeedBackMessage: "Downloading file..."}); 
            FileSaver.saveAs(decryptedFile);
          }else{
            alert('Sorry, you must provide a password to download your file!');
            this.retrieveFile(swarmHash, fileName, mimeType);
          }
        },500);
      }else{
        FileSaver.saveAs(new File([retrievedFile], fileName, {type: mimeType}));
      }
    }).catch((error)=>{
      this.setState({findFileFeedBackMessage: "Sorry, we couldn't find that hash."});      
    })
  }

  componentDidMount(){
    var urlParams = new URLSearchParams(window.location.search);
    let swarmHash = urlParams.get('swarmHash');      
    let fileName = urlParams.get('fileName'); 
    let mimeType = urlParams.get('mimeType'); 
    let isEncrypted = urlParams.get('isEncrypted') === 'true'; 

    if(swarmHash && fileName){
      this.setState({
        isDownloading: true,
        swarmHash: swarmHash,
        fileName: fileName,
        mimeType: mimeType,
        findingFile: true,
        fileIsDecrypting: false
      });
      this.retrieveFile(swarmHash, fileName, mimeType, isEncrypted);
    }
  }

  render() {
    return (
      <div className="dt-wrapper">
        <div className="dt-nav-header"> {/* this bit should always overlay (or perhaps be hidden unless mouseover?) */}
          <div className="dt-nav-header-item">
            <a href="/"><img className="dt-df-logo" src="/assets/images/datafund-logo.svg" alt="Datafund Logo"/></a>
          </div>
        </div>
        <DTransferUp/>
        <div className="dt-network-status">
          <div className="dt-network-status-ethereum">
            
          </div> {/* dt-network-status-ethereum */}
          <div className="dt-network-status-swarm">
            
          </div> {/* dt-network-status-swarm */}
        </div>
      </div>
    );
  }
}

export default App;