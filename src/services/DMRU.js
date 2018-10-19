import Web3 from 'web3';
const web3 = new Web3();

class DMRU {

  constructor(swarmNode){
    this.swarmNode = swarmNode;
    let topicLength = 32;
    let userLength = 20;
    let timeLength = 7;
    let levelLength = 1;
    this.updateMinLength = topicLength + userLength + timeLength + levelLength;
  }

  mruUpdateDigest(o) {
    var topicBytes = undefined;
    var dataBytes = undefined;
    var userBytes = undefined;

    if (!web3.utils.isHexStrict(o.data)) {
      console.error("data must be a valid 0x prefixed hex value");
      return undefined;
    }

    dataBytes = web3.utils.hexToBytes(o.data);

    try {
      topicBytes = web3.utils.hexToBytes(o.topic);
    } catch(err) {
      console.error("topicBytes: " + err);
      return undefined;
    }

    try {
      userBytes = web3.utils.hexToBytes(o.user);
    } catch(err) {
      console.error("userBytes: " + err);
      return undefined;
    }

    var buf = new ArrayBuffer(this.updateMinLength + dataBytes.length);
    var view = new DataView(buf);
    var cursor = 0;

    topicBytes.forEach(function(v) {
      view.setUint8(cursor, v);
      cursor++;
    });

    userBytes.forEach(function(v) {
      view.setUint8(cursor, v);
      cursor++;
    });

    // time is little endian
    var timeBuf = new ArrayBuffer(4);
    var timeView = new DataView(timeBuf);
    //view.setUint32(cursor, o.time);
    timeView.setUint32(0, o.time);
    var timeBufArray = new Uint8Array(timeBuf);
    for (var i = 0; i < 4; i++) {
      view.setUint8(cursor, timeBufArray[3-i]);
      cursor++;
    }

    for (i = 0; i < 3; i++) {
      view.setUint8(cursor, 0);
      cursor++;
    }

    //cursor += 4;
    view.setUint8(cursor, o.level);
    cursor++;

    dataBytes.forEach(function(v) {
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

  updateResource(privateKey, topic, state) {

    const data = web3.utils.padLeft(state, 2, '0');

    web3.eth.accounts.wallet.add(privateKey);
    const account = web3.eth.accounts.wallet[0].address;

    return this.sendRequest(`/bzz-resource:/?topic=${topic}&user=${account}&meta=1`,'GET', 'text', null)
      .then((metaResponse)=>{
        let meta = JSON.parse(metaResponse);

        const resourceUpdate = {
          "topic": topic,
          "data": data,
          "user": account,
          "time": meta.epoch.time,
          "level": meta.epoch.level
        };

        const dataToSign = this.mruUpdateDigest(resourceUpdate);

        const secp256k1 = require('secp256k1');
        const sigObj = secp256k1.sign(Buffer.from(web3.utils.hexToBytes(dataToSign)), Buffer.from(web3.utils.hexToBytes(privateKey)));
        const signature = '0x'+sigObj.signature.toString('hex')+"0"+sigObj.recovery.toString();

        return this.sendRequest(`/bzz-resource:/?topic=${resourceUpdate.topic}&user=${resourceUpdate.user}&level=${resourceUpdate.level}&time=${resourceUpdate.time}&signature=${signature}`,'POST', 'text', data);

      })
      .catch(console.log);

  }

  getResource (topicName, owner) {
    let topic = web3.utils.padRight(web3.utils.toHex(topicName), 64, '0');    
    return this.sendRequest(`/bzz-resource:/?topic=${topic}&user=${owner}`,
    'GET', 'text', null)
  }

  getMeta (topicName, owner) {
    let topic = web3.utils.padRight(web3.utils.toHex(topicName), 64, '0');    
    return this.sendRequest(`/bzz-resource:/?topic=${topic}&user=${owner}&meta=1`,
    'GET', 'text', null);
  }


  handleUpdate(privateKey, topicName, dataString) {
    console.log('test');
    let topic = web3.utils.padRight(web3.utils.toHex(topicName), 64, '0');
    let data = web3.utils.toHex(dataString);
    this.updateResource(privateKey, topic, data);
  }

}

export default DMRU;