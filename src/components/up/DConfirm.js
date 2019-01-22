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
      uiState: 1,
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
            {this.props.parentState.isStoringFile === false && 
              <div>
                <div className="confirm-ui-group clearfix">
                  <div className="confirm-ui-item">
                    <div className="confirm-ui-type">File name</div>
                    <div className="confirm-ui-value">{this.props.parentState.selectedFileName}</div>
                  </div>
                  <div className="confirm-ui-item">
                    <div className="confirm-ui-type">Size</div>
                    <div className="confirm-ui-value">{Utils.humanFileSize(this.props.parentState.selectedFileSize)}</div>
                  </div>
                  <div className="confirm-ui-item">
                    <div className="confirm-ui-type">Sender</div>
                    <div className="confirm-ui-value">{this.props.selectedMailbox.subdomain}.datafund.eth</div>
                  </div>
                  <div className="confirm-ui-item confirm-ui-item-last">
                    <div className="confirm-ui-type">Recipient</div>
                    <div className="confirm-ui-value">{this.props.parentState.addressee}.datafund.eth</div>
                  </div>
                </div>
                <div className="btn-group">
                  <button className="confirm-encrypt-and-send btn btn-lg btn-green btn-float-left" onClick={this.handleEncryptAndSend}>Encrypt and Send</button>
                  <button className="confirm-cancel btn btn-sm btn btn-link btn-float-right" onClick={this.handleCancel}><img src="assets/images/x.svg"/>Cancel</button>
                </div>
              </div>
            }
            {this.props.parentState.isStoringFile === true && 
              <div>
                <div className="confirm-ui-group clearfix">
                  <div className="confirm-ui-item">
                    <div className="confirm-ui-type">File name</div>
                    <div className="confirm-ui-value">{this.props.parentState.selectedFileName}</div>
                  </div>
                  <div className="confirm-ui-item confirm-ui-item-last">
                    <div className="confirm-ui-type">Size</div>
                    <div className="confirm-ui-value">{Utils.humanFileSize(this.props.parentState.selectedFileSize)}</div>
                  </div>
                </div>
                <div className="btn-group">
                  <button className="confirm-encrypt-and-send btn btn-lg btn-green btn-float-left" onClick={this.handleEncryptAndSend}>Encrypt and Store</button>
                  <button className="confirm-cancel btn btn-sm btn btn-link btn-float-right" onClick={this.handleCancel}><img src="assets/images/x.svg"/>Cancel</button>
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