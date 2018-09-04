import DWallet from './DWallet'

let mockWalletJSON = {"version":3,"id":"38b5f67d-536c-4a69-81e5-a636d75de587","address":"68a2824d8850facc2d934afb50e187bee2091e72","Crypto":{"ciphertext":"80382ee4912bef789537cd20ab074b73cded97071fc5de9a34d5115ccc8483ad","cipherparams":{"iv":"b6816720e79a753e82aacf04b62c39eb"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"50657dbbff42581518aee2bea79ef0e59112870c2007dae61717c37cb96dd9a8","n":8192,"r":8,"p":1},"mac":"32436b69589fe7770d678ba199657c623c9d081b37ca2dd687568892556d45bc"}};


function createSubdomain(password){
  return new Promise((resolve, reject)=>{
    let dw = new DWallet();
    resolve(dw.generate(password));
  })
}

function getSharedSecret(senderMailbox, recipient){
  return senderMailbox.subdomain+recipient
}

export default {createSubdomain, getSharedSecret}