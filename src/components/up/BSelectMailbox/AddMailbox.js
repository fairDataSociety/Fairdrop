import React, { Component } from 'react';
import DMailbox from '../../../services/DMailbox';
window.DMailbox = DMailbox;

class ASelectFile extends Component{
  
  constructor(props) {
    super(props);

    this.state = {
      feedbackMessage: "",
      mailboxName: false,
      password: false,
    }

    this.handleSelectMailboxName = this.handleSelectMailboxName.bind(this);
    this.handleSelectPassword = this.handleSelectPassword.bind(this);
    this.handleSelectPasswordVerification = this.handleSelectPasswordVerification.bind(this);
    this.addMailbox = this.addMailbox.bind(this);    
  }

  processMailboxName(){
    let mailboxName = this.refs.dtSelectMailboxName.value;
    if(DMailbox.isMailboxNameValid(mailboxName)){
      DMailbox.isMailboxNameAvailable(mailboxName).then((result) => {
        if(result === true){
          this.setState({
            mailboxName: mailboxName,
            feedbackMessage: "Name available!"        
          });
          return true;
        }else{
          this.setState({
            mailboxName: false,
            feedbackMessage: "Sorry, that name is not available!"        
          }); 
          return false;       
        }
      });
    }else{
      this.setState({
        mailboxName: false,
        feedbackMessage: "Sorry, that name is invalid."
      });
      return false;    
    }
  }

  handleSelectMailboxName(e){
    //check to see if mailbox name is unused/valid
    this.processMailboxName();
    e.preventDefault();
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
    this.processMailboxPassword();
    e.preventDefault();
  }

  handleSelectPasswordVerification(e){
    this.processMailboxPassword();
    e.preventDefault();
  }

  // copyPassword(e){
  //   if(this.refs.dtSymEncPasswordInput.value === this.refs.dtSymEncPasswordInputConfirm.value){
  //     if(navigator.clipboard){
  //       navigator.clipboard.writeText(this.refs.dtSymEncPasswordInput.value);
  //       this.setState({passwordMessage: 'Password copied to clipboard.'}); 
  //     }
  //   }else{
  //     this.setState({passwordMessage: 'Passwords must match.'});
  //   }
  // }

  // generatePassword(e){
  //   this.DT.generatePassword().then((password)=>{
  //     this.refs.dtSymEncPasswordInput.value = password;
  //     this.refs.dtSymEncPasswordInputConfirm.value = password;
  //     this.handleChangePassword(password);
  //   })
  // }


  addMailbox(e){
    window.DMailbox = DMailbox;
    if(this.state.mailboxName === false){
      this.processMailboxName();
    }
    if(this.state.password === false){
      this.processMailboxPassword();
    }else{
      //add the mailbox and select it
      this.setState({feedbackMessage: 'generating mailbox, maths takes a while...'});
      DMailbox.create(this.state.mailboxName, this.state.password).then((newMailBox)=>{
        this.setState({feedbackMessage: 'mailbox generated...'});        
        this.props.setSelectedMailbox(newMailBox);
      });
    }
  }

  render(){
    return (
      <div className="dt-mailbox-add-ui">
        <div className="dt-form-group">
          <input 
            id="dt-mailbox-add-name" 
            className="dt-mailbox-add-name" 
            type="text" 
            placeholder="mailbox name" 
            onChange={this.handleSelectMailboxName}
            name="selectMailboxName"             
            ref="dtSelectMailboxName"
            value="bobby"
          />
          <input 
            id="dt-mailbox-add-password" 
            autoComplete="off" 
            className="dt-mailbox-add-password" 
            type="password" 
            placeholder="password" 
            onChange={this.handleSelectPassword}
            name="dtSelectPassword"
            ref="dtSelectPassword"
            value="test"
          />
          <input 
            id="dt-mailbox-add-password-verification" 
            autoComplete="off" 
            className="dt-mailbox-add-password-verification" 
            type="password" 
            placeholder="password verification" 
            onChange={this.handleSelectPasswordVerification}
            name="dtSelectPasswordVerification"            
            ref="dtSelectPasswordVerification"  
            value="test"          
          />
        </div>
        <button className="dt-btn dt-btn-lg dt-select-encryption-no-button dt-btn-green" onClick={this.addMailbox}>Add Mailbox</button>
        <p>{this.state.feedbackMessage}</p>
      </div>
    )
  }
}

export default ASelectFile;