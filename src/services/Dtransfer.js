import Crypto from 'crypto';
import EthereumJSWallet from 'ethereumjs-wallet';

class DTransfer {

  constructor(gateway){
    if(gateway === undefined){
      throw new Error("You must provide a Swarm gateway service eg. http://localhost:8500/bzz:/");
    }

    this.gateway = gateway;
  }

  encrypt(text, password){
    var cipher = Crypto.createCipher('aes-256-ctr', password);
    var crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
  }

  decrypt(text, password){
    var decipher = Crypto.createDecipher('aes-256-ctr', password);
    var dec = decipher.update(text,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
  }

  encryptFile(file, password) {
    return new Promise((resolve, reject)=>{
      var fr = new FileReader();
      fr.onload = (e)=>{
          var crypted = this.encrypt(fr.result, password);
          var f = new File([crypted], file.name + ".encrypted");
          resolve(f);
          }

      fr.readAsText(file); 
    })
  }  

  decryptedFile(encryptedFile, password, decryptedFileName) {
    let decryptedFile = this.decrypt(encryptedFile, password);
    return new File([decryptedFile], decryptedFileName, {type: "text/plain;charset=utf-8"});
  }  

  postFile(encryptedFile){
    return new Promise((resolve, reject)=>{
      var formData = new FormData();
      formData.append('file', encryptedFile);

      var xhr = new XMLHttpRequest();
      xhr.open("POST", this.gateway, true);
      
      xhr.onload = ()=>{
        if (xhr.status === 200) {
          resolve(xhr.responseText);
        } else {
          reject('error');
        }
      };

      xhr.onerror = (error)=>{
        reject('couldn\'t access gateway.');
      };

      xhr.send(formData);
    });
  }

  getFile(swarmHash, fileName){
    return new Promise((resolve,reject)=>{
      var xhr = new XMLHttpRequest();
      xhr.open("GET", this.gateway + swarmHash + "/" + fileName, true);

      xhr.onload = ()=>{
        if (xhr.status === 200) {
          resolve(xhr.responseText);
        } else if(xhr.status === 404){
          reject('couldn\'t find hash.');
        } else {
          reject('unhandled error.');
        }
      };

      xhr.onerror = ()=>{
        reject('couldn\'t access gateway.');
      };

      xhr.send();
    });
  }

  decryptWallet(walletJSON, password) {
    try {
      var r = EthereumJSWallet.fromV3(walletJSON, password, true);
      return {
        address: r.getAddress().toString('hex'),
        publicKey: r.getPublicKey().toString('hex'),
        privateKey: r.getPrivateKey().toString('hex')
      };    
    }
    catch(err) {
      return {
        error: err.message
      };
    }
  }
}

export default DTransfer;
