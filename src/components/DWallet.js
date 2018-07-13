import React, { Component } from 'react';

class DWallet extends Component {
  constructor(props) {
    super(props);
    this.state = {    
      walletIsSelected: false,
      selectedWalletFileName: ""
    }

    this.handleSelectWallet = this.handleSelectWallet.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleUnlockWallet = this.handleUnlockWallet.bind(this);

  }

  handleSelectWallet(e){
    e.preventDefault();    
    this.refs.dtWalletFileInput.click();
  }

  handleFileChange(e){
    e.preventDefault();
    if(this.refs.dtWalletFileInput.files[0]){
      this.setState({
        walletIsSelected: true,
        selectedWalletFileName: this.refs.dtWalletFileInput.files[0].name
      });
    }
  }

  handleUnlockWallet(e){
    e.preventDefault();
    console.log(this.refs.dtPasswordInput.value);
  }  

  render() {
    return (
      <div>
      <form>
        <button id="dt-select-wallet-button" className="dt-toggle-button" onClick={this.handleSelectWallet} /><label>Select Your Wallet</label>
        <p>{this.selectedWalletFileName}</p>
        <input autoComplete="off" className="dt-hidden-file-input" type="file" onChange={this.handleFileChange} ref="dtWalletFileInput"/>
        <input autoComplete="off" className="dt-password-input" type="password" ref="dtPasswordInput" />
        <button className="dt-unlock-wallet-button" onClick={this.handleUnlockWallet} /><label>Unlock Your Wallet</label>
      </form>
      </div>
    );
  }
}

export default DWallet;