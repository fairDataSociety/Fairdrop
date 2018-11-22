import DEns from './DEns.js';
import DWallet from './DWallet';
import Crypto from 'crypto'

import SwarmFeeds from 'swarm-feeds'

let SF = new SwarmFeeds(process.env.REACT_APP_SWARM_GATEWAY);
let topicName = 'fairdrop-test-3-0';

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

  // create
  create(subdomain, password, feedbackMessageCallback){
    return this.isMailboxNameAvailable(subdomain).then((response)=>{
      if(response === true){
        return this.createSubdomain(subdomain, password, feedbackMessageCallback).then((wallet)=>{
          let mailbox = new Mailbox({
            // order: this.getAll().length + 1,
            subdomain: subdomain,
            wallet: wallet.walletV3
          });
          this.mailboxes.push(mailbox);
          this.saveAll();
          return {mailbox: mailbox, wallet: wallet};
        });
      }else{
        return false;
      }
    })
  }

  // unlock
  // sendFileTo
  // getFilesReceived
  // getFileReceived  
  // storeFile  
  // getStoredFiles
  // getStoredFile
  // backup
  // restore

  storeFile(wallet, fileData){
    return this.getAllStoredFiles(wallet).then((storedFiles)=>{
      storedFiles.push(fileData.toJSON());
      return SF.set(wallet.address, wallet.privateKey, topicName, JSON.stringify({storedFiles: storedFiles}));
      // localStorage.setItem('messages', JSON.stringify(messages));
    });
  }

  getAllStoredFiles(wallet){
    return SF.get(topicName, wallet.address).then((response)=>{
      return JSON.parse(response).storedFiles;
    }).catch(()=>{
      return [];
    });
  }

  saveMessage(message){
    return this.getAllMessages().then((messages)=>{
      messages.push(message.toJSON());
      return SF.set('0x1de9349041b78881e70c02f21e16c4a2a83292d1', '0x211783EA426F0FBD5AB98EE2A0B1307D45F666A8F45524D39EF735DB94788CF4', topicName, JSON.stringify({messages: messages}));
      // localStorage.setItem('messages', JSON.stringify(messages));
    });
  }

  getAllMessages(){
    // let messagesJSON = localStorage.getItem('messages') !== null ? localStorage.getItem('messages') : '[]';
    return SF.get(topicName, '0x1de9349041b78881e70c02f21e16c4a2a83292d1').then((response)=>{
      return JSON.parse(response).messages;
    }).catch(()=>{
      return [];
    });;
    // return new Promise((resolve, reject) => { resolve(JSON.parse(messagesJSON))} );
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
