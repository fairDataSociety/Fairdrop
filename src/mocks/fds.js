// Mock FDS library for frontend mockup
// This provides the same interface as fds.js but with mock data

const MOCK_ACCOUNTS = [];
let currentAccount = null;

class MockAccount {
  constructor(subdomain, password) {
    this.subdomain = subdomain;
    this.password = password;
    this.messages_store = [];
    this.stored_files = [];
    this.values = {};
  }

  async send(recipient, file, path, feedbackCb, progressCb, completeCb) {
    feedbackCb?.('Encrypting file...');
    await delay(500);
    progressCb?.(25);
    feedbackCb?.('Uploading to Swarm...');
    await delay(1000);
    progressCb?.(75);
    feedbackCb?.('Sending to recipient...');
    await delay(500);
    progressCb?.(100);
    completeCb?.('File sent successfully!');
    return { hash: 'mock-hash-' + Date.now() };
  }

  async store(file, path, feedbackCb, progressCb) {
    feedbackCb?.('Encrypting file...');
    await delay(500);
    progressCb?.(50);
    feedbackCb?.('Storing on Swarm...');
    await delay(1000);
    progressCb?.(100);
    this.stored_files.push({
      file: { name: file.name, size: file.size },
      meta: { pinned: false },
      hash: 'mock-hash-' + Date.now()
    });
    return { hash: 'mock-hash-' + Date.now() };
  }

  async messages(type, path) {
    // Return mock messages
    return this.messages_store;
  }

  async getBalance() {
    return 1000000; // Mock balance
  }

  async storedManifest() {
    return {
      storedFiles: this.stored_files
    };
  }

  getBackup() {
    return {
      name: `${this.subdomain}-backup.json`,
      data: JSON.stringify({ subdomain: this.subdomain })
    };
  }

  async retrieveDecryptedValue(key) {
    if (this.values[key]) {
      return this.values[key];
    }
    const error = new Error('Not found');
    error.response = { status: 404 };
    throw error;
  }

  async storeEncryptedValue(key, value) {
    this.values[key] = value;
    return true;
  }
}

class MockAccountManager {
  static isMailboxNameValid(name) {
    return name && name.length >= 3 && /^[a-z0-9-]+$/.test(name);
  }

  static async isMailboxNameAvailable(name) {
    // Returns true if available (not taken)
    const taken = MOCK_ACCOUNTS.find(a => a.subdomain === name);
    return !taken;
  }

  static Store = {
    async storeFilesUnencrypted(files, callback) {
      callback?.('Uploading...');
      await delay(1000);
      const hash = 'mock-quick-hash-' + Date.now();
      return {
        address: hash
      };
    }
  }
}

class FDS {
  constructor(config) {
    this.config = config || {};
    this.swarmGateway = 'https://gateway.fairdatasociety.org';
    this.Account = MockAccountManager;
  }

  GetAccounts(version = 1) {
    return MOCK_ACCOUNTS.filter(() => version === 1);
  }

  get currentAccount() {
    return currentAccount;
  }

  async CreateAccount(subdomain, password, feedbackCb) {
    feedbackCb?.('Creating account...');
    await delay(500);
    feedbackCb?.('Registering on ENS...');
    await delay(1000);

    const account = new MockAccount(subdomain, password);
    MOCK_ACCOUNTS.push(account);
    currentAccount = account;

    feedbackCb?.('Account created!');
    return account;
  }

  async UnlockAccount(subdomain, password) {
    const account = MOCK_ACCOUNTS.find(a => a.subdomain === subdomain);
    if (!account) {
      throw new Error('Account not found');
    }
    if (account.password !== password) {
      throw new Error('Invalid password');
    }
    currentAccount = account;
    return account;
  }

  async RestoreAccount(file) {
    // Mock restore - just pretend it worked
    await delay(500);
    return true;
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default FDS;
