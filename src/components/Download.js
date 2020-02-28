import React, { Component } from 'react';
import Utils from '../services/Utils';
import {saveAs} from 'filesaver.js';


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
      loc = this.props.routerArgs.location.pathname.replace('download-list/','bzz-list:/')      
    }else{
      loc = this.props.routerArgs.location.pathname.replace('download/','bzz:/');
    }

    let secs = this.props.routerArgs.location.pathname.split('/');
    let fn = secs[secs.length-1].replace(/\?(.*)/,'');
    let fs = parseInt(this.props.routerArgs.location.search.match(/size=([^&]*)/)[1]);

    this.state = {
      swarmGateway: props.fds.swarmGateway,
      loc: loc,
      fileName: fn,
      fileSize: fs
    };

    this.handleDownload = this.handleDownload.bind(this);
    this.handleCopyGatewayLink = this.handleCopyGatewayLink.bind(this);

  }

  componentDidMount(){

  }

  handleDownload(url){
    url = 'https://docs.ipfs.io/assets/logo.svg'
    saveAs(url);
  }

  handleCopyGatewayLink(){

    if(iOSSafari){
      var el = document.querySelector(".mailbox-address-input");
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
      var copyText = document.querySelector(".mailbox-address-input");
      copyText.select();
      document.execCommand("copy");
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
                <span className="info-filename-truncated">{this.state.fileName}</span>
                <span className="info-filesize"> { Utils.humanFileSize(this.state.fileSize) }</span>
              </div>

              {/*
                <div className="info-is-encrypted">
                  <img className="fairdrop-lock" src="assets/images/fairdrop-lock.svg" alt="fairdrop-logo"/> Encrypted
                </div>
              */}

              <div>
                <div className="feedback-swarmhash-message">File Download Link</div>
                  <div className="feedback-gateway-link">
                    <input onChange={()=>{/*do nothing*/}} contentEditable={true} type="text" value={`${this.state.swarmGateway}${this.state.loc}`}/>
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