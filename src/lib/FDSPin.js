import axios from 'axios';
import querystring from 'querystring';

class FDSPin{
	constructor(FDSAccount, OracleURL){
		this.acc = FDSAccount;
		this.orac = OracleURL;
	}

	async pin(hash){
		// curl -XPOST http://localhost:8080/pin -d "account=0x123&address=$ADDRESS&warrant=0x234&endBlock=1234"
		//send pin request to oracle
		let qs = querystring.stringify({
			account: this.acc.address,
			address: hash,
			warrant: "",
			endBlock: "9999"
		});
		return await axios.post(`${this.orac}/pin`, qs);
	}

	async unpin(hash){
		// curl -XPOST http://localhost:8080/unpin -d "address=$ADDRESS"
		//send unpin request to oracle
		console.log(`${this.orac}/unpin`)
		let qs = querystring.stringify({
			account: this.acc.address,
			address: hash
		});
		return await axios.post(`${this.orac}/unpin`, qs).catch();
	}
}


export default FDSPin;