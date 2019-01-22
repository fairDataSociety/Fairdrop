import React, { Component } from 'react';

class App extends Component {

  render(props){ 
    return <div 
      className={"disclaimer " + (this.props.disclaimersAreShown === false ? 'hidden' : '')} 
      >
      <div className="disclaimer-wrapper">
        <div className="disclaimer-content">
          Fairdrop is in Beta and provided for evaluation only! File integrity, persistence and security are not assured! <a href="mailto:support@datafund.io">Report Bugs</a> <span className="click-to-dismiss" onClick={this.props.hideDisclaimer}>(Click to Dismiss)</span>
        </div>
      </div>
    </div>
  }
}

export default App;