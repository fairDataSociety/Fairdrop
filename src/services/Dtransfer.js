import Crypto from 'crypto';
import ConsenSysLightWallet from 'eth-lightwallet';
import Buffer from 'buffer';
import toBuffer from 'blob-to-buffer';
import b64toBlob from 'b64-to-blob';

class DTransfer {

  constructor(gateway){
    if(gateway === undefined){
      throw new Error("You must provide a Swarm gateway service eg. http://localhost:8500/bzz:/");
    }

    this.gateway = gateway;
  }

  encryptBuffer(buffer, password){
    var cipher = Crypto.createCipher('aes-256-ctr', password);
    var crypted = cipher.update(buffer, null, 'hex');
    crypted += cipher.final('hex');
    return crypted;
  }

  blobToBuffer(blob) {
    return new Promise((resolve, reject)=>{
      toBuffer(blob, function (err, buffer) {
        if (err) {
          reject(err);
        }else{
          resolve(buffer);
        }
      })
    })    
  }

  encryptBlob(blob, password) {
    return this.blobToBuffer(blob).then((buffer)=>{
      var crypted = this.encryptBuffer(buffer, password);
      var f = new File([crypted], blob.name + ".encrypted", {type: blob.type});
      return f;
    });
  }

  decryptBuffer(buffer, password){
    var decipher = Crypto.createDecipher('aes-256-ctr', password);
    var dec = decipher.update(buffer,'hex','base64');
    dec += decipher.final('base64');
    return b64toBlob(dec);
  }

  decryptedFile(encryptedFile, password, decryptedFileName) {
    let decryptedFile = this.decryptBuffer(encryptedFile, password);
    let blob = new Blob([decryptedFile], { name: decryptedFileName, type: "image/png" });
    blob.name = decryptedFileName;
    return blob;
  }  

  createPassword(){
    let newWallet = ConsenSysLightWallet;
    return newWallet
            .keystore
            .generateRandomSeed();
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
}

export default DTransfer;
