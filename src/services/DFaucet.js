import Web3 from 'web3';
const web3 = new Web3();

class DFaucet {

  gimmie(address) {

    return new Promise((resolve, reject) => {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (this.status === 200) {
            resolve(JSON.parse(xhttp.responseText).transaction);
          } else {
            reject(JSON.parse(xhttp.responseText).error);
          }
        }
      };

      xhttp.open('POST', process.env.REACT_APP_FAUCET_URL, true);
      xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');      

      xhttp.send('address='+address);
    });
  }

}

export default new DFaucet;