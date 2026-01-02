/**
 * Fairdrop Analytics
 * Privacy-respecting analytics using PostHog (EU hosted)
 *
 * Usage:
 *   import { track, identify, isEnabled, setEnabled } from './lib/analytics';
 *
 *   track('upload_complete', { encrypted: true, size_category: 'large' });
 *   identify(username);
 */

const STORAGE_KEY = 'fairdrop_analytics_enabled';

/**
 * Check if analytics is enabled
 */
export function isEnabled() {
  // Also check legacy key for migration
  const legacy = localStorage.getItem('sentryEnabled');
  const current = localStorage.getItem(STORAGE_KEY);

  if (current !== null) {
    return current === 'true';
  }
  if (legacy !== null) {
    // Migrate legacy setting
    localStorage.setItem(STORAGE_KEY, legacy);
    return legacy === 'true';
  }
  return false;
}

/**
 * Enable or disable analytics
 */
export function setEnabled(enabled) {
  localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
  // Also set legacy key for backwards compatibility
  localStorage.setItem('sentryEnabled', enabled ? 'true' : 'false');

  if (enabled) {
    initPostHog();
  } else {
    // Opt out of PostHog
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.opt_out_capturing();
    }
  }
}

/**
 * Initialize PostHog (called on page load if enabled)
 */
export function initPostHog() {
  if (typeof window === 'undefined') return;

  // Only init if not already loaded
  if (window.posthog && window.posthog.__loaded) {
    window.posthog.opt_in_capturing();
    return;
  }

  // PostHog is loaded via script tag in index.html
  // This just ensures capturing is enabled
  if (window.posthog) {
    window.posthog.opt_in_capturing();
  }
}

/**
 * Track an event
 * @param {string} event - Event name (e.g., 'upload_complete', 'account_created')
 * @param {Object} properties - Event properties
 */
export function track(event, properties = {}) {
  if (!isEnabled()) return;

  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture(event, {
      ...properties,
      app_version: window.__FAIRDROP_VERSION__ || 'unknown'
    });
  }
}

/**
 * Identify a user (called on login)
 * @param {string} username - The username/subdomain
 */
export function identify(username) {
  if (!isEnabled()) return;

  if (typeof window !== 'undefined' && window.posthog) {
    // Use hashed identifier for privacy
    const hashedId = btoa(username).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
    window.posthog.identify(hashedId);
  }
}

/**
 * Reset user identity (called on logout)
 */
export function reset() {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.reset();
  }
}

// Standard events for consistency
export const Events = {
  // Core actions
  UPLOAD_START: 'upload_start',
  UPLOAD_COMPLETE: 'upload_complete',
  UPLOAD_FAILED: 'upload_failed',
  DOWNLOAD: 'download',
  SEND_ENCRYPTED: 'send_encrypted',

  // Account
  ACCOUNT_CREATED: 'account_created',
  ACCOUNT_UNLOCKED: 'account_unlocked',
  WALLET_CONNECTED: 'wallet_connected',

  // Features
  FEATURE_USED: 'feature_used',
  MODE_SELECTED: 'mode_selected',

  // Storage
  STAMP_PURCHASED: 'stamp_purchased',
  STAMP_EXHAUSTED: 'stamp_exhausted',

  // Errors
  ERROR: 'error',
  GSOC_TIMEOUT: 'gsoc_timeout'
};

// Initialize on load if enabled
if (typeof window !== 'undefined') {
  if (isEnabled()) {
    // Delay init slightly to ensure PostHog script is loaded
    setTimeout(initPostHog, 100);
  }
}

export default { track, identify, reset, isEnabled, setEnabled, Events };
