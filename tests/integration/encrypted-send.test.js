/**
 * Integration Tests for Encrypted Send/Receive Flow
 *
 * Tests the complete encrypted file transfer cycle:
 * 1. Create sender and recipient accounts
 * 2. Sender encrypts and uploads file
 * 3. Recipient downloads and decrypts file
 * 4. Verify content matches original
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { createMockSwarmServer } from '../mocks/swarm-server.js';
import { Crypto } from '@peculiar/webcrypto';

// Mock crypto.subtle with @peculiar/webcrypto FIRST (before other globals)
const webcrypto = new Crypto();
vi.stubGlobal('crypto', webcrypto);

// Track mock server URL for redirects
let mockServerUrl = null;

// Mock localStorage for Node.js
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

// Define MockBlob and MockFile BEFORE fetch mock (so they're available for body handling)
class MockBlob {
  constructor(parts, options = {}) {
    this.parts = parts;
    this.type = options.type || '';
    this._buffer = Buffer.concat(parts.map(p => {
      if (Buffer.isBuffer(p)) return p;
      if (p instanceof Uint8Array) return Buffer.from(p);
      if (typeof p === 'string') return Buffer.from(p);
      // Handle nested Blobs (e.g., new File([blob], name))
      if (p instanceof MockBlob) return p._buffer;
      if (p && p._buffer) return p._buffer;  // Duck typing for MockBlob
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

// Store original fetch for mock server
const originalFetch = globalThis.fetch;

// Mock fetch to redirect Bee requests and block ENS/external requests
vi.stubGlobal('fetch', async (url, options = {}) => {
  const urlStr = typeof url === 'string' ? url : url.toString();

  // Handle MockFile/MockBlob body - convert to Buffer for Node.js fetch
  if (options.body && options.body._buffer) {
    options = { ...options, body: options.body._buffer };
  }

  // Handle /api/bee-info relative URL (returns mock overlay for GSOC)
  if (urlStr === '/api/bee-info' || urlStr.endsWith('/api/bee-info')) {
    return new Response(JSON.stringify({
      overlay: 'be8aa29ad80afd4ccbada68360cd1b9d9cf646c7f872268f41f102bbc6223fb5'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Handle /api/free-stamp for sponsored stamp
  if (urlStr === '/api/free-stamp' || urlStr.endsWith('/api/free-stamp')) {
    return new Response(JSON.stringify({
      batchId: 'e171815c1578c7edd80aa441a626f860eb7fc8d43d96e778198e8edec2318059',
      expiresAt: Date.now() + (4 * 24 * 60 * 60 * 1000),
      remainingCapacity: 1000000
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Handle /api/register for ENS subdomain registration (mock success)
  if ((urlStr === '/api/register' || urlStr.endsWith('/api/register')) && options.method === 'POST') {
    const body = JSON.parse(options.body?.toString() || '{}');
    return new Response(JSON.stringify({
      success: true,
      ensName: `${body.username}.fairdropdev.eth`,
      txHash: '0x' + '1'.repeat(64)
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Handle /api/lookup/:username for ENS lookups (mock not found for new users)
  if (urlStr.includes('/api/lookup/')) {
    return new Response(JSON.stringify({
      exists: false
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Redirect localhost:1633 requests to mock server
  if (urlStr.startsWith('http://localhost:1633') && mockServerUrl) {
    const newUrl = urlStr.replace('http://localhost:1633', mockServerUrl);
    return originalFetch(newUrl, options);
  }

  // Block requests to real FDS gateways
  if (urlStr.includes('fairdatasociety.org')) {
    throw new Error('Network request blocked in tests');
  }

  // Block ENS RPC calls - return empty/error responses quickly
  if (urlStr.includes('llamarpc.com') ||
      urlStr.includes('ankr.com') ||
      urlStr.includes('publicnode.com') ||
      urlStr.includes('infura.io') ||
      urlStr.includes('alchemy.com')) {
    // Return a valid JSON-RPC error response
    return new Response(JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      error: { code: -32000, message: 'Test environment - ENS disabled' }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return originalFetch(url, options);
});

describe('Encrypted Send/Receive E2E', () => {
  let mockServer;
  let FDS;
  let fds;
  let alice, bob;
  // Generate unique names for each test run to avoid ENS conflicts
  const testId = Date.now().toString(36).slice(-4);
  const u = (base) => `${base}-${testId}`;

  beforeAll(async () => {
    // Start mock Swarm server
    mockServer = createMockSwarmServer(0);
    const { port } = await mockServer.start();

    // Set mock server URL for fetch redirect
    mockServerUrl = `http://localhost:${port}`;

    // Set environment before importing FDS
    process.env.VITE_BEE_URL = mockServerUrl;

    console.log(`Mock Swarm server running on port ${port}`);

    // Dynamic import FDS after environment setup
    const module = await import('../../src/lib/fds-adapter.js');
    FDS = module.default;
  });

  afterAll(async () => {
    if (mockServer) {
      await mockServer.stop();
    }
  });

  beforeEach(() => {
    // Clear state between tests
    localStorageMock.clear();
    mockServer.clearFiles();
    fds = new FDS();
  });

  describe('Account Creation', () => {
    it('creates accounts with unique keypairs', async () => {
      alice = await fds.CreateAccount(u('alice'), 'password123', () => {});
      bob = await fds.CreateAccount(u('bob'), 'password456', () => {});

      expect(alice.publicKey).toBeDefined();
      expect(bob.publicKey).toBeDefined();
      expect(alice.publicKey).not.toBe(bob.publicKey);
      expect(alice.privateKey).toBeDefined();
      expect(bob.privateKey).toBeDefined();
    }, 30000);

    it('stores accounts in localStorage', async () => {
      const name = u('charlie');
      await fds.CreateAccount(name, 'pass', () => {});

      const stored = JSON.parse(localStorage.getItem('fairdrop_mailboxes_v2'));
      expect(stored[name]).toBeDefined();
      expect(stored[name].publicKey).toBeDefined();
    }, 30000);

    it('can unlock existing account', async () => {
      const name = u('dave');
      await fds.CreateAccount(name, 'secret', () => {});

      const unlocked = await fds.UnlockAccount(name, 'secret');
      expect(unlocked.subdomain).toBe(name);
    }, 30000);
  });

  describe('Encrypted Send', () => {
    let senderName, receiverName;
    beforeEach(async () => {
      // Create fresh accounts for each test (localStorage cleared in parent beforeEach)
      senderName = u('sender');
      receiverName = u('receiver');
      alice = await fds.CreateAccount(senderName, 'pass1', () => {});
      bob = await fds.CreateAccount(receiverName, 'pass2', () => {});
    }, 30000); // Increase timeout for account creation

    it('sender can send encrypted file to receiver', async () => {
      const content = 'Hello receiver, this is a secret message!';
      const file = new MockFile([content], 'secret.txt', { type: 'text/plain' });

      const result = await alice.send(
        receiverName,
        file,
        '/',
        (msg) => console.log('Status:', msg),
        (progress) => console.log('Progress:', progress),
        (msg) => console.log('Complete:', msg)
      );

      expect(result.hash).toBeDefined();
      expect(result.hash.length).toBe(64);

      // Verify file was uploaded to mock server
      const uploadedFiles = mockServer.getUploadedFiles();
      expect(uploadedFiles.size).toBe(1);
    }, 30000);

    it('stores sent message in sender\'s history', async () => {
      const file = new MockFile(['test content'], 'test.txt', { type: 'text/plain' });

      await alice.send(receiverName, file, '/', () => {}, () => {}, () => {});

      const sentMessages = await alice.messages('sent');
      expect(sentMessages.length).toBe(1);
      expect(sentMessages[0].to).toBe(receiverName);
      expect(sentMessages[0].hash.file.name).toBe('test.txt');
    }, 30000);
  });

  describe('Receive and Decrypt', () => {
    let reference;
    let aliceRecvName, bobRecvName;

    beforeEach(async () => {
      // Create accounts and send a message
      aliceRecvName = u('alicerecv');
      bobRecvName = u('bobrecv');
      alice = await fds.CreateAccount(aliceRecvName, 'pass1', () => {});
      bob = await fds.CreateAccount(bobRecvName, 'pass2', () => {});

      const content = 'Secret message for Bob!';
      const file = new MockFile([content], 'secret.txt', { type: 'text/plain' });

      const result = await alice.send(bobRecvName, file, '/', () => {}, () => {}, () => {});
      reference = result.hash;
    }, 60000); // Longer timeout for send operation

    it('bob can receive and decrypt the message', async () => {
      const received = await bob.receiveMessage(reference);

      expect(received.from).toBe(aliceRecvName);
      expect(received.metadata.name).toBe('secret.txt');
      expect(received.file).toBeDefined();
    }, 30000);

    it('decrypted content matches original', async () => {
      const received = await bob.receiveMessage(reference);

      const decryptedText = await received.file.text();
      expect(decryptedText).toBe('Secret message for Bob!');
    }, 30000);

    it('stores received message in bob\'s history', async () => {
      await bob.receiveMessage(reference);

      const receivedMessages = await bob.messages('received');
      expect(receivedMessages.length).toBe(1);
      expect(receivedMessages[0].from).toBe(aliceRecvName);
    }, 30000);

    it('alice cannot decrypt message meant for bob', async () => {
      // This should fail because alice doesn't have bob's private key
      await expect(alice.receiveMessage(reference)).rejects.toThrow();
    }, 30000);
  });

  describe('Multiple Messages', () => {
    it('handles multiple messages between users', async () => {
      const multiAlice = u('multialice');
      const multiBob = u('multibob');
      alice = await fds.CreateAccount(multiAlice, 'pass1', () => {});
      bob = await fds.CreateAccount(multiBob, 'pass2', () => {});

      // Alice sends two messages to Bob
      const file1 = new MockFile(['Message 1'], 'msg1.txt', { type: 'text/plain' });
      const file2 = new MockFile(['Message 2'], 'msg2.txt', { type: 'text/plain' });

      const result1 = await alice.send(multiBob, file1, '/', () => {}, () => {}, () => {});
      const result2 = await alice.send(multiBob, file2, '/', () => {}, () => {}, () => {});

      // Bob receives both
      const received1 = await bob.receiveMessage(result1.hash);
      const received2 = await bob.receiveMessage(result2.hash);

      expect(await received1.file.text()).toBe('Message 1');
      expect(await received2.file.text()).toBe('Message 2');

      // Alice should have 2 sent messages
      const sentMessages = await alice.messages('sent');
      expect(sentMessages.length).toBe(2);
    }, 60000);
  });

  describe('Edge Cases', () => {
    it('handles large files', async () => {
      const largeAlice = u('largealice');
      const largeBob = u('largebob');
      alice = await fds.CreateAccount(largeAlice, 'pass1', () => {});
      bob = await fds.CreateAccount(largeBob, 'pass2', () => {});

      // Create a 100KB file
      const largeContent = 'x'.repeat(100 * 1024);
      const file = new MockFile([largeContent], 'large.txt', { type: 'text/plain' });

      const result = await alice.send(largeBob, file, '/', () => {}, () => {}, () => {});
      const received = await bob.receiveMessage(result.hash);

      const decrypted = await received.file.text();
      expect(decrypted.length).toBe(100 * 1024);
    }, 120000); // Large file needs more time

    it('handles binary files', async () => {
      const binAlice = u('binalice');
      const binBob = u('binbob');
      alice = await fds.CreateAccount(binAlice, 'pass1', () => {});
      bob = await fds.CreateAccount(binBob, 'pass2', () => {});

      // Create binary data
      const binaryData = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const file = new MockFile([binaryData], 'image.png', { type: 'image/png' });

      const result = await alice.send(binBob, file, '/', () => {}, () => {}, () => {});
      const received = await bob.receiveMessage(result.hash);

      const decrypted = new Uint8Array(await received.file.arrayBuffer());
      expect(decrypted).toEqual(binaryData);
    }, 60000);
  });
});
