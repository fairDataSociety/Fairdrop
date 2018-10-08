import Web3 from 'web3';
import ENS from 'ethereum-ens';
import namehash from 'eth-ens-namehash';

let httpTimeout = 2000;

class DEns {

  constructor(provider, options = {}){
    this.web3 = new Web3(new Web3.providers.HttpProvider(provider, httpTimeout));
    this.ens = new ENS(this.web3);

    this.gasPrice = this.web3.toWei(150, 'gwei');

    if(options.registrarContractAddress === undefined) throw new Error('registrarContractAddress must be provided');

    let registrarContractAbi = [{"constant": true,"inputs": [],"name": "ens","outputs": [{"name": "","type": "address"}],"payable": false,"type": "function"},{"constant": true,"inputs": [{"name": "","type": "bytes32"}],"name": "expiryTimes","outputs": [{"name": "","type": "uint256"}],"payable": false,"type": "function"},{"constant": false,"inputs": [{"name": "subnode","type": "bytes32"},{"name": "owner","type": "address"}],"name": "register","outputs": [],"payable": false,"type": "function"},{"constant": true,"inputs": [],"name": "rootNode","outputs": [{"name": "","type": "bytes32"}],"payable": false,"type": "function"},{"inputs": [{"name": "ensAddr","type": "address"},{"name": "node","type": "bytes32"}],"type": "constructor"}];
    this.registrarContract = this.web3.eth.contract(registrarContractAbi).at(options.registrarContractAddress);

    if(options.fifsRegistrarContractAddress === undefined) throw new Error('fifsRegistrarContractAddress must be provided');

    let fifsRegistrarContractAbi = [{"constant":false,"inputs":[{"name":"subnode","type":"bytes32"},{"name":"owner","type":"address"}],"name":"register","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"ensAddr","type":"address"},{"name":"node","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];
    this.fifsRegistrarContract = this.web3.eth.contract(fifsRegistrarContractAbi).at(options.fifsRegistrarContractAddress);

    if(options.resolverContractAddress === undefined) throw new Error('resolverContractAddress must be provided');

    var resolverContractAbi = [{"constant": true,"inputs": [{"name": "interfaceID","type": "bytes4"}],"name": "supportsInterface","outputs": [{"name": "","type": "bool"}],"payable": false,"type": "function"},{"constant": true,"inputs": [{"name": "node","type": "bytes32"},{"name": "contentTypes","type": "uint256"}],"name": "ABI","outputs": [{"name": "contentType","type": "uint256"},{"name": "data","type": "bytes"}],"payable": false,"type": "function"},{"constant": false,"inputs": [{"name": "node","type": "bytes32"},{"name": "x","type": "bytes32"},{"name": "y","type": "bytes32"}],"name": "setPubkey","outputs": [],"payable": false,"type": "function"},{"constant": true,"inputs": [{"name": "node","type": "bytes32"}],"name": "content","outputs": [{"name": "ret","type": "bytes32"}],"payable": false,"type": "function"},{"constant": true,"inputs": [{"name": "node","type": "bytes32"}],"name": "addr","outputs": [{"name": "ret","type": "address"}],"payable": false,"type": "function"},{"constant": false,"inputs": [{"name": "node","type": "bytes32"},{"name": "contentType","type": "uint256"},{"name": "data","type": "bytes"}],"name": "setABI","outputs": [],"payable": false,"type": "function"},{"constant": true,"inputs": [{"name": "node","type": "bytes32"}],"name": "name","outputs": [{"name": "ret","type": "string"}],"payable": false,"type": "function"},{"constant": false,"inputs": [{"name": "node","type": "bytes32"},{"name": "name","type": "string"}],"name": "setName","outputs": [],"payable": false,"type": "function"},{"constant": false,"inputs": [{"name": "node","type": "bytes32"},{"name": "hash","type": "bytes32"}],"name": "setContent","outputs": [],"payable": false,"type": "function"},{"constant": true,"inputs": [{"name": "node","type": "bytes32"}],"name": "pubkey","outputs": [{"name": "x","type": "bytes32"},{"name": "y","type": "bytes32"}],"payable": false,"type": "function"},{"constant": false,"inputs": [{"name": "node","type": "bytes32"},{"name": "addr","type": "address"}],"name": "setAddr","outputs": [],"payable": false,"type": "function"},{"inputs": [{"name": "ensAddr","type": "address"}],"payable": false,"type": "constructor"},{"anonymous": false,"inputs": [{"indexed": true,"name": "node","type": "bytes32"},{"indexed": false,"name": "a","type": "address"}],"name": "AddrChanged","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "node","type": "bytes32"},{"indexed": false,"name": "hash","type": "bytes32"}],"name": "ContentChanged","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "node","type": "bytes32"},{"indexed": false,"name": "name","type": "string"}],"name": "NameChanged","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "node","type": "bytes32"},{"indexed": true,"name": "contentType","type": "uint256"}],"name": "ABIChanged","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "node","type": "bytes32"},{"indexed": false,"name": "x","type": "bytes32"},{"indexed": false,"name": "y","type": "bytes32"}],"name": "PubkeyChanged","type": "event"}];
    this.resolverContract = this.web3.eth.contract(resolverContractAbi).at(options.resolverContractAddress);

    // window.registrarContract = this.registrarContract;
    // window.fifsRegistrarContract =  this.fifsRegistrarContract;
    // window.resolverContract = this.resolverContract;
    // window.namehash = namehash;
    // window.web3 = this.web3;
    // window.ens = this.ens;

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

  registerSubdomainToAddress(subdomain, address, publicKey, feedbackMessageCallback = false){
    if(feedbackMessageCallback) feedbackMessageCallback('verifying subdomain, waiting for node...');    
    this.registerSubdomainToAddressState = 0;
    return this.getSubdomainAvailiability(subdomain).then((availability)=>{
      console.log(availability);
      if(availability){
        if(feedbackMessageCallback) feedbackMessageCallback('registering subdomain, waiting for tx...');
        return this.registerSubdomain(subdomain).then((tx)=>{ // must be contract owner :-/
          this.registerSubdomainToAddressState = 1;
          if(feedbackMessageCallback) feedbackMessageCallback('setting resolver, waiting for tx...');        
          console.log(tx);
          return this.setResolver(subdomain).then((tx2)=>{  // must be contract owner :-/
            this.registerSubdomainToAddressState = 2; 
            if(feedbackMessageCallback) feedbackMessageCallback('registering to your address, waiting for tx...');                 
            console.log(tx2);
            return this.setAddr(subdomain, address).then((tx3)=>{ // May only be called by the owner of that node in the ENS registry.
              this.registerSubdomainToAddressState = 3;                      
              if(feedbackMessageCallback) feedbackMessageCallback('registering your public key, waiting for tx...');                             
              console.log(tx3);
              return this.setPubKey(subdomain, publicKey).then((tx4)=>{ // May only be called by the owner of that node in the ENS registry.
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
    })
  }  

  getSubdomainAvailiability(subdomain){
    return this.ens.owner(subdomain + '.'+ process.env.REACT_APP_DOMAIN_NAME).then((response)=>{
      return response === "0x0000000000000000000000000000000000000000";
    })
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
      subdomain + '.'+ process.env.REACT_APP_DOMAIN_NAME, 
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
        namehash.hash(subdomain + '.'+ process.env.REACT_APP_DOMAIN_NAME), 
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
        namehash.hash(subdomain + '.'+ process.env.REACT_APP_DOMAIN_NAME), 
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
    return new Promise((resolve, reject) => {
      this.resolverContract.pubkey(namehash.hash(subdomain + '.'+ process.env.REACT_APP_DOMAIN_NAME),(err, keyCoords)=>{
        if(err){
          reject(err);
          return;
        }else{
          let keyStr = "04"+keyCoords[0].substring(2,66)+keyCoords[1].substring(2,66);
          if(keyStr !== "0400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"){
            resolve(keyStr);
          }else{
            reject(false);
          }
          return;
        }
      })
    });
  }

  setSubnodeOwner(subdomain, address){
    return this.ens.setSubnodeOwner(
      subdomain + '.'+ process.env.REACT_APP_DOMAIN_NAME,
      address, 
      {
        from: this.web3.eth.accounts[0],
      }
    ).then((tx) => {
      console.log('setting subnode owner to ' + address + ', watching...');
      return this.watchTx(tx);
    });
  }

}

export default DEns;