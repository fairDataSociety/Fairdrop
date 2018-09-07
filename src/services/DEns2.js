let Web3 = require('web3');
var ENS = require('ethereum-ens');
var namehash = require('eth-ens-namehash')

class DEns {

  constructor(provider, options = {}){
    this.web3 = new Web3(new Web3.providers.HttpProvider(provider));
    this.ens = new ENS(this.web3);

    this.gasPrice = this.web3.toWei(12, 'gwei');

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
        console.log('checking...')
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
        console.log(subdomain+".gregor.test domain is available");
        return true;
    } else {
        console.log(subdomain+".gregor.test domain is not available");
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
    console.log(this.resolverContract.address)
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

  setAddr(subdomain){
    return new Promise((resolve, reject)=>{
      this.resolverContract.setAddr(
        namehash.hash(subdomain+'.gregor.test'), 
        this.web3.eth.accounts[0], 
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

  setPubKey(subdomain){
    return new Promise((resolve, reject)=>{
      this.resolverContract.setPubkey(
        namehash.hash(subdomain+'.gregor.test'), 
        "0x2d6933eb8f263be62c551dc489a6d00a3a4d38b035f51507f931ccc7c7899ced",
        "0x395a6a136dc4c252f40bfdc4be8fe3de5d16ca3bf2b709ce224da48872305292",
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

  pubKey(subdomain){
    return this.resolverContract.pubkey(namehash.hash(subdomain));
  }

  registerSubdomainToAddress(subdomain, address = false){
    this.registerSubdomainToAddressState = 0;
    if(this.getSubdomainAvailiability(subdomain)){
      console.log(subdomain + ' available!')
      return this.registerSubdomain(subdomain).then((tx)=>{
        this.registerSubdomainToAddressState = 1;
        console.log(tx);
        return this.setResolver(subdomain).then((tx2)=>{
          this.registerSubdomainToAddressState = 2;          
          console.log(tx2);
          return this.setAddr(subdomain).then((tx3)=>{
            this.registerSubdomainToAddressState = 3;                      
            console.log(tx3);
            return this.setPubKey(subdomain).then((tx4)=>{
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

let provider = "http://139.59.135.220:8545";

let dEns = new DEns(provider, {
  registrarContractAddress: '0x21397c1a1f4acd9132fe36df011610564b87e24b',
  fifsRegistrarContractAddress: '0xd78e926ec77acfae2f2a8533bd7e65c6b33518bb',
  resolverContractAddress: '0xA4038A4BfeEf917Eb9876E0a7c13D577941499c4'
});




  console.log(dEns.pubKey('dave1536219559417.gregor.test'));



// console.log(dEns.pubKey('john1536155074768.gregor.test'));
// dEns.setSubnodeOwner('john1536155074768.gregor.test', '0x468ce9a1ec886d15f3483975e062d3c08b6b4bc2').then((tx)=>{
//   console.log(tx);
//   console.log(dEns.pubKey('dave1536219559417.gregor.test'));
// });

// subdomain = 'dave1536219559417';

// console.time('registered');
// dEns.setSubnodeOwner(subdomain, '0x468ce9a1ec886d15f3483975e062d3c08b6b4bc2').then((tx)=>{
//   console.timeEnd('registered');  
//   console.log(dEns.pubKey(subdomain));
// })

var subdomain = 'dave'+ Date.now();

// console.time('registered');
// dEns.registerSubdomainToAddress(subdomain, '0x468ce9a1ec886d15f3483975e062d3c08b6b4bc2').then((tx)=>{
//   console.timeEnd('registered');  
//   console.log(dEns.pubKey(subdomain));
// })













// if(dEns.getSubdomainAvailiability(subdomain)){
//   console.log(subdomain + ' available!')
//   dEns.registerSubdomain(subdomain).then((tx)=>{
//     console.log(tx);
//     dEns.setResolver(subdomain).then((tx2)=>{
//       console.log(tx2);
//       dEns.setAddr(subdomain).then((tx3)=>{
//         console.log(tx3);
//         dEns.setPubKey(subdomain).then((tx4)=>{
//           console.log(tx4);
//           console.timeEnd('registered');
//         }).then((tx5) => {
//           console.log(dEns.pubKey(subdomain));
//         });
//       });
//     })
//   })
// }