/**
 * Beeport Integration Module
 *
 * Headless integration with Beeport for purchasing postage stamps
 * on Swarm Network. Supports multi-chain payments.
 *
 * Beeport: https://beeport.ethswarm.org/
 */

import { StampPurchase, PaymentChain, PaymentToken, StampStatus } from './stamp-purchase';

// Re-export for convenience
export {
  StampPurchase,
  PaymentChain,
  PaymentToken,
  StampStatus
};

/**
 * Purchase a postage stamp
 * @param {Object} options - Purchase options
 * @param {string} options.amount - Amount to spend (in token units)
 * @param {string} options.paymentChain - 'gnosis' | 'ethereum' | 'polygon'
 * @param {string} options.paymentToken - 'xBZZ' | 'BZZ' | 'USDT' | 'DAI'
 * @param {Object} options.wallet - Wallet instance from wallet abstraction layer
 * @param {number} options.depth - Batch depth (default: 20, ~1GB)
 * @param {number} options.ttl - Time to live in seconds (default: 14 days)
 * @returns {Promise<{stampId: string, txHash: string}>}
 */
export async function purchaseStamp(options) {
  const purchase = new StampPurchase(options);
  return purchase.execute();
}

/**
 * Get stamp purchase quote
 * @param {Object} options - Quote options
 * @param {number} options.sizeBytes - Estimated storage size in bytes
 * @param {number} options.durationDays - Desired duration in days
 * @param {string} options.paymentChain - 'gnosis' | 'ethereum' | 'polygon'
 * @param {string} options.paymentToken - 'xBZZ' | 'BZZ' | 'USDT' | 'DAI'
 * @returns {Promise<{price: string, depth: number, amount: string}>}
 */
export async function getStampQuote(options) {
  const { sizeBytes = 1024 * 1024 * 100, durationDays = 14, paymentChain, paymentToken } = options;

  // Calculate required depth for size
  const depth = calculateDepth(sizeBytes);

  // Get current price from Beeport API
  const price = await fetchStampPrice(depth, durationDays, paymentChain, paymentToken);

  return {
    price: price.total,
    depth,
    amount: price.bzzAmount,
    breakdown: price
  };
}

/**
 * Check stamp status
 * @param {string} stampId - Postage stamp ID
 * @returns {Promise<Object>} Stamp status
 */
export async function checkStampStatus(stampId) {
  // Use existing stamps module
  const { getStamp } = await import('../swarm/stamps');
  return getStamp(stampId);
}

/**
 * Calculate required batch depth for storage size
 * Depth determines the capacity: 2^depth * 4KB chunks
 * @param {number} sizeBytes - Size in bytes
 * @returns {number} Recommended depth
 */
function calculateDepth(sizeBytes) {
  // Each chunk is 4KB
  const chunkSize = 4096;
  const chunks = Math.ceil(sizeBytes / chunkSize);

  // depth = log2(chunks), minimum 17 (512KB), maximum 30 (4TB)
  const depth = Math.max(17, Math.min(30, Math.ceil(Math.log2(chunks))));
  return depth;
}

/**
 * Fetch stamp price from Beeport API
 */
async function fetchStampPrice(depth, durationDays, chain, token) {
  const BEEPORT_API = 'https://api.beeport.ethswarm.org/v1';

  try {
    const response = await fetch(`${BEEPORT_API}/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        depth,
        duration: durationDays * 24 * 60 * 60, // Convert to seconds
        chain,
        token
      })
    });

    if (!response.ok) {
      throw new Error(`Beeport API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.warn('[Beeport] API error, using fallback pricing:', error);

    // Fallback: Estimate based on current network params
    // ~0.01 BZZ per GB per day at depth 20
    const gbEquivalent = Math.pow(2, depth) * 4096 / (1024 * 1024 * 1024);
    const bzzPerDay = 0.01;
    const totalBzz = gbEquivalent * bzzPerDay * durationDays;

    return {
      bzzAmount: totalBzz.toFixed(4),
      total: totalBzz.toFixed(4),
      currency: token,
      chain
    };
  }
}

export default {
  purchaseStamp,
  getStampQuote,
  checkStampStatus,
  PaymentChain,
  PaymentToken,
  StampStatus
};
