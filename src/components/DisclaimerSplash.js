import React, { Component } from 'react';

class App extends Component {

  render(props){ 
    return <div 
      className={"disclaimer " + (this.props.disclaimersAreShown === false ? 'hidden' : '')} 
      onClick={this.props.hideDisclaimer}
      >
      <div className="disclaimer-wrapper">
        <div className="disclaimer-content">
          <h1>Welcome to Fairdrop!</h1>
          <p>Behold and welcome on our Fairdata.eth beta version of the website, provided to you on an “as is”  basis, which is still undergoing final testing before its official release. </p>
          <p>Beware, we do not give any warranties as to the suitability or usability of the website, data persistence or any of the content. We will not be liable for any loss suffered resulting from your use of the Fairdata.eth website. Real time distribution: you use it on your own risk.</p>
          <ul>
            <li>files are not guaranteed persist in the swarm network</li>
            <li>we will delete file references</li>
            <li>at present metadata is unencrypted</li>
            <li>messaging db is very primitive and subject to change</li>
            <li>encryption is primitive - no forward secrecy or salting of diffie hellman at present</li>
            <li>subdomains will expire</li>
            <li>running on ropsten - expect mailbox creation to be slooooooowwwwww...</li>
            <li>don't store or send anything you can't afford to lose!</li>
          </ul>
          <h3>I understand - let me in!</h3>
        </div>
      </div>
    </div>
  }
}

export default App;