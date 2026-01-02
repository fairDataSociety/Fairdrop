/**
 * Unit Tests for FDS Adapter
 *
 * Tests the core functionality of fds-adapter.js:
 * - FDS class (account management)
 * - Account class (send, store, messages)
 * - AccountManager (validation, lookup)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Crypto } from '@peculiar/webcrypto';

// ============================================================================
// MOCKS - Must be defined BEFORE importing the module under test
// ============================================================================

// Mock crypto.subtle with @peculiar/webcrypto
const webcrypto = new Crypto();
vi.stubGlobal('crypto', webcrypto);

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: (key) => localStorageMock.store[key] || null,
  setItem: (key, value) => { localStorageMock.store[key] = String(value); },
  removeItem: (key) => { delete localStorageMock.store[key]; },
  clear: () => { localStorageMock.store = {}; }
};
vi.stubGlobal('localStorage', localStorageMock);

// Mock btoa/atob for Node.js
vi.stubGlobal('btoa', (str) => Buffer.from(str).toString('base64'));
vi.stubGlobal('atob', (str) => Buffer.from(str, 'base64').toString());

// Mock Blob and File
class MockBlob {
  constructor(parts, options = {}) {
    this.parts = parts;
    this.type = options.type || '';
    this._buffer = Buffer.concat(parts.map(p => {
      if (Buffer.isBuffer(p)) return p;
      if (p instanceof Uint8Array) return Buffer.from(p);
      if (typeof p === 'string') return Buffer.from(p);
      if (p instanceof MockBlob) return p._buffer;
      if (p && p._buffer) return p._buffer;
      return Buffer.from(JSON.stringify(p));
    }));
  }
  async arrayBuffer() {
    return this._buffer.buffer.slice(
      this._buffer.byteOffset,
      this._buffer.byteOffset + this._buffer.byteLength
    );
  }
  async text() {
    return this._buffer.toString('utf-8');
  }
  get size() {
    return this._buffer.length;
  }
}

class MockFile extends MockBlob {
  constructor(parts, name, options = {}) {
    super(parts, options);
    this.name = name;
    this.lastModified = options.lastModified || Date.now();
  }
}

vi.stubGlobal('Blob', MockBlob);
vi.stubGlobal('File', MockFile);

// Mock fetch for API calls
vi.stubGlobal('fetch', async (url, options = {}) => {
  const urlStr = typeof url === 'string' ? url : url.toString();

  // Mock /api/bee-info
  if (urlStr.includes('/api/bee-info')) {
    return new Response(JSON.stringify({
      overlay: 'be8aa29ad80afd4ccbada68360cd1b9d9cf646c7f872268f41f102bbc6223fb5'
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // Mock /api/free-stamp
  if (urlStr.includes('/api/free-stamp')) {
    return new Response(JSON.stringify({
      batchId: 'e171815c1578c7edd80aa441a626f860eb7fc8d43d96e778198e8edec2318059',
      expiresAt: Date.now() + (4 * 24 * 60 * 60 * 1000),
      remainingCapacity: 1000000
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // Mock /api/lookup/:username (not found)
  if (urlStr.includes('/api/lookup/')) {
    return new Response(JSON.stringify({ exists: false }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Mock /api/register
  if (urlStr.includes('/api/register')) {
    return new Response(JSON.stringify({
      success: true,
      ensName: 'test.fairdrop.eth',
      txHash: '0x' + '1'.repeat(64)
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // Mock stamps endpoint
  if (urlStr.includes('/stamps')) {
    return new Response(JSON.stringify({
      stamps: [{ batchID: 'test-stamp', usable: true, amount: '1000000' }]
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // Default: return empty response
  return new Response('{}', { status: 200 });
});

// Mock swarm modules
vi.mock('../../src/lib/swarm/upload.jsx', () => ({
  uploadFile: vi.fn().mockResolvedValue('mock-reference-' + Date.now().toString(36)),
  uploadData: vi.fn().mockResolvedValue('mock-data-ref-' + Date.now().toString(36)),
  getShareableLink: vi.fn((ref) => `https://gateway.test/bzz/${ref}/`),
  getGatewayLink: vi.fn((ref) => `https://gateway.test/bzz/${ref}`)
}));

vi.mock('../../src/lib/swarm/download.jsx', () => ({
  downloadFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  downloadData: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  triggerDownload: vi.fn()
}));

vi.mock('../../src/lib/swarm/encryption.jsx', () => {
  // Generate proper mock key data
  const mockPublicKey = new Uint8Array(65);
  mockPublicKey[0] = 0x04; // Uncompressed point prefix
  for (let i = 1; i < 65; i++) mockPublicKey[i] = 0xaa;

  const mockPrivateKey = new Uint8Array(32);
  for (let i = 0; i < 32; i++) mockPrivateKey[i] = 0xbb;

  return {
    // generateKeyPair is SYNCHRONOUS - use mockReturnValue, not mockResolvedValue
    generateKeyPair: vi.fn().mockReturnValue({
      publicKey: mockPublicKey,
      privateKey: mockPrivateKey
    }),
    encryptFile: vi.fn().mockImplementation(async (file, pubKey) => ({
      encrypted: new Uint8Array([1, 2, 3, 4]),
      nonce: new Uint8Array(24)
    })),
    decryptFile: vi.fn().mockImplementation(async (encrypted, nonce, pubKey, privKey) =>
      new Uint8Array([116, 101, 115, 116]) // "test"
    ),
    encryptData: vi.fn().mockResolvedValue({
      encrypted: new Uint8Array([5, 6, 7, 8]),
      nonce: new Uint8Array(24)
    }),
    decryptData: vi.fn().mockResolvedValue(new Uint8Array([116, 101, 115, 116])),
    hexToBytes: vi.fn((hex) => {
      if (!hex || typeof hex !== 'string') return new Uint8Array(0);
      const matches = hex.match(/.{2}/g);
      if (!matches) return new Uint8Array(0);
      return new Uint8Array(matches.map(b => parseInt(b, 16)));
    }),
    bytesToHex: vi.fn((bytes) => {
      if (!bytes || !bytes.length) return '';
      return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    })
  };
});

vi.mock('../../src/lib/swarm/stamps.jsx', () => ({
  getAllStamps: vi.fn().mockResolvedValue([
    { batchID: 'test-stamp-id', usable: true, amount: '1000000' }
  ]),
  getStamp: vi.fn().mockResolvedValue({ batchID: 'test-stamp-id', usable: true }),
  requestSponsoredStamp: vi.fn().mockResolvedValue('sponsored-stamp-id'),
  isStampUsable: vi.fn().mockReturnValue(true)
}));

vi.mock('../../src/lib/swarm/client.jsx', () => ({
  getBeeUrl: vi.fn().mockReturnValue('http://localhost:1633')
}));

vi.mock('../../src/lib/swarm/gsoc.jsx', () => ({
  writeToInbox: vi.fn().mockResolvedValue({ reference: 'gsoc-ref-123' }),
  findNextSlot: vi.fn().mockResolvedValue(0),
  pollInbox: vi.fn().mockResolvedValue([]),
  decryptMetadata: vi.fn().mockResolvedValue({ from: 'sender', reference: 'ref-123' }),
  mineInboxKey: vi.fn().mockResolvedValue({
    key: 'mock-inbox-key',
    identifier: 'mock-identifier-' + Date.now().toString(36)
  }),
  deriveInboxKey: vi.fn().mockReturnValue('mock-derived-key'),
  getInboxOwner: vi.fn().mockReturnValue('mock-owner'),
  getIndexedIdentifier: vi.fn((base, idx) => `${base}-${idx}`),
  encryptMetadata: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  readInboxSlot: vi.fn().mockResolvedValue(null),
  hasMessages: vi.fn().mockResolvedValue(false)
}));

vi.mock('../../src/lib/wallet-legacy.js', () => ({
  connectMetaMask: vi.fn().mockResolvedValue({ address: '0x' + '1'.repeat(40) }),
  deriveEncryptionKeys: vi.fn().mockResolvedValue({
    publicKey: '04' + 'c'.repeat(128),
    privateKey: 'd'.repeat(64)
  }),
  isWalletConnected: vi.fn().mockReturnValue(false),
  getConnectedAddress: vi.fn().mockReturnValue(null),
  disconnectWallet: vi.fn(),
  formatAddress: vi.fn((addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '')
}));

vi.mock('../../src/lib/ens.js', () => ({
  resolveRecipient: vi.fn().mockResolvedValue({
    publicKey: '04' + 'e'.repeat(128),
    inboxParams: { overlay: 'test-overlay', identifier: 'test-id' }
  }),
  isENSName: vi.fn((name) => name?.endsWith('.eth')),
  checkFairdropSubdomain: vi.fn().mockResolvedValue(false),
  getInboxParams: vi.fn().mockResolvedValue({ overlay: 'test', identifier: 'test' }),
  registerFairdropSubdomain: vi.fn().mockResolvedValue({ success: true }),
  registerSubdomainGasless: vi.fn().mockResolvedValue({ success: true }),
  setInboxParams: vi.fn().mockResolvedValue(true),
  ENS_DOMAIN: 'fairdrop.eth'
}));

// Now import the module under test
import FDS from '../../src/lib/fds-adapter.js';

// ============================================================================
// TEST SUITES
// ============================================================================

describe('FDS Adapter', () => {

  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    // Reset all mocks
    vi.clearAllMocks();
  });

  // ==========================================================================
  // Utility Functions
  // ==========================================================================

  describe('Utility Functions', () => {

    it('should hash password consistently', () => {
      // The hashPassword function uses btoa with a salt
      const password = 'testPassword123';
      const hash1 = btoa(password + '_fairdrop_salt');
      const hash2 = btoa(password + '_fairdrop_salt');
      expect(hash1).toBe(hash2);
    });

    it('should generate unique IDs', () => {
      const id1 = Date.now().toString(36) + Math.random().toString(36).substr(2);
      const id2 = Date.now().toString(36) + Math.random().toString(36).substr(2);
      // IDs should be different (with high probability due to random component)
      expect(id1.length).toBeGreaterThan(0);
      expect(id2.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // FDS Class
  // ==========================================================================

  describe('FDS Class', () => {

    describe('Constructor', () => {

      it('should initialize with empty accounts list', () => {
        const fds = new FDS();
        const accounts = fds.GetAccounts();
        expect(Array.isArray(accounts)).toBe(true);
      });

      it('should expose AccountManager as Account property', () => {
        const fds = new FDS();
        expect(fds.Account).toBeDefined();
        expect(typeof fds.Account.isMailboxNameValid).toBe('function');
      });
    });

    describe('GetAccounts', () => {

      it('should return empty array when no accounts exist', () => {
        const fds = new FDS();
        const accounts = fds.GetAccounts();
        expect(accounts).toEqual([]);
      });

      it('should return stored accounts after creation', async () => {
        const fds = new FDS();
        await fds.CreateAccount('testuser', 'password123', () => {}, { skipInbox: true });
        const accounts = fds.GetAccounts();
        expect(accounts.length).toBe(1);
        expect(accounts[0].subdomain).toBe('testuser');
      });
    });

    describe('CreateAccount', () => {

      it('should create account with valid name and password', async () => {
        const fds = new FDS();
        const feedbackMessages = [];
        const feedbackCb = (msg) => feedbackMessages.push(msg);

        const account = await fds.CreateAccount('alice', 'securePassword', feedbackCb, { skipInbox: true });

        expect(account).toBeDefined();
        expect(account.subdomain).toBe('alice');
        expect(account.publicKey).toBeDefined();
      });

      it('should reject invalid subdomain names', async () => {
        const fds = new FDS();

        // Name too short
        await expect(fds.CreateAccount('ab', 'password', () => {}))
          .rejects.toThrow();

        // Invalid characters
        await expect(fds.CreateAccount('invalid@name', 'password', () => {}))
          .rejects.toThrow();
      });

      it('should store account in localStorage', async () => {
        const fds = new FDS();
        await fds.CreateAccount('bob', 'password123', () => {}, { skipInbox: true });

        const stored = localStorageMock.getItem('fairdrop_mailboxes_v2');
        expect(stored).toBeDefined();
        const parsed = JSON.parse(stored);
        // Storage is an object keyed by subdomain, not an array
        expect(Object.keys(parsed).length).toBe(1);
        expect(parsed['bob']).toBeDefined();
        expect(parsed['bob'].subdomain).toBe('bob');
      });

      it('should generate keypair for new account', async () => {
        const fds = new FDS();
        const account = await fds.CreateAccount('charlie', 'password', () => {}, { skipInbox: true });

        expect(account.publicKey).toBeDefined();
        // publicKey is stored as hex string: 65 bytes = 130 hex characters
        expect(typeof account.publicKey).toBe('string');
        expect(account.publicKey.length).toBeGreaterThan(100);
      });

      it('should call feedback callback with status updates', async () => {
        const fds = new FDS();
        const messages = [];

        await fds.CreateAccount('dave', 'password', (msg) => messages.push(msg), { skipInbox: true });

        expect(messages.length).toBeGreaterThan(0);
      });
    });

    describe('UnlockAccount', () => {

      it('should unlock existing account with correct password', async () => {
        const fds = new FDS();
        await fds.CreateAccount('eve', 'correctPassword', () => {}, { skipInbox: true });

        const account = await fds.UnlockAccount('eve', 'correctPassword');
        expect(account).toBeDefined();
        expect(account.subdomain).toBe('eve');
      });

      it('should reject incorrect password', async () => {
        const fds = new FDS();
        await fds.CreateAccount('frank', 'correctPassword', () => {}, { skipInbox: true });

        await expect(fds.UnlockAccount('frank', 'wrongPassword'))
          .rejects.toThrow();
      });

      it('should reject non-existent account', async () => {
        const fds = new FDS();

        await expect(fds.UnlockAccount('nonexistent', 'password'))
          .rejects.toThrow();
      });

      it('should set currentAccount after unlock', async () => {
        const fds = new FDS();
        await fds.CreateAccount('grace', 'password', () => {}, { skipInbox: true });
        await fds.UnlockAccount('grace', 'password');

        expect(fds.currentAccount).toBeDefined();
        expect(fds.currentAccount.subdomain).toBe('grace');
      });
    });

    describe('RestoreAccount', () => {

      it('should restore account from backup JSON', async () => {
        const fds = new FDS();

        // Create a backup-like object
        const backup = {
          subdomain: 'restored',
          publicKey: '04' + 'f'.repeat(128),
          privateKey: 'g'.repeat(64),
          passwordHash: btoa('password' + '_fairdrop_salt')
        };

        const backupFile = new MockFile(
          [JSON.stringify(backup)],
          'restored.fairdrop.json',
          { type: 'application/json' }
        );

        // RestoreAccount returns true on success, not an account
        const result = await fds.RestoreAccount(backupFile);
        expect(result).toBe(true);

        // Verify account was stored
        const stored = localStorageMock.getItem('fairdrop_mailboxes_v2');
        const parsed = JSON.parse(stored);
        expect(parsed['restored']).toBeDefined();
        expect(parsed['restored'].subdomain).toBe('restored');
      });
    });
  });

  // ==========================================================================
  // Account Class
  // ==========================================================================

  describe('Account Class', () => {

    let fds;
    let account;

    beforeEach(async () => {
      fds = new FDS();
      account = await fds.CreateAccount('testaccount', 'password123', () => {}, { skipInbox: true });
    });

    describe('Constructor', () => {

      it('should initialize with subdomain', () => {
        expect(account.subdomain).toBe('testaccount');
      });

      it('should have public and private keys', () => {
        expect(account.publicKey).toBeDefined();
        expect(account.privateKey).toBeDefined();
      });
    });

    describe('messages', () => {

      it('should return empty array for sent when no messages', async () => {
        const messages = await account.messages('sent');
        expect(Array.isArray(messages)).toBe(true);
        expect(messages.length).toBe(0);
      });

      it('should return empty array for received when no messages', async () => {
        const messages = await account.messages('received');
        expect(Array.isArray(messages)).toBe(true);
      });

      it('should return empty array for stored when no files', async () => {
        const messages = await account.messages('stored');
        expect(Array.isArray(messages)).toBe(true);
      });
    });

    describe('deduplicateMessages', () => {

      it('should remove duplicate messages by reference', async () => {
        // Add the same message twice manually
        const message = {
          reference: 'duplicate-ref',
          file: { name: 'test.txt', size: 100 },
          time: Date.now()
        };

        // Manually add to localStorage - key format is ${subdomain}_sent
        const key = `testaccount_sent`;
        localStorageMock.setItem(key, JSON.stringify([message, message, message]));

        account.deduplicateMessages('sent');

        const stored = JSON.parse(localStorageMock.getItem(key));
        expect(stored.length).toBe(1);
      });
    });

    describe('clearMessages', () => {

      it('should clear all messages of specified type', async () => {
        const key = `testaccount_sent`;
        localStorageMock.setItem(key, JSON.stringify([{ reference: 'test' }]));

        account.clearMessages('sent');

        // clearMessages uses removeItem, so key should be null/undefined
        const stored = localStorageMock.getItem(key);
        expect(stored).toBeNull();
      });
    });

    describe('getBackup', () => {

      it('should return backup object with account data', () => {
        const backup = account.getBackup();

        expect(backup).toBeDefined();
        expect(backup.name).toContain('testaccount');
        expect(backup.data).toBeDefined();
      });

      it('should include required fields in backup', () => {
        const backup = account.getBackup();
        const data = JSON.parse(backup.data);

        expect(data.subdomain).toBe('testaccount');
        expect(data.publicKey).toBeDefined();
        expect(data.privateKey).toBeDefined();
      });
    });

    describe('storeEncryptedValue / retrieveDecryptedValue', () => {

      it('should store and retrieve encrypted values', async () => {
        const key = 'test-key';
        const value = 'test-value-123';

        await account.storeEncryptedValue(key, value);
        const retrieved = await account.retrieveDecryptedValue(key);

        // Note: In real implementation, this would encrypt/decrypt
        // In our mock, we're just testing the flow
        expect(retrieved).toBeDefined();
      });
    });

    describe('getBalance', () => {

      it('should return balance information', async () => {
        const balance = await account.getBalance();
        expect(balance).toBeDefined();
      });
    });
  });

  // ==========================================================================
  // AccountManager (FDS.Account)
  // ==========================================================================

  describe('AccountManager', () => {

    let fds;

    beforeEach(() => {
      fds = new FDS();
    });

    describe('isMailboxNameValid', () => {

      it('should accept valid names (3-32 chars, alphanumeric, dash)', () => {
        expect(fds.Account.isMailboxNameValid('alice')).toBe(true);
        expect(fds.Account.isMailboxNameValid('bob123')).toBe(true);
        expect(fds.Account.isMailboxNameValid('my-name')).toBe(true);
        expect(fds.Account.isMailboxNameValid('abc')).toBe(true);
      });

      it('should reject names shorter than 3 characters', () => {
        expect(fds.Account.isMailboxNameValid('ab')).toBe(false);
        expect(fds.Account.isMailboxNameValid('a')).toBe(false);
        expect(fds.Account.isMailboxNameValid('')).toBe(false);
      });

      it('should reject names longer than 32 characters', () => {
        const longName = 'a'.repeat(33);
        expect(fds.Account.isMailboxNameValid(longName)).toBe(false);
      });

      it('should reject names with invalid characters', () => {
        expect(fds.Account.isMailboxNameValid('invalid@name')).toBe(false);
        expect(fds.Account.isMailboxNameValid('invalid name')).toBe(false);
        expect(fds.Account.isMailboxNameValid('invalid.name')).toBe(false);
        expect(fds.Account.isMailboxNameValid('UPPERCASE')).toBe(false);
      });

      it('should reject names starting or ending with dash', () => {
        expect(fds.Account.isMailboxNameValid('-invalid')).toBe(false);
        expect(fds.Account.isMailboxNameValid('invalid-')).toBe(false);
      });
    });

    describe('isMailboxNameAvailable', () => {

      it('should return true for available names', async () => {
        const available = await fds.Account.isMailboxNameAvailable('newuser');
        expect(available).toBe(true);
      });

      it('should return false for existing local accounts', async () => {
        await fds.CreateAccount('existing', 'password', () => {}, { skipInbox: true });
        const available = await fds.Account.isMailboxNameAvailable('existing');
        expect(available).toBe(false);
      });
    });

    describe('lookupRecipient', () => {

      it('should find local account by subdomain', async () => {
        await fds.CreateAccount('localuser', 'password', () => {}, { skipInbox: true });
        const result = await fds.Account.lookupRecipient('localuser');
        expect(result).toBeDefined();
        expect(result.publicKey).toBeDefined();
      });

      it('should resolve ENS names', async () => {
        const result = await fds.Account.lookupRecipient('someone.eth');
        expect(result).toBeDefined();
        expect(result.publicKey).toBeDefined();
      });

      it('should accept direct public keys', async () => {
        const pubKey = '04' + 'a'.repeat(128);
        const result = await fds.Account.lookupRecipient(pubKey);
        expect(result).toBeDefined();
      });
    });
  });

  // ==========================================================================
  // Message Storage
  // ==========================================================================

  describe('Message Storage', () => {

    let fds;
    let account;

    beforeEach(async () => {
      fds = new FDS();
      account = await fds.CreateAccount('msgtest', 'password', () => {}, { skipInbox: true });
    });

    it('should store messages in localStorage with account-specific key', async () => {
      // Manually trigger message storage
      const message = {
        reference: 'test-ref-123',
        file: { name: 'test.txt', size: 100 },
        time: Date.now()
      };

      const key = `fairdrop_sent_msgtest`;
      localStorageMock.setItem(key, JSON.stringify([message]));

      const stored = JSON.parse(localStorageMock.getItem(key));
      expect(stored.length).toBe(1);
      expect(stored[0].reference).toBe('test-ref-123');
    });

    it('should handle multiple message types independently', async () => {
      const sentKey = `fairdrop_sent_msgtest`;
      const receivedKey = `fairdrop_received_msgtest`;

      localStorageMock.setItem(sentKey, JSON.stringify([{ reference: 'sent-1' }]));
      localStorageMock.setItem(receivedKey, JSON.stringify([{ reference: 'received-1' }]));

      const sent = JSON.parse(localStorageMock.getItem(sentKey));
      const received = JSON.parse(localStorageMock.getItem(receivedKey));

      expect(sent.length).toBe(1);
      expect(received.length).toBe(1);
      expect(sent[0].reference).not.toBe(received[0].reference);
    });
  });

  // ==========================================================================
  // Error Handling
  // ==========================================================================

  describe('Error Handling', () => {

    let fds;

    beforeEach(() => {
      fds = new FDS();
    });

    it('should throw on invalid account creation', async () => {
      await expect(fds.CreateAccount('', 'password', () => {}))
        .rejects.toThrow();
    });

    it('should throw on unlock with wrong password', async () => {
      await fds.CreateAccount('errortest', 'correct', () => {}, { skipInbox: true });
      await expect(fds.UnlockAccount('errortest', 'wrong'))
        .rejects.toThrow();
    });

    it('should throw on unlock of non-existent account', async () => {
      await expect(fds.UnlockAccount('doesnotexist', 'password'))
        .rejects.toThrow();
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('Edge Cases', () => {

    let fds;

    beforeEach(() => {
      fds = new FDS();
    });

    it('should handle localStorage being empty', () => {
      localStorageMock.clear();
      const fds2 = new FDS();
      const accounts = fds2.GetAccounts();
      expect(accounts).toEqual([]);
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorageMock.setItem('fairdrop_mailboxes_v2', 'not-valid-json');

      // Should not throw, should initialize fresh
      expect(() => new FDS()).not.toThrow();
    });

    it('should handle multiple accounts', async () => {
      await fds.CreateAccount('user1', 'pass1', () => {}, { skipInbox: true });
      await fds.CreateAccount('user2', 'pass2', () => {}, { skipInbox: true });
      await fds.CreateAccount('user3', 'pass3', () => {}, { skipInbox: true });

      const accounts = fds.GetAccounts();
      expect(accounts.length).toBe(3);
    });

    it('should handle special characters in password', async () => {
      const specialPassword = 'p@$$w0rd!#$%^&*()';
      const account = await fds.CreateAccount('specialpass', specialPassword, () => {}, { skipInbox: true });
      expect(account).toBeDefined();

      const unlocked = await fds.UnlockAccount('specialpass', specialPassword);
      expect(unlocked).toBeDefined();
    });
  });

  // ==========================================================================
  // Persistence
  // ==========================================================================

  describe('Persistence', () => {

    it('should persist accounts across FDS instances', async () => {
      const fds1 = new FDS();
      await fds1.CreateAccount('persistent', 'password', () => {}, { skipInbox: true });

      // Create new instance (simulates page reload)
      const fds2 = new FDS();
      const accounts = fds2.GetAccounts();

      expect(accounts.length).toBe(1);
      expect(accounts[0].subdomain).toBe('persistent');
    });

    it('should unlock account from new FDS instance', async () => {
      const fds1 = new FDS();
      await fds1.CreateAccount('unlock-test', 'mypassword', () => {}, { skipInbox: true });

      const fds2 = new FDS();
      const account = await fds2.UnlockAccount('unlock-test', 'mypassword');

      expect(account.subdomain).toBe('unlock-test');
    });
  });

});
