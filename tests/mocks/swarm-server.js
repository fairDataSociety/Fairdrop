/**
 * Mock Swarm Server for Integration Testing
 *
 * This mock server simulates the Swarm bee gateway API responses
 * for testing upload and download flows without hitting real infrastructure.
 */

import http from 'http';
import crypto from 'crypto';

// Store uploaded files in memory for verification
const uploadedFiles = new Map();

/**
 * Generate a valid-looking Swarm reference (64 hex chars)
 */
function generateReference() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create and start the mock server
 * @param {number} port - Port to listen on (0 for random available port)
 */
export function createMockSwarmServer(port = 0) {
  const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Swarm-Postage-Batch-Id');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://localhost:${port}`);

    // POST /bzz - Upload file
    if (req.method === 'POST' && url.pathname === '/bzz') {
      handleUpload(req, res);
      return;
    }

    // GET /bzz/{reference} - Download file
    if (req.method === 'GET' && url.pathname.startsWith('/bzz/')) {
      handleDownload(req, res, url.pathname);
      return;
    }

    // GET /stamps - List stamps (for local bee check)
    if (req.method === 'GET' && url.pathname === '/stamps') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        stamps: [{
          batchID: 'e171815c1578c7edd80aa441a626f860eb7fc8d43d96e778198e8edec2318059',
          usable: true,
          amount: '1000000000000000',
          depth: 20
        }]
      }));
      return;
    }

    // GET /bytes/{reference} - Download raw data (bee-js downloadData)
    if (req.method === 'GET' && url.pathname.startsWith('/bytes/')) {
      handleBytesDownload(req, res, url.pathname);
      return;
    }

    // GET /chunks/{reference} - Download chunk data (bee-js alternative)
    if (req.method === 'GET' && url.pathname.startsWith('/chunks/')) {
      handleBytesDownload(req, res, url.pathname);
      return;
    }

    // Health check - both /health and / for compatibility
    if (req.method === 'GET' && (url.pathname === '/health' || url.pathname === '/')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', version: 'mock-1.0.0' }));
      return;
    }

    // Unknown endpoint
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found', path: url.pathname }));
  });

  let actualPort = port;

  return {
    start: () => new Promise((resolve, reject) => {
      server.on('error', reject);
      server.listen(port, () => {
        actualPort = server.address().port;
        console.log(`Mock Swarm server running on port ${actualPort}`);
        resolve({ server, port: actualPort });
      });
    }),
    stop: () => new Promise((resolve) => {
      server.close(() => {
        console.log('Mock Swarm server stopped');
        resolve();
      });
    }),
    getPort: () => actualPort,
    getUrl: () => `http://localhost:${actualPort}`,
    getUploadedFiles: () => uploadedFiles,
    clearFiles: () => uploadedFiles.clear()
  };
}

/**
 * Handle file upload
 */
function handleUpload(req, res) {
  const chunks = [];

  console.log(`[Mock] Upload request - Method: ${req.method}, URL: ${req.url}`);
  console.log(`[Mock] Upload headers:`, JSON.stringify(req.headers, null, 2));

  req.on('data', chunk => {
    console.log(`[Mock] Received chunk: ${chunk.length} bytes`);
    chunks.push(chunk);
  });

  req.on('end', () => {
    const buffer = Buffer.concat(chunks);
    const reference = generateReference();

    // Extract filename from query or content-disposition
    const url = new URL(req.url, 'http://localhost');
    const filename = url.searchParams.get('name') || 'uploaded-file';

    // Store the upload
    uploadedFiles.set(reference, {
      data: buffer,
      filename,
      size: buffer.length,
      contentType: req.headers['content-type'] || 'application/octet-stream',
      uploadedAt: new Date().toISOString()
    });

    console.log(`[Mock] Uploaded: ${filename} (${buffer.length} bytes) -> ${reference}`);
    console.log(`[Mock] Data preview:`, buffer.slice(0, 200).toString('utf8'));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ reference }));
  });

  req.on('error', (err) => {
    console.error('[Mock] Upload error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  });
}

/**
 * Handle file download (bzz endpoint - with metadata)
 */
function handleDownload(req, res, pathname) {
  // Extract reference from path: /bzz/{reference} or /bzz/{reference}/{filename}
  const parts = pathname.split('/').filter(Boolean);
  const reference = parts[1]; // bzz is parts[0]

  const file = uploadedFiles.get(reference);

  if (!file) {
    // Return a mock file for testing download UI
    console.log(`[Mock] Download request for unknown reference: ${reference}`);
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="mock-file.txt"`
    });
    res.end('Mock file content for testing');
    return;
  }

  console.log(`[Mock] Downloaded: ${file.filename}`);

  res.writeHead(200, {
    'Content-Type': file.contentType,
    'Content-Disposition': `attachment; filename="${file.filename}"`
  });
  res.end(file.data);
}

/**
 * Handle bytes/chunks download (raw data without metadata)
 */
function handleBytesDownload(req, res, pathname) {
  // Extract reference from path: /bytes/{reference} or /chunks/{reference}
  const parts = pathname.split('/').filter(Boolean);
  const reference = parts[1];

  const file = uploadedFiles.get(reference);

  if (!file) {
    console.log(`[Mock] Bytes download for unknown reference: ${reference}`);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Reference not found' }));
    return;
  }

  console.log(`[Mock] Bytes downloaded: ${reference} (${file.data.length} bytes)`);
  console.log(`[Mock] Data type: ${file.data.constructor.name}`);
  console.log(`[Mock] First 100 bytes:`, file.data.slice(0, 100).toString('utf8'));

  // Ensure we send proper binary data with correct headers
  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Content-Length': file.data.length
  });
  res.end(file.data);
}

// CLI: Run standalone
if (process.argv[1].endsWith('swarm-server.js')) {
  const server = createMockSwarmServer(1633);
  server.start().then(() => {
    console.log('Press Ctrl+C to stop');
  });
}

export default createMockSwarmServer;
