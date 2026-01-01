# Fairdrop

[![Deploy to Production](https://github.com/plur9/Fairdrop/actions/workflows/deploy.yml/badge.svg)](https://github.com/plur9/Fairdrop/actions/workflows/deploy.yml)

A free, decentralized, private and secure file transfer application built on Swarm.

**Live Site:** https://fairdrop.xyz

## Features

- **Decentralized Storage** - Files stored on the Swarm network
- **End-to-End Encryption** - AES-256-GCM with secp256k1 key exchange
- **No Tracking** - Zero personal data collection
- **Private Inbox** - GSOC-based zero-knowledge messaging
- **ENS Identity** - Optional username registration

## Quick Start

```bash
# Clone repository
git clone https://github.com/plur9/Fairdrop.git
cd Fairdrop

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

Open http://localhost:5173

## Requirements

- Node.js 20+
- A Bee node (local or remote)
- Postage stamp for uploads

For local development, install [Swarm Desktop](https://desktop.ethswarm.org/) or run bee-factory.

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](specs/architecture.md) | System overview, components, data flows |
| [API Reference](specs/api-reference.md) | Endpoints, data formats, errors |
| [Security Model](specs/security.md) | Encryption, key management, threats |
| [Environment](specs/environment.md) | Configuration variables |
| [Deployment](DEPLOYMENT.md) | Server setup and operations |

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run test         # E2E tests (Playwright)
npm run test:unit    # Unit tests (Vitest)
```

## Technology Stack

- **Frontend:** React 18, Vite, TailwindCSS
- **Storage:** Swarm (bee-js v10.1.1)
- **Encryption:** @noble/secp256k1, AES-256-GCM
- **Identity:** ENS (ethers.js v6)

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push branch (`git push origin feature/my-feature`)
5. Open Pull Request

For issues, use [GitHub Issues](https://github.com/plur9/Fairdrop/issues).

## Authors

- @significance
- @crtahlin
- @gasperx93

## License

GPL-3.0 License - see [LICENSE](LICENSE) for details.

---

Built by [Datafund](https://datafund.io) for [Fair Data Society](https://fairdatasociety.org)
