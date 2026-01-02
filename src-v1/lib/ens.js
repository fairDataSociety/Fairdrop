/**
 * ENS Integration Module
 * Handles ENS name resolution and text record lookup for Fairdrop
 */

import { ethers } from 'ethers';

// ENS text record key for Fairdrop public keys
const FAIRDROP_KEY = 'io.fairdrop.publickey';

// ENS text record keys for GSOC inbox params
const INBOX_OVERLAY_KEY = 'io.fairdrop.inbox.overlay';
const INBOX_ID_KEY = 'io.fairdrop.inbox.id';
const INBOX_PROX_KEY = 'io.fairdrop.inbox.prox';

// Configurable ENS domain for Fairdrop subdomains
// Use VITE_ENS_DOMAIN to override (e.g., "fairdropdev.eth" for testing)
export const ENS_DOMAIN = import.meta.env.VITE_ENS_DOMAIN || 'fairdrop.eth';

// Gasless registration API endpoint (backend service that owns the ENS domain)
export const ENS_REGISTRATION_API = import.meta.env.VITE_ENS_REGISTRATION_API || null;

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
 * Get GSOC inbox params from ENS text records
 * These params allow anyone to derive the inbox's GSOC key and send messages
 *
 * @param {string} ensName - ENS name
 * @returns {Promise<{targetOverlay: string, baseIdentifier: string, proximity: number, recipientPublicKey: string}|null>}
 */
export const getInboxParams = async (ensName) => {
  try {
    // Fetch all inbox params in parallel
    const [overlay, baseId, prox, publicKey] = await Promise.all([
      getENSTextRecord(ensName, INBOX_OVERLAY_KEY),
      getENSTextRecord(ensName, INBOX_ID_KEY),
      getENSTextRecord(ensName, INBOX_PROX_KEY),
      getFairdropPublicKey(ensName)
    ]);

    // Require at least overlay and baseIdentifier
    if (!overlay || !baseId) {
      return null;
    }

    return {
      targetOverlay: overlay,
      baseIdentifier: baseId,
      proximity: parseInt(prox) || 16,
      recipientPublicKey: publicKey
    };
  } catch (error) {
    console.error('ENS inbox params error:', error);
    return null;
  }
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
 * Checks registration API first (if configured), then falls back to direct ENS lookup
 * @param {string} username - Username to check (e.g., "alice" for alice.fairdrop.eth)
 * @returns {Promise<{exists: boolean, publicKey: string|null}>}
 */
export const checkFairdropSubdomain = async (username) => {
  const ensName = `${username}.${ENS_DOMAIN}`;

  // Try registration API first (faster, includes inbox params)
  if (ENS_REGISTRATION_API) {
    try {
      const apiBase = ENS_REGISTRATION_API.replace('/register', '');
      const response = await fetch(`${apiBase}/lookup/${username}`);
      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          console.log(`[ENS] Found ${username} via registration API`);
          return {
            exists: true,
            ensName: data.ensName || ensName,
            address: '0x' + '0'.repeat(40), // Mock address
            publicKey: data.publicKey?.replace('0x', '') || null,
            inboxParams: data.inboxParams || null
          };
        }
      }
    } catch (error) {
      console.log('[ENS] Registration API lookup failed, trying direct ENS:', error.message);
    }
  }

  // Fall back to real ENS
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
    const [publicKey, inboxParams] = await Promise.all([
      getFairdropPublicKey(cleaned),
      getInboxParams(cleaned)
    ]);
    if (publicKey) {
      return { publicKey, method: 'ens', ensName: cleaned, inboxParams };
    }
    // ENS name exists but no Fairdrop key
    return { publicKey: null, method: 'ens-no-key', ensName: cleaned, inboxParams: null };
  }

  // Try as fairdrop.eth subdomain
  if (/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(cleaned.toLowerCase())) {
    const result = await checkFairdropSubdomain(cleaned.toLowerCase());
    if (result.publicKey) {
      // Use inboxParams from registration API if available, otherwise fetch from ENS
      const inboxParams = result.inboxParams || await getInboxParams(result.ensName);
      return { publicKey: result.publicKey, method: 'fairdrop-subdomain', ensName: result.ensName, inboxParams };
    }
    if (result.exists) {
      return { publicKey: null, method: 'fairdrop-no-key', ensName: result.ensName, inboxParams: null };
    }
  }

  return { publicKey: null, method: 'not-found', ensName: null, inboxParams: null };
};

/**
 * Register a Fairdrop subdomain via gasless API
 * No wallet required - backend service handles the transaction
 *
 * @param {string} username - Username for subdomain (e.g., "alice" for alice.fairdropdev.eth)
 * @param {string} publicKey - Public key (hex) to register
 * @param {Object} options - Optional: gsocParams for inbox
 * @returns {Promise<{success: boolean, ensName: string, error?: string}>}
 */
export const registerSubdomainGasless = async (username, publicKey, options = {}) => {
  const ensName = `${username}.${ENS_DOMAIN}`;

  if (!ENS_REGISTRATION_API) {
    console.log('[ENS] No registration API configured, skipping gasless registration');
    return {
      success: false,
      ensName,
      error: 'No registration API configured'
    };
  }

  try {
    console.log(`[ENS] Registering ${ensName} via API...`);

    const response = await fetch(ENS_REGISTRATION_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        publicKey: publicKey.startsWith('0x') ? publicKey : `0x${publicKey}`,
        inboxParams: options.gsocParams || null
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Registration failed: ${response.status}`);
    }

    const result = await response.json();
    console.log(`[ENS] Registered ${ensName} successfully`);

    return {
      success: true,
      ensName,
      txHash: result.txHash
    };
  } catch (error) {
    console.error('[ENS] Gasless registration error:', error);
    return {
      success: false,
      ensName,
      error: error.message
    };
  }
};

/**
 * Register a Fairdrop subdomain with public key on ENS
 * Tries gasless API first, falls back to wallet if available
 *
 * @param {string} username - Username for subdomain (e.g., "alice" for alice.fairdrop.eth)
 * @param {string} publicKey - Public key (hex) to register
 * @param {Object} options - Optional: gsocParams for inbox
 * @returns {Promise<{success: boolean, ensName: string, txHash?: string, error?: string}>}
 */
export const registerFairdropSubdomain = async (username, publicKey, options = {}) => {
  // Try gasless API first (preferred - no user interaction needed)
  if (ENS_REGISTRATION_API) {
    const gaslessResult = await registerSubdomainGasless(username, publicKey, options);
    if (gaslessResult.success) {
      return gaslessResult;
    }
    console.log('[ENS] Gasless registration failed, trying wallet...');
  }

  // Fall back to wallet-based registration
  const ensName = `${username}.${ENS_DOMAIN}`;

  try {
    // Check if MetaMask/wallet is available
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('Wallet not connected. Please connect MetaMask to register on ENS.');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    console.log(`[ENS] Registering ${ensName} for ${signerAddress}`);

    // Get ENS registry contract
    const ensRegistry = new ethers.Contract(
      '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e', // ENS Registry (mainnet)
      [
        'function resolver(bytes32 node) view returns (address)',
        'function owner(bytes32 node) view returns (address)',
        'function setSubnodeRecord(bytes32 node, bytes32 label, address owner, address resolver, uint64 ttl)'
      ],
      signer
    );

    // Calculate namehash for parent and subdomain
    const parentNode = ethers.namehash(ENS_DOMAIN);
    const labelHash = ethers.keccak256(ethers.toUtf8Bytes(username));
    const subdomainNode = ethers.namehash(ensName);

    // Check if subdomain already exists
    const existingOwner = await ensRegistry.owner(subdomainNode);
    if (existingOwner !== ethers.ZeroAddress && existingOwner.toLowerCase() !== signerAddress.toLowerCase()) {
      throw new Error(`Subdomain ${ensName} is already owned by another address`);
    }

    // Get parent resolver
    const parentResolver = await ensRegistry.resolver(parentNode);
    if (parentResolver === ethers.ZeroAddress) {
      throw new Error(`Parent domain ${ENS_DOMAIN} has no resolver`);
    }

    // If subdomain doesn't exist, create it
    if (existingOwner === ethers.ZeroAddress) {
      console.log(`[ENS] Creating subdomain ${ensName}...`);
      const tx = await ensRegistry.setSubnodeRecord(
        parentNode,
        labelHash,
        signerAddress,
        parentResolver,
        0 // TTL
      );
      await tx.wait();
      console.log(`[ENS] Subdomain created: ${tx.hash}`);
    }

    // Set text record for public key
    const resolverContract = new ethers.Contract(
      parentResolver,
      [
        'function setText(bytes32 node, string key, string value)'
      ],
      signer
    );

    console.log(`[ENS] Setting public key for ${ensName}...`);
    const cleanKey = publicKey.startsWith('0x') ? publicKey : `0x${publicKey}`;
    const tx = await resolverContract.setText(subdomainNode, FAIRDROP_KEY, cleanKey);
    await tx.wait();
    console.log(`[ENS] Public key set: ${tx.hash}`);

    // Optionally set GSOC inbox params
    if (options.gsocParams) {
      await setInboxParams(ensName, options.gsocParams, signer);
    }

    return {
      success: true,
      ensName,
      txHash: tx.hash
    };
  } catch (error) {
    console.error('[ENS] Registration error:', error);
    return {
      success: false,
      ensName,
      error: error.message
    };
  }
};

/**
 * Set GSOC inbox params on ENS text records
 *
 * @param {string} ensName - ENS name to update
 * @param {Object} gsocParams - { targetOverlay, baseIdentifier, proximity }
 * @param {ethers.Signer} signer - Optional signer (will get from window.ethereum if not provided)
 * @returns {Promise<{success: boolean, txHashes?: string[]}>}
 */
export const setInboxParams = async (ensName, gsocParams, signer = null) => {
  try {
    if (!signer) {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('Wallet not connected');
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
    }

    const node = ethers.namehash(ensName);

    // Get resolver for this name
    const provider = signer.provider || new ethers.BrowserProvider(window.ethereum);
    const resolver = await provider.getResolver(ensName);
    if (!resolver) {
      throw new Error(`No resolver found for ${ensName}`);
    }

    const resolverContract = new ethers.Contract(
      resolver.address,
      ['function setText(bytes32 node, string key, string value)'],
      signer
    );

    const txHashes = [];

    // Set overlay
    if (gsocParams.targetOverlay) {
      console.log(`[ENS] Setting inbox overlay for ${ensName}...`);
      const tx = await resolverContract.setText(node, INBOX_OVERLAY_KEY, gsocParams.targetOverlay);
      await tx.wait();
      txHashes.push(tx.hash);
    }

    // Set base identifier
    if (gsocParams.baseIdentifier) {
      console.log(`[ENS] Setting inbox ID for ${ensName}...`);
      const tx = await resolverContract.setText(node, INBOX_ID_KEY, gsocParams.baseIdentifier);
      await tx.wait();
      txHashes.push(tx.hash);
    }

    // Set proximity
    if (gsocParams.proximity) {
      console.log(`[ENS] Setting inbox proximity for ${ensName}...`);
      const tx = await resolverContract.setText(node, INBOX_PROX_KEY, gsocParams.proximity.toString());
      await tx.wait();
      txHashes.push(tx.hash);
    }

    console.log(`[ENS] Inbox params set for ${ensName}`);
    return { success: true, txHashes };
  } catch (error) {
    console.error('[ENS] Set inbox params error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if user has permission to register subdomains on fairdrop.eth
 * @returns {Promise<{canRegister: boolean, reason?: string}>}
 */
export const canRegisterSubdomain = async () => {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      return { canRegister: false, reason: 'No wallet connected' };
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    // Check if user owns fairdrop.eth or has approval
    const ensRegistry = new ethers.Contract(
      '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
      [
        'function owner(bytes32 node) view returns (address)',
        'function isApprovedForAll(address owner, address operator) view returns (bool)'
      ],
      provider
    );

    const parentNode = ethers.namehash(ENS_DOMAIN);
    const parentOwner = await ensRegistry.owner(parentNode);

    if (parentOwner.toLowerCase() === signerAddress.toLowerCase()) {
      return { canRegister: true };
    }

    // Check if approved
    const isApproved = await ensRegistry.isApprovedForAll(parentOwner, signerAddress);
    if (isApproved) {
      return { canRegister: true };
    }

    return {
      canRegister: false,
      reason: `Only the owner of ${ENS_DOMAIN} can register subdomains`
    };
  } catch (error) {
    return { canRegister: false, reason: error.message };
  }
};

/**
 * Migrate from fairdrop.eth subdomain to a custom ENS domain
 * Copies public key and inbox params to the new domain
 *
 * @param {string} customDomain - Target ENS domain (e.g., "alice.eth")
 * @param {string} sourceUsername - Current fairdrop.eth username
 * @param {Object} wallet - Wallet instance from wallet abstraction layer
 * @returns {Promise<{success: boolean, error?: string, txHashes?: string[]}>}
 */
export const migrateToCustomDomain = async (customDomain, sourceUsername, wallet) => {
  try {
    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    // Verify wallet owns the target domain
    const signer = wallet.getSigner();
    const signerAddress = await signer.getAddress();
    const domainAddress = await resolveENSName(customDomain);

    if (!domainAddress) {
      throw new Error(`Domain ${customDomain} not found on ENS`);
    }

    if (domainAddress.toLowerCase() !== signerAddress.toLowerCase()) {
      throw new Error(`You don't own ${customDomain}. Connect the wallet that owns it.`);
    }

    // Get current fairdrop.eth data
    const sourceName = `${sourceUsername}.${ENS_DOMAIN}`;
    const [publicKey, inboxParams] = await Promise.all([
      getFairdropPublicKey(sourceName),
      getInboxParams(sourceName)
    ]);

    if (!publicKey) {
      throw new Error(`No public key found on ${sourceName}`);
    }

    const txHashes = [];

    // Get resolver for target domain
    const provider = wallet.getProvider();
    const resolver = await provider.getResolver(customDomain);
    if (!resolver) {
      throw new Error(`No resolver found for ${customDomain}. Please set up a resolver first.`);
    }

    const node = ethers.namehash(customDomain);
    const resolverContract = new ethers.Contract(
      resolver.address,
      ['function setText(bytes32 node, string key, string value)'],
      signer
    );

    // Set public key
    console.log(`[ENS] Setting public key on ${customDomain}...`);
    const cleanKey = publicKey.startsWith('0x') ? publicKey : `0x${publicKey}`;
    const tx1 = await resolverContract.setText(node, FAIRDROP_KEY, cleanKey);
    await tx1.wait();
    txHashes.push(tx1.hash);
    console.log(`[ENS] Public key migrated: ${tx1.hash}`);

    // Set inbox params if available
    if (inboxParams) {
      console.log(`[ENS] Migrating inbox params to ${customDomain}...`);

      if (inboxParams.targetOverlay) {
        const tx = await resolverContract.setText(node, INBOX_OVERLAY_KEY, inboxParams.targetOverlay);
        await tx.wait();
        txHashes.push(tx.hash);
      }

      if (inboxParams.baseIdentifier) {
        const tx = await resolverContract.setText(node, INBOX_ID_KEY, inboxParams.baseIdentifier);
        await tx.wait();
        txHashes.push(tx.hash);
      }

      if (inboxParams.proximity) {
        const tx = await resolverContract.setText(node, INBOX_PROX_KEY, inboxParams.proximity.toString());
        await tx.wait();
        txHashes.push(tx.hash);
      }

      console.log(`[ENS] Inbox params migrated`);
    }

    return {
      success: true,
      txHashes,
      oldDomain: sourceName,
      newDomain: customDomain
    };
  } catch (error) {
    console.error('[ENS] Migration error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check if username is available on fairdrop.eth
 * @param {string} username - Username to check
 * @returns {Promise<{available: boolean, reason?: string}>}
 */
export const checkUsernameAvailability = async (username) => {
  // Validate username format
  if (!username || typeof username !== 'string') {
    return { available: false, reason: 'Invalid username' };
  }

  const cleaned = username.toLowerCase().trim();

  // Check length (3-32 characters)
  if (cleaned.length < 3) {
    return { available: false, reason: 'Username must be at least 3 characters' };
  }
  if (cleaned.length > 32) {
    return { available: false, reason: 'Username must be 32 characters or less' };
  }

  // Check characters (alphanumeric and hyphens, no leading/trailing hyphens)
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(cleaned) && !/^[a-z0-9]$/.test(cleaned)) {
    return { available: false, reason: 'Username can only contain letters, numbers, and hyphens' };
  }

  // Reserved usernames
  const reserved = ['admin', 'root', 'system', 'api', 'www', 'mail', 'ftp', 'help', 'support', 'info'];
  if (reserved.includes(cleaned)) {
    return { available: false, reason: 'This username is reserved' };
  }

  // Check if already registered
  const result = await checkFairdropSubdomain(cleaned);
  if (result.exists) {
    return { available: false, reason: 'Username is already taken' };
  }

  return { available: true };
};

export default {
  resolveENSName,
  getENSTextRecord,
  getFairdropPublicKey,
  getInboxParams,
  lookupAddress,
  isENSName,
  checkFairdropSubdomain,
  resolveRecipient,
  registerFairdropSubdomain,
  registerSubdomainGasless,
  setInboxParams,
  canRegisterSubdomain,
  migrateToCustomDomain,
  checkUsernameAvailability,
  FAIRDROP_KEY,
  ENS_DOMAIN,
  ENS_REGISTRATION_API,
  INBOX_OVERLAY_KEY,
  INBOX_ID_KEY,
  INBOX_PROX_KEY
};
