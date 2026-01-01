# Fairdrop Security Model

## Overview

Fairdrop provides end-to-end encrypted file sharing using modern cryptographic primitives. This document describes the security model, encryption implementation, and threat model.

## Cryptographic Primitives

| Component | Algorithm | Key Size | Purpose |
|-----------|-----------|----------|---------|
| Key Exchange | ECDH (secp256k1) | 256-bit | Derive shared secrets |
| Encryption | AES-GCM | 256-bit | Symmetric encryption |
| Key Derivation | SHA-256 | 256-bit | Hash ECDH output |
| Random Generation | Web Crypto API | - | Generate keys, IVs |

## Encryption Flow

### Key Generation

```javascript
// Generate secp256k1 keypair
const privateKey = secp256k1.utils.randomSecretKey()  // 32 bytes
const publicKey = secp256k1.getPublicKey(privateKey)  // 33 or 65 bytes
```

Private keys are generated using `crypto.getRandomValues()` via the @noble/secp256k1 library.

### Key Exchange (ECDH)

```javascript
// Derive shared secret
const sharedPoint = secp256k1.getSharedSecret(privateKey, recipientPublicKey)
const sharedSecret = await crypto.subtle.digest('SHA-256', sharedPoint.slice(1))
```

1. Compute ECDH shared point on secp256k1 curve
2. Hash with SHA-256 to get 256-bit symmetric key
3. Slice removes the prefix byte from compressed point

### File Encryption

```
┌─────────────────────────────────────────────────────────────┐
│  plaintext = metadata_length || metadata_json || file_bytes │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  iv = crypto.getRandomValues(12 bytes)                       │
│  key = AES-GCM key from shared secret                        │
│  ciphertext = AES-GCM-256.encrypt(plaintext, key, iv)       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  output = { ephemeralPublicKey, ciphertext, iv }             │
└─────────────────────────────────────────────────────────────┘
```

**Properties:**
- Fresh 12-byte IV per encryption (96 bits, NIST recommendation)
- Authentication tag included in ciphertext (16 bytes)
- Ephemeral keypair per upload (forward secrecy)

## Key Management

### Browser Storage

Private keys are stored in `localStorage`:

```javascript
localStorage.setItem('fairdrop_privateKey', bytesToHex(privateKey))
localStorage.setItem('fairdrop_account', JSON.stringify({
  username: 'alice',
  publicKey: '04...',
  inboxParams: { ... }
}))
```

**Risks:**
- XSS attacks can access localStorage
- Browser extensions may access localStorage
- No encryption at rest

**Mitigations:**
- CSP headers prevent inline scripts
- No third-party scripts loaded
- User advised to backup keys externally

### Key Backup

Users should export their private key for backup:

```javascript
// Export private key (display to user)
const privateKeyHex = bytesToHex(privateKey)

// Import private key (user pastes)
const privateKey = hexToBytes(privateKeyHex)
```

**Best Practices:**
- Store backup offline (paper, hardware wallet)
- Never share private key
- Use strong device password

## GSOC Privacy Model

GSOC (Graffiti Single Owner Chunks) provides a zero-knowledge inbox system.

### Network-Level Anonymity

All senders derive the **same** GSOC key from public parameters:

```javascript
// Both sender A and sender B compute identical key
const gsocKey = bee.gsocMine(targetOverlay, baseIdentifier, proximity)
```

**Result:** Network observers cannot distinguish senders - all writes appear to come from the same address.

### Sender Privacy Modes

| Mode | Recipient Sees | Network Sees |
|------|----------------|--------------|
| Encrypted Send | Sender identity (encrypted) | Anonymous |
| Honest Inbox | Nothing | Anonymous |

**Encrypted Send:**
- Sender info encrypted with recipient's public key
- Only recipient can decrypt to see sender

**Honest Inbox:**
- No sender information included
- Fully anonymous messages

### GSOC Message Flow

```
1. Recipient mines GSOC key for their Bee node's neighborhood
2. Recipient publishes inbox params to ENS
3. Sender fetches params from ENS
4. Sender derives SAME GSOC key
5. Sender writes to indexed slot (0, 1, 2, ...)
6. Recipient polls slots to read messages
```

## Threat Model

### What We Protect Against

| Threat | Protection |
|--------|------------|
| **Passive eavesdropping** | End-to-end encryption (AES-GCM) |
| **Man-in-the-middle** | ECDH key exchange, HTTPS |
| **Server compromise** | No server stores plaintext/keys |
| **Network traffic analysis** | GSOC provides sender anonymity |
| **File content exposure** | Encrypted before upload |
| **Metadata leakage** | Metadata encrypted with file |

### What We Don't Protect Against

| Threat | Risk Level | Notes |
|--------|------------|-------|
| **Compromised browser** | High | XSS, malicious extensions |
| **Compromised device** | High | Keyloggers, malware |
| **Social engineering** | Medium | Phishing for private keys |
| **Traffic timing analysis** | Low | Upload/download patterns |
| **Quantum computing** | Future | secp256k1 vulnerable to Shor's |

### Trust Assumptions

1. **Browser is trusted**: Web Crypto API, JavaScript runtime
2. **Swarm network is available**: No guaranteed uptime
3. **ENS is reliable**: Public key resolution
4. **HTTPS is secure**: TLS 1.3 to server

## Security Properties

### Forward Secrecy

Each file upload uses an ephemeral keypair:

```javascript
const ephemeral = generateKeyPair()  // Fresh for each upload
const sharedSecret = deriveSharedSecret(ephemeral.privateKey, recipientPublicKey)
```

**Benefit:** Compromising a recipient's key doesn't reveal past uploads (unless ephemeral keys were logged).

### Authentication

AES-GCM provides authenticated encryption:
- Ciphertext includes 16-byte authentication tag
- Tampering is detected on decryption
- Wrong key produces authentication failure

### Non-Repudiation

**Not provided.** Fairdrop doesn't implement digital signatures on files:
- Sender cannot prove they sent a file
- Recipient cannot prove who sent a file

This is intentional for privacy.

## Implementation Security

### Dependencies

| Package | Security Notes |
|---------|----------------|
| `@noble/secp256k1` | Audited, constant-time, no dependencies |
| `bee-js` | Official Swarm client |
| `ethers` | Widely audited Ethereum library |

### Code Practices

- No `eval()` or dynamic code execution
- No user input in HTML (React escapes by default)
- CSP headers configured
- Dependencies pinned in package-lock.json

### Browser Compatibility

Web Crypto API required:
- Chrome 37+
- Firefox 34+
- Safari 11+
- Edge 12+

## Operational Security

### Server Security

- Bee node runs as unprivileged user
- Caddy handles TLS termination
- ENS registrar has minimal permissions
- No user data stored on server

### Incident Response

**Key Compromise:**
1. Generate new keypair immediately
2. Update ENS records
3. Notify contacts of new public key
4. Previously encrypted files remain secure

**Server Compromise:**
1. Server has no user keys
2. Previously uploaded files remain encrypted
3. Rotate ENS registrar wallet if compromised

## Recommendations

### For Users

1. **Backup private key** to offline storage
2. **Use strong device password**
3. **Verify recipient** before sharing sensitive files
4. **Use "Honest Inbox"** for maximum anonymity
5. **Don't reuse** the same keypair across services

### For Developers

1. **Keep dependencies updated** (especially bee-js)
2. **Monitor for CVEs** in cryptographic libraries
3. **Audit CSP headers** regularly
4. **Consider hardware key support** (WebAuthn)

## Cryptographic References

- [NIST SP 800-38D](https://csrc.nist.gov/publications/detail/sp/800-38d/final) - AES-GCM
- [SEC 2](https://www.secg.org/sec2-v2.pdf) - secp256k1 curve parameters
- [ECIES](https://en.wikipedia.org/wiki/Integrated_Encryption_Scheme) - Integrated encryption scheme

## Related Documentation

- [Architecture](architecture.md) - System overview
- [API Reference](api-reference.md) - Endpoint documentation
- [encryption.jsx](../src/lib/swarm/encryption.jsx) - Implementation
