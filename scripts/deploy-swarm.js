#!/usr/bin/env node
/**
 * Deploy to Swarm
 *
 * Builds the app and uploads to Swarm network as a manifest.
 * Returns the reference that can be used with gateways.
 *
 * Usage:
 *   node scripts/deploy-swarm.js
 *   node scripts/deploy-swarm.js --stamp <stamp-id>
 *   node scripts/deploy-swarm.js --bee-url http://localhost:1633
 *
 * Access after deploy:
 *   https://gateway.fairdatasociety.org/bzz/<reference>/
 *   https://<reference>.bzz.link/
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const DEFAULT_BEE_URL = process.env.BEE_URL || 'https://bee-1.fairdatasociety.org';
const DIST_DIR = join(__dirname, '..', 'dist');

// Parse arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    beeUrl: DEFAULT_BEE_URL,
    stamp: process.env.SWARM_STAMP || null,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--bee-url':
        config.beeUrl = args[++i];
        break;
      case '--stamp':
        config.stamp = args[++i];
        break;
      case '--verbose':
      case '-v':
        config.verbose = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Deploy Fairdrop to Swarm Network

Usage:
  node scripts/deploy-swarm.js [options]

Options:
  --bee-url <url>    Bee node URL (default: ${DEFAULT_BEE_URL})
  --stamp <id>       Postage stamp ID to use
  --verbose, -v      Verbose output
  --help, -h         Show this help

Environment Variables:
  BEE_URL            Bee node URL
  SWARM_STAMP        Postage stamp ID
        `);
        process.exit(0);
    }
  }

  return config;
}

// Get all files in dist directory
function getFiles(dir, baseDir = dir) {
  const files = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getFiles(fullPath, baseDir));
    } else {
      const relativePath = relative(baseDir, fullPath);
      files.push({
        path: relativePath,
        fullPath,
        size: stat.size
      });
    }
  }

  return files;
}

// Get content type for file
function getContentType(path) {
  const ext = path.split('.').pop().toLowerCase();
  const types = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'svg': 'image/svg+xml',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'ico': 'image/x-icon',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf',
    'eot': 'application/vnd.ms-fontobject'
  };
  return types[ext] || 'application/octet-stream';
}

// Upload a single file
async function uploadFile(beeUrl, file, stamp) {
  const content = readFileSync(file.fullPath);
  const contentType = getContentType(file.path);

  const response = await fetch(`${beeUrl}/bzz?name=${encodeURIComponent(file.path)}`, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      'Swarm-Postage-Batch-Id': stamp
    },
    body: content
  });

  if (!response.ok) {
    throw new Error(`Failed to upload ${file.path}: ${response.status}`);
  }

  const data = await response.json();
  return data.reference;
}

// Upload as tar collection (more efficient for multiple files)
async function uploadCollection(beeUrl, files, stamp, indexDocument = 'index.html') {
  // Create FormData with all files
  const formData = new FormData();

  for (const file of files) {
    const content = readFileSync(file.fullPath);
    const blob = new Blob([content], { type: getContentType(file.path) });
    formData.append('file', blob, file.path);
  }

  const response = await fetch(`${beeUrl}/bzz?name=fairdrop`, {
    method: 'POST',
    headers: {
      'Swarm-Postage-Batch-Id': stamp,
      'Swarm-Index-Document': indexDocument,
      'Swarm-Collection': 'true'
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload failed: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.reference;
}

// Get usable stamp from node
async function getUsableStamp(beeUrl) {
  const response = await fetch(`${beeUrl}/stamps`);
  if (!response.ok) {
    throw new Error('Failed to fetch stamps');
  }

  const data = await response.json();
  const usable = data.stamps?.find(s => s.usable && s.depth >= 20);

  if (!usable) {
    throw new Error('No usable stamp found. Provide one with --stamp or create one on the node.');
  }

  return usable.batchID;
}

// Main
async function main() {
  const config = parseArgs();

  console.log('🐝 Deploying Fairdrop to Swarm...\n');

  // Check dist exists
  try {
    statSync(DIST_DIR);
  } catch {
    console.error('❌ dist/ directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Get stamp
  let stamp = config.stamp;
  if (!stamp) {
    console.log('📮 No stamp provided, checking node...');
    try {
      stamp = await getUsableStamp(config.beeUrl);
      console.log(`   Using stamp: ${stamp.slice(0, 16)}...`);
    } catch (error) {
      console.error(`❌ ${error.message}`);
      process.exit(1);
    }
  }

  // Get files
  const files = getFiles(DIST_DIR);
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  console.log(`\n📁 Files to upload: ${files.length}`);
  console.log(`   Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

  if (config.verbose) {
    files.forEach(f => console.log(`   - ${f.path} (${f.size} bytes)`));
  }

  // Upload
  console.log(`\n⬆️  Uploading to ${config.beeUrl}...`);

  try {
    const reference = await uploadCollection(config.beeUrl, files, stamp);

    console.log('\n✅ Deploy complete!\n');
    console.log('📍 Reference:');
    console.log(`   ${reference}\n`);
    console.log('🌐 Access URLs:');
    console.log(`   https://gateway.fairdatasociety.org/bzz/${reference}/`);
    console.log(`   https://${reference}.bzz.link/`);
    console.log(`   http://localhost:1633/bzz/${reference}/ (local node)\n`);
    console.log('📝 To update fairdrop.eth ENS:');
    console.log(`   node scripts/update-ens-contenthash.js ${reference}`);

    return reference;
  } catch (error) {
    console.error(`\n❌ Deploy failed: ${error.message}`);
    process.exit(1);
  }
}

main().catch(console.error);
