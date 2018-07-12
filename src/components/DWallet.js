import React, { Component } from 'react';

class DWallet extends Component {
  constructor(props) {
    super(props);
    
    this.state = {    
      walletIsSelected: false
    }
  }

  selectWallet(){

  }


  render() {
    return (
      <div>
        <button className="" onClick={this.selectWallet} /><label></label>
      </div>
    );
  }
}

export default DWallet;