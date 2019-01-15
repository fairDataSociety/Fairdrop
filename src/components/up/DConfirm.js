import React, { Component } from 'react';
import Utils from '../../services/Utils';

class DConfirm extends Component{
  
  constructor(props) {
    super(props);

    this.state = {
      feedbackMessage: ""
    }

    this.handleEncryptAndSend = this.handleEncryptAndSend.bind(this);    
    this.handleCancel = this.handleCancel.bind(this);
  }

  handleCancel(){
    this.setState({feedbackMessage: ""});
    this.props.setParentState({
      uiState: 2,
    });
  }

  handleEncryptAndSend(e){
    e.preventDefault();
    this.props.setParentState({
      uiState: 4,
    });
    setTimeout(()=>{
      this.props.handleUpload().then(()=>{
        this.props.setParentState({
          uiState: 5
        });
      }).catch((error)=>{
        debugger
      })
    }, 2000);
  }

  render(){
    return (
      <div id="confirm" className={"confirm green page-wrapper " + (this.props.parentState.uiState === 3 ? "fade-in" : "hidden")}> 
        <div className="confirm-ui page-inner-centered">
          <div className="page-inner-wrapper">
            <h1 className="confirm-header">Confirm</h1>
            {this.props.isStoringFile === false && 
              <div>
                <div className="confirm-ui-group clearfix">
                  <table>
                    <tbody>
                      <tr>
                        <td>File:</td><td>{this.props.parentState.selectedFileName}</td><td>{ Utils.humanFileSize(this.props.parentState.selectedFileSize) }</td>
                      </tr>
                      <tr>
                        <td>Sender:</td><td>{this.props.selectedMailbox.subdomain}.datafund.eth</td><td></td>
                      </tr>
                      <tr>
                        <td>Recipient:</td><td>{this.props.parentState.addressee}.datafund.eth</td><td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="btn-group">
                  <form onSubmit={this.handleEncryptAndSend}>                
                    <button className="confirm-encrypt-and-send btn btn-lg btn-green btn-float-left" onClick={this.handleEncryptAndSend}>Encrypt and Store</button>
                    <button className="confirm-cancel btn btn-lg btn-link btn-float-right" onClick={this.handleCancel}>Cancel</button>
                  </form>
                </div>
              </div>
            }
            {this.props.isStoringFile === true && 
              <div>
                <div className="confirm-ui-group clearfix">
                  <table>
                    <tbody>
                      <tr>
                        <td>File:</td><td>{this.props.parentState.selectedFileName}</td><td>{ Utils.humanFileSize(this.props.parentState.selectedFileSize) }</td>
                      </tr>
                      <tr>
                        <td>Storing file.</td><td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="btn-group">
                  <form onSubmit={this.handleEncryptAndSend}>                
                    <button className="confirm-encrypt-and-send btn btn-lg btn-green btn-float-left" onClick={this.handleEncryptAndSend}>Encrypt and Store</button>
                    <button className="confirm-cancel btn btn-lg btn-link btn-float-right" onClick={this.handleCancel}>Cancel</button>
                  </form>
                </div>
              </div>
            }     
          </div>
        </div>
      </div>
    )
  }
}

export default DConfirm;