import React, { Component } from 'react';

class AboutFDS extends Component{
  
  constructor(props) {
    super(props);
  } 

  render(){
    return (
      <div>
        <div className="content-header">
          <img src={this.props.appRoot+"/assets/images/fairdrop-logo.svg"}/>
        </div>
        <h1>About FDS</h1>
      </div>
    )
  }
}

export default AboutFDS;