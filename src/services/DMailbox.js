import DEns from './DEns.js';
import DWallet from '../services/DWallet';
import Crypto from 'crypto'

let provider = process.env.REACT_APP_GETH_GATEWAY;

let dEns = new DEns(provider, {
  registrarContractAddress: '0x21397c1a1f4acd9132fe36df011610564b87e24b',
  fifsRegistrarContractAddress: '0xd78e926ec77acfae2f2a8533bd7e65c6b33518bb',
  resolverContractAddress: '0xA4038A4BfeEf917Eb9876E0a7c13D577941499c4'
});

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
      case 'sent':
        return messages.filter(message => message.from === subdomain)      
      case 'saved':
        return messages.filter((message) => {
          return message.from === subdomain &&
          message.to === subdomain;
        })      
      default:
        throw new Error('type should be received, sent or saved')
    }
  }

  create(subdomain, password, feedbackMessageCallback){
    return this.isMailboxNameAvailable(subdomain).then((response)=>{
      if(response === true){
        return this.createSubdomain(subdomain, password, feedbackMessageCallback).then((wallet)=>{
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

  createSubdomain(subdomain, password, feedbackMessageCallback){
    console.time('create wallet')
    return new Promise((resolve, reject)=>{
      let dw = new DWallet(); 
      console.timeEnd('create wallet')
      resolve(dw.generate(password));
    }).then((wallet)=>{
      return dEns.registerSubdomainToAddress(
        subdomain, 
        "0x" + wallet.walletV3.address, 
        wallet.wallet.getPublicKeyString(),
        feedbackMessageCallback
      ).then(()=>{
        return wallet;
      });
    });
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
    if(mailboxName.length > 3 && matches !== null && matches.length > 0){
      return true;      
    }else{
      return false;
    }
  }

  isMailboxNameAvailable(mailboxName){
    return dEns.getSubdomainAvailiability(mailboxName);
  }

  getPubKey(recipient){
    return dEns.getPubKey(recipient);
  }

  getSharedSecret(senderWallet, recipient){
    return dEns.getPubKey(recipient).then((recipientPublicKey)=>{
      let sender = Crypto.createECDH('secp256k1');
      sender.setPrivateKey(senderWallet.privateKey.substring(2,66), 'hex');
      return sender.computeSecret(recipientPublicKey, 'hex').toString('hex');
    });
  }

}

export default new DMailbox();
