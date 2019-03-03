import React, { Component } from 'react';

class Terms extends Component{
  
  constructor(props) {
    super(props);
  } 

  render(){
    return (
      <div>
        <div className="content-header">
          <img src={this.props.appRoot+"/assets/images/fairdrop-logo.svg"}/>
        </div>
        <h1>Terms</h1>
      </div>
    )
  }
}

export default Terms;