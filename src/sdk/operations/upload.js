/**
 * Upload Operations
 *
 * SDK wrapper for upload functionality
 */

import { uploadFile as libUpload, uploadData as libUploadData, getShareableLink as libGetLink, getGatewayLink } from '../../lib/swarm/upload';
import { getAllStamps, requestSponsoredStamp, isStampUsable } from '../../lib/swarm/stamps';

/**
 * Upload a file to Swarm
 * @param {File|Buffer|Uint8Array} file - File to upload
 * @param {Object} options - Upload options
 * @returns {Promise<{reference: string, link: string, filename: string}>}
 */
export async function upload(file, options = {}) {
  const { stampId, filename, contentType, onProgress, beeUrl } = options;

  // Get or request a stamp
  let stamp = stampId;
  if (!stamp) {
    stamp = await getUsableStamp();
  }

  // Determine filename
  let name = filename;
  if (!name && file.name) {
    name = file.name;
  }
  if (!name) {
    name = 'upload';
  }

  // Upload
  const result = await libUpload(file, {
    stamp,
    filename: name,
    contentType: contentType || file.type,
    onProgress
  });

  return {
    reference: result.reference,
    link: libGetLink(result.reference),
    gatewayLink: getGatewayLink(result.reference),
    filename: name
  };
}

/**
 * Upload raw data to Swarm
 * @param {string|Buffer|Uint8Array} data - Data to upload
 * @param {Object} options - Upload options
 * @returns {Promise<{reference: string}>}
 */
export async function uploadData(data, options = {}) {
  const { stampId } = options;

  let stamp = stampId;
  if (!stamp) {
    stamp = await getUsableStamp();
  }

  const result = await libUploadData(data, { stamp });

  return {
    reference: result.reference
  };
}

/**
 * Get a shareable link for a reference
 * @param {string} reference - Swarm reference
 * @returns {string}
 */
export function getShareableLink(reference) {
  return libGetLink(reference);
}

/**
 * Get a usable stamp (sponsored or owned)
 */
async function getUsableStamp() {
  // Try to get existing usable stamps
  const stamps = await getAllStamps();
  const usable = stamps.find(s => isStampUsable(s));

  if (usable) {
    return usable.batchID;
  }

  // Request sponsored stamp
  const sponsored = await requestSponsoredStamp();
  return sponsored.batchID;
}

export default {
  upload,
  uploadData,
  getShareableLink
};
