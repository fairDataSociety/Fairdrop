import React, { Component } from 'react';
import Dropzone from 'dropzone';

import FDS from 'fds.js';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      recipient: this.props.routerArgs.match.params.dropbox,
      isSending: false,
      hasSent: false,
      feedback: '',
      uploaded: 0,
      found: false
    };

    this.setStateLater = this.setStateLater.bind(this);

  }

  setFeedback(feedback){
    this.setState({
      feedback: feedback
    });
  }

  setUploaded(uploaded){
    this.setState({
      uploaded: uploaded
    });
  }

  setStateLater(state){
     setTimeout(()=>{
        this.setState(state);
     }, 500);
  }

  // async setAccount(event){
  //   event.preventDefault();
  //   let account = event.target.value;
  //   let fds = new FDS();
  //   this.setState({
  //     found: false,
  //     finding: true,
  //     feedback: 'finding account...',
  //   });  
  //   let availiable = await fds.Account.isMailboxNameAvailable(account);
  //   if(availiable === false){
  //     this.setStateLater({
  //       found: true,
  //       finding: false,
  //       feedback: 'account found!',
  //       swarmholeAddress: "https://swarmhole.com/?recipient="+account
  //     })      
  //   }else{
  //     this.setStateLater({
  //       found: false,
  //       finding: false,
  //       feedback: 'couldn\'t find that account',
  //       swarmholeAddress: "https://swarmhole.com/?recipient="+account
  //     })        
  //   }
  // }

  componentDidMount(){

    let fds = new FDS();
    this.dropzone = new Dropzone(this.refs.dz, {
      url: 'dummy://', //dropzone requires a url even if we're not using it
      previewsContainer: false,
      clickable: true,
      maxFilesize: 1000,
      accept: async (file, done) => {

       if(this.isSending){
         return false;
       }

       let availiable = await fds.Account.isMailboxNameAvailable(this.state.recipient);

       if(availiable === true){
         this.setState({
           found: false,
           feedback: 'Error: Account not found',
         });
         return false;
       }

        this.setState({
          isSending: true,
          status: 'Creating Account'
        });

        //create account

        let random = Math.floor(Math.random() * 101010101);
        let account = await fds.CreateAccount(
          `${random}-swarmhole-throwaway`,
          '',
          this.setFeedback.bind(this)
        );

        //send file to server

        await account.send(
          this.state.recipient, 
          file,
          '/shared/fairdrop/encrypted',
          this.setFeedback.bind(this), 
          this.setUploaded.bind(this),
          this.setFeedback.bind(this)
        );

        this.setState({
          isSending: false,
          hasSent: true,
          feedback: 'File sent!'
        });
      }
    });
  }


  render() {
    return (
      <div ref="dz" className="dropbox">
        <div className="dropbox-center">
          <h3 className="hide-mobile">
            <img alt="click to select a file" src="assets/images/fairdrop-select.svg"/> <span className="select-file-action" onClick={this.handleClickSelectFile}>select</span> or <img alt="drop file glyph" src="assets/images/fairdrop-drop.svg"/> drop a file
          </h3>
          <h3 className="show-mobile">
          	<img alt="click to select a file" src="assets/images/fairdrop-select.svg"/> <span className="select-file-action" onClick={this.handleClickSelectFile}>tap</span> 
          </h3>   
          <h2 className="instruction">
            to send a file <br/> anonymously to:
          </h2>
           <h2 className="last">
            {this.state.recipient}
          </h2>
          <div className="dropbox-feedback">
          	{this.state.feedback}
          </div>         
        </div>
      </div>
    );
  }
}

export default App;