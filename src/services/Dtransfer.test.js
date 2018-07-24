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

it('should encrypt string', ()=>{
  let encryptedFile = DT.encryptBuffer('test','password');
  expect(encryptedFile).toEqual('df60c4f2');
});

it('should decrypt buffer', ()=>{
  let decryptedFile = DT.decryptBuffer('df60c4f2','password','test.txt');
  expect(decryptedFile).toEqual(new Blob(['test']));
});

it('should create encrypted file', (done)=>{
  const mockFr = {
    onLoadEnd: jest.fn(),
    readAsText: jest.fn(),
    result: "test",
    addEventListener: jest.fn(),
    readAsArrayBuffer: jest.fn()
  };

  window.FileReader = jest.fn(() => mockFr);

  DT.blobToBuffer = jest.fn(()=>{ return new Promise((res,rej)=>{res('test')}) });

  var blob = new Blob(["test"], {type : 'text/plain'});
  blob["lastModifiedDate"] = "";
  blob["name"] = "test.txt";

  let encryptedFilePromise = DT.encryptBlob(blob, 'password');

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
