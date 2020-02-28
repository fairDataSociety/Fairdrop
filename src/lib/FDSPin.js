import axios from 'axios';
import querystring from 'querystring';
import PinningManager from './abi/PinningManager.json';
import PinWarrant from './abi/PinWarrant.json';

class FDSPin{
	constructor(FDSAccount, OracleURL, PinningManagerAddress){
		this.acc = FDSAccount;
		this.orac = OracleURL;
		this.pma = PinningManagerAddress;
	}

	async createWarrant(value){
		let PM = await this.acc.getContract(PinningManager.abi, this.pma);
		await PM.send('createWarrant', [], true, 15000000, value);
		return PM.getMyWarrant();
	}

	async getMyBalance(){
		let PM = await this.acc.getContract(PinningManager.abi, this.pma);
		let warrantAddress = await PM.getMyWarrant();
		let PW = await this.acc.getContract(PinWarrant.abi, warrantAddress);
		return PW.getBalance();
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
		let qs = querystring.stringify({
			account: this.acc.address,
			address: hash
		});
		return await axios.post(`${this.orac}/unpin`, qs).catch();
	}
}


export default FDSPin;