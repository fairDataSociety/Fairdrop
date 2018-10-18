import DEns from './DEns.js';
import DWallet from '../services/DWallet';
import Crypto from 'crypto'

import DMRU from './DMRU'

const SWARM_NODE='http://37.157.197.161:8500';

let MRU = new DMRU(SWARM_NODE);
let topicName = 'fairdrop-test-01';

// use this to init a new topic name for now

// setInterval(()=>{
//   MRU.getMeta(topicName, '0x1de9349041b78881e70c02f21e16c4a2a83292d1').then(console.log);
//   MRU.getResource(topicName, '0x1de9349041b78881e70c02f21e16c4a2a83292d1').then((response)=>{
//     console.log('retrieved:', response)
//   });
// }, 2000)

// MRU.handleUpdate('0x'+'211783EA426F0FBD5AB98EE2A0B1307D45F666A8F45524D39EF735DB94788CF4', topicName, '{"messages":[]}');


let provider = process.env.REACT_APP_GETH_GATEWAY;

let dEns = new DEns(provider, {
  registrarContractAddress: '0x21397c1a1f4acd9132fe36df011610564b87e24b',
  fifsRegistrarContractAddress: process.env.REACT_APP_FIFS_REGISTRAR_ADDRESS,
  resolverContractAddress: process.env.REACT_APP_RESOLVER_ADDRESS
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
    return this.getAllMessages().then((messages)=>{
      messages.push(message.toJSON());
      MRU.handleUpdate('0x211783EA426F0FBD5AB98EE2A0B1307D45F666A8F45524D39EF735DB94788CF4', topicName, JSON.stringify({messages: messages}));
      // localStorage.setItem('messages', JSON.stringify(messages));
    });
  }

  getAllMessages(){
    // let messagesJSON = localStorage.getItem('messages') !== null ? localStorage.getItem('messages') : '[]';
    return MRU.getResource(topicName, '0x1de9349041b78881e70c02f21e16c4a2a83292d1').then((response)=>{
      return JSON.parse(response).messages;
    });
  }

  getMessages(type, subdomain) {
    return this.getAllMessages().then((messages)=>{
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
    });      
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
      let address = "0x" + wallet.walletV3.address;
      return dEns.registerSubdomainToAddress(
        subdomain, 
        address, 
        wallet,
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
    if(
      mailboxName.length < 23 && 
      mailboxName.length > 3 && 
      matches !== null && 
      matches.length > 0
    ){
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
    }).catch((error)=>{
      debugger
    });
  }

}

export default new DMailbox();
