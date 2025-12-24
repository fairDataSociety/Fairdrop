// Mock FDSPin for frontend mockup
// Original used contract interactions and axios calls

class FDSPin {
  constructor(FDSAccount, OracleURL, PinningManagerAddress) {
    this.acc = FDSAccount;
    this.orac = OracleURL;
    this.pma = PinningManagerAddress;
  }

  async createWarrant(value) {
    console.log('FDSPin.createWarrant (mocked):', value);
    return '0xmock-warrant-address';
  }

  async getMyBalance() {
    // Return mock balance
    return 100000;
  }

  async pin(hash) {
    console.log('FDSPin.pin (mocked):', hash);
    return { status: 'ok' };
  }

  async unpin(hash) {
    console.log('FDSPin.unpin (mocked):', hash);
    return { status: 'ok' };
  }
}

export default FDSPin;
