# Fairdrop Architecture

## Overview

Fairdrop is a decentralized, privacy-focused file sharing application built on the Swarm network. It enables users to share files with end-to-end encryption, without centralized servers storing user data.

**Key Properties:**
- Files stored on Swarm (decentralized, censorship-resistant)
- End-to-end encryption using secp256k1 ECDH + AES-256-GCM
- Optional identity via ENS subdomains
- Zero-knowledge inbox system (GSOC)

## System Components

### 1. Frontend (React SPA)

A single-page application built with React 18 and Vite.

**Key Modules:**

| Module | Path | Purpose |
|--------|------|---------|
| Upload Manager | `src/components/upload/` | File selection, encryption, Swarm upload |
| Download Manager | `src/components/download/` | Link parsing, Swarm fetch, decryption |
| Account Manager | `src/components/account/` | Keypair generation, GSOC inbox setup |
| FDS Adapter | `src/lib/fds-adapter.js` | High-level API for Swarm operations |

**Storage Layer (`src/lib/swarm/`):**

| File | Purpose |
|------|---------|
| `client.jsx` | Bee client singleton, connection management |
| `encryption.jsx` | ECDH key exchange, AES-GCM encrypt/decrypt |
| `gsoc.jsx` | GSOC inbox operations (mine, read, write) |
| `upload.jsx` | File upload with chunking |
| `download.jsx` | File download and reassembly |

### 2. Bee Node (Swarm)

Production runs Bee v2.6.0 as a system service.

**Endpoints used:**
- `POST /bytes` - Upload raw data
- `GET /bytes/{reference}` - Download by reference
- `POST /bzz` - Upload files with manifest
- `GET /bzz/{reference}` - Download files
- `GET /addresses` - Node overlay address
- `POST /soc` - Single Owner Chunk operations

### 3. ENS Registrar Service

Node.js service for subdomain registration on `fairdropdev.eth`.

**Flow:**
1. User creates account (generates keypair)
2. Frontend requests subdomain registration
3. Registrar signs and submits ENS transaction
4. User's public key published to ENS text record

### 4. Caddy Reverse Proxy

Routes requests to appropriate backends:

```
fairdrop.xyz/              → Static files (dist/)
fairdrop.xyz/api/swarm/*   → Bee node (localhost:1633)
fairdrop.xyz/api/register  → ENS Registrar (localhost:3002)
fairdrop.xyz/api/bee-info  → Bee info endpoint
fairdrop.xyz/api/free-stamp → Sponsored stamp service
```

## Data Flows

### Upload Flow (Encrypted)

```
┌──────────┐     ┌───────────────┐     ┌───────────┐     ┌─────────────┐
│   User   │────▶│   Encrypt     │────▶│  Upload   │────▶│   Swarm     │
│ (File)   │     │ (AES-GCM)     │     │ (bee-js)  │     │  Network    │
└──────────┘     └───────────────┘     └───────────┘     └─────────────┘
                        │                    │
                        ▼                    ▼
                 Ephemeral Key          Reference
                 (in link)              (64-char hex)
```

1. User selects file
2. Generate ephemeral keypair
3. Derive shared secret (ECDH with recipient public key)
4. Encrypt file + metadata (AES-256-GCM)
5. Upload ciphertext to Swarm
6. Generate share link: `https://fairdrop.xyz/download/{ref}/{filename}?key={ephemeralPubKey}`

### Download Flow (Encrypted)

```
┌───────────┐     ┌───────────────┐     ┌───────────┐     ┌──────────┐
│   Link    │────▶│   Download    │────▶│  Decrypt  │────▶│   User   │
│ (params)  │     │  (bee-js)     │     │ (AES-GCM) │     │  (File)  │
└───────────┘     └───────────────┘     └───────────┘     └──────────┘
      │                  │                    │
      ▼                  ▼                    ▼
  Reference +       Ciphertext          Private Key
  Ephemeral Key     from Swarm          (in browser)
```

1. Parse link parameters (reference, filename, ephemeral key)
2. Download ciphertext from Swarm
3. User provides private key (or uses stored key)
4. Derive shared secret (ECDH)
5. Decrypt and present file

### Account Creation Flow

```
┌──────────┐     ┌───────────────┐     ┌───────────┐     ┌─────────────┐
│   User   │────▶│   Generate    │────▶│   GSOC    │────▶│    ENS      │
│          │     │   Keypair     │     │   Mine    │     │  Register   │
└──────────┘     └───────────────┘     └───────────┘     └─────────────┘
                        │                    │                  │
                        ▼                    ▼                  ▼
                  Private Key           Inbox Params      username.fairdropdev.eth
                 (localStorage)         (ENS record)
```

1. Generate secp256k1 keypair
2. Get Bee node overlay address
3. Mine GSOC key for node's neighborhood (CPU-intensive)
4. Publish inbox params to ENS
5. Store private key in browser localStorage

### GSOC Inbox Flow

GSOC (Graffiti Single Owner Chunks) enables private messaging:

```
  Sender                                           Recipient
    │                                                  │
    │  1. Fetch inbox params from ENS                  │
    │─────────────────────────────────────────────────▶│
    │                                                  │
    │  2. Derive GSOC key (same as recipient mined)    │
    │                                                  │
    │  3. Write message to indexed slot                │
    │─────────────────────▶ Swarm ─────────────────────│
    │                                                  │
    │                        4. Poll slots for messages│
    │                        ◀─────────────────────────│
```

**Privacy Properties:**
- All senders derive identical GSOC key (network anonymity)
- Encrypted metadata reveals sender only to recipient
- "Honest Inbox" mode: fully anonymous (no sender info)

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI framework |
| Vite | 5.x | Build tool |
| bee-js | 10.1.1 | Swarm client |
| ethers.js | 6.16 | Ethereum utilities |
| @noble/secp256k1 | 3.0 | ECDH, signatures |
| Dropzone | 5.9 | File drag-and-drop |

### Backend Services

| Service | Technology | Purpose |
|---------|------------|---------|
| Bee Node | Bee 2.6.0 | Swarm gateway |
| ENS Registrar | Node.js | Subdomain registration |
| Caddy | Caddy 2.x | Reverse proxy, TLS |

### External Dependencies

| Service | Purpose |
|---------|---------|
| Swarm Network | Decentralized file storage |
| Ethereum Mainnet | ENS resolution |
| Gnosis Chain | ENS registration (gas) |

## Network Topology

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Internet                                     │
└──────────────┬───────────────────────────────────────┬──────────────┘
               │                                       │
               ▼                                       ▼
┌──────────────────────────┐              ┌───────────────────────────┐
│     User Browser         │              │    Production Server      │
│                          │              │     164.90.215.90         │
│  ┌────────────────────┐  │    HTTPS     │  ┌─────────────────────┐  │
│  │   Fairdrop SPA     │──┼──────────────┼─▶│    Caddy Proxy      │  │
│  │                    │  │              │  │    fairdrop.xyz     │  │
│  │  - React 18        │  │              │  └──────────┬──────────┘  │
│  │  - bee-js          │  │              │             │             │
│  │  - secp256k1       │  │              │  ┌──────────┼──────────┐  │
│  └────────────────────┘  │              │  │          │          │  │
│                          │              │  ▼          ▼          ▼  │
│  localStorage:           │              │ Static   Bee Node   ENS   │
│  - privateKey            │              │ Files    :1633      Reg   │
│  - accountData           │              │                     :3002 │
└──────────────────────────┘              └───────────────────────────┘
                                                       │
                                                       │
                    ┌──────────────────────────────────┴────────┐
                    │                                           │
                    ▼                                           ▼
          ┌─────────────────┐                        ┌─────────────────┐
          │  Swarm Network  │                        │    Ethereum     │
          │  (p2p storage)  │                        │   (ENS/Gnosis)  │
          └─────────────────┘                        └─────────────────┘
```

## File Storage Format

### Unencrypted Upload

Files uploaded directly to Swarm using `POST /bzz`:

```
Reference: 64-character hex (Swarm content hash)
URL: https://fairdrop.xyz/download/{reference}/{filename}
```

### Encrypted Upload

Encrypted payload structure:

```
┌─────────────────────────────────────────────────────────┐
│  Metadata Length (4 bytes, uint32)                       │
├─────────────────────────────────────────────────────────┤
│  Metadata (JSON)                                         │
│  {                                                       │
│    "name": "document.pdf",                               │
│    "type": "application/pdf",                            │
│    "size": 1234567,                                      │
│    "timestamp": 1704067200000                            │
│  }                                                       │
├─────────────────────────────────────────────────────────┤
│  File Data (raw bytes)                                   │
└─────────────────────────────────────────────────────────┘
          │
          ▼ AES-256-GCM Encryption
┌─────────────────────────────────────────────────────────┐
│  Ciphertext (includes 16-byte auth tag)                  │
└─────────────────────────────────────────────────────────┘
```

Share link includes:
- Swarm reference
- Filename (URL encoded)
- Ephemeral public key (for ECDH)

## Scalability Considerations

### Current Limitations

- Single Bee node (no load balancing)
- Browser-based encryption (CPU limited)
- GSOC mining is CPU-intensive (~seconds)

### Scaling Options

1. **Multiple Bee nodes**: Load balance across nodes
2. **CDN for static files**: Reduce server load
3. **Sponsored stamps pool**: Pre-purchase batch stamps
4. **Worker threads**: Offload encryption to web workers

## Related Documentation

- [API Reference](api-reference.md) - Endpoint documentation
- [Security Model](security.md) - Encryption details, threat model
- [Environment](environment.md) - Configuration reference
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Operational runbook
