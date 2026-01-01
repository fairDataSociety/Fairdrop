/**
 * Mock ENS Registration Server
 *
 * Simulates the gasless ENS registration API for local testing.
 * In production, this would be a real backend service that owns fairdropdev.eth
 * and registers subdomains on behalf of users.
 *
 * Usage:
 *   node tests/mocks/ens-server.js
 *
 * Endpoints:
 *   POST /api/register - Register a subdomain
 *   GET /api/lookup/:username - Look up a registered subdomain
 */

import http from 'http';

// In-memory registry (simulates ENS storage)
const registry = new Map();

const PORT = process.env.ENS_SERVER_PORT || 3002;
const ENS_DOMAIN = process.env.ENS_DOMAIN || 'fairdropdev.eth';

function createMockENSServer(port = PORT) {
  const server = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://localhost:${port}`);

    // POST /api/register - Register subdomain
    if (req.method === 'POST' && url.pathname === '/api/register') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const { username, publicKey, inboxParams } = data;

          if (!username || !publicKey) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing username or publicKey' }));
            return;
          }

          // Check if already registered
          if (registry.has(username.toLowerCase())) {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Username already registered' }));
            return;
          }

          // Register the subdomain
          const ensName = `${username}.${ENS_DOMAIN}`;
          const record = {
            username: username.toLowerCase(),
            ensName,
            publicKey,
            inboxParams,
            registeredAt: new Date().toISOString()
          };

          registry.set(username.toLowerCase(), record);

          console.log(`[ENS Mock] Registered: ${ensName}`);
          console.log(`[ENS Mock]   publicKey: ${publicKey.slice(0, 20)}...`);
          if (inboxParams) {
            console.log(`[ENS Mock]   inboxParams: overlay=${inboxParams.targetOverlay?.slice(0, 10)}...`);
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            ensName,
            txHash: '0x' + Math.random().toString(16).slice(2).padEnd(64, '0')
          }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    // GET /api/lookup/:username - Look up subdomain
    if (req.method === 'GET' && url.pathname.startsWith('/api/lookup/')) {
      const username = url.pathname.split('/')[3]?.toLowerCase();

      if (!username) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing username' }));
        return;
      }

      const record = registry.get(username);

      if (!record) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ exists: false }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        exists: true,
        ensName: record.ensName,
        publicKey: record.publicKey,
        inboxParams: record.inboxParams
      }));
      return;
    }

    // GET /api/list - List all registrations (debug)
    if (req.method === 'GET' && url.pathname === '/api/list') {
      const list = Array.from(registry.values()).map(r => ({
        username: r.username,
        ensName: r.ensName,
        hasInbox: !!r.inboxParams
      }));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ registrations: list, count: list.length }));
      return;
    }

    // Health check
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        domain: ENS_DOMAIN,
        registrations: registry.size
      }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  let actualPort = port;

  return {
    start: () => new Promise((resolve, reject) => {
      server.on('error', reject);
      server.listen(port, () => {
        actualPort = server.address().port;
        console.log(`Mock ENS server running on http://localhost:${actualPort}`);
        console.log(`  Domain: ${ENS_DOMAIN}`);
        console.log(`  POST /api/register - Register subdomain`);
        console.log(`  GET /api/lookup/:username - Look up subdomain`);
        resolve({ server, port: actualPort });
      });
    }),
    stop: () => new Promise((resolve) => {
      server.close(() => {
        console.log('Mock ENS server stopped');
        resolve();
      });
    }),
    getPort: () => actualPort,
    getUrl: () => `http://localhost:${actualPort}`,
    getRegistry: () => registry,
    clearRegistry: () => registry.clear()
  };
}

// CLI: Run standalone
if (process.argv[1].endsWith('ens-server.js')) {
  const server = createMockENSServer();
  server.start().then(() => {
    console.log('Press Ctrl+C to stop');
  });
}

export { createMockENSServer };
export default createMockENSServer;
