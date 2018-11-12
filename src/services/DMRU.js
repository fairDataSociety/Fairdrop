import Web3 from 'web3';
const web3 = new Web3();

class DMRU {

  constructor(swarmNode){
    this.swarmNode = swarmNode;
  }

  get(topicName, owner){
    return this.getResource(topicName, owner).then((hash)=>{
      return this.sendRequest(`/bzz-raw:/${hash}/`, 'GET', 'text');
    });
  }

  set(privateKey, topicName, data){
    let topic = web3.utils.padRight(web3.utils.toHex(topicName), 64, '0');        
    return this.sendRequest('/bzz-raw:/', 'POST', 'text', web3.utils.toHex(data)).then((hash) => {
      return this.updateResource(privateKey, topic, web3.utils.toHex(hash));
    });
  }

  getResource(topicName, owner) {
    let topic = web3.utils.padRight(web3.utils.toHex(topicName), 64, '0');
    return this.sendRequest(`/bzz-feed:/?topic=${topic}&user=${owner}`,
    'GET');
  }

  getMeta (topicName, owner) {
    let topic = web3.utils.padRight(web3.utils.toHex(topicName), 64, '0');    
    return this.sendRequest(`/bzz-feed:/?topic=${topic}&user=${owner}&meta=1`,
    'GET', 'text', null);
  }

  handleUpdate(privateKey, topicName, dataString) {
    let topic = web3.utils.padRight(web3.utils.toHex(topicName), 64, '0');
    let data = web3.utils.toHex(dataString);
    return this.updateResource(privateKey, topic, data);
  }

  updateResource(privateKey, topic, state) {
    const data = web3.utils.padLeft(state, 2, '0');
    // console.log('Updating topic', topic, 'with', data);

    web3.eth.accounts.wallet.add(privateKey);
    const account = web3.eth.accounts.wallet[0].address;

    return this.sendRequest(`/bzz-feed:/?topic=${topic}&user=${account}&meta=1`, 'GET', 'text', null).then((response) => {
      const metaResponse = JSON.parse(response);

      const resourceUpdate = {
        topic,
        data,
        user: account,
        time: metaResponse.epoch.time,
        level: metaResponse.epoch.level,
      };

      // console.log('Resource update', resourceUpdate)
      const dataBytes = web3.utils.hexToBytes(data);
      const dataToSign = this.feedUpdateDigest(metaResponse, dataBytes);
      // console.log('Data to sign', dataToSign, 'by account', account);

      const secp256k1 = require('secp256k1');
      const sigObj = secp256k1.sign(Buffer.from(web3.utils.hexToBytes(dataToSign)), Buffer.from(web3.utils.hexToBytes(privateKey)));
      // console.log(sigObj.signature.toString('hex'), sigObj.recovery)
      const signature = `0x${sigObj.signature.toString('hex')}0${sigObj.recovery.toString()}`;
      // console.log('Signature', signature);

      return this.sendRequest(`/bzz-feed:/?topic=${resourceUpdate.topic}&user=${resourceUpdate.user}&level=${resourceUpdate.level}&time=${resourceUpdate.time}&signature=${signature}`,
        'POST', 'text', data);
      })
  }

  feedUpdateDigest(request, data) {
    let topicBytes;
    let userBytes;
    let protocolVersion = 0;

    let topicLength = 32;
    let userLength = 20;
    let timeLength = 7;
    let levelLength = 1;
    let headerLength = 8;

    let updateMinLength = topicLength + userLength + timeLength + levelLength + headerLength;

    protocolVersion = request.protocolVersion;

    try {
      topicBytes = web3.utils.hexToBytes(request.feed.topic);
    } catch (err) {
      console.error(`topicBytes: ${err}`);
      return undefined;
    }

    try {
      userBytes = web3.utils.hexToBytes(request.feed.user);
    } catch (err) {
      console.error(`topicBytes: ${err}`);
      return undefined;
    }

    const buf = new ArrayBuffer(updateMinLength + data.length);
    const view = new DataView(buf);
    let cursor = 0;

    view.setUint8(cursor, protocolVersion); // first byte is protocol version.
    cursor += headerLength; // leave the next 7 bytes (padding) set to zero

    topicBytes.forEach((v) => {
      view.setUint8(cursor, v);
      cursor++;
    });

    userBytes.forEach((v) => {
      view.setUint8(cursor, v);
      cursor++;
    });

    // time is little-endian
    view.setUint32(cursor, request.epoch.time, true);
    cursor += 7;

    view.setUint8(cursor, request.epoch.level);
    cursor++;

    data.forEach((v) => {
      view.setUint8(cursor, v);
      cursor++;
    });

    return web3.utils.sha3(web3.utils.bytesToHex(new Uint8Array(buf)));
  }

  dataToBuffer(data) {
    const dataBytes = web3.utils.hexToBytes(data);
    var buf = new ArrayBuffer(dataBytes.length);
    var dataView = new DataView(buf);
    for (var i = 0; i < dataBytes.length; i++) {
      dataView.setUint8(i, dataBytes[i]);
    }
    return buf;
  }

  sendRequest(url, requestType, responseType, data) {

    return new Promise((resolve, reject) => {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
          if (this.readyState === 4) {
            if (this.status === 200) {
            if (responseType === 'arraybuffer') {
              resolve(new Uint8Array(xhttp.response)[0]);
            } else {
              resolve(xhttp.responseText);
            }
          } else {
            reject(this.status);
          }
        }
      };

      xhttp.open(requestType, `${this.swarmNode}${url}`, true);
      xhttp.setRequestHeader('Accept', 'application/octet-stream');
      xhttp.setRequestHeader('Access-Control-Allow-Method', requestType);
      xhttp.responseType = responseType;

      if (data) {
        const newDataBytes = this.dataToBuffer(data);
        var dataArray = new Uint8Array(newDataBytes);

        xhttp.send(dataArray);
      } else {
        xhttp.send();
      }
    });
  }

}

export default DMRU;