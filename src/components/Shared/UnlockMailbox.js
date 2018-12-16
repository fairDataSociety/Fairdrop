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
      <div className="dt-mailbox-unlock-ui">
        <div className="dt-form-group dt-form-group-last clearfix">
          <form onSubmit={this.handleUnlockMailboxWallet}>
            <input 
              id="dt-mailbox-unlock-password" 
              autoComplete="off" 
              className="dt-mailbox-unlock-password" 
              type="password" 
              placeholder="password" 
              ref="dtSelectPassword"
            />
          </form>
          <div className="dt-feedback-unlock-ui dt-feedback-float-right">{this.state.feedbackMessage}</div>
        </div>
        <button className="dt-btn dt-btn-lg dt-btn-float-left dt-btn-green" onClick={this.handleUnlockMailboxWallet}>Continue</button>
      </div>
    )
  }
}

export default UnlockMailbox;