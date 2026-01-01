# Fairdrop Technical Specifications

Technical documentation for Fairdrop - a decentralized, privacy-focused file sharing application built on Swarm.

## Contents

| Document | Description |
|----------|-------------|
| [Architecture](architecture.md) | System overview, components, data flows |
| [API Reference](api-reference.md) | Endpoints, data formats, error handling |
| [Security Model](security.md) | Encryption, key management, threat model |
| [Environment](environment.md) | Configuration variables reference |

## Quick Links

- **Live Site**: https://fairdrop.xyz
- **Repository**: https://github.com/plur9/Fairdrop
- **Deployment Guide**: [DEPLOYMENT.md](../DEPLOYMENT.md)

## Technology Stack

- **Frontend**: React 18, Vite, TailwindCSS
- **Storage**: Swarm (via bee-js v10.1.1)
- **Encryption**: secp256k1 (ECDH), AES-256-GCM
- **Identity**: ENS subdomains on fairdropdev.eth
- **Server**: Caddy (reverse proxy), Bee node

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Fairdrop React SPA                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │    │
│  │  │ Upload   │  │ Download │  │ Account Manager  │   │    │
│  │  │ Manager  │  │ Manager  │  │ (GSOC Inbox)     │   │    │
│  │  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │    │
│  │       │             │                  │             │    │
│  │  ┌────┴─────────────┴──────────────────┴─────────┐  │    │
│  │  │           FDS Adapter / bee-js                │  │    │
│  │  └───────────────────────┬───────────────────────┘  │    │
│  └──────────────────────────┼──────────────────────────┘    │
└─────────────────────────────┼───────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Production Server                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 Caddy Reverse Proxy                  │    │
│  │         fairdrop.xyz → static files                  │    │
│  │         /api/swarm/* → Bee node                      │    │
│  │         /api/register → ENS Registrar                │    │
│  └────┬────────────────────┬────────────────────┬──────┘    │
│       │                    │                    │            │
│       ▼                    ▼                    ▼            │
│  ┌─────────┐        ┌───────────┐        ┌───────────┐      │
│  │ Static  │        │ Bee Node  │        │   ENS     │      │
│  │ Files   │        │ (Swarm)   │        │ Registrar │      │
│  └─────────┘        └─────┬─────┘        └─────┬─────┘      │
│                           │                    │             │
└───────────────────────────┼────────────────────┼─────────────┘
                            │                    │
                            ▼                    ▼
                    ┌───────────────┐    ┌───────────────┐
                    │ Swarm Network │    │   Ethereum    │
                    │  (Storage)    │    │   (ENS)       │
                    └───────────────┘    └───────────────┘
```

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env.local` for development
3. Run `npm install`
4. Run `npm run dev`

See [Environment](environment.md) for configuration details.
