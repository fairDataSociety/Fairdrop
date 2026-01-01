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
import { resolveRecipient, isENSName, checkFairdropSubdomain, getInboxParams, registerFairdropSubdomain, registerSubdomainGasless, setInboxParams as setENSInboxParams, ENS_DOMAIN } from './ens';
import { writeToInbox, findNextSlot, pollInbox, decryptMetadata } from './swarm/gsoc';

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
   * Uses GSOC for inbox notification (zero-leak privacy)
   */
  async send(recipient, file, path, feedbackCb, progressCb, completeCb) {
    try {
      feedbackCb?.('Looking up recipient...');

      // Look up recipient's public key and inbox params
      const recipientInfo = await this._lookupRecipient(recipient);
      if (!recipientInfo.publicKey) {
        throw new Error(`Recipient "${recipient}" not found`);
      }

      feedbackCb?.('Encrypting file...');
      progressCb?.(10);

      // Encrypt file with recipient's public key
      const encrypted = await encryptFile(file, hexToBytes(recipientInfo.publicKey));
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
        onProgress: (p) => progressCb?.(30 + p * 0.5),
        onStatusChange: (s) => feedbackCb?.(s === 'uploading' ? 'Uploading...' : s)
      });

      progressCb?.(80);

      // Write to recipient's GSOC inbox (if they have one set up)
      if (recipientInfo.inboxParams) {
        feedbackCb?.('Notifying recipient...');
        console.log('[GSOC] Writing to inbox with params:', {
          baseId: recipientInfo.inboxParams.baseIdentifier?.slice(0, 20),
          overlay: recipientInfo.inboxParams.targetOverlay?.slice(0, 20),
          proximity: recipientInfo.inboxParams.proximity
        });
        try {
          const slot = await findNextSlot(recipientInfo.inboxParams);
          console.log('[GSOC] Found slot:', slot);
          await writeToInbox(recipientInfo.inboxParams, slot, {
            reference,
            senderInfo: {
              from: this.subdomain,
              filename: file.name
            }
          }, { anonymous: false });
          console.log(`[GSOC] SUCCESS - Wrote to inbox slot ${slot} for ${recipient}`);
        } catch (gsocError) {
          // Log but don't fail - message is still stored on Swarm
          console.error('[GSOC] FAILED to write to inbox:', gsocError);
        }
      } else {
        console.warn('[GSOC] Recipient has no inbox params - message stored on Swarm only');
      }

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
   * Send file anonymously (Mode 2: Honest Inbox)
   * Sender identity is completely hidden from recipient
   *
   * @param {string} recipientPublicKey - Recipient's public key (hex)
   * @param {Object} inboxParams - Recipient's GSOC inbox params
   * @param {File} file - File to send
   * @param {Function} feedbackCb - Progress feedback callback
   * @param {Function} progressCb - Progress percentage callback
   * @returns {Promise<{hash: string}>}
   */
  async sendAnonymous(recipientPublicKey, inboxParams, file, feedbackCb, progressCb) {
    try {
      feedbackCb?.('Encrypting file...');
      progressCb?.(10);

      // Encrypt file with recipient's public key
      const encrypted = await encryptFile(file, hexToBytes(recipientPublicKey));
      progressCb?.(30);

      feedbackCb?.('Uploading to Swarm...');

      // Create minimal payload (no sender info!)
      const payload = {
        version: 1,
        type: 'encrypted-file',
        // NO from or fromPublicKey fields!
        ephemeralPublicKey: bytesToHex(encrypted.ephemeralPublicKey),
        iv: bytesToHex(encrypted.iv),
        ciphertext: bytesToHex(encrypted.ciphertext),
        filename: 'anonymous', // Don't reveal original filename
        size: file.size,
        timestamp: Date.now()
      };

      // Upload payload to Swarm
      const payloadBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      const reference = await uploadFile(new File([payloadBlob], 'message.json'), {
        onProgress: (p) => progressCb?.(30 + p * 0.5),
        onStatusChange: (s) => feedbackCb?.(s === 'uploading' ? 'Uploading...' : s)
      });

      progressCb?.(80);

      // Write to GSOC inbox - NO sender info (anonymous mode)
      feedbackCb?.('Delivering anonymously...');
      const slot = await findNextSlot(inboxParams);
      await writeToInbox(inboxParams, slot, {
        reference
        // NO senderInfo - this is anonymous mode!
      }, { anonymous: true });

      console.log(`[GSOC] Anonymous message written to slot ${slot}`);

      progressCb?.(100);
      feedbackCb?.('File sent anonymously!');

      // Do NOT store in sent messages - preserve sender anonymity

      return { hash: reference };
    } catch (error) {
      console.error('Anonymous send error:', error);
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
   * For 'received', polls GSOC inbox for new messages
   */
  async messages(type, path) {
    // Map type to storage key
    const key = type === 'sent' ? this._sentKey :
                type === 'received' ? this._receivedKey :
                path?.includes('consents') ? `${this.subdomain}_consents` :
                this._receivedKey;

    try {
      // For received messages, poll GSOC inbox first
      if (type === 'received') {
        await this._pollGSOCInbox();
      }

      const stored = localStorage.getItem(key);
      const messages = stored ? JSON.parse(stored) : [];

      // Transform messages to expected format for Mailbox component
      // Expected: { hash: { address, file: { name, size }, time }, from, saveAs }
      const self = this;
      return messages.map(msg => ({
        hash: {
          address: msg.reference || msg.hash?.address || '',
          file: {
            name: msg.filename || msg.hash?.file?.name || 'unknown',
            size: msg.size || msg.hash?.file?.size || 0
          },
          time: msg.timestamp || msg.hash?.time || Date.now()
        },
        from: msg.from || 'anonymous',
        to: msg.to || msg.recipient || '',
        saveAs: async function() {
          try {
            // Download and decrypt the file
            const result = await self.receiveMessage(msg.reference || msg.hash?.address);
            // Trigger download
            const url = URL.createObjectURL(result.file);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.metadata?.name || msg.filename || 'download';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed: ' + error.message);
          }
        }
      }));
    } catch {
      return [];
    }
  }

  /**
   * Poll GSOC inbox for new messages
   * Downloads and decrypts each message, stores in localStorage
   */
  async _pollGSOCInbox() {
    const inboxParams = await this._getMyInboxParams();
    if (!inboxParams) {
      console.log('[GSOC] No inbox configured for this account');
      return;
    }

    try {
      const lastIndex = this._getLastPolledIndex();
      const newMessages = await pollInbox(inboxParams, lastIndex);

      if (newMessages.length === 0) {
        console.log('[GSOC] No new messages');
        return;
      }

      console.log(`[GSOC] Found ${newMessages.length} new messages`);

      // Process each message
      for (const msg of newMessages) {
        try {
          // Download and decrypt the file
          const received = await this.receiveMessage(msg.reference);

          // Decrypt sender info if present (Mode 1: Encrypted Send)
          let senderInfo = { from: 'anonymous', filename: 'unknown' };
          if (msg.encryptedMeta && this.privateKey) {
            try {
              senderInfo = await decryptMetadata(msg.encryptedMeta, hexToBytes(this.privateKey));
            } catch (e) {
              console.warn('[GSOC] Failed to decrypt sender metadata:', e);
            }
          }

          // Store message with GSOC metadata
          const message = {
            reference: msg.reference,
            from: senderInfo.from || received.from || 'anonymous',
            filename: senderInfo.filename || received.metadata?.name || 'unknown',
            size: received.metadata?.size || 0,
            timestamp: msg.timestamp,
            receivedAt: Date.now(),
            gsocIndex: msg.index
          };
          this._addMessage('received', message);

          // Update last polled index
          this._setLastPolledIndex(msg.index + 1);
        } catch (error) {
          console.error(`[GSOC] Failed to process message at index ${msg.index}:`, error);
        }
      }
    } catch (error) {
      console.error('[GSOC] Inbox poll error:', error);
    }
  }

  /**
   * Get this account's inbox params (from ENS API or local storage)
   * IMPORTANT: Uses ENS API as source of truth to match what senders see
   */
  async _getMyInboxParams() {
    const paramsKey = `${this.subdomain}_inbox_params`;
    console.log('[GSOC] Getting inbox params for:', this.subdomain);

    // Try ENS API first (this is what senders use, so we need to match)
    try {
      const { checkFairdropSubdomain } = await import('./ens');
      const result = await checkFairdropSubdomain(this.subdomain);
      console.log('[GSOC] ENS API result:', {
        exists: result.exists,
        hasInboxParams: !!result.inboxParams,
        baseId: result.inboxParams?.baseIdentifier?.slice(0, 20)
      });

      if (result.inboxParams) {
        // Use ENS params (source of truth for senders)
        return result.inboxParams;
      }
    } catch (e) {
      console.warn('[GSOC] ENS API lookup failed:', e.message);
    }

    // Fall back to localStorage
    try {
      const stored = localStorage.getItem(paramsKey);
      if (stored) {
        const params = JSON.parse(stored);
        console.log('[GSOC] Using LOCAL params (fallback):', {
          baseId: params.baseIdentifier?.slice(0, 20)
        });
        return params;
      }
    } catch (e) {
      console.warn('[GSOC] Failed to parse stored params:', e);
    }

    console.log('[GSOC] No inbox params found');
    return null;
  }

  /**
   * Get the last polled GSOC inbox index
   */
  _getLastPolledIndex() {
    const key = `${this.subdomain}_gsoc_last_index`;
    try {
      return parseInt(localStorage.getItem(key) || '0', 10);
    } catch {
      return 0;
    }
  }

  /**
   * Set the last polled GSOC inbox index
   */
  _setLastPolledIndex(index) {
    const key = `${this.subdomain}_gsoc_last_index`;
    localStorage.setItem(key, index.toString());
  }

  /**
   * Set up GSOC inbox for receiving messages
   * This mines a GSOC key and stores the params
   * @param {string} targetOverlay - Bee node overlay address (optional, uses default)
   * @returns {Promise<Object>} Inbox params to publish to ENS
   */
  async setupGSOCInbox(targetOverlay, proximity = 8) {
    const { mineInboxKey } = await import('./swarm/gsoc');

    // Use provided overlay or try to get from local Bee
    const overlay = targetOverlay || await this._getBeeOverlay();
    if (!overlay) {
      throw new Error('No Bee overlay available. Please provide targetOverlay or run local Bee node.');
    }

    console.log('[GSOC] Mining inbox key for overlay:', overlay);
    // Use proximity 8 by default (16 often times out on real nodes)
    const { privateKey, params } = await mineInboxKey(overlay, proximity);

    // Add recipient public key to params
    params.recipientPublicKey = this.publicKey;

    // Store params locally
    const paramsKey = `${this.subdomain}_inbox_params`;
    localStorage.setItem(paramsKey, JSON.stringify(params));

    console.log('[GSOC] Inbox set up. Publish these to ENS:', {
      'io.fairdrop.inbox.overlay': params.targetOverlay,
      'io.fairdrop.inbox.id': params.baseIdentifier,
      'io.fairdrop.inbox.prox': params.proximity.toString()
    });

    return params;
  }

  /**
   * Register account on ENS (automatic, gasless)
   * Uses backend API - no wallet or user interaction required
   *
   * @param {Object} options - Registration options
   * @param {boolean} options.includeInbox - Also set GSOC inbox params (default: true)
   * @returns {Promise<{success: boolean, ensName: string, error?: string}>}
   */
  async registerOnENS(options = {}) {
    const { includeInbox = true } = options;
    const ensName = `${this.subdomain}.${ENS_DOMAIN}`;

    try {
      // Get inbox params if we should include them
      let gsocParams = null;
      if (includeInbox) {
        const paramsKey = `${this.subdomain}_inbox_params`;
        const stored = localStorage.getItem(paramsKey);
        if (stored) {
          gsocParams = JSON.parse(stored);
        }
      }

      // Register via gasless API (no user interaction)
      const result = await registerFairdropSubdomain(
        this.subdomain,
        this.publicKey,
        { gsocParams }
      );

      if (result.success) {
        console.log(`[ENS] Registered ${result.ensName} - discoverable by anyone!`);
        // Mark as registered in local storage
        this._updateLocalData({ ensRegistered: true, ensName: result.ensName });
      }

      return result;
    } catch (error) {
      console.error('[ENS] Registration error:', error);
      return {
        success: false,
        ensName,
        error: error.message
      };
    }
  }

  /**
   * Update GSOC inbox params on ENS
   * Call this after setupGSOCInbox to publish params
   *
   * @returns {Promise<{success: boolean}>}
   */
  async updateENSInboxParams() {
    try {
      const paramsKey = `${this.subdomain}_inbox_params`;
      const stored = localStorage.getItem(paramsKey);
      if (!stored) {
        throw new Error('No inbox params found. Call setupGSOCInbox first.');
      }

      const params = JSON.parse(stored);
      const ensName = `${this.subdomain}.fairdrop.eth`;

      const result = await setENSInboxParams(ensName, params);
      return result;
    } catch (error) {
      console.error('[ENS] Update inbox params error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if this account is registered on ENS
   * @returns {Promise<{registered: boolean, publicKey: string|null}>}
   */
  async checkENSRegistration() {
    try {
      const result = await checkFairdropSubdomain(this.subdomain);
      return {
        registered: result.exists && result.publicKey !== null,
        publicKey: result.publicKey,
        address: result.address,
        ensName: result.ensName
      };
    } catch (error) {
      return { registered: false, publicKey: null };
    }
  }

  /**
   * Update local account data
   */
  _updateLocalData(updates) {
    const mailboxes = JSON.parse(localStorage.getItem(STORAGE_KEYS.MAILBOXES) || '{}');
    if (mailboxes[this.subdomain]) {
      mailboxes[this.subdomain] = { ...mailboxes[this.subdomain], ...updates };
      localStorage.setItem(STORAGE_KEYS.MAILBOXES, JSON.stringify(mailboxes));
    }
  }

  /**
   * Get Bee node overlay address
   */
  async _getBeeOverlay() {
    try {
      const { getBee } = await import('./swarm/client');
      const bee = getBee();
      const addresses = await bee.getNodeAddresses();
      // Convert PeerAddress object to hex string
      const overlay = addresses.overlay;
      return typeof overlay === 'string' ? overlay : overlay.toHex();
    } catch (error) {
      console.log('[GSOC] Could not get Bee overlay:', error);
      return null;
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

  /**
   * Receive and decrypt a message by Swarm reference
   * @param {string} reference - Swarm reference of the encrypted message
   * @returns {Promise<{file: Blob, metadata: Object, from: string, timestamp: number}>}
   */
  async receiveMessage(reference) {
    try {
      // 1. Download encrypted payload from Swarm
      const { data } = await downloadFile(reference);

      // Handle different data formats (Uint8Array, string, ArrayBuffer)
      let payloadText;
      if (typeof data === 'string') {
        payloadText = data;
      } else if (data instanceof ArrayBuffer) {
        payloadText = new TextDecoder().decode(new Uint8Array(data));
      } else if (data instanceof Uint8Array) {
        payloadText = new TextDecoder().decode(data);
      } else if (data && data.buffer instanceof ArrayBuffer) {
        // TypedArray view
        payloadText = new TextDecoder().decode(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
      } else if (data?.bytes instanceof Uint8Array) {
        // bee-js Bytes class
        payloadText = new TextDecoder().decode(data.bytes);
      } else {
        // Last resort - try to decode whatever we have
        try {
          payloadText = new TextDecoder().decode(new Uint8Array(data));
        } catch {
          throw new Error(`Unsupported data type: ${typeof data}`);
        }
      }

      const payload = JSON.parse(payloadText);

      // 2. Verify message format
      if (payload.type !== 'encrypted-file') {
        throw new Error('Invalid message format');
      }

      // 3. Decrypt with our private key
      const decrypted = await decryptFile({
        ephemeralPublicKey: hexToBytes(payload.ephemeralPublicKey),
        ciphertext: hexToBytes(payload.ciphertext),
        iv: hexToBytes(payload.iv)
      }, hexToBytes(this.privateKey));

      // 4. Store in received messages
      const message = {
        reference,
        from: payload.from,
        fromPublicKey: payload.fromPublicKey,
        filename: decrypted.metadata.name,
        size: decrypted.metadata.size,
        timestamp: payload.timestamp,
        receivedAt: Date.now()
      };
      this._addMessage('received', message);

      return {
        file: decrypted.file,
        metadata: decrypted.metadata,
        from: payload.from,
        fromPublicKey: payload.fromPublicKey,
        timestamp: payload.timestamp
      };
    } catch (error) {
      console.error('Receive error:', error);
      throw error;
    }
  }

  // Private helper methods

  /**
   * Look up recipient's public key and inbox params
   * @param {string} recipient - Recipient identifier
   * @returns {Promise<{publicKey: string|null, inboxParams: Object|null}>}
   */
  async _lookupRecipient(recipient) {
    console.log('[GSOC] Looking up recipient:', recipient);

    // First check local mailboxes
    const mailboxes = JSON.parse(localStorage.getItem(STORAGE_KEYS.MAILBOXES) || '{}');
    console.log('[GSOC] Available mailboxes:', Object.keys(mailboxes));

    if (mailboxes[recipient]) {
      // Local mailbox - check for inbox params in mailbox OR separate storage
      let inboxParams = mailboxes[recipient].inboxParams || null;
      console.log('[GSOC] Found mailbox, inboxParams in mailbox:', !!inboxParams);

      // Also check the separate inbox params storage (from setupGSOCInbox)
      if (!inboxParams) {
        const paramsKey = `${recipient}_inbox_params`;
        const storedParams = localStorage.getItem(paramsKey);
        console.log('[GSOC] Checking separate storage key:', paramsKey, '- found:', !!storedParams);
        if (storedParams) {
          try {
            inboxParams = JSON.parse(storedParams);
            console.log('[GSOC] Parsed inbox params from separate storage');
          } catch (e) {
            console.warn('[GSOC] Failed to parse stored inbox params:', e);
          }
        }
      }

      console.log('[GSOC] Final lookup result - publicKey:', !!mailboxes[recipient].publicKey, 'inboxParams:', !!inboxParams);
      return { publicKey: mailboxes[recipient].publicKey, inboxParams };
    }

    // If recipient looks like a hex public key, use it directly (no inbox)
    if (recipient.length === 66 && recipient.startsWith('0x')) {
      return { publicKey: recipient.slice(2), inboxParams: null };
    }
    if (recipient.length === 64 && /^[a-fA-F0-9]+$/.test(recipient)) {
      return { publicKey: recipient, inboxParams: null };
    }

    // Try ENS resolution (supports ENS names and fairdrop.eth subdomains)
    try {
      const result = await resolveRecipient(recipient);
      if (result.publicKey) {
        console.log(`[ENS] Resolved ${recipient} via ${result.method}${result.ensName ? ` (${result.ensName})` : ''}`);
        return { publicKey: result.publicKey, inboxParams: result.inboxParams };
      }
      if (result.method === 'ens-no-key' || result.method === 'fairdrop-no-key') {
        console.log(`[ENS] Found ${result.ensName} but no Fairdrop public key set`);
      }
    } catch (error) {
      console.error('[ENS] Resolution error:', error);
    }

    return { publicKey: null, inboxParams: null };
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

      // Check for duplicates by reference
      const ref = message.reference || message.hash?.address;
      const isDuplicate = messages.some(m =>
        (m.reference || m.hash?.address) === ref
      );

      if (isDuplicate) {
        console.log('[Messages] Skipping duplicate:', ref?.slice(0, 16));
        return;
      }

      messages.unshift(message); // Add to beginning
      localStorage.setItem(key, JSON.stringify(messages.slice(0, 100))); // Keep last 100
    } catch (e) {
      console.error('Error saving message:', e);
    }
  }

  /**
   * Remove duplicate messages from storage (one-time cleanup)
   * Call this to fix existing duplicates
   */
  deduplicateMessages(type = 'received') {
    const key = type === 'sent' ? this._sentKey :
                type === 'received' ? this._receivedKey :
                this._storedKey;

    try {
      const messages = JSON.parse(localStorage.getItem(key) || '[]');
      const seen = new Set();
      const unique = messages.filter(m => {
        const ref = m.reference || m.hash?.address;
        if (!ref || seen.has(ref)) return false;
        seen.add(ref);
        return true;
      });

      console.log(`[Messages] Deduplicated ${type}: ${messages.length} -> ${unique.length}`);
      localStorage.setItem(key, JSON.stringify(unique));
      return unique.length;
    } catch (e) {
      console.error('Error deduplicating messages:', e);
      return 0;
    }
  }

  /**
   * Clear all messages of a type
   */
  clearMessages(type = 'received') {
    const key = type === 'sent' ? this._sentKey :
                type === 'received' ? this._receivedKey :
                this._storedKey;
    localStorage.removeItem(key);
    // Also reset the polled index
    if (type === 'received') {
      localStorage.removeItem(`${this.subdomain}_gsoc_last_index`);
    }
    console.log(`[Messages] Cleared ${type} messages for ${this.subdomain}`);
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
    console.log('[lookupRecipient] Searching for:', recipient);
    console.log('[lookupRecipient] Local mailboxes:', Object.keys(mailboxes));

    // Check with case-insensitive matching
    const recipientLower = recipient.toLowerCase();
    const matchedKey = Object.keys(mailboxes).find(k => k.toLowerCase() === recipientLower);

    if (matchedKey && mailboxes[matchedKey]) {
      console.log('[lookupRecipient] Found local mailbox:', matchedKey);
      return { exists: true, publicKey: mailboxes[matchedKey].publicKey };
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

  /**
   * Look up an account (alias for lookupRecipient)
   * Used by Dropbox component to check if recipient exists
   * @param {string} name - Mailbox name, ENS name, or public key
   * @returns {Promise<{exists: boolean, publicKey: string|null}>}
   */
  static async lookupAccount(name) {
    return AccountManager.lookupRecipient(name);
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
   * @param {string} subdomain - Account name
   * @param {string} password - Password (can be empty for throwaway)
   * @param {Function} feedbackCb - Progress callback
   * @param {Object} options - Optional settings
   * @param {boolean} options.throwaway - Skip ENS/inbox setup for anonymous sending
   */
  async CreateAccount(subdomain, password, feedbackCb, options = {}) {
    const { throwaway = false } = options;

    try {
      feedbackCb?.('Validating name...');

      if (!AccountManager.isMailboxNameValid(subdomain)) {
        throw new Error('Invalid mailbox name');
      }

      // Skip availability check for throwaway accounts (they're random anyway)
      if (!throwaway) {
        const available = await AccountManager.isMailboxNameAvailable(subdomain);
        if (!available) {
          throw new Error('Mailbox name already taken');
        }
      }

      feedbackCb?.('Generating keypair...');
      await delay(throwaway ? 50 : 300); // Faster for throwaway

      // Generate new keypair
      const keyPair = generateKeyPair();

      feedbackCb?.('Creating account...');
      await delay(throwaway ? 50 : 200);

      // Store account
      const accountData = {
        subdomain,
        publicKey: bytesToHex(keyPair.publicKey),
        privateKey: bytesToHex(keyPair.privateKey),
        passwordHash: hashPassword(password),
        created: Date.now(),
        throwaway // Mark as throwaway for later reference
      };

      this._saveAccount(accountData);

      // Create and set as current account
      this.currentAccount = new Account(accountData);

      // Skip inbox and ENS setup for throwaway accounts (anonymous senders)
      if (throwaway) {
        console.log('[Account] Throwaway account created - skipping ENS/inbox setup');
        return this.currentAccount;
      }

      // Try to set up GSOC inbox automatically (if Bee node available)
      feedbackCb?.('Setting up inbox...');
      try {
        await this.currentAccount.setupGSOCInbox();
        console.log('[GSOC] Inbox set up automatically for', subdomain);
      } catch (error) {
        console.warn('[GSOC] Could not set up inbox automatically:', error.message);
        // Don't fail account creation - inbox can be set up later
      }

      // Register on ENS automatically (gasless, no user interaction)
      try {
        const ensResult = await this.currentAccount.registerOnENS({ includeInbox: true });
        if (ensResult.success) {
          feedbackCb?.(`Registered as ${ensResult.ensName}`);
        }
      } catch (error) {
        // Silent fail - ENS registration is optional
        console.log('[ENS] Registration skipped:', error.message);
      }

      feedbackCb?.('Account created!');

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

  /**
   * Debug helper - call from browser console: FDS.debug()
   */
  static debug() {
    console.log('=== GSOC Debug Info ===');

    // All mailboxes
    const mailboxes = JSON.parse(localStorage.getItem(STORAGE_KEYS.MAILBOXES) || '{}');
    console.log('Mailboxes:', Object.keys(mailboxes));

    // Check inbox params for each
    for (const name of Object.keys(mailboxes)) {
      const paramsKey = `${name}_inbox_params`;
      const params = localStorage.getItem(paramsKey);
      console.log(`  ${name}:`);
      console.log(`    - has publicKey: ${!!mailboxes[name].publicKey}`);
      console.log(`    - inbox params in mailbox: ${!!mailboxes[name].inboxParams}`);
      console.log(`    - inbox params in ${paramsKey}: ${!!params}`);
      if (params) {
        try {
          const p = JSON.parse(params);
          console.log(`    - overlay: ${p.targetOverlay?.slice(0, 16)}...`);
          console.log(`    - baseId: ${p.baseIdentifier?.slice(0, 16)}...`);
        } catch (e) {
          console.log(`    - INVALID JSON: ${e.message}`);
        }
      }
    }

    // Honest inboxes
    const inboxes = JSON.parse(localStorage.getItem('fairdrop_inboxes') || '{}');
    console.log('Honest Inboxes:', Object.keys(inboxes));
    for (const name of Object.keys(inboxes)) {
      console.log(`  ${name}:`);
      console.log(`    - has gsocParams: ${!!inboxes[name].gsocParams}`);
    }

    return { mailboxes: Object.keys(mailboxes), inboxes: Object.keys(inboxes) };
  }
}

// Expose debug helper globally
if (typeof window !== 'undefined') {
  window.FDS_DEBUG = FDS.debug;
}

export default FDS;
