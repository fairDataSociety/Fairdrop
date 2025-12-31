/**
 * FDS Adapter - Maps legacy FDS API to modern Swarm library
 *
 * This adapter provides backward compatibility with the 2020 Fairdrop UI
 * while using bee-js and the modern Swarm library under the hood.
 */

import { uploadFile, uploadData, getShareableLink, getGatewayLink } from './swarm/upload';
import { downloadFile, downloadData, triggerDownload } from './swarm/download';
import { generateKeyPair, encryptFile, decryptFile, encryptData, decryptData, hexToBytes, bytesToHex } from './swarm/encryption';
import { getAllStamps, getStamp, requestSponsoredStamp, isStampUsable } from './swarm/stamps';
import { getBeeUrl } from './swarm/client';
import { connectMetaMask, deriveEncryptionKeys, isWalletConnected, getConnectedAddress, disconnectWallet, formatAddress } from './wallet';
import { resolveRecipient, isENSName, checkFairdropSubdomain } from './ens';

// Storage keys
const STORAGE_KEYS = {
  MAILBOXES: 'fairdrop_mailboxes_v2',
  APP_STATE: 'fairdrop_app_state_v2'
};

/**
 * Utility: Simple password hashing (for local storage only, not cryptographic security)
 */
function hashPassword(password) {
  return btoa(password + '_fairdrop_salt');
}

/**
 * Utility: Generate unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Utility: Delay helper
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Account class - represents a single mailbox/account
 */
class Account {
  constructor(data) {
    this.subdomain = data.subdomain;
    this.publicKey = data.publicKey;
    this.privateKey = data.privateKey;
    this.passwordHash = data.passwordHash;
    this.created = data.created || Date.now();

    // Message storage keys
    this._sentKey = `${this.subdomain}_sent`;
    this._receivedKey = `${this.subdomain}_received`;
    this._storedKey = `${this.subdomain}_stored`;
    this._valuesKey = `${this.subdomain}_values`;
  }

  /**
   * Send encrypted file to recipient
   */
  async send(recipient, file, path, feedbackCb, progressCb, completeCb) {
    try {
      feedbackCb?.('Looking up recipient...');

      // Look up recipient's public key
      const recipientPubKey = await this._lookupPublicKey(recipient);
      if (!recipientPubKey) {
        throw new Error(`Recipient "${recipient}" not found`);
      }

      feedbackCb?.('Encrypting file...');
      progressCb?.(10);

      // Encrypt file with recipient's public key
      const encrypted = await encryptFile(file, hexToBytes(recipientPubKey));
      progressCb?.(30);

      feedbackCb?.('Uploading to Swarm...');

      // Create payload with encrypted data and metadata
      const payload = {
        version: 1,
        type: 'encrypted-file',
        from: this.subdomain,
        fromPublicKey: this.publicKey,
        to: recipient,
        ephemeralPublicKey: bytesToHex(encrypted.ephemeralPublicKey),
        iv: bytesToHex(encrypted.iv),
        ciphertext: bytesToHex(encrypted.ciphertext),
        filename: file.name,
        size: file.size,
        timestamp: Date.now()
      };

      // Upload payload to Swarm
      const payloadBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      const reference = await uploadFile(new File([payloadBlob], 'message.json'), {
        onProgress: (p) => progressCb?.(30 + p * 0.6),
        onStatusChange: (s) => feedbackCb?.(s === 'uploading' ? 'Uploading...' : s)
      });

      progressCb?.(100);
      feedbackCb?.('File sent!');
      completeCb?.('File sent successfully!');

      // Store in sent messages
      const message = this._createMessage(reference, file, 'encrypted', recipient);
      this._addMessage('sent', message);

      return { hash: reference };
    } catch (error) {
      console.error('Send error:', error);
      throw error;
    }
  }

  /**
   * Store encrypted file (for self)
   */
  async store(file, path, feedbackCb, progressCb, meta, pinned, encrypted) {
    try {
      feedbackCb?.('Encrypting file...');
      progressCb?.(10);

      // Encrypt with own public key
      const encryptedData = await encryptFile(file, hexToBytes(this.publicKey));
      progressCb?.(30);

      feedbackCb?.('Uploading to Swarm...');

      // Create stored file payload
      const payload = {
        version: 1,
        type: 'stored-file',
        owner: this.subdomain,
        ephemeralPublicKey: bytesToHex(encryptedData.ephemeralPublicKey),
        iv: bytesToHex(encryptedData.iv),
        ciphertext: bytesToHex(encryptedData.ciphertext),
        filename: file.name,
        size: file.size,
        contentType: file.type,
        timestamp: Date.now(),
        meta: meta || {}
      };

      const payloadBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      const reference = await uploadFile(new File([payloadBlob], 'stored.json'), {
        onProgress: (p) => progressCb?.(30 + p * 0.6),
        onStatusChange: (s) => feedbackCb?.(s === 'uploading' ? 'Uploading...' : s)
      });

      progressCb?.(100);
      feedbackCb?.('File stored!');

      // Store in stored files
      const storedFile = {
        reference,
        filename: file.name,
        size: file.size,
        contentType: file.type,
        timestamp: Date.now(),
        meta: { pinned: pinned || false, ...meta },
        hash: {
          file: { name: file.name, size: file.size, type: file.type },
          address: reference,
          time: Date.now()
        }
      };
      this._addMessage('stored', storedFile);

      return { hash: reference };
    } catch (error) {
      console.error('Store error:', error);
      throw error;
    }
  }

  /**
   * Get messages of specified type
   */
  async messages(type, path) {
    // Map type to storage key
    const key = type === 'sent' ? this._sentKey :
                type === 'received' ? this._receivedKey :
                path?.includes('consents') ? `${this.subdomain}_consents` :
                this._receivedKey;

    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get stored files
   */
  async stored() {
    try {
      const stored = localStorage.getItem(this._storedKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get account balance (returns stamp capacity)
   */
  async getBalance() {
    try {
      const stamps = await getAllStamps();
      if (stamps.length === 0) return 0;

      // Return total capacity across usable stamps
      const usableStamps = stamps.filter(s => s.usable);
      return usableStamps.length * 1000000; // Arbitrary units
    } catch {
      return 0;
    }
  }

  /**
   * Get stored manifest (for dashboard stats)
   */
  async storedManifest() {
    const storedFiles = await this.stored();
    return {
      storedFiles: storedFiles.map(f => ({
        file: { name: f.filename, size: f.size },
        meta: f.meta || {},
        hash: f.reference
      }))
    };
  }

  /**
   * Retrieve encrypted value (key-value store)
   */
  async retrieveDecryptedValue(key) {
    try {
      const values = JSON.parse(localStorage.getItem(this._valuesKey) || '{}');
      if (values[key] !== undefined) {
        return values[key];
      }
      const error = new Error('Not found');
      error.response = { status: 404 };
      throw error;
    } catch (e) {
      if (e.response?.status === 404) throw e;
      const error = new Error('Not found');
      error.response = { status: 404 };
      throw error;
    }
  }

  /**
   * Store encrypted value
   */
  async storeEncryptedValue(key, value) {
    try {
      const values = JSON.parse(localStorage.getItem(this._valuesKey) || '{}');
      values[key] = value;
      localStorage.setItem(this._valuesKey, JSON.stringify(values));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get backup data for export
   */
  getBackup() {
    return {
      name: `${this.subdomain}-backup.json`,
      data: JSON.stringify({
        subdomain: this.subdomain,
        publicKey: this.publicKey,
        privateKey: this.privateKey,
        created: this.created
      })
    };
  }

  // Private helper methods

  async _lookupPublicKey(recipient) {
    // First check local mailboxes
    const mailboxes = JSON.parse(localStorage.getItem(STORAGE_KEYS.MAILBOXES) || '{}');
    if (mailboxes[recipient]) {
      return mailboxes[recipient].publicKey;
    }

    // If recipient looks like a hex public key, use it directly
    if (recipient.length === 66 && recipient.startsWith('0x')) {
      return recipient.slice(2);
    }
    if (recipient.length === 64 && /^[a-fA-F0-9]+$/.test(recipient)) {
      return recipient;
    }

    // Try ENS resolution (supports ENS names and fairdrop.eth subdomains)
    try {
      const result = await resolveRecipient(recipient);
      if (result.publicKey) {
        console.log(`[ENS] Resolved ${recipient} via ${result.method}${result.ensName ? ` (${result.ensName})` : ''}`);
        return result.publicKey;
      }
      if (result.method === 'ens-no-key' || result.method === 'fairdrop-no-key') {
        console.log(`[ENS] Found ${result.ensName} but no Fairdrop public key set`);
      }
    } catch (error) {
      console.error('[ENS] Resolution error:', error);
    }

    return null;
  }

  _createMessage(reference, file, type, recipient) {
    return {
      reference,
      filename: file.name,
      size: file.size,
      type,
      from: this.subdomain,
      to: recipient,
      timestamp: Date.now(),
      hash: {
        file: { name: file.name, size: file.size, type: file.type },
        address: reference,
        time: Date.now()
      }
    };
  }

  _addMessage(type, message) {
    const key = type === 'sent' ? this._sentKey :
                type === 'received' ? this._receivedKey :
                this._storedKey;

    try {
      const messages = JSON.parse(localStorage.getItem(key) || '[]');
      messages.unshift(message); // Add to beginning
      localStorage.setItem(key, JSON.stringify(messages.slice(0, 100))); // Keep last 100
    } catch (e) {
      console.error('Error saving message:', e);
    }
  }
}

/**
 * AccountManager - Static methods for account operations
 */
class AccountManager {
  static isMailboxNameValid(name) {
    if (!name || typeof name !== 'string') return false;
    if (name.length < 3 || name.length > 32) return false;
    return /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(name);
  }

  static async isMailboxNameAvailable(name) {
    // Check local registry
    const mailboxes = JSON.parse(localStorage.getItem(STORAGE_KEYS.MAILBOXES) || '{}');
    if (mailboxes[name]) {
      return false;
    }

    // Check if fairdrop.eth subdomain is taken
    try {
      const result = await checkFairdropSubdomain(name);
      if (result.exists) {
        console.log(`[ENS] Subdomain ${result.ensName} already registered`);
        return false;
      }
    } catch (error) {
      // ENS check failed, allow registration locally
      console.error('[ENS] Availability check error:', error);
    }

    return true;
  }

  /**
   * Look up a recipient's public key
   * Used for validating recipients before sending
   * @param {string} recipient - Mailbox name, ENS name, or public key
   * @returns {Promise<{exists: boolean, publicKey: string|null}>}
   */
  static async lookupRecipient(recipient) {
    // First check local mailboxes
    const mailboxes = JSON.parse(localStorage.getItem(STORAGE_KEYS.MAILBOXES) || '{}');
    if (mailboxes[recipient]) {
      return { exists: true, publicKey: mailboxes[recipient].publicKey };
    }

    // If recipient looks like a hex public key, use it directly
    if (recipient.length === 66 && recipient.startsWith('0x')) {
      return { exists: true, publicKey: recipient.slice(2) };
    }
    if (recipient.length === 64 && /^[a-fA-F0-9]+$/.test(recipient)) {
      return { exists: true, publicKey: recipient };
    }

    // Try ENS resolution
    try {
      const result = await resolveRecipient(recipient);
      if (result.publicKey) {
        console.log(`[ENS] Resolved ${recipient} via ${result.method}${result.ensName ? ` (${result.ensName})` : ''}`);
        return { exists: true, publicKey: result.publicKey };
      }
      if (result.method === 'ens-no-key' || result.method === 'fairdrop-no-key') {
        console.log(`[ENS] Found ${result.ensName} but no Fairdrop public key set`);
        return { exists: false, publicKey: null, reason: 'no-public-key' };
      }
    } catch (error) {
      console.error('[ENS] Resolution error:', error);
    }

    return { exists: false, publicKey: null };
  }

  static Store = {
    /**
     * Upload files without encryption (quick upload)
     */
    async storeFilesUnencrypted(files, progressCallback, statusCallback) {
      console.log('[FDS Adapter] storeFilesUnencrypted called with', files.length, 'files');
      try {
        const file = files[0]; // Handle first file
        console.log('[FDS Adapter] Uploading file:', file.name, file.size);
        statusCallback?.('Uploading to Swarm...');

        const reference = await uploadFile(file, {
          onProgress: (p) => progressCallback?.(p),
          onStatusChange: (s) => statusCallback?.(s)
        });

        console.log('[FDS Adapter] Upload complete, reference:', reference);
        statusCallback?.('Upload complete!');
        progressCallback?.(100);

        const result = {
          address: reference,
          file: {
            name: file.name,
            size: file.size,
            type: file.type
          }
        };
        console.log('[FDS Adapter] Returning:', result);
        return result;
      } catch (error) {
        console.error('[FDS Adapter] Unencrypted upload error:', error);
        throw error;
      }
    }
  };
}

/**
 * FDS Main Class - Entry point for all FDS operations
 */
class FDS {
  constructor(config) {
    this.config = config || {};
    this.swarmGateway = getBeeUrl();
    this.currentAccount = null;
    this.Account = AccountManager;

    // Load existing accounts from localStorage
    this._loadAccounts();
  }

  /**
   * Get list of accounts (mailboxes)
   */
  GetAccounts(version = 1) {
    const mailboxes = JSON.parse(localStorage.getItem(STORAGE_KEYS.MAILBOXES) || '{}');
    const accounts = Object.values(mailboxes);

    // Version 0 = legacy accounts (none in our implementation)
    if (version === 0) {
      return [];
    }

    return accounts.map(m => ({
      subdomain: m.subdomain,
      publicKey: m.publicKey
    }));
  }

  /**
   * Create new account (mailbox)
   */
  async CreateAccount(subdomain, password, feedbackCb) {
    try {
      feedbackCb?.('Validating name...');

      if (!AccountManager.isMailboxNameValid(subdomain)) {
        throw new Error('Invalid mailbox name');
      }

      const available = await AccountManager.isMailboxNameAvailable(subdomain);
      if (!available) {
        throw new Error('Mailbox name already taken');
      }

      feedbackCb?.('Generating keypair...');
      await delay(300);

      // Generate new keypair
      const keyPair = generateKeyPair();

      feedbackCb?.('Creating account...');
      await delay(200);

      // Store account
      const accountData = {
        subdomain,
        publicKey: bytesToHex(keyPair.publicKey),
        privateKey: bytesToHex(keyPair.privateKey),
        passwordHash: hashPassword(password),
        created: Date.now()
      };

      this._saveAccount(accountData);

      feedbackCb?.('Account created!');

      // Create and set as current account
      this.currentAccount = new Account(accountData);

      return this.currentAccount;
    } catch (error) {
      console.error('CreateAccount error:', error);
      throw error;
    }
  }

  /**
   * Unlock existing account
   */
  async UnlockAccount(subdomain, password) {
    const mailboxes = JSON.parse(localStorage.getItem(STORAGE_KEYS.MAILBOXES) || '{}');
    const accountData = mailboxes[subdomain];

    if (!accountData) {
      throw new Error('Account not found');
    }

    if (accountData.passwordHash !== hashPassword(password)) {
      throw new Error('Invalid password');
    }

    this.currentAccount = new Account(accountData);
    return this.currentAccount;
  }

  /**
   * Restore account from backup file
   */
  async RestoreAccount(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.subdomain || !data.publicKey || !data.privateKey) {
        throw new Error('Invalid backup file');
      }

      // Add password hash if missing (old backups)
      if (!data.passwordHash) {
        data.passwordHash = hashPassword(''); // Empty password for imported accounts
      }

      this._saveAccount(data);

      return true;
    } catch (error) {
      console.error('RestoreAccount error:', error);
      throw error;
    }
  }

  /**
   * Connect with MetaMask wallet
   */
  async ConnectWallet(feedbackCb) {
    try {
      feedbackCb?.('Connecting to MetaMask...');

      const { address, signer } = await connectMetaMask();

      feedbackCb?.('Please sign the message to derive your encryption keys...');

      // Derive encryption keys from wallet signature
      const { privateKey, publicKey } = await deriveEncryptionKeys(signer);

      // Create account data
      const subdomain = formatAddress(address); // Use short address as subdomain
      const accountData = {
        subdomain,
        address,
        publicKey: bytesToHex(publicKey),
        privateKey: bytesToHex(privateKey),
        passwordHash: '', // No password for wallet accounts
        isWalletAccount: true,
        created: Date.now()
      };

      this._saveAccount(accountData);

      feedbackCb?.('Wallet connected!');

      // Create and set as current account
      this.currentAccount = new Account(accountData);

      return this.currentAccount;
    } catch (error) {
      console.error('ConnectWallet error:', error);
      throw error;
    }
  }

  /**
   * Check if MetaMask is available
   */
  isMetaMaskAvailable() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  /**
   * Disconnect wallet
   */
  disconnectWallet() {
    disconnectWallet();
    this.currentAccount = null;
  }

  // Private methods

  _loadAccounts() {
    // Just ensure storage exists
    if (!localStorage.getItem(STORAGE_KEYS.MAILBOXES)) {
      localStorage.setItem(STORAGE_KEYS.MAILBOXES, '{}');
    }
  }

  _saveAccount(accountData) {
    const mailboxes = JSON.parse(localStorage.getItem(STORAGE_KEYS.MAILBOXES) || '{}');
    mailboxes[accountData.subdomain] = accountData;
    localStorage.setItem(STORAGE_KEYS.MAILBOXES, JSON.stringify(mailboxes));
  }
}

export default FDS;
