import EthereumJSWallet from 'ethereumjs-wallet';

class Wallet{
  constructor(walletJSON){
    if(walletJSON === undefined) throw new Error('walletJSON must be defined');

    this.walletJSON = walletJSON;
    this.wallet = false;

    return this;
  }

  unlock(password){
    try {
      this.wallet = EthereumJSWallet.fromV3(JSON.stringify(this.walletJSON), password, true);          
      return {
        address: this.wallet.getAddress().toString('hex'),
        publicKey: this.wallet.getPublicKey().toString('hex'),
        privateKey: this.wallet.getPrivateKey().toString('hex')
      };    
    }
    catch(err) {
      return false;
    }
  }
}

export default Wallet;