import React, { Component } from 'react';

class UnlockMailbox extends Component{
  
  constructor(props) {
    super(props);

    this.FDS = this.props.FDS;

    this.state = {
      feedbackMessage: "",
      mailboxIsUnlocked: false,
    }

    this.handleUnlockMailboxWallet = this.handleUnlockMailboxWallet.bind(this);
  }

  handleUnlockMailboxWallet(e){
    e.preventDefault();
    let password = this.refs.dtSelectPassword.value;
    let subdomain = this.props.subdomain;
    this.unlockMailboxWallet(subdomain, password);
  }


  unlockMailboxWallet(subdomain, password){
    this.FDS.UnlockAccount(subdomain, password).then((account)=>{
      this.setState({
        feedbackMessage: 'Mailbox unlocked.',
        mailboxIsUnlocked: true,
      });
      this.props.mailboxUnlocked();
      this.props.setSelectedMailbox(this.FDS.currentAccount);
    }).catch((error)=>{
      this.setState({
        feedbackMessage: 'Password invalid, please try again.',
        mailboxIsUnlocked: false
      });
    });
  }


  render(){
    return (
      <div className="mailbox-unlock-ui">
        <div className="form-group form-group-last clearfix">
          <form onSubmit={this.handleUnlockMailboxWallet}>
            <input 
              id="mailbox-unlock-password" 
              autoComplete="off" 
              className="mailbox-unlock-password" 
              type="password" 
              placeholder="password" 
              ref="dtSelectPassword"
            />
          </form>
          <div className="feedback-unlock-ui feedback-float-right">{this.state.feedbackMessage}</div>
        </div>
        <button className="btn btn-lg btn-float-left btn-green" onClick={this.handleUnlockMailboxWallet.bind(this)}>Continue</button>
      </div>
    )
  }
}

export default UnlockMailbox;