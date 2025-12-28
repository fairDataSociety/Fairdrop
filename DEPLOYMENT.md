# Fairdrop Deployment

## Production Server

**NOT Vercel** - Uses datacore-campaigns server.

| Setting | Value |
|---------|-------|
| Server | 209.38.243.88 (DO_DROPLET_IP) |
| User | deploy |
| Key | ~/.datacore/env/credentials/deploy_key |
| Site path | /var/www/sites/fairdrop.xyz/ |
| URL | https://fairdrop.xyz |

## Deploy Command

```bash
# Using deploy script (recommended)
~/Data/.datacore/modules/datacore-campaigns/scripts/deploy-site.sh fairdrop.xyz

# Manual deploy
npm run build
scp -i ~/Data/.datacore/env/credentials/deploy_key -r dist/* deploy@209.38.243.88:/var/www/sites/fairdrop.xyz/
```

## Build Output

The build produces files in `dist/` directory which are deployed as a SPA (Single Page Application).

## Workflow

1. Make changes
2. Run tests: `npm run test:unit`
3. Build: `npm run build`
4. Deploy: `~/.datacore/modules/datacore-campaigns/scripts/deploy-site.sh fairdrop.xyz`
5. Verify: `curl -s -o /dev/null -w "%{http_code}" https://fairdrop.xyz`
