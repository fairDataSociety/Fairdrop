import React, { Component } from 'react';
import { withRouter, Link, Route } from 'react-router-dom'
import FDS from 'fds';

import DTransferUp from "./components/DTransferUp";
import DTransferMailbox from "./components/DTransferMailbox";

import './App.css';
import './lib/DMist.css';
import './lib/DDrop.css';

class App extends Component {

  // handle initial application state
  getInitialState() {
    let hasNotHiddenDisclaimers = localStorage.getItem('hasHiddenDisclaimers') !== "true";

    return {
      selectedMailbox: false,
      isStoringFile: false,      
      fileIsSelected: false,
      fileWasSelected: false,
      disclaimersAreShown: hasNotHiddenDisclaimers
    };
  }

  resetMailboxState(){
    this.setState({
      selectedMailbox: false,
      isStoringFile: false,      
      fileIsSelected: false,
      fileWasSelected: false,
      fileIsSelecting: false
    });
    this.props.history.push('/');
  }

  resetFileState(){
    this.setState({
      isStoringFile: false,      
      fileIsSelected: false,
      fileWasSelected: false,
      fileIsSelecting: false
    });
  }

  constructor(props) {
    super(props);

    this.FDS = new FDS({
      swarmGateway: process.env.REACT_APP_SWARM_GATEWAY, 
      ethGateway: process.env.REACT_APP_GETH_GATEWAY, 
      faucetAddress: process.env.REACT_APP_FAUCET_URL,
      httpTimeout: 1000,
      ensConfig: {
        domain: process.env.REACT_APP_DOMAIN_NAME,
        registryAddress: process.env.REACT_APP_ENS_ADDRESS,
        fifsRegistrarContractAddress: process.env.REACT_APP_FIFS_REGISTRAR_ADDRESS,
        resolverContractAddress: process.env.REACT_APP_RESOLVER_ADDRESS
      }
    });

    this.dTransferUp = React.createRef();

    this.setIsSelecting = this.setIsSelecting.bind(this);
    this.setSelectedMailbox = this.setSelectedMailbox.bind(this);
    this.fileWasSelected = this.fileWasSelected.bind(this);
    this.hideDisclaimer = this.hideDisclaimer.bind(this);
    this.handleSendFile = this.handleSendFile.bind(this);
    this.handleStoreFile = this.handleStoreFile.bind(this);
    this.resetFileState = this.resetFileState.bind(this);
    this.resetMailboxState = this.resetMailboxState.bind(this);

    this.state = this.getInitialState();
  }

  setIsSelecting(state = true){
    this.setState({fileIsSelecting: state});
  }

  setSelectedMailbox(selectedMailbox){
    this.setState({selectedMailbox: selectedMailbox});
  }

  fileWasSelected(state = true){
    this.setState({fileWasSelected: state});
  }  

  handleSendFile(e){
    this.setState({isSendingFile: true});
    this.props.history.push('/');
  }

  handleStoreFile(e){
    this.setState({isStoringFile: true});
    this.props.history.push('/');
  }

  hideDisclaimer(e){
    localStorage.setItem('hasHiddenDisclaimers', true);
    this.setState({disclaimersAreShown: false});
  }

  render() {
    return (
      <div className="dt-parent-wrapper">
        <div className={"dt-disclaimer " + (this.state.disclaimersAreShown === false ? 'dt-hidden' : '')} onClick={this.hideDisclaimer}>
          <div className="dt-disclaimer-wrapper">
            <div className="dt-disclaimer-content">
              <h1>Welcome to Fairdrop!</h1>
              <p>Behold and welcome on our Fairdata.eth beta version of the website, provided to you on an “as is”  basis, which is still undergoing final testing before its official release. </p>
              <p>Beware, we do not give any warranties as to the suitability or usability of the website, data persistence or any of the content. We will not be liable for any loss suffered resulting from your use of the Fairdata.eth website. Real time distribution: you use it on your own risk.</p>
              <ul>
                <li>files are not guaranteed persist in the swarm network</li>
                <li>we will delete file references</li>
                <li>at present metadata is unencrypted</li>
                <li>messaging db is very primitive and subject to change</li>
                <li>encryption is primitive - no forward secrecy or salting of diffie hellman at present</li>
                <li>subdomains will expire</li>
                <li>running on ropsten - expect mailbox creation to be slooooooowwwwww...</li>
                <li>don't store or send anything you can't afford to lose!</li>
              </ul>
              <h3>I understand - let me in!</h3>
            </div>
          </div>
        </div>
        <div className={ "dt-wrapper dt-green " + ((this.state.fileIsSelecting || this.props.location.pathname === '/mailbox') ? "dt-nav-white " : "dt-nav-black ")}>
          <div className="dt-nav-header">
            <div className="dt-nav-header-item-left">
              <Link to={"/"}>
                <svg version="1.1" className="fairdop-logo" alt="Fairdrop Logo"
                   width="238px" height="68px" viewBox="0 0 238 68" enableBackground="new 0 0 238 68">
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
              </Link>
            </div>
            {this.state.fileWasSelected === false && this.props.location.pathname === '/mailbox' &&
            <div className="dt-nav-header-item-left">
              <button className="dt-nav-header-item-button" onClick={this.handleStoreFile} >
                Store File
              </button>
            </div>
            }
            {this.state.fileWasSelected === false && this.props.location.pathname === '/mailbox' && 
            <div className="dt-nav-header-item-left">
              <button className="dt-nav-header-item-button" onClick={this.handleSendFile} >
                Send File
              </button>                
            </div>
            }


            <div className="dt-nav-header-item-right">
              <Link className="dt-nav-key" to={'mailbox'}>
                <svg alt="Fairdrop Inbox"
                  version="1.1" id="Layer_1" height="32px" viewBox="0 0 400 400">
                  <path d="M193.571,208.877c0.782,0.497,1.6,0.915,2.47,1.227c3.234,1.119,8.611,0.933,11.49-1.014
                    c1.058-0.72,1.964-1.76,2.87-2.666c2.257-2.239,4.515-4.487,6.78-6.731c7.57-7.526,15.142-15.053,22.713-22.575l27.404-27.236
                    c7.695-7.642,15.373-15.289,23.068-22.931c3.234-3.212,6.46-6.424,9.694-9.637c2.142-2.146,3.323-5.012,3.323-8.069
                    c0-3.048-1.182-5.927-3.332-8.082c-4.327-4.323-11.863-4.323-16.173,0l-72.314,72.959V32.773c0.213-6.06-4.39-11.001-10.255-11.21
                    h-1.146c-2.826-0.102-5.545,0.92-7.633,2.857c-2.07,1.938-3.279,4.567-3.376,7.407v142.297l-72.333-72.977
                    c-4.425-4.438-11.676-4.438-16.137,0.018c-4.46,4.447-4.46,11.711,0,16.159c3.582,3.568,7.18,7.126,10.761,10.69
                    c8.389,8.326,16.777,16.661,25.183,24.987c9.641,9.584,19.283,19.159,28.933,28.738c7.357,7.295,14.715,14.595,22.064,21.904
                    C189.43,205.429,191.323,207.464,193.571,208.877"/>
                  <path d="M369.373,223.254h-86.648c-5.545-0.053-10.112,4.07-10.672,9.544l-7.518,47.611h-128.35l-7.456-47.327
                    c-0.613-5.758-5.447-9.881-10.699-9.828H32.289c-3.021-0.106-5.74,0.907-7.819,2.844c-2.088,1.946-3.288,4.576-3.386,7.42
                    l0.009,135.397c-0.213,6.069,4.39,11.01,10.264,11.214h337.074c3.039,0.098,5.75-0.915,7.838-2.853
                    c2.07-1.938,3.279-4.576,3.368-7.42V234.46C379.85,228.399,375.246,223.459,369.373,223.254 M357.226,357.709H43.495V245.665h64.806
                    l6.851,47.949c0.906,5.35,5.598,9.286,11.179,9.188h147.988c5.643,0.089,10.353-3.839,11.277-9.331l6.824-47.807h64.806V357.709z"/>
                </svg>  
              </Link>                
            </div>
            {this.state.selectedMailbox.subdomain && 
              <div className="dt-nav-header-item-right">
                <button className="dt-nav-header-item-button dt-nav-header-sign-out" onClick={this.resetMailboxState}>
                  (Sign Out)
                </button>
              </div>
            }
            {this.state.selectedMailbox.subdomain && 
              <div className="dt-nav-header-item-right">
                <Link className="dt-nav-context" to={'mailbox'}>
                  {this.state.selectedMailbox.subdomain}
                </Link>
              </div>
            }
          </div>

  
          <Route exact={true} path="/" render={ () => {
              return <DTransferUp 
                FDS={this.FDS}
                setSelectedMailbox={this.setSelectedMailbox}
                selectedMailbox={this.state.selectedMailbox}
                fileWasSelected={this.fileWasSelected} 
                setIsSelecting={this.setIsSelecting} 
                ref={this.dTransferUp} 
                isSendingFile={this.state.isSendingFile}
                isStoringFile={this.state.isStoringFile}
                resetFileState={this.resetFileState}
              />
            }
          }/>

          <Route path="/mailbox" render={() => {
            return <DTransferMailbox 
              setSelectedMailbox={this.setSelectedMailbox}
              selectedMailbox={this.state.selectedMailbox}
              FDS={this.FDS}
            ></DTransferMailbox>
          }} />
  
        </div>
      </div>
    );
  }
}

export default withRouter(App);