/**
 * Utility functions for Fairdrop
 *
 * Extracted from fds-adapter.js for modularity
 */

/**
 * Simple password hashing (for local storage only, not cryptographic security)
 * @param {string} password - The password to hash
 * @returns {string} Base64-encoded hash
 */
export function hashPassword(password) {
  return btoa(password + '_fairdrop_salt');
}

/**
 * Generate unique ID using timestamp and random component
 * @returns {string} Unique identifier
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Promise-based delay helper
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Storage keys used throughout the application
 */
export const STORAGE_KEYS = {
  MAILBOXES: 'fairdrop_mailboxes_v2',
  APP_STATE: 'fairdrop_app_state_v2'
};
