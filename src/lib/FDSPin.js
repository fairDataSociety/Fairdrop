class FDSPin{
	constructor(FDSAccount){
		this.acc = FDSAccount;
	}

	async pin(){
		//send pin request to oracle
		//check for completion
		return true;
	}

	async unpin(){
		//send unpin request to oracle
		//check for completion
		return true;
	}

}


export default FDSPin;