import React, { Component } from 'react';
import Utils from '../services/Utils';
import {saveAs} from 'file-saver';


//deal with xbrowser copy paste issues
var ua = window.navigator.userAgent;
var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
var webkit = !!ua.match(/WebKit/i);
var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

class App extends Component {

  constructor(props) {
    super(props);

    let loc;
    if(this.props.isList === true){
      loc = this.props.routerArgs.location.pathname.replace('/download-list/','/bzz/')
    }else{
      loc = this.props.routerArgs.location.pathname.replace('/download/','/bzz/');
    }

    let secs = this.props.routerArgs.location.pathname.split('/');
    let fn = secs[secs.length-1].replace(/\?(.*)/,'');
    let fs = parseInt(this.props.routerArgs.location.search.match(/size=([^&]*)/)[1]);

    // Extract Swarm hash from URL (format: /download/{hash}/filename or /bzz/{hash}/...)
    let swarmHash = '';
    if (secs.length >= 3) {
      // Find the hash segment (typically after /download/ or /bzz/)
      const downloadIdx = secs.indexOf('download');
      const bzzIdx = secs.indexOf('bzz');
      const hashIdx = downloadIdx !== -1 ? downloadIdx + 1 : (bzzIdx !== -1 ? bzzIdx + 1 : 2);
      swarmHash = secs[hashIdx] || '';
    }

    this.state = {
      swarmGateway: props.fds.swarmGateway,
      loc: loc,
      fileName: fn,
      fileSize: fs,
      swarmHash: swarmHash,
      hashCopied: false
    };

    this.handleDownload = this.handleDownload.bind(this);
    this.handleCopyGatewayLink = this.handleCopyGatewayLink.bind(this);
    this.handleCopySwarmHash = this.handleCopySwarmHash.bind(this);

  }

  componentDidMount(){

  }

  handleDownload(url){
    url = 'https://docs.ipfs.io/assets/logo.svg'
    saveAs(url);
  }

  handleCopyGatewayLink(){

    if(iOSSafari){
      var el = document.querySelector(".feedback-gateway-link-input");
      var oldContentEditable = el.contentEditable,
          oldReadOnly = el.readOnly,
          range = document.createRange();

      el.contentEditable = true;
      el.readOnly = false;
      range.selectNodeContents(el);

      var s = window.getSelection();
      s.removeAllRanges();
      s.addRange(range);

      el.setSelectionRange(0, 999999); // A big number, to cover anything that could be inside the element.

      el.contentEditable = oldContentEditable;
      el.readOnly = oldReadOnly;

      document.execCommand('copy');
    }else{
      var copyText = document.querySelector(".feedback-gateway-link-input");
      copyText.select();
      document.execCommand("copy");
    }
  }

  handleCopySwarmHash(){
    const hash = this.state.swarmHash;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(hash).then(() => {
        this.setState({ hashCopied: true });
        setTimeout(() => this.setState({ hashCopied: false }), 2000);
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = hash;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.setState({ hashCopied: true });
      setTimeout(() => this.setState({ hashCopied: false }), 2000);
    }
  }  

  render() {
    return (
        <div id="completed" className={"confirm page-wrapper"}>
          <div className="info">
            <div className="info-content">
              <div className="file-was-sent">
                <img className="circle-tick" src={this.props.appRoot+"/assets/images/file-download-solid.svg"} alt="Circle Tick"/>
                Download.
              </div>
              <div className="info-filename">
                <span className="info-filename-truncated">{Utils.truncate(this.state.fileName,20, 20, 50)}</span>
                <span className="info-filesize"> { Utils.humanFileSize(this.state.fileSize) }</span>
              </div>

              {/*
                <div className="info-is-encrypted">
                  <img className="fairdrop-lock" src="assets/images/fairdrop-lock.svg" alt="fairdrop-logo"/> Encrypted
                </div>
              */}

              {this.state.swarmHash && (
                <div className="swarm-hash-display">
                  <div className="feedback-swarmhash-message">Swarm Hash</div>
                  <div className="swarm-hash-row">
                    <code className="swarm-hash-value">
                      {this.state.swarmHash.slice(0, 8)}...{this.state.swarmHash.slice(-8)}
                    </code>
                    <button
                      className="copy-hash-btn"
                      onClick={this.handleCopySwarmHash}
                      title="Copy full hash"
                    >
                      {this.state.hashCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <div className="feedback-swarmhash-message">File Download Link</div>
                  <div className="feedback-gateway-link">
                    <input className="feedback-gateway-link-input" onChange={()=>{/*do nothing*/}} contentEditable={true} type="text" value={window.location.href}/>
                  </div>
                <button className="copy-gateway-link" onClick={this.handleCopyGatewayLink}>Copy link.</button>
              </div>


              <div className="info-actions">
                <a className="download-file" href={`${this.state.swarmGateway}${this.state.loc}`} download target="=_blank" rel="noopener noreferrer">Download File</a>
              </div>

              <div className="info-actions">
                <a className="download-file send-another" href='/' target="=_blank" rel="noopener noreferrer">Send Another File</a>
              </div>
            </div>
          </div> {/* ui */}
      </div>
    );
  }
}

export default App;