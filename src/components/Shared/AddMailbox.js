import React, { Component } from 'react';

class ASelectFile extends Component{
  
  constructor(props) {
    super(props);

    this.FDS = props.FDS;

    this.state = {
      feedbackMessage: "",
      mailboxName: false,
      password: false,
      checkingAvailability: false
    }

    this.handleSelectMailboxName = this.handleSelectMailboxName.bind(this);
    this.handleSelectPassword = this.handleSelectPassword.bind(this);
    this.handleSelectPasswordVerification = this.handleSelectPasswordVerification.bind(this);
    this.addMailbox = this.addMailbox.bind(this);
  }

  handleSelectMailboxName(e){
    e.preventDefault();    
    //check to see if mailbox name is unused/valid
    if(this.state.checkingAvailability === false){
      this.processMailboxName().catch((error)=>{
        //already handled
      });
    }
  }  

  processMailboxName(){
    let mailboxName = this.refs.dtSelectMailboxName.value;
    this.setState({
      mailboxName: mailboxName,
      checkingAvailability: true,
      feedbackMessage: "Checking availability..."
    });

    return new Promise((resolve, reject)=>{
      // x
      // is mailbox name valid, available (need to expose this)
      if(mailboxName && this.FDS.Account.isMailboxNameValid(mailboxName)){
        return this.FDS.Account.isMailboxNameAvailable(mailboxName).then((result) => {
          if(result === true){
            this.setState({
              mailboxName: mailboxName,
              checkingAvailability: false,
              feedbackMessage: "Name available!"        
            });
            resolve(true);
          }else{
            this.setState({
              mailboxName: false,
              checkingAvailability: false,
              feedbackMessage: "Sorry, that name is not available!"        
            }); 
            resolve(false);
          }
        }).catch((error)=>{
          if(error.toString() === 'Error: Invalid JSON RPC response: ""'){
            this.setState({
              mailboxName: false,
              checkingAvailability: false,
              feedbackMessage: "Network error - try again!"
            });
            resolve(false);
          }   
        });
      }else{
        this.setState({
          mailboxName: false,
          checkingAvailability: false,
          feedbackMessage: "Sorry, that name is invalid."
        });
        resolve(false);
      }
    });
  }

  processMailboxPassword(){
    let password = this.refs.dtSelectPassword.value;
    let passwordVerification = this.refs.dtSelectPasswordVerification.value;    

    if(password === ""){
      this.setState({
        feedbackMessage: 'You must enter a password.',
        password: false
      });
      return false; 
    }

    if(password !== passwordVerification){
      this.setState({
        feedbackMessage: 'Passwords must match.',
        password: false
      });
      return false
    } 

    if(password === passwordVerification){
      this.setState({
        feedbackMessage: 'Passwords match!',
        password: password
      });
      return true
    }
  }

  handleSelectPassword(e){
    e.preventDefault();    
    this.processMailboxPassword();
  }

  handleSelectPasswordVerification(e){
    e.preventDefault();    
    this.processMailboxPassword();
  }

  addMailbox(e){
    e.preventDefault();

    this.FDS.CreateAccount(this.state.mailboxName, this.state.password, (message) => {
      this.setState({feedbackMessage: message});
    }).then((account)=>{

      this.FDS.UnlockAccount(this.state.mailboxName, this.state.password).then((account)=>{
        this.setState({
          feedbackMessage: 'Mailbox unlocked.',
          mailboxIsUnlocked: true,
        });
        this.props.mailboxUnlocked();
        this.props.setSelectedMailbox(this.FDS.currentAccount);
      })
    }).catch((error)=>{
      this.setState({feedbackMessage: error});
    });

  }

  render(){
    return (
      <div className="dt-mailbox-add-ui">
        <form onSubmit={this.addMailbox}>
          <div className="dt-form-group">      
            <input 
              className="dt-mailbox-add-name" 
              type="text" 
              autoComplete="new-name"    
              placeholder="mailbox name" 
              onChange={this.handleSelectMailboxName}
              ref="dtSelectMailboxName"
            />
          </div>
          <div className="dt-form-group"> 
            <input 
              className="dt-mailbox-add-password" 
              type="password" 
              placeholder="password"
              autoComplete="off"       
              onChange={this.handleSelectPassword}
              ref="dtSelectPassword"
            />
          </div>
          <div className="dt-form-group-last clearfix">
            <input 
              autoComplete="off"            
              className="dt-mailbox-add-password-verification" 
              type="password" 
              placeholder="password verification" 
              onChange={this.handleSelectPasswordVerification}
              ref="dtSelectPasswordVerification"  
            />
            <div className="dt-feedback-unlock-ui">{this.state.feedbackMessage}</div>
          </div>
          <div className="dt-actions">
              <button className="dt-btn dt-btn-lg dt-select-encryption-no-button dt-btn-green" onClick={this.addMailbox}>Add Mailbox</button>        
              {this.props.mailboxesExist &&
                <button className="dt-btn dt-btn-lg dt-select-encryption-no-button dt-btn dt-btn-lg dt-btn-link" onClick={this.props.cancelAddMailbox}>Cancel</button>              
              }
          </div>
        </form>
      </div>
    )
  }
}

export default ASelectFile;