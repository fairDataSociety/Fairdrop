/**
 * Share Handler Component
 *
 * Handles incoming shares from the PWA Share Target.
 * Retrieves shared files from IndexedDB and presents upload options.
 */

import React, { useState, useEffect } from 'react';

/**
 * Check for pending shares
 */
export function checkPendingShare() {
  const params = new URLSearchParams(window.location.search);
  return params.get('share') === 'pending';
}

/**
 * Retrieve pending share data from IndexedDB
 */
export async function getPendingShare() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fairdrop-share', 1);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending')) {
        db.createObjectStore('pending', { keyPath: 'timestamp' });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('pending', 'readonly');
      const store = tx.objectStore('pending');
      const getAll = store.getAll();

      getAll.onsuccess = () => {
        db.close();
        // Return most recent share
        const shares = getAll.result.sort((a, b) => b.timestamp - a.timestamp);
        resolve(shares[0] || null);
      };
      getAll.onerror = () => reject(getAll.error);
    };
  });
}

/**
 * Clear pending share from IndexedDB
 */
export async function clearPendingShare(timestamp) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fairdrop-share', 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('pending', 'readwrite');
      const store = tx.objectStore('pending');

      if (timestamp) {
        store.delete(timestamp);
      } else {
        store.clear();
      }

      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    };
  });
}

/**
 * Convert base64 data URL to File
 */
function dataURLtoFile(dataURL, filename) {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

/**
 * Share Handler Modal Component
 */
function ShareHandler({ onFile, onClose }) {
  const [share, setShare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadShare();
  }, []);

  async function loadShare() {
    setLoading(true);
    try {
      const data = await getPendingShare();
      setShare(data);

      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('share');
      window.history.replaceState({}, '', url.toString());
    } catch (err) {
      console.error('Failed to load share:', err);
      setError('Failed to load shared content');
    }
    setLoading(false);
  }

  async function handleUpload(mode) {
    if (!share || share.files.length === 0) return;

    try {
      // Convert base64 back to File
      const file = dataURLtoFile(share.files[0].data, share.files[0].name);

      // Clear the pending share
      await clearPendingShare(share.timestamp);

      // Pass to parent handler
      if (onFile) {
        onFile(file, mode);
      }

      onClose();
    } catch (err) {
      console.error('Failed to process share:', err);
      setError('Failed to process shared file');
    }
  }

  if (loading) {
    return (
      <div className="share-handler-overlay">
        <div className="share-handler-modal">
          <div className="share-handler-loading">Loading shared content...</div>
        </div>
      </div>
    );
  }

  if (error || !share) {
    return (
      <div className="share-handler-overlay" onClick={onClose}>
        <div className="share-handler-modal" onClick={e => e.stopPropagation()}>
          <h3>Share Error</h3>
          <p>{error || 'No shared content found'}</p>
          <button className="share-handler-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  const hasFiles = share.files && share.files.length > 0;
  const file = hasFiles ? share.files[0] : null;

  return (
    <div className="share-handler-overlay" onClick={onClose}>
      <div className="share-handler-modal" onClick={e => e.stopPropagation()}>
        <button className="share-handler-close" onClick={onClose}>×</button>

        <h3>Shared Content</h3>

        {hasFiles && (
          <div className="share-handler-file">
            <div className="share-handler-file-icon">📄</div>
            <div className="share-handler-file-info">
              <div className="share-handler-file-name">{file.name}</div>
              <div className="share-handler-file-meta">
                {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown type'}
              </div>
            </div>
          </div>
        )}

        {share.text && (
          <div className="share-handler-text">
            <label>Shared text:</label>
            <p>{share.text}</p>
          </div>
        )}

        {share.url && (
          <div className="share-handler-url">
            <label>Shared URL:</label>
            <a href={share.url} target="_blank" rel="noopener noreferrer">{share.url}</a>
          </div>
        )}

        {hasFiles && (
          <div className="share-handler-actions">
            <h4>What would you like to do?</h4>

            <button className="share-handler-action" onClick={() => handleUpload('send')}>
              <span className="share-handler-action-icon">🔐</span>
              <span className="share-handler-action-label">Send Encrypted</span>
              <span className="share-handler-action-desc">Send securely to someone</span>
            </button>

            <button className="share-handler-action" onClick={() => handleUpload('store')}>
              <span className="share-handler-action-icon">💾</span>
              <span className="share-handler-action-label">Store File</span>
              <span className="share-handler-action-desc">Save to your personal storage</span>
            </button>

            <button className="share-handler-action" onClick={() => handleUpload('quick')}>
              <span className="share-handler-action-icon">🔗</span>
              <span className="share-handler-action-label">Quick Share</span>
              <span className="share-handler-action-desc">Create a shareable link</span>
            </button>
          </div>
        )}

        {!hasFiles && !share.text && !share.url && (
          <div className="share-handler-empty">
            <p>No content was shared.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShareHandler;
