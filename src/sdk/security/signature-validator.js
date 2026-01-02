/**
 * Signature Validator
 *
 * Validates EIP-712 signatures for authenticated operations.
 * Used for account creation and sensitive operations.
 */

import { ethers } from 'ethers';

// EIP-712 Domain for Fairdrop
const DOMAIN = {
  name: 'Fairdrop',
  version: '3',
  chainId: 1 // Ethereum mainnet for signature verification
};

// Operation types for EIP-712
const TYPES = {
  CreateAccount: [
    { name: 'username', type: 'string' },
    { name: 'publicKey', type: 'bytes' },
    { name: 'nonce', type: 'uint256' },
    { name: 'timestamp', type: 'uint256' }
  ],
  SendMessage: [
    { name: 'recipient', type: 'string' },
    { name: 'contentHash', type: 'bytes32' },
    { name: 'nonce', type: 'uint256' },
    { name: 'timestamp', type: 'uint256' }
  ],
  RegisterInbox: [
    { name: 'overlay', type: 'string' },
    { name: 'baseIdentifier', type: 'string' },
    { name: 'proximity', type: 'uint8' },
    { name: 'nonce', type: 'uint256' }
  ]
};

// Nonce storage
const NONCE_KEY = 'fairdrop_nonces';

/**
 * Signature Validator class
 */
export class SignatureValidator {
  constructor(options = {}) {
    this.requireSignature = options.requireSignature ?? true;
    this.nonces = this._loadNonces();
  }

  /**
   * Create a signed account creation request
   * @param {Object} params - Account params
   * @param {Object} wallet - Wallet instance
   */
  async signAccountCreation(params, wallet) {
    const { username, publicKey } = params;
    const nonce = this._getNextNonce(wallet.address);
    const timestamp = Math.floor(Date.now() / 1000);

    const message = {
      username,
      publicKey: ethers.getBytes(publicKey.startsWith('0x') ? publicKey : `0x${publicKey}`),
      nonce,
      timestamp
    };

    const signature = await wallet.signTypedData({
      domain: DOMAIN,
      types: TYPES,
      value: message,
      primaryType: 'CreateAccount'
    });

    this._useNonce(wallet.address, nonce);

    return {
      ...message,
      signature,
      signer: wallet.address
    };
  }

  /**
   * Verify a signed account creation
   * @param {Object} signedRequest - Signed request
   * @returns {Object} { valid: boolean, address: string, error?: string }
   */
  async verifyAccountCreation(signedRequest) {
    const { username, publicKey, nonce, timestamp, signature } = signedRequest;

    // Check timestamp (within 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) {
      return { valid: false, error: 'Signature expired' };
    }

    const message = {
      username,
      publicKey: ethers.getBytes(publicKey.startsWith('0x') ? publicKey : `0x${publicKey}`),
      nonce,
      timestamp
    };

    try {
      const recoveredAddress = ethers.verifyTypedData(
        DOMAIN,
        { CreateAccount: TYPES.CreateAccount },
        message,
        signature
      );

      return {
        valid: true,
        address: recoveredAddress
      };
    } catch (error) {
      return {
        valid: false,
        error: `Signature verification failed: ${error.message}`
      };
    }
  }

  /**
   * Create a signed send message request
   * @param {Object} params - Message params
   * @param {Object} wallet - Wallet instance
   */
  async signSendMessage(params, wallet) {
    const { recipient, contentHash } = params;
    const nonce = this._getNextNonce(wallet.address);
    const timestamp = Math.floor(Date.now() / 1000);

    const message = {
      recipient,
      contentHash: ethers.hexlify(contentHash),
      nonce,
      timestamp
    };

    const signature = await wallet.signTypedData({
      domain: DOMAIN,
      types: TYPES,
      value: message,
      primaryType: 'SendMessage'
    });

    this._useNonce(wallet.address, nonce);

    return {
      ...message,
      signature,
      signer: wallet.address
    };
  }

  /**
   * Verify a send message signature
   */
  async verifySendMessage(signedRequest) {
    const { recipient, contentHash, nonce, timestamp, signature } = signedRequest;

    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) {
      return { valid: false, error: 'Signature expired' };
    }

    const message = {
      recipient,
      contentHash,
      nonce,
      timestamp
    };

    try {
      const recoveredAddress = ethers.verifyTypedData(
        DOMAIN,
        { SendMessage: TYPES.SendMessage },
        message,
        signature
      );

      return { valid: true, address: recoveredAddress };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Get next nonce for address
   */
  _getNextNonce(address) {
    const key = address.toLowerCase();
    const current = this.nonces[key] || 0;
    return current + 1;
  }

  /**
   * Use a nonce (mark as used)
   */
  _useNonce(address, nonce) {
    const key = address.toLowerCase();
    this.nonces[key] = nonce;
    this._saveNonces();
  }

  /**
   * Load nonces from storage
   */
  _loadNonces() {
    try {
      const stored = localStorage.getItem(NONCE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  /**
   * Save nonces to storage
   */
  _saveNonces() {
    try {
      localStorage.setItem(NONCE_KEY, JSON.stringify(this.nonces));
    } catch {
      // Storage not available
    }
  }

  /**
   * Get domain for external use
   */
  static getDomain() {
    return DOMAIN;
  }

  /**
   * Get types for external use
   */
  static getTypes() {
    return TYPES;
  }
}

export default SignatureValidator;
