import DTransfer from './DTransfer';
import toBuffer from 'blob-to-buffer';
import b64toBlob from 'b64-to-blob';

let DT = new DTransfer('http://swarm-gateway.net/bzz:/');

it('should generate password', (done)=>{
  let generatedPassword = DT.generatePassword().then((password)=>{
    expect(password.length).toEqual(96);
    done();
  });
})
