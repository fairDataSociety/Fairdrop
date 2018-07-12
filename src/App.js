import React, { Component } from 'react';
import DWallet from "./components/DWallet";
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      fileShouldEncrypt: false
    };
  }

  toggleFileShouldEncrypt() {
    this.setState({fileShouldEncrypt: !this.state.fileShouldEncrypt});
  }

  render() {
    return (
      <div className="dt-wrapper">
        <div className="dt-toggle-is-encrypted">
          <div className="dt-formgroup">
            <button className="dt-toggle-button" onClick={this.toggleFileShouldEncrypt} /><label>Encrypt the file using your Ethereum wallet.</label>
          </div>
          {this.fileShouldEncrypt &&
            <DWallet/>
          }
        </div>
      </div>
    );
  }
}

export default App;