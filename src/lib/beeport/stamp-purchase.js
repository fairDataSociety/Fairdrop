/**
 * Stamp Purchase Implementation
 *
 * Handles the multi-step stamp purchase flow:
 * 1. Get quote from Beeport
 * 2. Approve token spending (if needed)
 * 3. Execute purchase transaction
 * 4. Wait for stamp confirmation
 */

import { ethers } from 'ethers';

// Payment chains
export const PaymentChain = {
  GNOSIS: 'gnosis',
  ETHEREUM: 'ethereum',
  POLYGON: 'polygon'
};

// Payment tokens
export const PaymentToken = {
  XBZZ: 'xBZZ',     // Gnosis chain BZZ
  BZZ: 'BZZ',       // Mainnet BZZ
  USDT: 'USDT',
  USDC: 'USDC',
  DAI: 'DAI'
};

// Stamp purchase status
export const StampStatus = {
  IDLE: 'idle',
  QUOTING: 'quoting',
  APPROVING: 'approving',
  PURCHASING: 'purchasing',
  CONFIRMING: 'confirming',
  COMPLETE: 'complete',
  ERROR: 'error'
};

// Chain configurations
const CHAIN_CONFIG = {
  [PaymentChain.GNOSIS]: {
    chainId: 100,
    rpc: 'https://rpc.gnosischain.com',
    bzzToken: '0xdBF3Ea6F5beE45c02255B2c26a16F300502F68da',
    postageContract: '0x621e455C4a139f5C4e4A8122Ce55Dc21630769E4'
  },
  [PaymentChain.ETHEREUM]: {
    chainId: 1,
    rpc: 'https://eth.drpc.org',
    bzzToken: '0x19062190B1925b5b6689D7073fDfC8c2976EF8Cb',
    bridgeContract: '0x...' // For cross-chain purchases
  },
  [PaymentChain.POLYGON]: {
    chainId: 137,
    rpc: 'https://polygon-rpc.com',
    bridgeContract: '0x...' // For cross-chain purchases
  }
};

// Beeport API endpoint
const BEEPORT_API = 'https://api.beeport.ethswarm.org/v1';

// ERC20 ABI for approvals
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)'
];

// Postage stamp contract ABI
const POSTAGE_ABI = [
  'function createBatch(address _owner, uint256 _initialBalancePerChunk, uint8 _depth, uint8 _bucketDepth, bytes32 _nonce, bool _immutable) payable returns (bytes32)',
  'function topUpBatch(bytes32 _batchId, uint256 _topupAmountPerChunk) payable'
];

/**
 * Stamp Purchase class - handles the purchase flow
 */
export class StampPurchase {
  constructor(options) {
    this.amount = options.amount;
    this.chain = options.paymentChain || PaymentChain.GNOSIS;
    this.token = options.paymentToken || PaymentToken.XBZZ;
    this.wallet = options.wallet;
    this.depth = options.depth || 20; // ~1GB default
    this.ttl = options.ttl || 14 * 24 * 60 * 60; // 14 days default

    this.status = StampStatus.IDLE;
    this.statusCallback = options.onStatusChange || (() => {});
    this.result = null;
    this.error = null;
  }

  /**
   * Execute the stamp purchase
   */
  async execute() {
    try {
      // Validate wallet connection
      if (!this.wallet) {
        throw new Error('Wallet not connected');
      }

      // Step 1: Get quote
      this._setStatus(StampStatus.QUOTING);
      const quote = await this._getQuote();

      // Step 2: Switch to correct chain if needed
      const chainConfig = CHAIN_CONFIG[this.chain];
      const signer = this.wallet.getSigner();

      // Step 3: Check and approve token spending
      this._setStatus(StampStatus.APPROVING);
      await this._approveTokens(quote.bzzAmount, chainConfig);

      // Step 4: Purchase stamp
      this._setStatus(StampStatus.PURCHASING);
      const txHash = await this._purchaseStamp(quote, chainConfig);

      // Step 5: Wait for confirmation
      this._setStatus(StampStatus.CONFIRMING);
      const stampId = await this._waitForConfirmation(txHash);

      this._setStatus(StampStatus.COMPLETE);
      this.result = { stampId, txHash };
      return this.result;

    } catch (error) {
      this._setStatus(StampStatus.ERROR);
      this.error = error;
      throw error;
    }
  }

  /**
   * Get purchase quote from Beeport
   */
  async _getQuote() {
    try {
      const response = await fetch(`${BEEPORT_API}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          depth: this.depth,
          duration: this.ttl,
          chain: this.chain,
          token: this.token
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Quote failed: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.warn('[Beeport] Quote API error, using amount directly:', error);
      // Fallback: use provided amount directly
      return {
        bzzAmount: this.amount,
        pricePerChunk: ethers.parseEther(this.amount) / BigInt(Math.pow(2, this.depth))
      };
    }
  }

  /**
   * Check and approve token spending if needed
   */
  async _approveTokens(amount, chainConfig) {
    const signer = this.wallet.getSigner();
    const token = new ethers.Contract(chainConfig.bzzToken, ERC20_ABI, signer);

    const address = await signer.getAddress();
    const spender = chainConfig.postageContract;
    const amountWei = ethers.parseEther(amount.toString());

    // Check current allowance
    const currentAllowance = await token.allowance(address, spender);
    if (currentAllowance >= amountWei) {
      console.log('[Beeport] Already approved');
      return;
    }

    // Check balance
    const balance = await token.balanceOf(address);
    if (balance < amountWei) {
      throw new Error(`Insufficient ${this.token} balance. Have: ${ethers.formatEther(balance)}, Need: ${amount}`);
    }

    // Approve spending
    const approveTx = await token.approve(spender, amountWei);
    await approveTx.wait();
    console.log('[Beeport] Token approval confirmed');
  }

  /**
   * Execute stamp purchase transaction
   */
  async _purchaseStamp(quote, chainConfig) {
    const signer = this.wallet.getSigner();
    const postage = new ethers.Contract(chainConfig.postageContract, POSTAGE_ABI, signer);

    const owner = await signer.getAddress();
    const pricePerChunk = quote.pricePerChunk || ethers.parseEther(quote.bzzAmount) / BigInt(Math.pow(2, this.depth));
    const nonce = ethers.hexlify(ethers.randomBytes(32));
    const bucketDepth = 16; // Standard bucket depth
    const immutable = false; // Allow top-ups

    const tx = await postage.createBatch(
      owner,
      pricePerChunk,
      this.depth,
      bucketDepth,
      nonce,
      immutable
    );

    console.log('[Beeport] Purchase transaction submitted:', tx.hash);
    return tx.hash;
  }

  /**
   * Wait for stamp confirmation on Swarm network
   */
  async _waitForConfirmation(txHash) {
    const signer = this.wallet.getSigner();
    const provider = this.wallet.getProvider();

    // Wait for transaction confirmation
    const receipt = await provider.waitForTransaction(txHash, 2);

    if (!receipt || receipt.status === 0) {
      throw new Error('Transaction failed');
    }

    // Extract stamp ID from logs
    // The BatchCreated event contains the batch ID
    const stampId = this._extractStampId(receipt);

    // Poll Bee node until stamp is usable
    await this._waitForStampUsable(stampId);

    return stampId;
  }

  /**
   * Extract stamp ID from transaction receipt
   */
  _extractStampId(receipt) {
    // BatchCreated event signature
    const BATCH_CREATED_TOPIC = ethers.id('BatchCreated(bytes32,uint256,uint256,address,uint8,uint8,bool)');

    for (const log of receipt.logs) {
      if (log.topics[0] === BATCH_CREATED_TOPIC) {
        return log.topics[1]; // First indexed parameter is batchId
      }
    }

    throw new Error('Could not find stamp ID in transaction logs');
  }

  /**
   * Wait for stamp to be usable on Swarm network
   */
  async _waitForStampUsable(stampId, maxAttempts = 30) {
    const { getStamp } = await import('../swarm/stamps');

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const stamp = await getStamp(stampId);
        if (stamp && stamp.usable) {
          console.log('[Beeport] Stamp is usable:', stampId);
          return stamp;
        }
      } catch (error) {
        // Stamp not yet visible, continue polling
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.warn('[Beeport] Stamp may not be immediately usable, check later:', stampId);
    return null;
  }

  /**
   * Set status and notify callback
   */
  _setStatus(status) {
    this.status = status;
    this.statusCallback(status);
  }
}

export default StampPurchase;
