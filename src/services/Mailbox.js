function generatePassword (){
    return new Promise((resolve, reject)=>{
      Crypto.randomBytes(48, function(err, buffer) {
        resolve(buffer.toString('hex'));
      });
    })
  }

function humanFileSize(size) {
      var i = Math.floor( Math.log(size) / Math.log(1024) );
      return ( size / Math.pow(1024, i) ).toFixed(0) * 1 + ' ' + ['bytes', 'KB', 'MB', 'GB', 'TB'][i];
  }

function humanEntropy(password){
    return zxcvbn(password).crack_times_display.offline_fast_hashing_1e10_per_second;
  }

export default {generatePassword, humanFileSize, humanEntropy}