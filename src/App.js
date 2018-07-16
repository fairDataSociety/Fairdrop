import React, { Component } from 'react';
import DWallet from "./components/DWallet";
import DTransfer from "./services/Dtransfer";
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      fileIsSelecting: false,
    };

    this.handleSelectFileForUpload = this.handleSelectFileForUpload.bind(this);

  }

  handleSelectFileForUpload(e){
    e.preventDefault();    
    this.setState({fileIsSelecting: !this.state.fileIsSelecting});
  }

  render() {
    return (
      <div className="dt-wrapper">
        <div className="dt-nav-header"> {/* this bit should always overlay (or perhaps be hidden unless mouseover?) */}
          <div className="dt-logo">
          </div>
        </div>
        <div className="dt-select-file" onClick={this.handleSelectFileForUpload}> 
          <div className={"dt-select-file-header " + (this.state.fileIsSelecting && "is-selected")}> {/* this bit should slide up out of view using transform */}
            <h1>Send and store files securely and privately<br/>that's how we do on the decentralised web 3.0</h1>
          </div> {/* dt-header */}
          <div className={"dt-select-file-main " + (this.state.fileIsSelecting && "is-selected")} > {/* this bit should expand to fill the viewport */}

          </div> {/* dt-select-file-main */}
          <div className={"dt-select-file-instruction " + (this.state.fileIsSelecting && "is-selected")}> {/* this bit should be centered vertically in the surrounding div which overlays the other two siblings */}
            <h2>choose or drag and drop a file</h2>
          </div> {/* dt-select-file-instruction */}
        </div> {/* dt-select-file */}
        <div className="dt-info"> {/* this bit could slide in from left over the top of dt-select-file */}
          <div className="dt-info-content">
            <img/>
            <div className="dt-info-filename">filename</div>
            <div className="dt-info-filesize">100kb</div>
            <div className="dt-info-is-encrytped">unencrypted</div>
            <div className="dt-network-status">...</div>
          </div>
        </div> {/* dt-info */}
        <div className="dt-ui"> {/* this bit could slide in from right over the top of dt-select-file */}

        </div> {/* dt-ui */}
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