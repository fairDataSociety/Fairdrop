
toggle DWallet in App.js  ...

  this.state = {
    fileShouldEncryptAsym: false,
    selectedWallet: false
  };

  ...

  toggleFileShouldEncryptAsym(e) {
    e.preventDefault();    
    this.setState({fileShouldEncryptAsym: !this.state.fileShouldEncryptAsym});
  }

  setDecryptedWallet(wallet){
    this.setState({selectedWallet: wallet});
  }

  ...

<div className="dt-toggle-is-encrypted">
  <div className="dt-formgroup">
    <button id="dt-toggle-is-encrypted-button" className="dt-toggle-button" onClick={this.toggleFileShouldEncryptAsym} /><label>Encrypt the file using your Ethereum wallet.</label>
  </div>
  { this.state.fileShouldEncryptAsym &&
    <DWallet setDecryptedWallet={this.setDecryptedWallet} />
  }
</div>

