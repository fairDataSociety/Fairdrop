/**
 * Smoke Tests - Real Infrastructure
 *
 * These tests hit REAL infrastructure:
 * - Local Bee node (localhost:1633)
 * - Ethereum mainnet ENS (fairdropdev.eth domain)
 *
 * Prerequisites:
 * - Local Bee node running with usable stamp
 * - ENS_OWNER_PRIVATE_KEY env var set (for subdomain registration)
 * - ETH in the owner wallet for gas
 *
 * Run with:
 *   ENS_OWNER_PRIVATE_KEY=0x... npm run test:smoke
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { ethers } from 'ethers';
import { Crypto } from '@peculiar/webcrypto';

// Mock browser globals for Node.js
const webcrypto = new Crypto();
vi.stubGlobal('crypto', webcrypto);

const localStorageMock = {
  store: {},
  getItem: (key) => localStorageMock.store[key] || null,
  setItem: (key, value) => { localStorageMock.store[key] = String(value); },
  removeItem: (key) => { delete localStorageMock.store[key]; },
  clear: () => { localStorageMock.store = {}; }
};
vi.stubGlobal('localStorage', localStorageMock);
vi.stubGlobal('btoa', (str) => Buffer.from(str).toString('base64'));
vi.stubGlobal('atob', (str) => Buffer.from(str, 'base64').toString());

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

// Wrap fetch to handle MockFile/MockBlob body for real HTTP requests
const originalFetch = globalThis.fetch;
vi.stubGlobal('fetch', async (url, options = {}) => {
  // Convert MockFile/MockBlob body to Buffer for Node.js fetch
  if (options.body && options.body._buffer) {
    options = { ...options, body: options.body._buffer };
  }
  return originalFetch(url, options);
});

// ENS Constants
const ENS_DOMAIN = 'fairdropdev.eth';
const FAIRDROP_KEY = 'io.fairdrop.publickey';
const PUBLIC_RESOLVER = '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63';
const ENS_REGISTRY = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
const LOCAL_BEE = 'http://localhost:1633';

// ENS Registry ABI (minimal)
const ENS_REGISTRY_ABI = [
  'function setSubnodeRecord(bytes32 node, bytes32 label, address owner, address resolver, uint64 ttl)',
  'function owner(bytes32 node) view returns (address)'
];

// Public Resolver ABI (minimal)
const RESOLVER_ABI = [
  'function setText(bytes32 node, string key, string value)',
  'function text(bytes32 node, string key) view returns (string)'
];

/**
 * Check if local Bee node is available
 */
async function checkLocalBee() {
  try {
    const response = await fetch(`${LOCAL_BEE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get local Bee stamp
 */
async function getLocalStamp() {
  try {
    const response = await fetch(`${LOCAL_BEE}/stamps`);
    const data = await response.json();
    const usable = data.stamps?.find(s => s.usable);
    return usable?.batchID || null;
  } catch {
    return null;
  }
}

/**
 * Register ENS subdomain and set public key text record
 */
async function registerSubdomainWithPublicKey(username, publicKey, signer) {
  const ensName = `${username}.${ENS_DOMAIN}`;
  const parentNode = ethers.namehash(ENS_DOMAIN);
  const labelHash = ethers.keccak256(ethers.toUtf8Bytes(username));
  const subdomainNode = ethers.namehash(ensName);

  const registry = new ethers.Contract(ENS_REGISTRY, ENS_REGISTRY_ABI, signer);
  const resolver = new ethers.Contract(PUBLIC_RESOLVER, RESOLVER_ABI, signer);

  // Check if subdomain already exists
  const existingOwner = await registry.owner(subdomainNode);
  const signerAddress = await signer.getAddress();

  if (existingOwner === ethers.ZeroAddress) {
    // Create subdomain
    console.log(`Creating subdomain: ${ensName}`);
    const tx = await registry.setSubnodeRecord(
      parentNode,
      labelHash,
      signerAddress,
      PUBLIC_RESOLVER,
      0
    );
    await tx.wait();
    console.log(`Subdomain created: ${ensName}`);
  } else {
    console.log(`Subdomain already exists: ${ensName} (owner: ${existingOwner})`);
  }

  // Set public key text record
  console.log(`Setting public key for ${ensName}`);
  const tx = await resolver.setText(subdomainNode, FAIRDROP_KEY, publicKey);
  await tx.wait();
  console.log(`Public key set for ${ensName}`);

  return { ensName, subdomainNode };
}

/**
 * Look up public key from ENS
 */
async function lookupPublicKey(ensName, provider) {
  const resolver = new ethers.Contract(PUBLIC_RESOLVER, RESOLVER_ABI, provider);
  const node = ethers.namehash(ensName);
  const publicKey = await resolver.text(node, FAIRDROP_KEY);
  return publicKey || null;
}

describe('Real Infrastructure Smoke Tests', () => {
  let beeAvailable = false;
  let stampId = null;
  let provider;
  let signer;
  let FDS;
  let fds;

  beforeAll(async () => {
    // Check local Bee
    beeAvailable = await checkLocalBee();
    if (beeAvailable) {
      stampId = await getLocalStamp();
    }

    // Set environment for FDS adapter
    process.env.VITE_BEE_URL = LOCAL_BEE;
    process.env.VITE_DEFAULT_STAMP_ID = stampId;
    process.env.VITE_ENS_DOMAIN = ENS_DOMAIN;

    // Setup Ethereum provider/signer if private key available
    if (process.env.ENS_OWNER_PRIVATE_KEY) {
      provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
      signer = new ethers.Wallet(process.env.ENS_OWNER_PRIVATE_KEY, provider);
      console.log(`ENS signer: ${await signer.getAddress()}`);
    }

    // Import FDS after env setup
    const module = await import('../../src/lib/fds-adapter.js');
    FDS = module.default;
    fds = new FDS();
  });

  describe('Local Bee Node', () => {
    it('local Bee is running', async () => {
      expect(beeAvailable).toBe(true);
    });

    it('has usable postage stamp', async () => {
      expect(stampId).toBeDefined();
      expect(stampId).toHaveLength(64);
    });

    it('can upload and download file', async () => {
      if (!beeAvailable || !stampId) {
        console.log('Skipping: Local Bee not available');
        return;
      }

      const content = `Test content ${Date.now()}`;
      const response = await fetch(`${LOCAL_BEE}/bzz?name=test.txt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Swarm-Postage-Batch-Id': stampId
        },
        body: content
      });

      expect(response.ok).toBe(true);
      const { reference } = await response.json();
      expect(reference).toHaveLength(64);

      // Download
      const downloadResponse = await fetch(`${LOCAL_BEE}/bzz/${reference}`);
      expect(downloadResponse.ok).toBe(true);
      const downloaded = await downloadResponse.text();
      expect(downloaded).toBe(content);
    });
  });

  describe('Account Creation with Real Bee', () => {
    it('creates account with keypair', async () => {
      if (!beeAvailable) {
        console.log('Skipping: Local Bee not available');
        return;
      }

      localStorageMock.clear();
      const account = await fds.CreateAccount('smoketest', 'password123', () => {});

      expect(account.subdomain).toBe('smoketest');
      expect(account.publicKey).toBeDefined();
      expect(account.publicKey).toHaveLength(66); // Compressed secp256k1
      expect(account.privateKey).toBeDefined();
    });

    it('can send encrypted file via real Bee', async () => {
      if (!beeAvailable) {
        console.log('Skipping: Local Bee not available');
        return;
      }

      localStorageMock.clear();
      const alice = await fds.CreateAccount('alice', 'pass1', () => {});
      const bob = await fds.CreateAccount('bob', 'pass2', () => {});

      const content = 'Real smoke test message!';
      const file = new MockFile([content], 'smoke.txt', { type: 'text/plain' });

      const result = await alice.send('bob', file, '/', () => {}, () => {}, () => {});

      expect(result.hash).toBeDefined();
      expect(result.hash).toHaveLength(64);

      // Bob can receive and decrypt
      const received = await bob.receiveMessage(result.hash);
      expect(received.from).toBe('alice');
      expect(await received.file.text()).toBe(content);
    }, 60000);
  });

  describe('ENS Integration', () => {
    const testUsername = `test${Date.now() % 10000}`;

    it('can resolve ENS domain owner', async () => {
      if (!provider) {
        console.log('Skipping: No provider (need ENS_OWNER_PRIVATE_KEY)');
        return;
      }

      const registry = new ethers.Contract(ENS_REGISTRY, ENS_REGISTRY_ABI, provider);
      const owner = await registry.owner(ethers.namehash(ENS_DOMAIN));

      console.log(`${ENS_DOMAIN} owner: ${owner}`);
      expect(owner).not.toBe(ethers.ZeroAddress);
    });

    it('can register subdomain and set public key', async () => {
      if (!signer) {
        console.log('Skipping: No signer (need ENS_OWNER_PRIVATE_KEY with ETH)');
        return;
      }

      // Create account to get public key
      localStorageMock.clear();
      const account = await fds.CreateAccount(testUsername, 'pass', () => {});

      // Register on ENS
      const result = await registerSubdomainWithPublicKey(
        testUsername,
        account.publicKey,
        signer
      );

      expect(result.ensName).toBe(`${testUsername}.${ENS_DOMAIN}`);

      // Verify by lookup
      const lookedUp = await lookupPublicKey(result.ensName, provider);
      expect(lookedUp).toBe(account.publicKey);
    }, 120000);

    it('can look up existing Fairdrop public key', async () => {
      if (!provider) {
        console.log('Skipping: No provider');
        return;
      }

      // This test assumes the previous test created a subdomain
      // Or you can test with a known subdomain
      const ensName = `${testUsername}.${ENS_DOMAIN}`;
      const publicKey = await lookupPublicKey(ensName, provider);

      if (publicKey) {
        console.log(`Found public key for ${ensName}: ${publicKey.slice(0, 20)}...`);
        expect(publicKey).toHaveLength(66);
      } else {
        console.log(`No public key found for ${ensName} (expected if first run)`);
      }
    });
  });

  describe('Full E2E with ENS', () => {
    it('alice sends to bob via ENS name', async () => {
      if (!signer || !beeAvailable) {
        console.log('Skipping: Need signer and local Bee');
        return;
      }

      localStorageMock.clear();

      // Create accounts
      const alice = await fds.CreateAccount('aliceens', 'pass1', () => {});
      const bob = await fds.CreateAccount('bobens', 'pass2', () => {});

      // Register bob on ENS
      await registerSubdomainWithPublicKey('bobens', bob.publicKey, signer);

      // Alice sends to bob via ENS name
      const content = 'Message via ENS lookup!';
      const file = new MockFile([content], 'ens-test.txt', { type: 'text/plain' });

      // Send using ENS name
      const result = await alice.send(`bobens.${ENS_DOMAIN}`, file, '/', () => {}, () => {}, () => {});

      expect(result.hash).toBeDefined();

      // Bob receives
      const received = await bob.receiveMessage(result.hash);
      expect(await received.file.text()).toBe(content);

      console.log('Full E2E with ENS: SUCCESS');
    }, 180000);
  });
});
