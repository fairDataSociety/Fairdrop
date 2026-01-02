/**
 * AccountManager - Static methods for account operations
 *
 * Handles account validation, lookup, and quick upload operations.
 */

import { checkFairdropSubdomain, resolveRecipient } from './ens';
import { uploadFile } from './swarm/upload';
import { STORAGE_KEYS } from './utils';

class AccountManager {
  /**
   * Validate mailbox name format
   * @param {string} name - Mailbox name to validate
   * @returns {boolean}
   */
  static isMailboxNameValid(name) {
    if (!name || typeof name !== 'string') return false;
    if (name.length < 3 || name.length > 32) return false;
    return /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(name);
  }

  /**
   * Check if mailbox name is available (local + ENS)
   * @param {string} name - Mailbox name to check
   * @returns {Promise<boolean>}
   */
  static async isMailboxNameAvailable(name) {
    const mailboxes = JSON.parse(localStorage.getItem(STORAGE_KEYS.MAILBOXES) || '{}');
    if (mailboxes[name]) return false;

    try {
      const result = await checkFairdropSubdomain(name);
      if (result.exists) return false;
    } catch (error) {
      // ENS check failed, allow registration locally
      console.error('[ENS] Availability check error:', error);
    }

    return true;
  }

  /**
   * Look up a recipient's public key
   * @param {string} recipient - Mailbox name, ENS name, or public key
   * @returns {Promise<{exists: boolean, publicKey: string|null, reason?: string}>}
   */
  static async lookupRecipient(recipient) {
    const mailboxes = JSON.parse(localStorage.getItem(STORAGE_KEYS.MAILBOXES) || '{}');

    // Check with case-insensitive matching
    const recipientLower = recipient.toLowerCase();
    const matchedKey = Object.keys(mailboxes).find(k => k.toLowerCase() === recipientLower);

    if (matchedKey && mailboxes[matchedKey]) {
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
        return { exists: true, publicKey: result.publicKey };
      }
      if (result.method === 'ens-no-key' || result.method === 'fairdrop-no-key') {
        return { exists: false, publicKey: null, reason: 'no-public-key' };
      }
    } catch (error) {
      console.error('[ENS] Resolution error:', error);
    }

    return { exists: false, publicKey: null };
  }

  /**
   * Look up an account (alias for lookupRecipient)
   * @param {string} name - Mailbox name, ENS name, or public key
   * @returns {Promise<{exists: boolean, publicKey: string|null}>}
   */
  static async lookupAccount(name) {
    return AccountManager.lookupRecipient(name);
  }

  /**
   * Store operations for quick upload
   */
  static Store = {
    /**
     * Upload files without encryption (quick upload)
     * @param {File[]} files - Files to upload
     * @param {Function} progressCallback - Progress callback (0-100)
     * @param {Function} statusCallback - Status message callback
     * @returns {Promise<{address: string, file: Object}>}
     */
    async storeFilesUnencrypted(files, progressCallback, statusCallback) {
      try {
        const file = files[0];
        statusCallback?.('Uploading to Swarm...');

        const reference = await uploadFile(file, {
          onProgress: (p) => progressCallback?.(p),
          onStatusChange: (s) => statusCallback?.(s)
        });

        statusCallback?.('Upload complete!');
        progressCallback?.(100);

        return {
          address: reference,
          file: { name: file.name, size: file.size, type: file.type }
        };
      } catch (error) {
        console.error('[AccountManager] Unencrypted upload error:', error);
        throw error;
      }
    }
  };
}

export default AccountManager;
export { AccountManager };
