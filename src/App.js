import React, { Component } from 'react';
import DTransfer from "./services/Dtransfer";
import FileSaver from 'file-saver';
import DTransferUp from "./components/DTransferUp";
import DTransferMailbox from "./components/DTransferMailbox";
import DMailbox from "./services/DMailbox";
import './App.css';

window.DMailbox = DMailbox;

class App extends Component {

  getInitialState() {
    return {
      // download file
      fileIsSelected: false,
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

    this.setIsSelecting = this.setIsSelecting.bind(this);

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
    let mailbox = urlParams.get('mailbox') !== null;      

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

    if(mailbox){
      this.setState({
        isMailbox: true,
      });      
    }
  }

  setIsSelecting(){
    this.setState({fileIsSelecting: true});
  }

  render() {
    return (
      <div className={"dt-wrapper " + ((this.state.fileIsSelecting || this.state.isMailbox) ? "dt-nav-white " : "")}>
        <div className="dt-nav-header"> {/* this bit should always overlay (or perhaps be hidden unless mouseover?) */}
          <div className="dt-nav-header-item">
          <a href="/">
            <svg version="1.1" className="fairdop-logo" alt="Fairdrop Logo"
               width="238px" height="68px" viewBox="0 0 238 68" enable-background="new 0 0 238 68">
              <g>
                <path d="M78.321,44.335c-2.959,0-3.209-1.678-3.352-2.961c-0.643,1.283-3.174,3.424-8.381,3.424c-6.632,0-8.166-3.566-8.166-5.992
                  c0-2.994,2.141-4.279,3.067-4.67c1.676-0.749,4.386-0.821,8.487-0.821h4.957v-0.427c0-2.14-0.036-4.208-5.777-4.208
                  c-2.604,0-5.42,0.464-6.17,2.282l-3.423-0.321c0.036-0.142,0.356-1.07,0.784-1.711c0.678-0.999,2.176-2.711,8.63-2.711
                  c0.499,0,2.96,0.036,4.957,0.535c0.463,0.106,2.282,0.499,3.316,1.89c0.855,1.141,0.855,2.318,0.855,3.638v6.952
                  c0,1.998,0.321,2.676,1.962,2.676c0.32,0,1.248-0.107,1.248-0.107v2.354C80.318,44.228,79.32,44.335,78.321,44.335 M68.587,35.919
                  c-3.424,0-6.775,0-6.775,2.852c0,1.711,1.568,3.424,5.027,3.424c2.033,0,5.885-0.465,7.488-3.424
                  c0.643-1.213,0.607-2.354,0.643-2.852H68.587z"/>
                <path d="M86.054,20.406h3.353v3.423h-3.353V20.406z M86.09,26.754h3.389v17.401H86.09V26.754z"/>
                <path d="M100.209,26.754v1.961c0.25-0.25,2.39-2.461,6.704-2.461c0.998,0,1.569,0.179,1.997,0.286v3.316
                  c-0.642-0.215-1.462-0.393-2.817-0.393c-1.319,0-5.884,0.107-5.884,4.992v9.699h-3.388V26.754H100.209z"/>
                <path d="M129.731,44.155v-2.318c-0.818,0.75-3.065,2.639-7.809,2.639c-1.069,0-4.137-0.07-6.739-1.996
                  c-1.142-0.82-3.603-3.139-3.603-7.168c0-1.213,0.25-4.064,2.817-6.347c1.142-0.998,3.708-2.639,7.632-2.639
                  c1.248,0,4.778,0.179,7.701,2.461v-9.808h3.389v25.176H129.731z M128.128,30.926c-2.068-1.854-5.028-1.89-5.884-1.89
                  c-4.065,0-7.132,2.425-7.132,6.561c0,3.424,2.495,6.1,7.238,6.1c3.246,0,7.561-1.215,7.561-6.42
                  C129.911,34.456,129.875,32.495,128.128,30.926"/>
                <path d="M143.919,26.754v1.961c0.25-0.25,2.39-2.461,6.705-2.461c0.998,0,1.567,0.179,1.996,0.286v3.316
                  c-0.642-0.215-1.461-0.393-2.816-0.393c-1.321,0-5.885,0.107-5.885,4.992v9.699h-3.387V26.754H143.919z"/>
                <path d="M166.703,44.69c-6.597,0-11.411-3.352-11.411-8.879c0-7.132,6.633-9.486,11.305-9.486c5.49,0,11.41,2.426,11.41,9.199
                  C178.007,40.554,173.907,44.69,166.703,44.69 M166.524,29.107c-3.887,0-7.809,2.211-7.809,6.489c0,3.637,3.244,6.277,8.166,6.277
                  c3.388,0,7.738-1.783,7.738-6.42C174.62,30.677,170.02,29.107,166.524,29.107"/>
                <path d="M187.595,26.754v1.854c1.319-1.318,4.707-2.282,7.523-2.282c6.775,0,10.627,4.138,10.627,8.986
                  c0,4.635-3.209,9.164-9.949,9.164c-4.921,0-7.203-1.746-8.201-2.746v9.379h-3.389V26.754H187.595z M194.763,29.001
                  c-4.957,0-7.347,2.888-7.347,6.561c0,4.635,4.173,6.205,7.489,6.205c4.35,0,7.167-2.711,7.167-6.561
                  C202.072,31.781,199.397,29.001,194.763,29.001"/>
                <polygon points="54.648,20.271 48.692,24.172 51.062,20.318 48.692,16.892  "/>
                <rect x="39.371" y="30.142" width="14.564" height="2.959"/>
                <polygon points="35.784,18.98 32.255,18.98 32.255,44.155 35.784,44.155 35.784,40.026 35.784,33.102 35.784,30.143 35.784,22.083 
                    "/>
                <rect x="35.784" y="18.98" width="15.886" height="3.103"/>
                <polygon points="35.784,31.829 41.74,27.928 39.371,31.78 41.74,35.208   "/>
              </g>
            </svg>
          </a>
          </div>
        </div>
        <div className="dt-nav-key-wrapper">
          <div className="dt-nav-key" onClick={ () => window.location.href = "/?mailbox" }>
            <svg alt="Fairdrop Key"
               width="100px" height="68px" viewBox="0 0 100 68" enable-background="new 0 0 100 68">
            <path d="M57.818,37.086c1.383,4.604,5.516,7.698,10.283,7.698l0,0c5.943-0.009,10.775-4.851,10.77-10.791
              c-0.004-5.942-4.844-10.777-10.785-10.777c-4.773,0.005-8.897,3.104-10.272,7.714l-0.426,1.426l-34.609,0.041
              c-0.438,0-0.852,0.173-1.166,0.487c-0.312,0.314-0.485,0.728-0.484,1.165c0.001,0.911,0.741,1.652,1.651,1.652l2.002-0.002
              l0.007,7.303l3.304-0.003l-0.007-7.3l7.658-0.018l0.002,7.312l3.309-0.004l-0.007-7.309l18.342-0.022L57.818,37.086z M68.078,26.52
              h0.006c4.123,0,7.48,3.354,7.484,7.477c0.002,4.124-3.348,7.48-7.471,7.484c-4.121-0.002-7.479-3.355-7.49-7.473
              C60.604,29.882,63.955,26.523,68.078,26.52"/>
            </svg>    
          </div>
        </div>

        { this.state.isMailbox
          ? <DTransferMailbox/>
          : <DTransferUp setIsSelecting={this.setIsSelecting}/>
        }

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