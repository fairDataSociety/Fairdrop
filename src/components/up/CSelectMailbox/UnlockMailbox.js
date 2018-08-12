import React, { Component } from 'react';
import DMailbox from '../../../services/DMailbox';
import Utils from '../../../services/DTransferUtils';
import DWallet from '../../../services/DWallet';


class UnlockMailbox extends Component{
  
  constructor(props) {
    super(props);

    this.state = {
      feedbackMessage: "",
      mailboxIsUnlocked: false,
    }

    this.handleUnlockMailbox = this.handleUnlockMailbox.bind(this);

  }

  handleUnlockMailbox(){
    let password = this.refs.dtSelectPassword.value;
    let mailbox = this.props.mailbox;

    let wallet = new DWallet(mailbox.wallet);
    if(wallet.unlock(password)){
      this.props.setSelectedMailbox(mailbox, wallet);
      this.setState({
        feedbackMessage: 'Mailbox unlocked.',
        mailboxIsUnlocked: true
      });   
    }else{
      this.props.setSelectedMailbox(false, false);
      this.setState({
        feedbackMessage: 'Password invalid, please try again.',
        mailboxIsUnlocked: true
      });
    }
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
        <button className="dt-btn dt-btn-lg dt-select-encryption-no-button dt-btn-green" onClick={this.handleUnlockMailbox}>Unlock Mailbox</button>
        <p>{this.state.feedbackMessage}</p>
      </div>
    )
  }
}

export default UnlockMailbox;