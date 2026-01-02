# Fairdrop

Secure file sharing on Swarm - encrypted, decentralized, censorship-resistant.

## Quick Reference

```bash
npm run dev      # Dev server (localhost:3001)
npm run build    # Production build
npm test         # Run Playwright tests
```

## Architecture Overview

```
src/
├── lib/                    # Core logic
│   ├── fds-adapter.js      # Main API adapter (Account + FDS classes)
│   ├── account-manager.js  # AccountManager static methods (extracted)
│   ├── utils.js            # Utilities (hashPassword, generateId, delay)
│   ├── swarm/              # Swarm operations (well-modularized)
│   │   ├── client.jsx      # Bee client singleton
│   │   ├── upload.jsx      # File upload to Swarm
│   │   ├── download.jsx    # File download from Swarm
│   │   ├── encryption.jsx  # libsodium encryption
│   │   ├── stamps.jsx      # Postage stamp management
│   │   ├── gsoc.jsx        # GSOC inbox/messaging
│   │   └── multibox.jsx    # Multi-file operations
│   ├── wallet/             # Wallet abstraction
│   │   ├── index.js        # Unified interface
│   │   ├── external/       # Reown AppKit adapter
│   │   └── embedded/       # Self-custodial wallet
│   ├── wallet-legacy.js    # Old MetaMask integration
│   ├── ens.js              # ENS resolution & subdomains
│   └── beeport/            # Stamp purchases
├── components/             # React UI
│   ├── up/                 # Upload flow wizard
│   │   ├── ASelectFile.js  # Step 1: File selection
│   │   ├── BSelectMailbox.js # Step 2: Account selection (LARGE)
│   │   ├── DConfirm.js     # Step 3: Confirm & encrypt
│   │   ├── EInProgress.js  # Step 4: Upload progress
│   │   └── FCompleted.js   # Step 5: Share link
│   ├── Mailbox.js          # Account management (762 lines - LARGE)
│   ├── Menu.js             # Navigation menu
│   ├── Upload.js           # Upload flow container
│   └── Download.js         # Download page
├── sdk/                    # Agent API (NEW)
│   ├── fairdrop-sdk.js     # Core SDK class
│   ├── operations/         # upload, download, send, inbox
│   └── security/           # Rate limiter, signature validator
└── App.js                  # Main app component
```

## Key Concepts

### Upload Modes

| Mode | Flow | Use Case |
|------|------|----------|
| **Send Encrypted** | File → Encrypt → GSOC inbox | Private transfer to recipient |
| **Store File** | File → Encrypt → Swarm | Personal storage |
| **Quick Share** | File → Swarm (unencrypted) | Public shareable link |

### Account System

- Accounts stored in localStorage (`fairdrop_mailboxes_v2`)
- Each account has: subdomain, keypair (public/private), wallet address
- ENS subdomain: `username.fairdrop.eth` for inbox discovery
- GSOC (Graffiti-based Single Owner Chunk) for decentralized inbox

### Encryption

- **Algorithm**: libsodium secretbox (XSalsa20-Poly1305)
- **Key derivation**: Diffie-Hellman from sender/recipient keypairs
- **File encryption**: Symmetric key derived from shared secret

## File Responsibilities

### Core (needs refactoring)

| File | Lines | Responsibility | Status |
|------|-------|----------------|--------|
| `fds-adapter.js` | 1363 | Everything (accounts, storage, messaging) | SPLIT THIS |
| `Mailbox.js` | 762 | Account UI, inbox, sent, stored | SPLIT THIS |
| `BSelectMailbox.js` | 500+ | Account creation/login UI | Consider splitting |

### Well-Structured

| File | Lines | Responsibility |
|------|-------|----------------|
| `swarm/upload.jsx` | 226 | Single responsibility: upload |
| `swarm/download.jsx` | 222 | Single responsibility: download |
| `swarm/encryption.jsx` | 187 | Single responsibility: crypto |
| `wallet/index.js` | ~100 | Clean abstraction layer |

## Known Issues & Technical Debt

### 1. fds-adapter.js ~~is a God Object~~ (IMPROVED)
**Original**: 1363 lines handling accounts, storage, messaging, state
**Current**: ~1221 lines (Account + FDS classes)
**Extracted**:
- `lib/utils.js` - Utilities (hashPassword, generateId, delay)
- `lib/account-manager.js` - Static account operations
**Status**: Core classes remain coupled due to shared state, but better organized

### 2. Mixed Component Patterns
**Problem**: Class components (App.js, Mailbox.js) mixed with functional
**Status**: Acceptable - class components work, no immediate need to convert

### 3. Large Components
**Problem**: Mailbox.js (762 lines), BSelectMailbox.js (549 lines)
**Status**: Both use shared subcomponents (AddMailbox, UnlockMailbox, SelectRecipient)
**Note**: Further splitting would add complexity without significant benefit

### 4. ~~Incomplete Test Coverage~~ (RESOLVED)
**Added**: `tests/unit/fds-adapter.test.js` with 48 unit tests
**Current**: 72 passing tests across unit, integration, e2e, smoke suites
**Coverage**: FDS class, Account class, AccountManager all tested

### 5. No TypeScript
**Problem**: No type safety, harder to refactor
**Status**: Future consideration, not blocking

## Development Patterns

### Adding New Features

1. Check if `fds-adapter.js` needs changes (probably does)
2. Add to appropriate `swarm/` module if Swarm-related
3. Create new component in `components/`
4. Add CSS to `App.css` (single stylesheet)

### Debugging

```javascript
// Swarm operations log to console with [Swarm] prefix
// GSOC operations log with [GSOC] prefix
// Check Network tab for bee-js requests to gateway
```

### Environment

```
VITE_BEE_URL=https://gateway.fairdatasociety.org  # Default Swarm gateway
VITE_ENS_RPC=https://ethereum.publicnode.com       # ENS resolution
```

## Testing

```bash
npm test                    # All Playwright tests
npm run test:unit          # Unit tests only (if configured)
npx playwright test --ui   # Interactive test runner
```

**Test locations**:
- `tests/unit/` - Pure function tests
- `tests/integration/` - Multi-module tests
- `tests/e2e/` - Full browser tests
- `tests/smoke/` - Real infrastructure tests

## Cleanup Roadmap (Updated 2026-01-02)

### Phase 1: Test Coverage ✅ COMPLETE
- [x] Added 48 unit tests for fds-adapter.js core functions
- [x] All 72 tests passing (unit + integration + e2e + smoke)
- [x] Coverage: FDS class, Account class, AccountManager

### Phase 2: Split fds-adapter.js ✅ COMPLETE
- [x] Extracted `lib/utils.js` (hashPassword, generateId, delay, STORAGE_KEYS)
- [x] Extracted `lib/account-manager.js` (static account operations)
- [x] Reduced fds-adapter.js from 1363 → 1221 lines
- [x] Added named exports for direct access

### Phase 3: Component Review ✅ COMPLETE
- [x] Reviewed Mailbox.js, BSelectMailbox.js structure
- [x] Confirmed both already use shared subcomponents
- [x] Further splitting would add complexity without benefit

### Phase 4: DX Improvements ✅ COMPLETE (2026-01-02)
- [x] Removed unused moment.js dependency
- [x] Added ESLint configuration (.eslintrc.json)
- [x] Added Prettier configuration (.prettierrc)
- [x] Replaced moment.js with native Date functions in Mailbox.js, Utils.js

### Phase 5: Swarm Integration Review ✅ VERIFIED (2026-01-02)
- [x] bee-js already at latest (10.1.1)
- [x] GSOC uses native bee-js methods (gsocMine, gsocSend, makeSOCReader)
- [x] Beeport integration exists (src/lib/beeport/)
- [x] ENS integration follows best practices (ethers v6, text records, gasless API)

**Finding**: GSOC docs recommend `bee.gsocSubscribe()` WebSocket for real-time updates instead of polling. Current `pollInbox()` works but could be optimized in future.

### Phase 6: React Router Upgrade - Deferred
- [ ] Upgrade react-router-dom v5 → v6

**Why deferred**: Routes use regex-like patterns (e.g., `/bzz\:\/.+/`) for Swarm protocol support that React Router v6 doesn't support. Migration requires:
1. Refactoring routes to use multiple Route elements or custom matching
2. Creating withRouter HOC wrapper for class components
3. Updating render props to element props
4. Testing all route combinations including bzz:// protocol routes

**Current status**: v5.3.4 works correctly. Upgrade when time permits.

### Phase 7: Dead Code Removal - Future
- [ ] Reduce verbose console.log statements (51 in fds-adapter)
- [ ] Audit unused exports with `npx knip`
- [ ] Consider code splitting for large chunks (>500KB warning)

## Dependencies

### Core
- `@ethersphere/bee-js` - Swarm client
- `libsodium-wrappers` - Encryption
- `ethers` - Ethereum/wallet operations
- `react-router-dom` - Routing

### New (v3)
- `@reown/appkit` - WalletConnect integration
- `viem` - Modern Ethereum library

## External Services

| Service | Purpose | Config |
|---------|---------|--------|
| Swarm Gateway | File storage | `VITE_BEE_URL` |
| Ethereum RPC | ENS resolution | `VITE_ENS_RPC` |
| Beeport API | Stamp purchases | `lib/beeport/` |

## Related Files

- `CONTINUATION.md` - Testing checklist for v3 features
- `public/manifest.json` - PWA configuration
- `public/sw.js` - Service worker
