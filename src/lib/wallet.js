/**
 * Wallet Connection Module
 * Handles MetaMask and other Web3 wallet connections
 */

import { ethers } from 'ethers';

// Storage key for wallet connection state
const WALLET_STORAGE_KEY = 'fairdrop_wallet_connection';

/**
 * Check if MetaMask is available
 */
export const isMetaMaskAvailable = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

/**
 * Get the current wallet provider
 */
export const getProvider = () => {
  if (!isMetaMaskAvailable()) {
    return null;
  }
  return new ethers.BrowserProvider(window.ethereum);
};

/**
 * Connect to MetaMask
 * @returns {Promise<{address: string, signer: ethers.Signer}>}
 */
export const connectMetaMask = async () => {
  if (!isMetaMaskAvailable()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }

  try {
    // Request account access
    const provider = getProvider();
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    // Store connection state
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({
      connected: true,
      address,
      connectedAt: Date.now()
    }));

    return { address, signer, provider };
  } catch (error) {
    console.error('MetaMask connection error:', error);
    if (error.code === 4001) {
      throw new Error('Connection rejected. Please approve the connection request.');
    }
    throw error;
  }
};

/**
 * Disconnect wallet
 */
export const disconnectWallet = () => {
  localStorage.removeItem(WALLET_STORAGE_KEY);
};

/**
 * Check if wallet is connected
 */
export const isWalletConnected = () => {
  try {
    const stored = localStorage.getItem(WALLET_STORAGE_KEY);
    if (!stored) return false;
    const data = JSON.parse(stored);
    return data.connected === true;
  } catch {
    return false;
  }
};

/**
 * Get connected wallet address
 */
export const getConnectedAddress = () => {
  try {
    const stored = localStorage.getItem(WALLET_STORAGE_KEY);
    if (!stored) return null;
    const data = JSON.parse(stored);
    return data.address || null;
  } catch {
    return null;
  }
};

/**
 * Derive encryption keys from wallet signature
 * Uses a deterministic message to derive consistent keys
 * @param {ethers.Signer} signer - Wallet signer
 * @returns {Promise<{privateKey: Uint8Array, publicKey: Uint8Array}>}
 */
export const deriveEncryptionKeys = async (signer) => {
  const address = await signer.getAddress();

  // Use a deterministic message for key derivation
  const message = `Fairdrop Encryption Key Derivation\n\nAddress: ${address}\nPurpose: Generate encryption keypair\n\nSigning this message will derive your encryption keys. This does not cost any gas.`;

  // Sign the message
  const signature = await signer.signMessage(message);

  // Hash the signature to get deterministic bytes
  const signatureBytes = ethers.getBytes(signature);
  const hashBuffer = await crypto.subtle.digest('SHA-256', signatureBytes);
  const privateKey = new Uint8Array(hashBuffer);

  // Import secp256k1 to derive public key
  const secp256k1 = await import('@noble/secp256k1');

  // Ensure the private key is valid (in the valid range for secp256k1)
  // If not valid, we hash again
  let validPrivateKey = privateKey;
  while (!secp256k1.utils.isValidSecretKey(validPrivateKey)) {
    const rehash = await crypto.subtle.digest('SHA-256', validPrivateKey);
    validPrivateKey = new Uint8Array(rehash);
  }

  const publicKey = secp256k1.getPublicKey(validPrivateKey);

  return { privateKey: validPrivateKey, publicKey };
};

/**
 * Format address for display (0x1234...5678)
 */
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Listen for account changes
 */
export const onAccountChange = (callback) => {
  if (!isMetaMaskAvailable()) return () => {};

  const handler = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
      callback(null);
    } else {
      callback(accounts[0]);
    }
  };

  window.ethereum.on('accountsChanged', handler);

  return () => {
    window.ethereum.removeListener('accountsChanged', handler);
  };
};

/**
 * Listen for chain changes
 */
export const onChainChange = (callback) => {
  if (!isMetaMaskAvailable()) return () => {};

  const handler = (chainId) => {
    callback(chainId);
  };

  window.ethereum.on('chainChanged', handler);

  return () => {
    window.ethereum.removeListener('chainChanged', handler);
  };
};

export default {
  isMetaMaskAvailable,
  getProvider,
  connectMetaMask,
  disconnectWallet,
  isWalletConnected,
  getConnectedAddress,
  deriveEncryptionKeys,
  formatAddress,
  onAccountChange,
  onChainChange
};
