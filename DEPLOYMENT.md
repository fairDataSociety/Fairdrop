# Fairdrop Deployment

## Production Server

Dedicated Fairdrop droplet with local Bee node.

| Setting | Value |
|---------|-------|
| Server | 164.90.215.90 |
| User | gregor |
| SSH Alias | `ssh fairdrop` |
| Site path | /var/www/sites/fairdrop.xyz/ |
| URL | https://fairdrop.xyz |

**Note:** Root login is disabled. Use `gregor` user with sudo.

## Services

| Service | Port | Status Command |
|---------|------|----------------|
| Caddy | 80/443 | `systemctl status caddy` |
| Bee node | 1633 (API), 1634 (P2P) | `systemctl status bee` |
| ENS registrar | 3002 | `systemctl status fairdrop-ens` |

## Credentials & Secrets

### On Server (`/var/www/apps/fairdrop-ens/.env`)

```bash
PORT=3002
ENS_DOMAIN=fairdropdev.eth
RPC_URL=https://ethereum.publicnode.com
ENS_PRIVATE_KEY=0x98f9f4...  # Wallet owning fairdropdev.eth
```

Note: `eth.llamarpc.com` blocks server IPs - use `ethereum.publicnode.com`

### Local Development

When running ENS server locally, export:
```bash
export ENS_PRIVATE_KEY=0x98f9f4ecaf1e78ac861db31dae0264c360e6ec4fba984f429d444af03f0f3996
export ENS_DOMAIN=fairdropdev.eth
export RPC_URL=https://eth.llamarpc.com  # Works from local, blocked from servers
node server/ens-registrar.js
```

### Wallets

| Purpose | Address | Chain | Funded With |
|---------|---------|-------|-------------|
| **ENS registrar** | `0x24A13899c037d60eE13b9Da339286127EfE4640B` | Ethereum Mainnet | ETH (for gas) |
| **Bee node** | `0xa40Ad4ED8Ff369e945e8Bd56CC7c25F1A924CB8E` | Gnosis Chain | xDAI + BZZ |

### Current Stamp

```
Batch ID: bf9b9eaa988090e6310c8ad9ffd9b04e5de785b80c216c0e45acfa15b19fd6c8
TTL: ~4 days (check with: curl http://localhost:1633/stamps)
```

## Deploy Commands

### Quick Deploy (recommended)

```bash
# Build and deploy
npm run build
rsync -avz --delete dist/ gregor@fairdrop:/var/www/sites/fairdrop.xyz/
```

### Git Deploy (auto-build on server)

```bash
git push production main
```

This triggers the post-receive hook which:
1. Checks out code to `/var/www/build/fairdrop`
2. Runs `npm install && npm run build`
3. Syncs to `/var/www/sites/fairdrop.xyz/`

## Server Management

```bash
# SSH to server
ssh fairdrop

# Check all services
systemctl status caddy bee fairdrop-ens

# View logs
journalctl -u bee -f
journalctl -u fairdrop-ens -f

# Check Bee status
curl -s http://localhost:1633/status | jq
curl -s http://localhost:1633/stamps | jq

# Check ENS registrar
curl -s http://localhost:3002/health | jq

# Buy new stamp (when current expires)
curl -s -X POST 'http://localhost:1633/stamps/10000000000/20' | jq
```

## Stamp Management

When stamp expires (~4 days), buy a new one:

```bash
# On server
curl -s -X POST 'http://localhost:1633/stamps/10000000000/20' | jq

# Get new batch ID from response, then update .env.production locally:
# VITE_DEFAULT_STAMP_ID=<new-batch-id>

# Rebuild and deploy
npm run build
rsync -avz --delete dist/ gregor@fairdrop:/var/www/sites/fairdrop.xyz/
```

## FDS Handoff (Before Launch)

When FDS takes over for production:

| Item | Current (Dev) | Production (FDS) |
|------|---------------|------------------|
| ENS domain | `fairdropdev.eth` | `fairdrop.eth` |
| ENS wallet | `0x24A1...40B` | FDS wallet |
| Server | 164.90.215.90 | FDS infra |

Changes needed:
1. Update `ENS_DOMAIN` on server
2. Fund new ENS wallet with ETH
3. Update `.env.production` if API endpoint changes
