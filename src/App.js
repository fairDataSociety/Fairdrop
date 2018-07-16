import React, { Component } from 'react';
import DWallet from "./components/DWallet";
import DTransfer from "./services/Dtransfer";
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      fileShouldEncryptAsym: false,
      selectedWallet: false
    };

    this.toggleFileShouldEncryptAsym = this.toggleFileShouldEncryptAsym.bind(this);
    this.setDecryptedWallet = this.setDecryptedWallet.bind(this);

  }

  toggleFileShouldEncryptAsym(e) {
    e.preventDefault();    
    this.setState({fileShouldEncryptAsym: !this.state.fileShouldEncryptAsym});
  }

  setDecryptedWallet(wallet){
    this.setState({selectedWallet: wallet});
  }

  render() {
    return (
      <div className="dt-wrapper">
        <div className="dt-toggle-is-encrypted">
          <div className="dt-formgroup">
            <button id="dt-toggle-is-encrypted-button" className="dt-toggle-button" onClick={this.toggleFileShouldEncryptAsym} /><label>Encrypt the file using your Ethereum wallet.</label>
          </div>
          {this.state.fileShouldEncryptAsym &&
            <DWallet setDecryptedWallet={this.setDecryptedWallet} />
          }
        </div>
      </div>
    );
  }
}

export default App;