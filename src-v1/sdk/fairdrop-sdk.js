/**
 * Fairdrop SDK Core Class
 *
 * Main entry point for programmatic access to Fairdrop functionality.
 */

import { RateLimiter } from './security/rate-limiter';
import { SignatureValidator } from './security/signature-validator';
import * as uploadOps from './operations/upload';
import * as downloadOps from './operations/download';
import * as sendOps from './operations/send';
import * as inboxOps from './operations/inbox';

/**
 * SDK Configuration defaults
 */
const DEFAULT_CONFIG = {
  // Rate limits
  maxUploadsPerHour: 100,
  maxSendsPerHour: 50,
  maxAccountsPerDay: 5,

  // Bee node
  beeUrl: null, // Auto-detect

  // Authentication
  requireSignature: true,

  // Storage
  defaultTTL: 14 * 24 * 60 * 60 // 14 days
};

/**
 * Main SDK class
 */
export class FairdropSDK {
  /**
   * Create a new Fairdrop SDK instance
   * @param {Object} options
   * @param {Object} options.wallet - Wallet instance (from wallet abstraction layer)
   * @param {Object} options.account - Fairdrop account (mailbox)
   * @param {Object} options.config - Optional configuration overrides
   */
  constructor(options = {}) {
    this.wallet = options.wallet || null;
    this.account = options.account || null;
    this.config = { ...DEFAULT_CONFIG, ...options.config };

    // Initialize rate limiter
    this.rateLimiter = new RateLimiter({
      uploadsPerHour: this.config.maxUploadsPerHour,
      sendsPerHour: this.config.maxSendsPerHour,
      accountsPerDay: this.config.maxAccountsPerDay
    });

    // Initialize signature validator
    this.signatureValidator = new SignatureValidator({
      requireSignature: this.config.requireSignature
    });

    // Bind operations namespace
    this.inbox = this._createInboxAPI();
  }

  /**
   * Set wallet for authenticated operations
   * @param {Object} wallet - Wallet instance
   */
  setWallet(wallet) {
    this.wallet = wallet;
    return this;
  }

  /**
   * Set account for inbox operations
   * @param {Object} account - Fairdrop account (mailbox)
   */
  setAccount(account) {
    this.account = account;
    return this;
  }

  /**
   * Upload a file to Swarm
   * @param {File|Buffer|Uint8Array} file - File to upload
   * @param {Object} options - Upload options
   * @param {string} options.filename - Filename override
   * @param {string} options.contentType - MIME type
   * @param {string} options.stampId - Postage stamp to use
   * @param {Function} options.onProgress - Progress callback
   * @returns {Promise<{reference: string, link: string}>}
   */
  async upload(file, options = {}) {
    // Check rate limit
    await this.rateLimiter.checkUpload();

    // Perform upload
    const result = await uploadOps.upload(file, {
      ...options,
      beeUrl: this.config.beeUrl
    });

    // Track for rate limiting
    this.rateLimiter.trackUpload();

    return result;
  }

  /**
   * Upload raw data to Swarm
   * @param {string|Buffer|Uint8Array} data - Data to upload
   * @param {Object} options - Upload options
   * @returns {Promise<{reference: string}>}
   */
  async uploadData(data, options = {}) {
    await this.rateLimiter.checkUpload();

    const result = await uploadOps.uploadData(data, {
      ...options,
      beeUrl: this.config.beeUrl
    });

    this.rateLimiter.trackUpload();
    return result;
  }

  /**
   * Download a file from Swarm
   * @param {string} reference - Swarm reference (hash)
   * @param {Object} options - Download options
   * @returns {Promise<{data: Uint8Array, filename: string, contentType: string}>}
   */
  async download(reference, options = {}) {
    return downloadOps.download(reference, {
      ...options,
      beeUrl: this.config.beeUrl
    });
  }

  /**
   * Download raw data from Swarm
   * @param {string} reference - Swarm reference
   * @returns {Promise<Uint8Array>}
   */
  async downloadData(reference) {
    return downloadOps.downloadData(reference, {
      beeUrl: this.config.beeUrl
    });
  }

  /**
   * Send an encrypted file to a recipient
   * @param {File|Buffer|Uint8Array} file - File to send
   * @param {string} recipient - Recipient identifier (ENS, username, or public key)
   * @param {Object} options - Send options
   * @param {string} options.subject - Message subject
   * @param {string} options.message - Optional message
   * @returns {Promise<{success: boolean, reference: string}>}
   */
  async send(file, recipient, options = {}) {
    // Check rate limit
    await this.rateLimiter.checkSend();

    // Require account for sending
    if (!this.account) {
      throw new Error('Account required for sending. Call setAccount() first.');
    }

    const result = await sendOps.send(file, recipient, {
      ...options,
      account: this.account,
      beeUrl: this.config.beeUrl
    });

    this.rateLimiter.trackSend();
    return result;
  }

  /**
   * Send encrypted data (not a file)
   * @param {string|Object} data - Data to send (will be JSON encoded if object)
   * @param {string} recipient - Recipient identifier
   * @param {Object} options - Send options
   */
  async sendData(data, recipient, options = {}) {
    await this.rateLimiter.checkSend();

    if (!this.account) {
      throw new Error('Account required for sending');
    }

    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    const result = await sendOps.sendEncrypted(payload, recipient, {
      ...options,
      account: this.account,
      beeUrl: this.config.beeUrl
    });

    this.rateLimiter.trackSend();
    return result;
  }

  /**
   * Get a shareable link for a reference
   * @param {string} reference - Swarm reference
   * @returns {string} Shareable URL
   */
  getShareableLink(reference) {
    return uploadOps.getShareableLink(reference, {
      beeUrl: this.config.beeUrl
    });
  }

  /**
   * Create inbox API namespace
   */
  _createInboxAPI() {
    return {
      /**
       * List inbox messages
       * @returns {Promise<Array>} Messages
       */
      list: async () => {
        if (!this.account) {
          throw new Error('Account required for inbox access');
        }
        return inboxOps.getInbox(this.account);
      },

      /**
       * Poll for new messages
       * @param {Object} options - Polling options
       * @param {number} options.since - Timestamp to poll from
       * @param {Function} options.onMessage - Callback for new messages
       */
      poll: async (options = {}) => {
        if (!this.account) {
          throw new Error('Account required for inbox polling');
        }
        return inboxOps.pollInbox(this.account, options);
      },

      /**
       * Mark message as read
       * @param {string} messageId - Message ID
       */
      markAsRead: async (messageId) => {
        if (!this.account) {
          throw new Error('Account required');
        }
        return inboxOps.markAsRead(this.account, messageId);
      },

      /**
       * Get message content
       * @param {Object} message - Message object
       */
      getContent: async (message) => {
        if (!this.account) {
          throw new Error('Account required');
        }
        return inboxOps.getMessageContent(message, this.account);
      }
    };
  }

  /**
   * Get SDK stats
   */
  getStats() {
    return {
      rateLimits: this.rateLimiter.getStats(),
      hasWallet: !!this.wallet,
      hasAccount: !!this.account,
      config: this.config
    };
  }

  /**
   * Static factory method
   */
  static create(options) {
    return new FairdropSDK(options);
  }
}

export default FairdropSDK;
