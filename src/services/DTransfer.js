import Crypto from 'crypto';
import toBuffer from 'blob-to-buffer';

class DTransfer {

  constructor(gateway){
    if(gateway === undefined){
      throw new Error("You must provide a Swarm gateway service eg. http://localhost:8500/");
    }

    this.gateway = gateway + "/bzz:/";
    this.rawGateway = gateway + "/bzz-raw:/";
  }

  encryptBuffer(buffer, password){
    // in a promise because later we'll put this in a web worker
    return new Promise((resolve, reject) => {
      if(!password) throw new Error('You must supply a password.');
      let cipher = Crypto.createCipher('aes-256-ctr', password);
      let crypted = cipher.update(new Uint8Array(buffer));
      let cryptedFinal = cipher.final();
      let c = new Uint8Array(crypted.length + cryptedFinal.length);
      c.set(crypted);
      c.set(cryptedFinal, crypted.length);
      resolve(c);
    });
  }

  decryptBuffer(buffer, password){
    var decipher = Crypto.createDecipher('aes-256-ctr', password);
    var dec = decipher.update(buffer);
    let decFinal = decipher.final();
    let d = new Uint8Array(dec.length + decFinal.length);
    d.set(dec);
    d.set(decFinal, dec.length);    
    return d;
  }

  decryptedFile(encryptedBuffer, password, decryptedFileName, mimeType) {
    let decryptedBuffer = this.decryptBuffer(encryptedBuffer, password);
    let blob = new Blob([decryptedBuffer], { name: decryptedFileName, type: mimeType });
    blob.name = decryptedFileName;
    return decryptedBuffer;
  }

  sendRequest(url, requestType, data) {

    return new Promise((resolve, reject) => {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (this.status === 200) {
            resolve(xhttp.responseText);
          } else {
            reject(this.status);
          }
        }
      };

      xhttp.open(requestType, url, true);
      xhttp.setRequestHeader('Content-Type', 'application/octet-stream');
      xhttp.send(data);
    });
  }

  postData(data){
    return this.sendRequest(this.gateway, 'POST', data);
  }

  getFile(url){
    return new Promise((resolve,reject)=>{
      var xhr = new XMLHttpRequest();

      xhr.open("GET", url, true);

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

      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.send();
    });
  }

  getData(url){
    return new Promise((resolve,reject)=>{
      var xhr = new XMLHttpRequest();

      xhr.open("GET", url, true);

      xhr.onload = ()=>{
        if (xhr.status === 200) {
          resolve(new Uint8Array(xhr.response));
        } else if(xhr.status === 404){
          reject('couldn\'t find hash.');
        } else {
          reject('unhandled error.');
        }
      };

      xhr.onerror = ()=>{
        reject('couldn\'t access gateway.');
      };

      xhr.responseType = 'arraybuffer';
      xhr.send();
    });
  }

  getDataFromManifest(swarmHash, filename){
    let url = this.rawGateway + swarmHash + "/";
    return this.getFile(url).then((manifest)=>{
      if(JSON.parse(manifest).entries.length === 1){
        // console.log(this.rawGateway + JSON.parse(manifest).entries[0].hash + "/");
        return this.getData(this.rawGateway + JSON.parse(manifest).entries[0].hash + "/");
      }else{
        throw new Error("couldn't find that file in the manifest.")
      }
    })
  }

}

export default DTransfer;
