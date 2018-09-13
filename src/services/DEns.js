import Web3 from 'web3';
import ENS from 'ethereum-ens';
import namehash from 'eth-ens-namehash';

class DEns {

  constructor(provider, options = {}){
    this.web3 = new Web3(new Web3.providers.HttpProvider(provider));
    this.ens = new ENS(this.web3);

    this.gasPrice = this.web3.toWei(50, 'gwei');

    if(options.registrarContractAddress === undefined) throw new Error('registrarContractAddress must be provided');

    let registrarContractAbi = [{"constant": true,"inputs": [],"name": "ens","outputs": [{"name": "","type": "address"}],"payable": false,"type": "function"},{"constant": true,"inputs": [{"name": "","type": "bytes32"}],"name": "expiryTimes","outputs": [{"name": "","type": "uint256"}],"payable": false,"type": "function"},{"constant": false,"inputs": [{"name": "subnode","type": "bytes32"},{"name": "owner","type": "address"}],"name": "register","outputs": [],"payable": false,"type": "function"},{"constant": true,"inputs": [],"name": "rootNode","outputs": [{"name": "","type": "bytes32"}],"payable": false,"type": "function"},{"inputs": [{"name": "ensAddr","type": "address"},{"name": "node","type": "bytes32"}],"type": "constructor"}];
    this.registrarContract = this.web3.eth.contract(registrarContractAbi).at(options.registrarContractAddress);

    if(options.fifsRegistrarContractAddress === undefined) throw new Error('fifsRegistrarContractAddress must be provided');

    let fifsRegistrarContractAbi = [{"constant":false,"inputs":[{"name":"subnode","type":"bytes32"},{"name":"owner","type":"address"}],"name":"register","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"ensAddr","type":"address"},{"name":"node","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];
    this.fifsRegistrarContract = this.web3.eth.contract(fifsRegistrarContractAbi).at(options.fifsRegistrarContractAddress);

    if(options.resolverContractAddress === undefined) throw new Error('resolverContractAddress must be provided');

    var resolverContractAbi = [{"constant": true,"inputs": [{"name": "interfaceID","type": "bytes4"}],"name": "supportsInterface","outputs": [{"name": "","type": "bool"}],"payable": false,"type": "function"},{"constant": true,"inputs": [{"name": "node","type": "bytes32"},{"name": "contentTypes","type": "uint256"}],"name": "ABI","outputs": [{"name": "contentType","type": "uint256"},{"name": "data","type": "bytes"}],"payable": false,"type": "function"},{"constant": false,"inputs": [{"name": "node","type": "bytes32"},{"name": "x","type": "bytes32"},{"name": "y","type": "bytes32"}],"name": "setPubkey","outputs": [],"payable": false,"type": "function"},{"constant": true,"inputs": [{"name": "node","type": "bytes32"}],"name": "content","outputs": [{"name": "ret","type": "bytes32"}],"payable": false,"type": "function"},{"constant": true,"inputs": [{"name": "node","type": "bytes32"}],"name": "addr","outputs": [{"name": "ret","type": "address"}],"payable": false,"type": "function"},{"constant": false,"inputs": [{"name": "node","type": "bytes32"},{"name": "contentType","type": "uint256"},{"name": "data","type": "bytes"}],"name": "setABI","outputs": [],"payable": false,"type": "function"},{"constant": true,"inputs": [{"name": "node","type": "bytes32"}],"name": "name","outputs": [{"name": "ret","type": "string"}],"payable": false,"type": "function"},{"constant": false,"inputs": [{"name": "node","type": "bytes32"},{"name": "name","type": "string"}],"name": "setName","outputs": [],"payable": false,"type": "function"},{"constant": false,"inputs": [{"name": "node","type": "bytes32"},{"name": "hash","type": "bytes32"}],"name": "setContent","outputs": [],"payable": false,"type": "function"},{"constant": true,"inputs": [{"name": "node","type": "bytes32"}],"name": "pubkey","outputs": [{"name": "x","type": "bytes32"},{"name": "y","type": "bytes32"}],"payable": false,"type": "function"},{"constant": false,"inputs": [{"name": "node","type": "bytes32"},{"name": "addr","type": "address"}],"name": "setAddr","outputs": [],"payable": false,"type": "function"},{"inputs": [{"name": "ensAddr","type": "address"}],"payable": false,"type": "constructor"},{"anonymous": false,"inputs": [{"indexed": true,"name": "node","type": "bytes32"},{"indexed": false,"name": "a","type": "address"}],"name": "AddrChanged","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "node","type": "bytes32"},{"indexed": false,"name": "hash","type": "bytes32"}],"name": "ContentChanged","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "node","type": "bytes32"},{"indexed": false,"name": "name","type": "string"}],"name": "NameChanged","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "node","type": "bytes32"},{"indexed": true,"name": "contentType","type": "uint256"}],"name": "ABIChanged","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "node","type": "bytes32"},{"indexed": false,"name": "x","type": "bytes32"},{"indexed": false,"name": "y","type": "bytes32"}],"name": "PubkeyChanged","type": "event"}];
    this.resolverContract = this.web3.eth.contract(resolverContractAbi).at(options.resolverContractAddress);

    this.registerSubdomainToAddressState = 0;

  }

  watchTx(hash){
    return new Promise((resolve, reject) => {
      var interval = setInterval(()=>{
        console.log('checking... ' + hash)
        try {
          let response = this.web3.eth.getTransactionReceipt(hash);
          if(response !== null){
            clearInterval(interval);
            if(response.status === '0x0'){
              console.log(response)
              throw new Error('transaction ' + response.transactionHash + ' failed!');
            }
            resolve(response);
          }
        }catch(error) {
          reject(error);
        }
      },2000);
    });
  }

  getSubdomainAvailiability(subdomain){
    var expiryTime = new Date(this.registrarContract.expiryTimes(this.web3.sha3(subdomain)).toNumber() * 1000);
    var now = new Date();
    if (expiryTime < now) {
        // console.log(subdomain+".gregor.test domain is available");
        return true;
    } else {
        // console.log(subdomain+".gregor.test domain is not available");
        return false;
    }
  }

  registerSubdomain(subdomain){
    console.log(this.web3.eth.accounts[0], this.web3.eth.getBalance(this.web3.eth.accounts[0]));
    return new Promise((resolve, reject)=>{
      this.fifsRegistrarContract.register(
        this.web3.sha3(subdomain), 
        this.web3.eth.accounts[0], 
        {
          from: this.web3.eth.accounts[0],
          gasPrice: this.gasPrice
        },
        (err, tx)=>{
          console.log('registering subdomain, watching...');          
          if(err){
            reject(err);
          }else{
            this.watchTx(tx).then((txReceipt)=>{
              resolve(txReceipt);
            }).catch((error)=>{
              reject(error);
            });            
          }
        }
      );
    });
  }

  setResolver(subdomain){
    console.log(subdomain, this.resolverContract.address)
    return this.ens.setResolver(
      subdomain+'.gregor.test', 
      this.resolverContract.address,
      {
        from: this.web3.eth.accounts[0],
        gasPrice: this.gasPrice
      }
    ).then((tx) => {
        console.log('setting resolver, watching...');
        return this.watchTx(tx);
    });
  }

  setAddr(subdomain, address){
    return new Promise((resolve, reject)=>{
      this.resolverContract.setAddr(
        namehash.hash(subdomain+'.gregor.test'), 
        address,
        {
          from: this.web3.eth.accounts[0],
          gasPrice: this.gasPrice
        },
        (err, tx)=>{
          console.log('setting addr, watching...');          
          if(err){
            reject(err);
          }else{
            this.watchTx(tx).then((txReceipt)=>{
              resolve(txReceipt);
            }).catch((error)=>{
              reject(error);
            });            
          }          
        }
      );
    })
  }

  setPubKey(subdomain, publicKey){
    console.log(publicKey)
    let publicKeyX = publicKey.substring(0,66);
    let publicKeyY = "0x"+publicKey.substring(66,130);
    return new Promise((resolve, reject)=>{
      this.resolverContract.setPubkey(
        namehash.hash(subdomain+'.gregor.test'), 
        publicKeyX,
        publicKeyY,
        {
          from: this.web3.eth.accounts[0],
          gasPrice: this.gasPrice
        },
        (err, tx)=>{
          console.log('setting pub key, watching...');          
          if(err){
            reject(err);
          }else{
            this.watchTx(tx).then((txReceipt)=>{
              resolve(txReceipt);
            }).catch((error)=>{
              reject(error);
            });            
          }          
        }
      );
    })
  } 

  getPubKey(subdomain){
    let keyCoords = this.resolverContract.pubkey(namehash.hash(subdomain+'.gregor.test'));
    return "04"+keyCoords[0].substring(2,66)+keyCoords[1].substring(2,66);
  }

  setSubnodeOwner(subdomain, address){
    return this.ens.setSubnodeOwner(
      subdomain+'.gregor.test',
      address, 
      {
        from: this.web3.eth.accounts[0],
      }
    ).then((tx) => {
      console.log('setting subnode owner to ' + address + ', watching...');
      return this.watchTx(tx);
    });
  }

  registerSubdomainToAddress(subdomain, address, publicKey, feedbackMessageCallback){
    this.registerSubdomainToAddressState = 0;
    if(this.getSubdomainAvailiability(subdomain)){
      console.log(subdomain + ' available!')
      feedbackMessageCallback('registering subdomain, waiting for tx...');
      return this.registerSubdomain(subdomain).then((tx)=>{
        this.registerSubdomainToAddressState = 1;
        console.log(tx);
        return this.setResolver(subdomain).then((tx2)=>{
          this.registerSubdomainToAddressState = 2;          
          console.log(tx2);
          return this.setAddr(subdomain, address).then((tx3)=>{
            this.registerSubdomainToAddressState = 3;                      
            console.log(tx3);
            return this.setPubKey(subdomain, publicKey).then((tx4)=>{
            this.registerSubdomainToAddressState = 4;
              console.log(tx4.transactionHash);
              return tx4.transactionHash;
              // return this.setSubnodeOwner(subdomain, address).then((tx5)=>{
              //   this.registerSubdomainToAddressState = 5;
              //   console.log(tx5);
                // console.timeEnd('registered');
              // });
            });
          });
        })
      })
    }else{
      return false;
    }
  }

}

export default DEns;