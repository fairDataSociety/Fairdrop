/**
 * Fairdrop SDK
 *
 * Programmatic API for AI agents and automated workflows.
 * Provides a consistent interface for upload, download, send, and inbox operations.
 *
 * Features:
 * - Isomorphic: Works in browser and Node.js
 * - Rate limited: Built-in protection against abuse
 * - Signed operations: EIP-712 signatures for authentication
 *
 * @example
 * import { Fairdrop } from '@fairdrop/sdk';
 *
 * const fd = new Fairdrop({ wallet });
 * await fd.upload(file);
 * await fd.send(file, recipient);
 * const messages = await fd.inbox.list();
 */

import { FairdropSDK } from './fairdrop-sdk';
import { RateLimiter, RateLimitError } from './security/rate-limiter';
import { SignatureValidator } from './security/signature-validator';

// Re-export main class
export { FairdropSDK, FairdropSDK as Fairdrop };

// Re-export security utilities
export { RateLimiter, RateLimitError, SignatureValidator };

// Re-export operations
export { upload, uploadData, getShareableLink } from './operations/upload';
export { download, downloadData } from './operations/download';
export { send, sendEncrypted } from './operations/send';
export { getInbox, pollInbox, markAsRead } from './operations/inbox';

// Default export
export default FairdropSDK;
