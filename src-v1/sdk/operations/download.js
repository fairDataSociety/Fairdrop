/**
 * Download Operations
 *
 * SDK wrapper for download functionality
 */

import { downloadFile as libDownload, downloadData as libDownloadData } from '../../lib/swarm/download';

/**
 * Download a file from Swarm
 * @param {string} reference - Swarm reference (hash)
 * @param {Object} options - Download options
 * @returns {Promise<{data: Uint8Array, filename: string, contentType: string}>}
 */
export async function download(reference, options = {}) {
  const result = await libDownload(reference);

  return {
    data: result.data,
    filename: result.filename || 'download',
    contentType: result.contentType || 'application/octet-stream'
  };
}

/**
 * Download raw data from Swarm
 * @param {string} reference - Swarm reference
 * @returns {Promise<Uint8Array>}
 */
export async function downloadData(reference) {
  return libDownloadData(reference);
}

/**
 * Check if a reference is valid
 * @param {string} reference - Swarm reference to check
 * @returns {boolean}
 */
export function isValidReference(reference) {
  if (!reference || typeof reference !== 'string') {
    return false;
  }
  // Swarm references are 64 hex characters
  return /^[a-fA-F0-9]{64}$/.test(reference);
}

export default {
  download,
  downloadData,
  isValidReference
};
