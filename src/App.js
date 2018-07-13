import React, { Component } from 'react';
import DWallet from "./components/DWallet";
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      fileShouldEncrypt: false
    };

    this.toggleFileShouldEncrypt = this.toggleFileShouldEncrypt.bind(this);
  }

  toggleFileShouldEncrypt(e) {
    e.preventDefault();    
    this.setState({fileShouldEncrypt: !this.state.fileShouldEncrypt});
  }

  render() {
    return (
      <div className="dt-wrapper">
        <div className="dt-toggle-is-encrypted">
          <div className="dt-formgroup">
            <button id="dt-toggle-is-encrypted-button" className="dt-toggle-button" onClick={this.toggleFileShouldEncrypt} /><label>Encrypt the file using your Ethereum wallet.</label>
          </div>
          {this.state.fileShouldEncrypt &&
            <DWallet/>
          }
        </div>
      </div>
    );
  }
}

export default App;