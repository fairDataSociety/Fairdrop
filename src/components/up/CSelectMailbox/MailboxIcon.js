import React, { Component } from 'react';
import DTransfer from '../../../services/Dtransfer';
import Dropzone from 'dropzone';

class ASelectFile extends Component{
  
  constructor(props) {
    super(props);
    this.DT = new DTransfer(process.env.REACT_APP_SWARM_GATEWAY);
  }

  render(){
    return (
      <div className="dt-mailbox-add">
        <button onClick={this.props.mailboxAction}>
          <div className="dt-mailbox">
            <div className="dt-mailbox-name">
              {this.props.mailboxName}
            </div>
            <div className="dt-mailbox-description">
              {this.props.mailboxDescription}
            </div>
          </div>
        </button>
      </div>
    )
  }
}

export default ASelectFile;