//to do - make these web workers!

import EthereumJSWallet from 'ethereumjs-wallet';

class Wallet{

  generate(password){
    console.timeEnd("generateWallet");
    return new Promise((resolve, reject)=>{
      setTimeout(()=>{
        this.wallet = EthereumJSWallet.generate();
        this.walletV3 = this.wallet.toV3(password);
        resolve(this);
      })
    })
    // return {
    //   v3: this.wallet.toV3(password),
    //   address: this.wallet.getAddress().toString('hex'),
    //   publicKey: this.wallet.getPublicKey().toString('hex'),
    //   privateKey: this.wallet.getPrivateKey().toString('hex')
    // };
  }

  fromJSON(walletJSON, password) {
    return new Promise((resolve, reject)=>{
      console.time("decryptWallet");
      try {
        var wallet = EthereumJSWallet.fromV3(walletJSON, password, true);
        console.timeEnd("decryptWallet");
        resolve(wallet);
      }
      catch(err) {
        console.timeEnd("decryptWallet");
        if(err.message === "Key derivation failed - possibly wrong passphrase"){
          reject(false);       
        }else{
          throw new Error(err);
        }
      }
    });
  }




}

export default Wallet;