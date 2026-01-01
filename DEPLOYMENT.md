# Fairdrop Deployment

## Production Server

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

**NEVER commit private keys, wallet addresses, or domain names to git.**

All secrets are stored on the server only:

| Secret | Location |
|--------|----------|
| ENS registrar config | `/var/www/apps/fairdrop-ens/.env` |
| Bee node config | `/etc/bee/bee.yaml` |

To view current configuration:
```bash
ssh fairdrop
curl -s http://localhost:3002/health | jq  # Shows ENS domain, wallet, balance
```

## Local Development

Use the mock ENS server (no real keys needed):
```bash
npm run dev:full  # Starts Vite + mock ENS server
```

## Deploy Commands

### CI/CD (recommended)

Push to `main` triggers GitHub Actions:
1. Runs tests (unit + E2E)
2. Builds production bundle
3. Creates GitHub Release
4. Deploys to server via SSH

### Manual Deploy

```bash
npm run build
rsync -avz --delete dist/ gregor@fairdrop:/var/www/sites/fairdrop.xyz/
```

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

# Check ENS registrar (shows domain, wallet, balance)
curl -s http://localhost:3002/health | jq
```

## Stamp Management

When stamp expires, buy a new one:

```bash
# On server
curl -s -X POST 'http://localhost:1633/stamps/10000000000/20' | jq

# Get new batch ID from response, update .env.production:
# VITE_DEFAULT_STAMP_ID=<new-batch-id>

# Rebuild and deploy
npm run build && rsync -avz --delete dist/ gregor@fairdrop:/var/www/sites/fairdrop.xyz/
```

## FDS Handoff

When FDS takes over for production:

1. Update ENS domain in `/var/www/apps/fairdrop-ens/.env`
2. Generate new private key, fund wallet with ETH
3. Update `.env.production` if API endpoint changes
4. Transfer `fairdrop.eth` ENS domain to new wallet
