import DTransfer from './DTransfer';

let DT = new DTransfer('http://localhost:8500/bzz:/');

it('should encrypt string', ()=>{
  let encryptedFile = DT.encrypt('test','password');
  expect(encryptedFile).toEqual('df60c4f2');
});

it('should decrypt string', ()=>{
  let decryptedFile = DT.decrypt('df60c4f2','password');
  expect(decryptedFile).toEqual('test');
});

it('should create encrypted file', (done)=>{
  const mockFr = {
    onload: jest.fn(),
    readAsText: jest.fn(),
    result: "test",
  };

  window.FileReader = jest.fn(() => mockFr);


  var blob = new Blob(["test"], {type : 'text/plain'});
  blob["lastModifiedDate"] = "";
  blob["name"] = "test.txt";

  let encryptedFilePromise = DT.encryptFile(blob, 'password');

  mockFr.onload();

  encryptedFilePromise.then((result)=>{
    expect(result.name).toEqual('test.txt.encrypted');
    done();
  });
  
})

it('should post file',(done)=>{

  const mockXHR = {
    open: jest.fn(),
    send: jest.fn(),
    readyState: 4,
    status: 200,
    responseText: "aswarmhash",
    onload: jest.fn()
  };

  window.XMLHttpRequest = jest.fn(() => mockXHR);

  var blob = new Blob(["test file contents"], {type : 'text/plain'});
  blob["lastModifiedDate"] = "";
  blob["name"] = "test.txt";

  let postFilePromise = DT.postFile(blob);

  mockXHR.onload();

  postFilePromise.then((response)=>{
    expect(response).toEqual('aswarmhash');
    done();
  });
});

it('should return an error on post file if xhr status is 0',(done)=>{

  const mockXHR = {
    open: jest.fn(),
    send: jest.fn(),
    readyState: 4,
    status: 0,
    onerror: jest.fn()
  };

  window.XMLHttpRequest = jest.fn(() => mockXHR);

  var blob = new Blob(["test file contents"], {type : 'text/plain'});
  blob["lastModifiedDate"] = "";
  blob["name"] = "test.txt";

  let postFilePromise = DT.postFile(blob);

  mockXHR.onerror();

  postFilePromise.catch((error)=>{
    expect(error).toEqual('couldn\'t access gateway.');
    done();
  });
});

it('should getfile', (done)=>{
  const mockXHR = {
    open: jest.fn(),
    send: jest.fn(),
    status: 200,
    readyState: 4,
    onload: jest.fn(),
    responseText: "some file content"
  };

  window.XMLHttpRequest = jest.fn(() => mockXHR);

  let getFilePromise = DT.getFile()

  mockXHR.onload();

  getFilePromise.then((response)=>{
    expect(response).toEqual('some file content');
    done();
  });
});


it('should throw error if getfile request fails with status 0', (done)=>{
  const mockXHR = {
    open: jest.fn(),
    send: jest.fn(),
    status: 0,
    readyState: 4,
    onload: jest.fn(),
    onerror: jest.fn()
  };

  window.XMLHttpRequest = jest.fn(() => mockXHR);

  let getFilePromise = DT.getFile()

  mockXHR.onerror();

  getFilePromise.catch((error)=>{
    expect(error).toEqual('couldn\'t access gateway.');
    done();
  });
});

it('should throw error if getfile request fails with status 404', (done)=>{
  const mockXHR = {
    open: jest.fn(),
    send: jest.fn(),
    status: 404,
    readyState: 4,
    onload: jest.fn(),
    onerror: jest.fn()
  };

  window.XMLHttpRequest = jest.fn(() => mockXHR);

  let getFilePromise = DT.getFile()

  mockXHR.onload();

  getFilePromise.catch((error)=>{
    expect(error).toEqual('couldn\'t find hash.');
    done();
  });
});

describe('#decryptWallet', ()=>{
  let password, address, privateKey, publicKey, walletJSON;

  beforeEach(() => {
    password = 'testtesttest';
    address = 'bb6d3dd8d6fbaacb6a0a79b655d6e94db27d2b32';
    privateKey ='15c15f944f8370a8e9570214ac097587d2aef039089da8f02ebcd6d9b14d341c';
    publicKey = '15f982f1a0cf7c59ac27798572d45c2bfeb322a8b02267cbd8d20704bcbf65b261f4041f0946ddf5788f3180f2f1f528edb0e990548b9c3b7dbad0641da1950c';
    walletJSON = '{"version":3,"id":"df476fec-eb59-4e79-8ef9-6be04cacd559","address":"bb6d3dd8d6fbaacb6a0a79b655d6e94db27d2b32","Crypto":{"ciphertext":"2c9dd629ac4c74f3a553c562ecdbd3f8cc6c610a7cbe796147bd7f1ece531c3e","cipherparams":{"iv":"a12b4877811ce8e1a279ce91c444d5d6"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"8cb4d854455c69002c313540a93cbcfa2ef6d168b70e539f260c488a48b340a4","n":8192,"r":8,"p":1},"mac":"8040122aa0b28630e7e911439d2e7590817de5e020b16e7bb2f39f21301bf9fb"}}';    
  });

  it('should decrypt wallet json', ()=>{
    let decryptedWallet = DT.decryptWallet(walletJSON, password);

    expect(decryptedWallet.address).toEqual(address);
    expect(decryptedWallet.publicKey).toEqual(publicKey);
    expect(decryptedWallet.privateKey).toEqual(privateKey);
  });

  it('should return the proper errors', ()=>{
    expect(DT.decryptWallet(walletJSON, password).error).toEqual(undefined);
    expect(DT.decryptWallet(walletJSON, '').error).toEqual('Key derivation failed - possibly wrong passphrase');
    expect(DT.decryptWallet(walletJSON, 'not-the-password').error).toEqual('Key derivation failed - possibly wrong passphrase');
    expect(DT.decryptWallet('', 'not-the-password').error).toEqual('Unexpected end of JSON input');
    expect(DT.decryptWallet('', '').error).toEqual('Unexpected end of JSON input');
  })

})