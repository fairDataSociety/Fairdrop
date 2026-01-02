/**
 * Send Operations
 *
 * SDK wrapper for encrypted sending functionality
 */

import { encryptFile, encryptData } from '../../lib/swarm/encryption';
import { uploadFile } from '../../lib/swarm/upload';
import { writeToInbox } from '../../lib/swarm/gsoc';
import { resolveRecipient, getInboxParams } from '../../lib/ens';
import { getAllStamps, requestSponsoredStamp, isStampUsable } from '../../lib/swarm/stamps';

/**
 * Send an encrypted file to a recipient
 * @param {File|Buffer|Uint8Array} file - File to send
 * @param {string} recipient - Recipient identifier (ENS, username, or public key)
 * @param {Object} options - Send options
 * @returns {Promise<{success: boolean, reference: string, recipientENS: string}>}
 */
export async function send(file, recipient, options = {}) {
  const { subject, message, account } = options;

  // Resolve recipient
  const resolution = await resolveRecipient(recipient);
  if (!resolution.publicKey) {
    throw new Error(`Could not resolve recipient: ${recipient}. Method: ${resolution.method}`);
  }

  // Get recipient inbox params
  const inboxParams = resolution.inboxParams || await getInboxParams(resolution.ensName);
  if (!inboxParams) {
    throw new Error(`Recipient ${recipient} does not have inbox configured`);
  }

  // Get stamp
  const stamp = await getUsableStamp();

  // Encrypt file with recipient's public key
  const encrypted = await encryptFile(file, resolution.publicKey);

  // Upload encrypted file
  const uploadResult = await uploadFile(encrypted.data, {
    stamp,
    filename: `${file.name || 'file'}.encrypted`,
    contentType: 'application/octet-stream'
  });

  // Create metadata
  const metadata = {
    type: 'file',
    filename: file.name || 'file',
    size: file.size || encrypted.data.length,
    contentType: file.type || 'application/octet-stream',
    subject: subject || file.name,
    message: message || null,
    reference: uploadResult.reference,
    encryptionNonce: encrypted.nonce,
    senderPublicKey: account?.publicKey || null,
    senderENS: account?.subdomain ? `${account.subdomain}.fairdrop.eth` : null,
    timestamp: Date.now()
  };

  // Encrypt metadata
  const encryptedMeta = await encryptData(JSON.stringify(metadata), resolution.publicKey);

  // Write to recipient's inbox via GSOC
  const gsocResult = await writeToInbox(
    inboxParams.targetOverlay,
    inboxParams.baseIdentifier,
    encryptedMeta.data,
    { stamp, proximity: inboxParams.proximity }
  );

  return {
    success: true,
    reference: uploadResult.reference,
    recipientENS: resolution.ensName,
    gsocIndex: gsocResult.index
  };
}

/**
 * Send encrypted data (not a file)
 * @param {string} data - Data to send
 * @param {string} recipient - Recipient identifier
 * @param {Object} options - Send options
 */
export async function sendEncrypted(data, recipient, options = {}) {
  const { subject, account } = options;

  // Resolve recipient
  const resolution = await resolveRecipient(recipient);
  if (!resolution.publicKey) {
    throw new Error(`Could not resolve recipient: ${recipient}`);
  }

  // Get inbox params
  const inboxParams = resolution.inboxParams || await getInboxParams(resolution.ensName);
  if (!inboxParams) {
    throw new Error(`Recipient ${recipient} does not have inbox configured`);
  }

  // Get stamp
  const stamp = await getUsableStamp();

  // Create metadata
  const metadata = {
    type: 'data',
    subject: subject || 'Message',
    data: data,
    senderPublicKey: account?.publicKey || null,
    senderENS: account?.subdomain ? `${account.subdomain}.fairdrop.eth` : null,
    timestamp: Date.now()
  };

  // Encrypt metadata
  const encryptedMeta = await encryptData(JSON.stringify(metadata), resolution.publicKey);

  // Write to inbox
  const gsocResult = await writeToInbox(
    inboxParams.targetOverlay,
    inboxParams.baseIdentifier,
    encryptedMeta.data,
    { stamp, proximity: inboxParams.proximity }
  );

  return {
    success: true,
    recipientENS: resolution.ensName,
    gsocIndex: gsocResult.index
  };
}

/**
 * Get a usable stamp
 */
async function getUsableStamp() {
  const stamps = await getAllStamps();
  const usable = stamps.find(s => isStampUsable(s));
  if (usable) return usable.batchID;
  const sponsored = await requestSponsoredStamp();
  return sponsored.batchID;
}

export default {
  send,
  sendEncrypted
};
