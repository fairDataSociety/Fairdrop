# Environment Variables Reference

## Overview

Fairdrop uses Vite's environment variable system. Variables prefixed with `VITE_` are embedded into the build and accessible in browser code.

**Files:**
- `.env` - Default values (tracked)
- `.env.local` - Local overrides (gitignored)
- `.env.production` - Production build values (tracked)
- `.env.example` - Template for new setups

## Frontend Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_BEE_URL` | Bee node endpoint | `https://fairdrop.xyz/api/swarm` |
| `VITE_DEFAULT_STAMP_ID` | Postage stamp for uploads | `bf9b9eaa...` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_ENS_REGISTRATION_API` | ENS registrar endpoint | `/api/register` |
| `VITE_SPONSOR_API` | Free stamp endpoint | `/api/free-stamp` |
| `VITE_FDS_GATEWAY` | Fallback gateway | `https://gateway.fairdatasociety.org` |

## Development Configuration

`.env.example` (copy to `.env.local`):

```bash
# Local Bee node (Swarm Desktop or bee-factory)
VITE_BEE_URL=http://localhost:1633

# Local stamp ID (from bee-factory or purchased)
VITE_DEFAULT_STAMP_ID=e171815c1578c7edd80aa441a626f860eb7fc8d43d96e778198e8edec2318059

# FDS Gateway (fallback)
VITE_FDS_GATEWAY=https://gateway.fairdatasociety.org

# Sponsor API
VITE_SPONSOR_API=/api/free-stamp
```

**Development Setup:**
1. Install [Swarm Desktop](https://desktop.ethswarm.org/) or run bee-factory
2. Copy `.env.example` to `.env.local`
3. Update `VITE_DEFAULT_STAMP_ID` with your stamp
4. Run `npm run dev`

## Production Configuration

`.env.production`:

```bash
# Bee Node - Proxied via Caddy
VITE_BEE_URL=https://fairdrop.xyz/api/swarm

# Production stamp ID (purchased on server)
VITE_DEFAULT_STAMP_ID=bf9b9eaa988090e6310c8ad9ffd9b04e5de785b80c216c0e45acfa15b19fd6c8

# ENS Registration API
VITE_ENS_REGISTRATION_API=/api/register

# Sponsor API
VITE_SPONSOR_API=/api/free-stamp
```

## Server-Side Variables

These are used by the ENS Registrar service (not embedded in frontend):

| Variable | Description | Example |
|----------|-------------|---------|
| `PRIVATE_KEY` | Wallet private key for ENS txs | `0x...` |
| `RPC_URL` | Ethereum/Gnosis RPC | `https://rpc.gnosis.gateway.fm` |
| `ENS_DOMAIN` | Parent ENS domain | `fairdropdev.eth` |
| `PORT` | Server port | `3002` |

**ENS Registrar `.env`:**

```bash
# Wallet for signing ENS transactions
PRIVATE_KEY=0x...

# Gnosis Chain RPC
RPC_URL=https://rpc.gnosis.gateway.fm

# Parent domain
ENS_DOMAIN=fairdropdev.eth

# Server port
PORT=3002
```

## Variable Reference by Context

### Browser (Vite Build)

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_BEE_URL` | Yes | Bee API endpoint |
| `VITE_DEFAULT_STAMP_ID` | Yes | Postage stamp for uploads |
| `VITE_ENS_REGISTRATION_API` | No | Username registration |
| `VITE_SPONSOR_API` | No | Free stamps |
| `VITE_FDS_GATEWAY` | No | Fallback gateway |

### Server (ENS Registrar)

| Variable | Required | Purpose |
|----------|----------|---------|
| `PRIVATE_KEY` | Yes | Sign ENS transactions |
| `RPC_URL` | Yes | Blockchain RPC |
| `ENS_DOMAIN` | Yes | Parent domain |
| `PORT` | No | Server port (default: 3002) |

### CI/CD (GitHub Actions)

| Secret | Purpose |
|--------|---------|
| `DEPLOY_KEY` | SSH key for rsync to server |

## Postage Stamps

### What is a Stamp?

Postage stamps prepay for storage on Swarm. Each upload consumes stamp balance.

### Getting a Stamp

**Development (bee-factory):**
```bash
# Create stamp with 10 BZZ, depth 20
curl -X POST http://localhost:1635/stamps/10000000000/20
```

**Production:**
```bash
# Buy stamp via Bee API
curl -X POST http://localhost:1635/stamps/100000000000/24 \
  -H "Content-Type: application/json"
```

### Stamp Properties

| Property | Description |
|----------|-------------|
| `batchId` | 64-character hex identifier |
| `amount` | BZZ deposited (in PLUR) |
| `depth` | Storage capacity (2^depth chunks) |
| `bucketDepth` | Collision resistance |
| `immutable` | If true, cannot add more BZZ |

## Troubleshooting

### "URL is not valid!" Error

Check `VITE_BEE_URL`:
- Must be a full URL with protocol
- Must be reachable from browser
- Check for trailing slashes

```bash
# Verify URL works
curl https://fairdrop.xyz/api/swarm/
```

### "Stamp insufficient" Error

The postage stamp is depleted:
1. Check stamp balance: `GET /stamps/{batchId}`
2. Purchase new stamp
3. Update `VITE_DEFAULT_STAMP_ID`

### ENS Registration Fails

Check server-side variables:
1. Verify `PRIVATE_KEY` has funds on Gnosis Chain
2. Check `RPC_URL` is accessible
3. Verify `ENS_DOMAIN` ownership

## Security Notes

### Sensitive Variables

**Never commit:**
- `PRIVATE_KEY` (ENS registrar wallet)
- `DEPLOY_KEY` (SSH key)

**Safe to commit:**
- `VITE_BEE_URL` (public endpoint)
- `VITE_DEFAULT_STAMP_ID` (stamps are public)
- `VITE_ENS_REGISTRATION_API` (public endpoint)

### Frontend Exposure

All `VITE_*` variables are embedded in the JavaScript bundle:

```javascript
// Accessible in browser console
console.log(import.meta.env.VITE_BEE_URL)
```

Never put secrets in `VITE_*` variables.

## Related Documentation

- [Architecture](architecture.md) - System overview
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Server setup
- [Swarm Docs](https://docs.ethswarm.org/) - Postage stamps
