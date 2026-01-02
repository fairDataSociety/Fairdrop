/**
 * Rate Limiter
 *
 * Protects against abuse by limiting operations per time window.
 * Uses localStorage for persistence across page reloads.
 */

const STORAGE_KEY = 'fairdrop_rate_limits';

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends Error {
  constructor(operation, remaining) {
    super(`Rate limit exceeded for ${operation}. Try again in ${remaining} seconds.`);
    this.name = 'RateLimitError';
    this.operation = operation;
    this.remaining = remaining;
  }
}

/**
 * Rate Limiter class
 */
export class RateLimiter {
  /**
   * Create a new rate limiter
   * @param {Object} limits - Rate limit configuration
   */
  constructor(limits = {}) {
    this.limits = {
      uploadsPerHour: limits.uploadsPerHour || 100,
      sendsPerHour: limits.sendsPerHour || 50,
      accountsPerDay: limits.accountsPerDay || 5
    };

    // Load existing state
    this.state = this._loadState();
  }

  /**
   * Check if upload is allowed
   * @throws {RateLimitError} if limit exceeded
   */
  async checkUpload() {
    this._cleanOldEntries('uploads', 3600);
    const count = this.state.uploads.length;

    if (count >= this.limits.uploadsPerHour) {
      const oldest = this.state.uploads[0];
      const remaining = Math.ceil((oldest + 3600000 - Date.now()) / 1000);
      throw new RateLimitError('upload', remaining);
    }
  }

  /**
   * Track an upload
   */
  trackUpload() {
    this.state.uploads.push(Date.now());
    this._saveState();
  }

  /**
   * Check if send is allowed
   * @throws {RateLimitError} if limit exceeded
   */
  async checkSend() {
    this._cleanOldEntries('sends', 3600);
    const count = this.state.sends.length;

    if (count >= this.limits.sendsPerHour) {
      const oldest = this.state.sends[0];
      const remaining = Math.ceil((oldest + 3600000 - Date.now()) / 1000);
      throw new RateLimitError('send', remaining);
    }
  }

  /**
   * Track a send
   */
  trackSend() {
    this.state.sends.push(Date.now());
    this._saveState();
  }

  /**
   * Check if account creation is allowed
   * @throws {RateLimitError} if limit exceeded
   */
  async checkAccountCreation() {
    this._cleanOldEntries('accounts', 86400);
    const count = this.state.accounts.length;

    if (count >= this.limits.accountsPerDay) {
      const oldest = this.state.accounts[0];
      const remaining = Math.ceil((oldest + 86400000 - Date.now()) / 1000);
      throw new RateLimitError('account creation', remaining);
    }
  }

  /**
   * Track an account creation
   */
  trackAccountCreation() {
    this.state.accounts.push(Date.now());
    this._saveState();
  }

  /**
   * Get rate limit stats
   */
  getStats() {
    this._cleanOldEntries('uploads', 3600);
    this._cleanOldEntries('sends', 3600);
    this._cleanOldEntries('accounts', 86400);

    return {
      uploads: {
        used: this.state.uploads.length,
        limit: this.limits.uploadsPerHour,
        window: '1 hour'
      },
      sends: {
        used: this.state.sends.length,
        limit: this.limits.sendsPerHour,
        window: '1 hour'
      },
      accounts: {
        used: this.state.accounts.length,
        limit: this.limits.accountsPerDay,
        window: '24 hours'
      }
    };
  }

  /**
   * Reset all limits (for testing)
   */
  reset() {
    this.state = {
      uploads: [],
      sends: [],
      accounts: []
    };
    this._saveState();
  }

  /**
   * Clean entries older than window
   */
  _cleanOldEntries(key, windowSeconds) {
    const cutoff = Date.now() - (windowSeconds * 1000);
    this.state[key] = this.state[key].filter(ts => ts > cutoff);
  }

  /**
   * Load state from storage
   */
  _loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored);
        return {
          uploads: state.uploads || [],
          sends: state.sends || [],
          accounts: state.accounts || []
        };
      }
    } catch (err) {
      console.warn('Failed to load rate limit state:', err);
    }

    return {
      uploads: [],
      sends: [],
      accounts: []
    };
  }

  /**
   * Save state to storage
   */
  _saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (err) {
      console.warn('Failed to save rate limit state:', err);
    }
  }
}

export default RateLimiter;
