/**
 * Inbox Operations
 *
 * SDK wrapper for inbox/message functionality
 */

import { pollInbox as libPollInbox, subscribeToInbox as libSubscribe, decryptMetadata } from '../../lib/swarm/gsoc';
import { decryptData } from '../../lib/swarm/encryption';
import { downloadData } from '../../lib/swarm/download';

// Local storage key for read messages
const READ_MESSAGES_KEY = 'fairdrop_read_messages';

/**
 * Get inbox messages
 * @param {Object} account - Fairdrop account
 * @returns {Promise<Array>} Messages
 */
export async function getInbox(account) {
  if (!account || !account.gsocParams) {
    throw new Error('Account with GSOC params required');
  }

  const { targetOverlay, baseIdentifier, proximity } = account.gsocParams;
  const messages = await libPollInbox(targetOverlay, baseIdentifier, { proximity });

  // Decrypt and parse messages
  const decrypted = [];
  for (const msg of messages) {
    try {
      const decryptedMeta = await decryptMetadata(msg.data, account.privateKey);
      const meta = JSON.parse(decryptedMeta);

      decrypted.push({
        id: msg.index.toString(),
        index: msg.index,
        ...meta,
        read: isMessageRead(msg.index),
        raw: msg
      });
    } catch (err) {
      console.warn('Failed to decrypt message:', err);
    }
  }

  // Sort by timestamp (newest first)
  decrypted.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  return decrypted;
}

/**
 * Poll for new messages since a timestamp
 * @param {Object} account - Fairdrop account
 * @param {Object} options - Polling options
 * @returns {Promise<Array>} New messages
 */
export async function pollInbox(account, options = {}) {
  const { since, onMessage, interval = 30000, maxPolls = 10 } = options;

  const seen = new Set();
  let pollCount = 0;

  const poll = async () => {
    const messages = await getInbox(account);
    const newMessages = messages.filter(m => {
      if (seen.has(m.id)) return false;
      if (since && m.timestamp < since) return false;
      seen.add(m.id);
      return true;
    });

    if (newMessages.length > 0 && onMessage) {
      for (const msg of newMessages) {
        onMessage(msg);
      }
    }

    return newMessages;
  };

  // Initial poll
  const initial = await poll();

  // Set up interval polling if callback provided
  if (onMessage && maxPolls > 1) {
    const pollInterval = setInterval(async () => {
      pollCount++;
      await poll();
      if (pollCount >= maxPolls) {
        clearInterval(pollInterval);
      }
    }, interval);

    // Return cleanup function
    return {
      messages: initial,
      stop: () => clearInterval(pollInterval)
    };
  }

  return initial;
}

/**
 * Mark a message as read
 * @param {Object} account - Fairdrop account
 * @param {string} messageId - Message ID
 */
export async function markAsRead(account, messageId) {
  const read = getReadMessages();
  read.add(messageId);
  saveReadMessages(read);
}

/**
 * Get message content (download attached file)
 * @param {Object} message - Message object
 * @param {Object} account - Fairdrop account
 * @returns {Promise<{data: Uint8Array, filename: string}>}
 */
export async function getMessageContent(message, account) {
  if (!message.reference) {
    throw new Error('Message has no file reference');
  }

  // Download encrypted file
  const encrypted = await downloadData(message.reference);

  // Decrypt
  const decrypted = await decryptData(encrypted, account.privateKey, {
    nonce: message.encryptionNonce
  });

  return {
    data: decrypted,
    filename: message.filename || 'download',
    contentType: message.contentType || 'application/octet-stream'
  };
}

/**
 * Get read message IDs from storage
 */
function getReadMessages() {
  try {
    const stored = localStorage.getItem(READ_MESSAGES_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
}

/**
 * Save read message IDs to storage
 */
function saveReadMessages(read) {
  try {
    localStorage.setItem(READ_MESSAGES_KEY, JSON.stringify([...read]));
  } catch {
    // Storage not available
  }
}

/**
 * Check if message is read
 */
function isMessageRead(id) {
  return getReadMessages().has(id.toString());
}

/**
 * Subscribe to real-time inbox updates via WebSocket
 *
 * Uses bee.gsocSubscribe() for instant message delivery instead of polling.
 * This is more efficient than polling and provides real-time notifications.
 *
 * @param {Object} account - Fairdrop account with gsocParams
 * @param {Object} options - Subscription options
 * @param {number} options.startIndex - Start from this slot index (default: 0)
 * @param {Function} options.onMessage - Callback when new message arrives
 * @param {Function} options.onError - Callback on subscription errors
 * @returns {Object} Subscription handle { cancel(), isActive(), getCurrentIndex() }
 *
 * @example
 * const subscription = subscribeToInbox(account, {
 *   onMessage: (message) => console.log('New message:', message),
 *   onError: (error) => console.error('Error:', error)
 * });
 *
 * // Later, to stop:
 * subscription.cancel();
 */
export function subscribeToInbox(account, options = {}) {
  if (!account || !account.gsocParams) {
    throw new Error('Account with GSOC params required');
  }

  const { startIndex = 0, onMessage, onError } = options;
  const { targetOverlay, baseIdentifier, proximity } = account.gsocParams;

  const params = { targetOverlay, baseIdentifier, proximity };

  return libSubscribe(params, startIndex, {
    onMessage: async (rawMessage) => {
      try {
        // Decrypt message metadata
        const decryptedMeta = await decryptMetadata(rawMessage.data || rawMessage, account.privateKey);
        const meta = typeof decryptedMeta === 'string' ? JSON.parse(decryptedMeta) : decryptedMeta;

        const message = {
          id: rawMessage.index.toString(),
          index: rawMessage.index,
          ...meta,
          read: false,
          raw: rawMessage
        };

        onMessage?.(message);
      } catch (err) {
        console.warn('[SDK] Failed to process message:', err);
        // Still notify about new message even if decryption fails
        onMessage?.({
          id: rawMessage.index.toString(),
          index: rawMessage.index,
          reference: rawMessage.reference,
          timestamp: rawMessage.timestamp,
          read: false,
          raw: rawMessage
        });
      }
    },
    onError: (error) => {
      console.error('[SDK] Subscription error:', error);
      onError?.(error);
    },
    onClose: () => {
      console.log('[SDK] Subscription closed');
    }
  });
}

export default {
  getInbox,
  pollInbox,
  subscribeToInbox,
  markAsRead,
  getMessageContent
};
