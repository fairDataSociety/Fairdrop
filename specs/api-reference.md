# Fairdrop API Reference

## Overview

Fairdrop exposes several API endpoints through the Caddy reverse proxy. All endpoints are available at `https://fairdrop.xyz/api/`.

## Endpoints

### Swarm Proxy (`/api/swarm/*`)

Proxied Bee node API. Full documentation: [Bee API Reference](https://docs.ethswarm.org/api/)

#### Upload Data

```http
POST /api/swarm/bytes
Content-Type: application/octet-stream
Swarm-Postage-Batch-Id: {stampId}

{binary data}
```

**Response:**
```json
{
  "reference": "a1b2c3d4e5f6..."
}
```

#### Download Data

```http
GET /api/swarm/bytes/{reference}
```

**Response:** Binary data

#### Upload File (with manifest)

```http
POST /api/swarm/bzz?name={filename}
Content-Type: application/octet-stream
Swarm-Postage-Batch-Id: {stampId}

{binary data}
```

**Response:**
```json
{
  "reference": "a1b2c3d4e5f6..."
}
```

#### Download File

```http
GET /api/swarm/bzz/{reference}
```

**Response:** File with appropriate Content-Type

#### Check Connection

```http
GET /api/swarm/
```

**Response:**
```json
{
  "status": "ok",
  "version": "2.6.0",
  ...
}
```

#### Get Node Addresses

```http
GET /api/swarm/addresses
```

**Response:**
```json
{
  "overlay": "a1b2c3...",
  "underlay": [...],
  "ethereum": "0x...",
  "publicKey": "..."
}
```

### Bee Info (`/api/bee-info`)

Returns Bee node overlay address for GSOC operations.

```http
GET /api/bee-info
```

**Response:**
```json
{
  "overlay": "a1b2c3d4e5f6789..."
}
```

### ENS Registration (`/api/register`)

Register a subdomain on `fairdropdev.eth`.

```http
POST /api/register
Content-Type: application/json

{
  "username": "alice",
  "publicKey": "04a1b2c3...",
  "inboxParams": {
    "targetOverlay": "...",
    "baseIdentifier": "...",
    "proximity": 16
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "txHash": "0x...",
  "subdomain": "alice.fairdropdev.eth"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Username already taken"
}
```

### Sponsor API (`/api/free-stamp`)

Get a sponsored postage stamp for uploads (rate limited).

```http
POST /api/free-stamp
Content-Type: application/json

{
  "fileSize": 1048576
}
```

**Response:**
```json
{
  "stampId": "bf9b9eaa988090e6310c8ad9ffd9b04e5de785b80c216c0e45acfa15b19fd6c8",
  "expiresAt": "2025-01-15T00:00:00Z"
}
```

## Data Formats

### Share Link Format

**Unencrypted:**
```
https://fairdrop.xyz/download/{reference}/{filename}?size={bytes}
```

**Encrypted:**
```
https://fairdrop.xyz/download/{reference}/{filename}?size={bytes}&key={ephemeralPubKey}
```

| Parameter | Description |
|-----------|-------------|
| `reference` | 64-character Swarm content hash |
| `filename` | URL-encoded original filename |
| `size` | File size in bytes |
| `key` | Hex-encoded ephemeral public key (encrypted only) |

### GSOC Message Format

Messages written to GSOC inbox slots:

```json
{
  "version": 1,
  "reference": "a1b2c3d4...",
  "timestamp": 1704067200000,
  "encryptedMeta": {
    "ephemeralPublicKey": "04...",
    "ciphertext": "...",
    "iv": "..."
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `version` | number | Protocol version (currently 1) |
| `reference` | string | Swarm reference to uploaded file |
| `timestamp` | number | Unix timestamp (milliseconds) |
| `encryptedMeta` | object | Optional, encrypted sender info |

### Encrypted Metadata

Decrypted `encryptedMeta` contains:

```json
{
  "from": "alice.fairdropdev.eth",
  "filename": "document.pdf"
}
```

### ENS Text Records

Fairdrop stores inbox parameters in ENS text records:

| Key | Value |
|-----|-------|
| `fairdrop.inbox.v2` | JSON-encoded inbox params |
| `fairdrop.publicKey` | Hex-encoded public key |

**Inbox params structure:**
```json
{
  "targetOverlay": "a1b2c3...",
  "baseIdentifier": "0x...",
  "proximity": 16,
  "recipientPublicKey": "04..."
}
```

## Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (invalid parameters) |
| 404 | Not found (invalid reference) |
| 413 | Payload too large |
| 429 | Rate limited |
| 500 | Server error |
| 502 | Bee node unavailable |

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Errors

| Code | Description | Resolution |
|------|-------------|------------|
| `INVALID_REFERENCE` | Swarm reference not found | Check reference format |
| `STAMP_INSUFFICIENT` | Postage stamp depleted | Use fresh stamp |
| `USERNAME_TAKEN` | ENS subdomain exists | Choose different name |
| `RATE_LIMITED` | Too many requests | Wait and retry |
| `BEE_UNAVAILABLE` | Bee node connection failed | Check server status |

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/free-stamp` | 10 | 1 hour |
| `/api/register` | 5 | 1 hour |
| `/api/swarm/*` | 100 | 1 minute |

## Headers

### Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | `application/json` or `application/octet-stream` |
| `Swarm-Postage-Batch-Id` | For uploads | Valid stamp ID |

### Response Headers

| Header | Description |
|--------|-------------|
| `Content-Type` | Response MIME type |
| `Content-Length` | Response size |
| `X-Swarm-Reference` | Swarm reference (for uploads) |

## Examples

### Upload a File

```javascript
const response = await fetch('/api/swarm/bytes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/octet-stream',
    'Swarm-Postage-Batch-Id': stampId
  },
  body: fileData
});

const { reference } = await response.json();
console.log('Uploaded:', reference);
```

### Download a File

```javascript
const response = await fetch(`/api/swarm/bytes/${reference}`);
const data = await response.arrayBuffer();
```

### Register Username

```javascript
const response = await fetch('/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'alice',
    publicKey: '04a1b2c3...',
    inboxParams: { ... }
  })
});

const result = await response.json();
if (result.success) {
  console.log('Registered:', result.subdomain);
}
```

## WebSocket API

The Bee node also exposes WebSocket endpoints for real-time operations:

```
wss://fairdrop.xyz/api/swarm/subscribe/{topic}
```

Currently not used by Fairdrop frontend, but available for future features.

## Related Documentation

- [Architecture](architecture.md) - System overview
- [Security Model](security.md) - Encryption details
- [Bee API Docs](https://docs.ethswarm.org/api/) - Full Swarm API reference
