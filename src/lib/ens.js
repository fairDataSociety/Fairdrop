/**
 * ENS Integration Module
 * Handles ENS name resolution and text record lookup for Fairdrop
 */

import { ethers } from 'ethers';

// ENS text record key for Fairdrop public keys
const FAIRDROP_KEY = 'io.fairdrop.publickey';

// Configurable ENS domain for Fairdrop subdomains
// Use VITE_ENS_DOMAIN to override (e.g., "fairdropdev.eth" for testing)
export const ENS_DOMAIN = import.meta.env.VITE_ENS_DOMAIN || 'fairdrop.eth';

// Fallback public RPC endpoints
const RPC_ENDPOINTS = [
  'https://eth.llamarpc.com',
  'https://rpc.ankr.com/eth',
  'https://ethereum.publicnode.com'
];

let cachedProvider = null;

/**
 * Get an Ethereum provider for ENS lookups
 * Uses connected wallet if available, otherwise public RPC
 */
export const getProvider = () => {
  // If MetaMask is connected, use it
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }

  // Use cached provider if available
  if (cachedProvider) {
    return cachedProvider;
  }

  // Create a fallback provider using public RPCs
  cachedProvider = new ethers.JsonRpcProvider(RPC_ENDPOINTS[0]);
  return cachedProvider;
};

/**
 * Resolve ENS name to Ethereum address
 * @param {string} ensName - ENS name (e.g., "vitalik.eth")
 * @returns {Promise<string|null>} Ethereum address or null
 */
export const resolveENSName = async (ensName) => {
  try {
    // Validate input
    if (!ensName || typeof ensName !== 'string') {
      return null;
    }

    // Check if it looks like an ENS name
    if (!ensName.includes('.')) {
      return null;
    }

    const provider = getProvider();
    const address = await provider.resolveName(ensName);
    return address;
  } catch (error) {
    console.error('ENS resolution error:', error);
    return null;
  }
};

/**
 * Get ENS text record
 * @param {string} ensName - ENS name
 * @param {string} key - Text record key
 * @returns {Promise<string|null>} Text record value or null
 */
export const getENSTextRecord = async (ensName, key) => {
  try {
    const provider = getProvider();
    const resolver = await provider.getResolver(ensName);

    if (!resolver) {
      return null;
    }

    const value = await resolver.getText(key);
    return value || null;
  } catch (error) {
    console.error('ENS text record error:', error);
    return null;
  }
};

/**
 * Get Fairdrop public key from ENS text record
 * @param {string} ensName - ENS name
 * @returns {Promise<string|null>} Public key (hex) or null
 */
export const getFairdropPublicKey = async (ensName) => {
  const publicKey = await getENSTextRecord(ensName, FAIRDROP_KEY);

  // Validate it looks like a public key (66 chars with 0x prefix, or 64 chars hex)
  if (publicKey) {
    const cleanKey = publicKey.startsWith('0x') ? publicKey.slice(2) : publicKey;
    if (cleanKey.length === 66 && /^[a-fA-F0-9]+$/.test(cleanKey)) {
      return cleanKey;
    }
    // Also accept compressed public key (33 bytes = 66 hex chars)
    if (cleanKey.length === 66 && /^[a-fA-F0-9]+$/.test(cleanKey)) {
      return cleanKey;
    }
  }

  return null;
};

/**
 * Reverse lookup: get ENS name for address
 * @param {string} address - Ethereum address
 * @returns {Promise<string|null>} ENS name or null
 */
export const lookupAddress = async (address) => {
  try {
    const provider = getProvider();
    const ensName = await provider.lookupAddress(address);
    return ensName;
  } catch (error) {
    console.error('ENS reverse lookup error:', error);
    return null;
  }
};

/**
 * Check if a name is a valid ENS name format
 * @param {string} name - Name to check
 * @returns {boolean}
 */
export const isENSName = (name) => {
  if (!name || typeof name !== 'string') return false;

  // Basic ENS name validation
  // Must contain a dot and end with a TLD
  const parts = name.toLowerCase().split('.');
  if (parts.length < 2) return false;

  // All parts must be non-empty
  if (parts.some(part => part.length === 0)) return false;

  // Common ENS TLDs
  const validTLDs = ['eth', 'xyz', 'luxe', 'kred', 'art', 'club'];
  const tld = parts[parts.length - 1];

  // If it ends with .eth, it's definitely an ENS name
  if (tld === 'eth') return true;

  // For other TLDs, check if they're valid ENS TLDs
  return validTLDs.includes(tld);
};

/**
 * Check if a Fairdrop subdomain exists and has a public key
 * @param {string} username - Username to check (e.g., "alice" for alice.fairdrop.eth)
 * @returns {Promise<{exists: boolean, publicKey: string|null}>}
 */
export const checkFairdropSubdomain = async (username) => {
  const ensName = `${username}.${ENS_DOMAIN}`;

  try {
    const publicKey = await getFairdropPublicKey(ensName);
    const address = await resolveENSName(ensName);

    return {
      exists: address !== null,
      ensName,
      address,
      publicKey
    };
  } catch (error) {
    console.error('Fairdrop subdomain check error:', error);
    return {
      exists: false,
      ensName,
      address: null,
      publicKey: null
    };
  }
};

/**
 * Resolve a recipient identifier to a public key
 * Tries multiple resolution methods in order:
 * 1. If it looks like a public key, use directly
 * 2. If it's an ENS name, look up the text record
 * 3. If it's a username, try username.fairdrop.eth
 *
 * @param {string} recipient - Recipient identifier
 * @returns {Promise<{publicKey: string|null, method: string, ensName: string|null}>}
 */
export const resolveRecipient = async (recipient) => {
  if (!recipient || typeof recipient !== 'string') {
    return { publicKey: null, method: 'invalid', ensName: null };
  }

  const cleaned = recipient.trim();

  // Check if it's already a public key (66 chars with 0x, or 64/66 hex chars)
  if (cleaned.startsWith('0x') && cleaned.length === 68) {
    return { publicKey: cleaned.slice(2), method: 'direct', ensName: null };
  }
  if (/^[a-fA-F0-9]{64,66}$/.test(cleaned)) {
    return { publicKey: cleaned, method: 'direct', ensName: null };
  }

  // Check if it's an ENS name
  if (isENSName(cleaned)) {
    const publicKey = await getFairdropPublicKey(cleaned);
    if (publicKey) {
      return { publicKey, method: 'ens', ensName: cleaned };
    }
    // ENS name exists but no Fairdrop key
    return { publicKey: null, method: 'ens-no-key', ensName: cleaned };
  }

  // Try as fairdrop.eth subdomain
  if (/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(cleaned.toLowerCase())) {
    const result = await checkFairdropSubdomain(cleaned.toLowerCase());
    if (result.publicKey) {
      return { publicKey: result.publicKey, method: 'fairdrop-subdomain', ensName: result.ensName };
    }
    if (result.exists) {
      return { publicKey: null, method: 'fairdrop-no-key', ensName: result.ensName };
    }
  }

  return { publicKey: null, method: 'not-found', ensName: null };
};

export default {
  resolveENSName,
  getENSTextRecord,
  getFairdropPublicKey,
  lookupAddress,
  isENSName,
  checkFairdropSubdomain,
  resolveRecipient,
  FAIRDROP_KEY,
  ENS_DOMAIN
};
