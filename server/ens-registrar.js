/**
 * ENS Subdomain Registrar Server
 *
 * Registers subdomains on fairdropdev.eth (or configured domain)
 * and sets public key + inbox params as text records.
 *
 * Requirements:
 * - Private key of the wallet that owns the parent ENS domain
 * - ETH for gas fees
 *
 * Environment variables:
 * - ENS_PRIVATE_KEY: Private key of domain owner (required)
 * - ENS_DOMAIN: Parent domain (default: fairdropdev.eth)
 * - RPC_URL: Ethereum RPC endpoint (default: mainnet)
 * - PORT: Server port (default: 3002)
 *
 * Usage:
 *   ENS_PRIVATE_KEY=0x... node server/ens-registrar.js
 */

import http from 'http';
import { ethers } from 'ethers';

// Configuration
const PORT = process.env.PORT || 3002;
const ENS_DOMAIN = process.env.ENS_DOMAIN || 'fairdropdev.eth';
const RPC_URL = process.env.RPC_URL || 'https://eth.llamarpc.com';
const PRIVATE_KEY = process.env.ENS_PRIVATE_KEY;

// ENS Contract addresses (mainnet)
const ENS_REGISTRY = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';

// ENS text record keys
const FAIRDROP_KEY = 'io.fairdrop.publickey';
const INBOX_OVERLAY_KEY = 'io.fairdrop.inbox.overlay';
const INBOX_ID_KEY = 'io.fairdrop.inbox.id';
const INBOX_PROX_KEY = 'io.fairdrop.inbox.prox';

// ABIs
const ENS_REGISTRY_ABI = [
  'function owner(bytes32 node) view returns (address)',
  'function resolver(bytes32 node) view returns (address)',
  'function setSubnodeRecord(bytes32 node, bytes32 label, address owner, address resolver, uint64 ttl)',
  'function setSubnodeOwner(bytes32 node, bytes32 label, address owner) returns (bytes32)'
];

const RESOLVER_ABI = [
  'function setText(bytes32 node, string key, string value)',
  'function text(bytes32 node, string key) view returns (string)',
  'function setAddr(bytes32 node, address addr)'
];

let provider;
let wallet;
let ensRegistry;
let parentNode;
let parentResolver;

async function initialize() {
  if (!PRIVATE_KEY) {
    console.error('ERROR: ENS_PRIVATE_KEY environment variable is required');
    console.error('Usage: ENS_PRIVATE_KEY=0x... node server/ens-registrar.js');
    process.exit(1);
  }

  provider = new ethers.JsonRpcProvider(RPC_URL);
  wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  ensRegistry = new ethers.Contract(ENS_REGISTRY, ENS_REGISTRY_ABI, wallet);

  // Calculate parent domain namehash
  parentNode = ethers.namehash(ENS_DOMAIN);

  // Verify ownership
  const owner = await ensRegistry.owner(parentNode);
  if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
    console.error(`ERROR: Wallet ${wallet.address} does not own ${ENS_DOMAIN}`);
    console.error(`Owner is: ${owner}`);
    process.exit(1);
  }

  // Get parent resolver
  parentResolver = await ensRegistry.resolver(parentNode);
  if (parentResolver === ethers.ZeroAddress) {
    console.error(`ERROR: ${ENS_DOMAIN} has no resolver set`);
    process.exit(1);
  }

  const balance = await provider.getBalance(wallet.address);
  console.log(`Wallet: ${wallet.address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  console.log(`Domain: ${ENS_DOMAIN}`);
  console.log(`Resolver: ${parentResolver}`);
}

async function registerSubdomain(username, publicKey, inboxParams) {
  const ensName = `${username}.${ENS_DOMAIN}`;
  const labelHash = ethers.keccak256(ethers.toUtf8Bytes(username));
  const subdomainNode = ethers.namehash(ensName);

  console.log(`[ENS] Registering ${ensName}...`);

  // Check if subdomain already exists
  const existingOwner = await ensRegistry.owner(subdomainNode);

  const txs = [];

  // Create subdomain if it doesn't exist
  if (existingOwner === ethers.ZeroAddress) {
    console.log(`[ENS] Creating subdomain...`);
    const tx = await ensRegistry.setSubnodeRecord(
      parentNode,
      labelHash,
      wallet.address, // Owner is registrar (can transfer later)
      parentResolver,
      0 // TTL
    );
    await tx.wait();
    txs.push(tx.hash);
    console.log(`[ENS] Subdomain created: ${tx.hash}`);
  } else if (existingOwner.toLowerCase() !== wallet.address.toLowerCase()) {
    throw new Error(`Subdomain ${ensName} is owned by ${existingOwner}`);
  }

  // Set text records
  const resolver = new ethers.Contract(parentResolver, RESOLVER_ABI, wallet);

  // Set public key
  console.log(`[ENS] Setting public key...`);
  const cleanKey = publicKey.startsWith('0x') ? publicKey : `0x${publicKey}`;
  const tx1 = await resolver.setText(subdomainNode, FAIRDROP_KEY, cleanKey);
  await tx1.wait();
  txs.push(tx1.hash);
  console.log(`[ENS] Public key set: ${tx1.hash}`);

  // Set inbox params if provided
  if (inboxParams) {
    if (inboxParams.targetOverlay) {
      console.log(`[ENS] Setting inbox overlay...`);
      const tx = await resolver.setText(subdomainNode, INBOX_OVERLAY_KEY, inboxParams.targetOverlay);
      await tx.wait();
      txs.push(tx.hash);
    }
    if (inboxParams.baseIdentifier) {
      console.log(`[ENS] Setting inbox ID...`);
      const tx = await resolver.setText(subdomainNode, INBOX_ID_KEY, inboxParams.baseIdentifier);
      await tx.wait();
      txs.push(tx.hash);
    }
    if (inboxParams.proximity) {
      console.log(`[ENS] Setting inbox proximity...`);
      const tx = await resolver.setText(subdomainNode, INBOX_PROX_KEY, inboxParams.proximity.toString());
      await tx.wait();
      txs.push(tx.hash);
    }
  }

  console.log(`[ENS] Registration complete: ${ensName}`);
  return { ensName, txHashes: txs };
}

async function lookupSubdomain(username) {
  const ensName = `${username}.${ENS_DOMAIN}`;
  const subdomainNode = ethers.namehash(ensName);

  const owner = await ensRegistry.owner(subdomainNode);
  if (owner === ethers.ZeroAddress) {
    return { exists: false };
  }

  const resolver = new ethers.Contract(parentResolver, RESOLVER_ABI, provider);

  const [publicKey, overlay, baseId, prox] = await Promise.all([
    resolver.text(subdomainNode, FAIRDROP_KEY).catch(() => null),
    resolver.text(subdomainNode, INBOX_OVERLAY_KEY).catch(() => null),
    resolver.text(subdomainNode, INBOX_ID_KEY).catch(() => null),
    resolver.text(subdomainNode, INBOX_PROX_KEY).catch(() => null)
  ]);

  const result = {
    exists: true,
    ensName,
    owner,
    publicKey: publicKey || null
  };

  if (overlay && baseId) {
    result.inboxParams = {
      targetOverlay: overlay,
      baseIdentifier: baseId,
      proximity: parseInt(prox) || 16,
      recipientPublicKey: publicKey?.replace('0x', '') || null
    };
  }

  return result;
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // POST /api/register
  if (req.method === 'POST' && url.pathname === '/api/register') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { username, publicKey, inboxParams } = JSON.parse(body);

        if (!username || !publicKey) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing username or publicKey' }));
          return;
        }

        // Validate username
        if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(username.toLowerCase())) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid username format' }));
          return;
        }

        const result = await registerSubdomain(username.toLowerCase(), publicKey, inboxParams);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          ensName: result.ensName,
          txHash: result.txHashes[0]
        }));
      } catch (error) {
        console.error('[ENS] Registration error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // GET /api/lookup/:username
  if (req.method === 'GET' && url.pathname.startsWith('/api/lookup/')) {
    const username = url.pathname.split('/')[3]?.toLowerCase();

    if (!username) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing username' }));
      return;
    }

    try {
      const result = await lookupSubdomain(username);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  // Health check
  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
    const balance = await provider.getBalance(wallet.address);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      domain: ENS_DOMAIN,
      wallet: wallet.address,
      balance: ethers.formatEther(balance) + ' ETH'
    }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Start server
initialize().then(() => {
  server.listen(PORT, () => {
    console.log(`\nENS Registrar running on http://localhost:${PORT}`);
    console.log(`  POST /api/register - Register subdomain`);
    console.log(`  GET /api/lookup/:username - Lookup subdomain`);
  });
}).catch(error => {
  console.error('Failed to initialize:', error);
  process.exit(1);
});
