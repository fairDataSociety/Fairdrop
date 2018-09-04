import DEns from './DEns.js';
import DMessage from './DMessage.js'

class Mailbox {
  constructor(attrs){
    // if(attrs.order === undefined) throw new Error('order must be defined');
    if(attrs.subdomain === undefined) throw new Error('subdomain must be defined');
    if(attrs.wallet === undefined) throw new Error('wallet must be defined');

    this.order = attrs.order;
    this.subdomain = attrs.subdomain;
    this.wallet = attrs.wallet;

    return this;
  }
}

class DMailbox {

  constructor(){
    this.mailboxes = this.getAll();
  }

  saveMessage(message){
    let messages = this.getAllMessages();
    messages.push(message.toJSON());
    localStorage.setItem('messages', JSON.stringify(messages));
  }

  getAllMessages(){
    let messagesJSON = localStorage.getItem('messages') !== null ? localStorage.getItem('messages') : '[]';
    return JSON.parse(messagesJSON);    
  }

  getMessages(type, subdomain) {
    let messages = this.getAllMessages();
    switch(type) {
      case 'received':
        return messages.filter(message => message.to === subdomain)
        break;
      case 'sent':
        return messages.filter(message => message.from === subdomain)      
        break;
      case 'saved':
        return messages.filter((message) => {
          message.from === subdomain &&
          message.to === subdomain
        })      
        break;
    }
  }

  create(subdomain, password){
      return this.isMailboxNameAvailable(subdomain).then((response)=>{
        if(response === true){
          return DEns.createSubdomain(password).then((wallet)=>{
            let mailbox = new Mailbox({
              // order: this.getAll().length + 1,
              subdomain: subdomain,
              wallet: wallet
            });
            this.mailboxes.push(mailbox);
            this.saveAll();
            return mailbox;
          });
        }else{
          return false;
        }
      })
  }

  get(subdomain){
    let results = this.getAll().filter(mailbox => mailbox.subdomain === subdomain);
    if(results.length === 1){
      return results[0];
    }else if(results.length === 0){
      return false;
    }else{
      throw new Error('there should only be one result per subdomain')
    }
  }

  getAll(){
    if(localStorage.getItem('mailboxes') === null){
      return [];
    }else{
      return JSON.parse(localStorage.getItem('mailboxes'));
    }
  }

  saveAll(){
    localStorage.setItem('mailboxes', JSON.stringify(this.mailboxes));
  }

  toJSON(){
    return {
      order: this.order,
      subdomain: this.subdomain,
      wallet: this.wallet
    }
  }

  isMailboxNameValid(mailboxName){
    // check to see if name conforms to eth subdomain restrictions
    if(mailboxName === undefined || mailboxName === false) return false;
    let pattern = /^[a-zA-Z0-9_-]*$/
    let matches = mailboxName.match(pattern)
    if(mailboxName.length > 7 && matches !== null && matches.length > 0){
      return true;      
    }else{
      return false;
    }
  }

  isMailboxNameAvailable(mailboxName){
    // check to see whether mailbox already exists
    // or handle error if network/endpoint failure
    return new Promise((resolve, reject)=>{

      if(this.get(mailboxName) === false){
        resolve(true);
      }else{
        resolve(false);
      }

    });
  }

}

export default new DMailbox();
