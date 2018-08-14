import React, { Component } from 'react';
import DWallet from '../../../services/DWallet';


class UnlockMailbox extends Component{
  
  constructor(props) {
    super(props);

    this.state = {
      feedbackMessage: "",
      mailboxIsUnlocked: false,
    }

    this.handleUnlockMailboxWallet = this.handleUnlockMailboxWallet.bind(this);

  }

  handleUnlockMailboxWallet(){
    let password = this.refs.dtSelectPassword.value;
    let mailbox = this.props.mailbox;

    this.unlockMailboxWallet(mailbox, password);
  }


  unlockMailboxWallet(mailbox, password){
    let dWallet = new DWallet();
    this.setState({
      feedbackMessage: 'Hard maths takes a long time...',
      mailboxIsUnlocked: false
    });
    let wallet = dWallet.fromJSON(mailbox.wallet.walletV3, password).then((wallet)=>{
        this.props.setSelectedMailbox(mailbox, wallet);
        this.setState({
          feedbackMessage: 'Mailbox unlocked.',
          mailboxIsUnlocked: true
        });
      }).catch((error)=>{
        this.props.setSelectedMailbox(false, false);
        this.setState({
          feedbackMessage: 'Password invalid, please try again.',
          mailboxIsUnlocked: false
        });
      });
  }


  render(){
    return (
      <div className="dt-mailbox-unlock-ui">
        <div className="dt-form-group">
          <input 
            id="dt-mailbox-unlock-password" 
            autoComplete="off" 
            className="dt-mailbox-unlock-password" 
            type="password" 
            placeholder="password" 
            name="dtSelectPassword"
            ref="dtSelectPassword"
          />
        </div>
        <button className="dt-btn dt-btn-lg dt-select-encryption-no-button dt-btn-green" onClick={this.handleUnlockMailboxWallet}>Unlock Mailbox</button>
        <p>{this.state.feedbackMessage}</p>
      </div>
    )
  }
}

export default UnlockMailbox;