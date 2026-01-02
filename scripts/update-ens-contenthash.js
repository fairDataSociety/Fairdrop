#!/usr/bin/env node
/**
 * Update ENS Content Hash
 *
 * Updates the content hash of an ENS domain to point to a Swarm reference.
 * This enables access via fairdrop.eth.limo or any ENS-aware gateway.
 *
 * Usage:
 *   node scripts/update-ens-contenthash.js <swarm-reference>
 *   node scripts/update-ens-contenthash.js <swarm-reference> --domain mydomain.eth
 *   node scripts/update-ens-contenthash.js <swarm-reference> --dry-run
 *
 * Environment:
 *   PRIVATE_KEY - Private key for signing transaction
 *   RPC_URL - Ethereum RPC URL (default: https://eth.drpc.org)
 */

import { ethers } from 'ethers';

// Configuration
const DEFAULT_DOMAIN = 'fairdrop.eth';
const DEFAULT_RPC = process.env.RPC_URL || 'https://eth.drpc.org';

// ENS contracts
const ENS_REGISTRY = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
const PUBLIC_RESOLVER = '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63';

// Parse arguments
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Update ENS Content Hash for Swarm Deployment

Usage:
  node scripts/update-ens-contenthash.js <swarm-reference> [options]

Arguments:
  <swarm-reference>   64-character Swarm hash

Options:
  --domain <name>     ENS domain to update (default: ${DEFAULT_DOMAIN})
  --dry-run           Show what would be done without executing
  --help, -h          Show this help

Environment Variables:
  PRIVATE_KEY         Private key for signing (required)
  RPC_URL             Ethereum RPC URL (default: ${DEFAULT_RPC})

Example:
  PRIVATE_KEY=0x... node scripts/update-ens-contenthash.js abc123...def789
    `);
    process.exit(0);
  }

  const config = {
    reference: null,
    domain: DEFAULT_DOMAIN,
    dryRun: false,
    rpcUrl: DEFAULT_RPC
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      switch (args[i]) {
        case '--domain':
          config.domain = args[++i];
          break;
        case '--dry-run':
          config.dryRun = true;
          break;
        case '--rpc':
          config.rpcUrl = args[++i];
          break;
      }
    } else if (!config.reference) {
      config.reference = args[i];
    }
  }

  if (!config.reference) {
    console.error('❌ Swarm reference required');
    process.exit(1);
  }

  // Validate reference format
  if (!/^[a-fA-F0-9]{64}$/.test(config.reference)) {
    console.error('❌ Invalid Swarm reference. Must be 64 hex characters.');
    process.exit(1);
  }

  return config;
}

// Convert Swarm reference to ENS content hash
function swarmToContentHash(reference) {
  // Content hash format for Swarm:
  // 0xe40101fa011b20 + reference (32 bytes)
  // e4 = multicodec for ipns (we use swarm-manifest)
  // 0101 = CID version 1
  // fa = multicodec for swarm-manifest
  // 011b20 = multihash header (sha256, 32 bytes)

  // Actually for Swarm we use:
  // 0xe40101fa031b20 + reference
  // The 03 indicates swarm-ns

  const prefix = '0xe40101fa031b20';
  return prefix + reference.toLowerCase();
}

// Verify we own the domain
async function verifyOwnership(provider, domain, address) {
  const registry = new ethers.Contract(
    ENS_REGISTRY,
    ['function owner(bytes32 node) view returns (address)'],
    provider
  );

  const node = ethers.namehash(domain);
  const owner = await registry.owner(node);

  if (owner.toLowerCase() !== address.toLowerCase()) {
    throw new Error(`Domain ${domain} is owned by ${owner}, not ${address}`);
  }

  return true;
}

// Get resolver for domain
async function getResolver(provider, domain) {
  const registry = new ethers.Contract(
    ENS_REGISTRY,
    ['function resolver(bytes32 node) view returns (address)'],
    provider
  );

  const node = ethers.namehash(domain);
  const resolverAddr = await registry.resolver(node);

  if (resolverAddr === ethers.ZeroAddress) {
    throw new Error(`No resolver set for ${domain}`);
  }

  return resolverAddr;
}

// Set content hash
async function setContentHash(signer, domain, contentHash) {
  const node = ethers.namehash(domain);
  const resolverAddr = await getResolver(signer.provider, domain);

  const resolver = new ethers.Contract(
    resolverAddr,
    ['function setContenthash(bytes32 node, bytes calldata hash) external'],
    signer
  );

  console.log(`📝 Setting content hash on ${resolverAddr}...`);

  const tx = await resolver.setContenthash(node, contentHash);
  console.log(`   Transaction: ${tx.hash}`);

  const receipt = await tx.wait();
  console.log(`   Confirmed in block ${receipt.blockNumber}`);

  return tx.hash;
}

// Main
async function main() {
  const config = parseArgs();

  console.log('🔗 Updating ENS Content Hash\n');
  console.log(`   Domain: ${config.domain}`);
  console.log(`   Reference: ${config.reference.slice(0, 16)}...${config.reference.slice(-8)}`);

  // Calculate content hash
  const contentHash = swarmToContentHash(config.reference);
  console.log(`   Content Hash: ${contentHash.slice(0, 20)}...`);

  if (config.dryRun) {
    console.log('\n🔍 Dry run - no transaction will be sent\n');
    console.log('Would set content hash to:', contentHash);
    console.log('\nAfter update, accessible at:');
    console.log(`   https://${config.domain.replace('.eth', '')}.eth.limo/`);
    console.log(`   https://${config.domain}.link/`);
    return;
  }

  // Get private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('\n❌ PRIVATE_KEY environment variable required');
    console.error('   Set it to the private key that owns the ENS domain');
    process.exit(1);
  }

  // Connect
  console.log(`\n🌐 Connecting to ${config.rpcUrl}...`);
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);
  const address = await signer.getAddress();
  console.log(`   Wallet: ${address}`);

  // Verify ownership
  console.log(`\n🔐 Verifying ownership of ${config.domain}...`);
  await verifyOwnership(provider, config.domain, address);
  console.log('   ✓ Ownership verified');

  // Set content hash
  console.log('\n📤 Sending transaction...');
  const txHash = await setContentHash(signer, config.domain, contentHash);

  console.log('\n✅ ENS content hash updated!\n');
  console.log('🌐 Your site is now accessible at:');
  console.log(`   https://${config.domain.replace('.eth', '')}.eth.limo/`);
  console.log(`   https://${config.domain}.link/`);
  console.log(`\n   Transaction: https://etherscan.io/tx/${txHash}`);
}

main().catch(error => {
  console.error(`\n❌ Error: ${error.message}`);
  process.exit(1);
});
