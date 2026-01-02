/**
 * Storage Dashboard Component
 *
 * Displays storage status, stamp information, and top-up options.
 */

import React, { useState, useEffect } from 'react';
import { getAllStamps, isStampUsable } from '../lib/swarm/stamps';
import { getStampQuote, PaymentChain, PaymentToken } from '../lib/beeport';

function StorageDashboard({ wallet, onTopUp }) {
  const [stamps, setStamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStamp, setSelectedStamp] = useState(null);
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    loadStamps();
  }, []);

  async function loadStamps() {
    setLoading(true);
    try {
      const allStamps = await getAllStamps();
      // Filter to usable stamps and sort by expiration
      const usable = allStamps
        .filter(s => isStampUsable(s))
        .sort((a, b) => (b.batchTTL || 0) - (a.batchTTL || 0));
      setStamps(usable);

      // Select first stamp by default
      if (usable.length > 0) {
        setSelectedStamp(usable[0]);
      }
    } catch (error) {
      console.error('Failed to load stamps:', error);
    }
    setLoading(false);
  }

  async function handleQuote() {
    try {
      const q = await getStampQuote({
        sizeBytes: 1024 * 1024 * 100, // 100MB
        durationDays: 14,
        paymentChain: PaymentChain.GNOSIS,
        paymentToken: PaymentToken.XBZZ
      });
      setQuote(q);
    } catch (error) {
      console.error('Failed to get quote:', error);
    }
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function formatDays(seconds) {
    if (!seconds) return 'Unknown';
    const days = Math.floor(seconds / 86400);
    if (days < 1) return 'Less than a day';
    if (days === 1) return '1 day';
    return `${days} days`;
  }

  function getExpirationClass(seconds) {
    if (!seconds) return '';
    const days = seconds / 86400;
    if (days <= 3) return 'storage-expiring-soon';
    if (days <= 7) return 'storage-expiring';
    return '';
  }

  if (loading) {
    return (
      <div className="storage-dashboard">
        <div className="storage-loading">Loading storage info...</div>
      </div>
    );
  }

  return (
    <div className="storage-dashboard">
      <div className="storage-header">
        <h3>Storage Status</h3>
        <button className="storage-refresh" onClick={loadStamps}>
          Refresh
        </button>
      </div>

      {stamps.length === 0 ? (
        <div className="storage-empty">
          <p>No active stamps found.</p>
          <p className="storage-hint">
            You can use sponsored stamps for free uploads, or purchase your own for longer storage.
          </p>
          <button className="storage-btn-primary" onClick={handleQuote}>
            Get Stamp Quote
          </button>
        </div>
      ) : (
        <div className="storage-stamps">
          {stamps.map(stamp => (
            <div
              key={stamp.batchID}
              className={`storage-stamp ${selectedStamp?.batchID === stamp.batchID ? 'selected' : ''} ${getExpirationClass(stamp.batchTTL)}`}
              onClick={() => setSelectedStamp(stamp)}
            >
              <div className="storage-stamp-id">
                <code>{stamp.batchID.slice(0, 8)}...{stamp.batchID.slice(-6)}</code>
              </div>
              <div className="storage-stamp-info">
                <span className="storage-stamp-capacity">
                  Depth {stamp.depth} ({formatBytes(Math.pow(2, stamp.depth) * 4096)})
                </span>
                <span className="storage-stamp-ttl">
                  {formatDays(stamp.batchTTL)} remaining
                </span>
              </div>
              <div className="storage-stamp-utilization">
                <div
                  className="storage-stamp-bar"
                  style={{ width: `${Math.min(100, (stamp.utilization || 0))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedStamp && (
        <div className="storage-selected">
          <h4>Selected Stamp</h4>
          <div className="storage-details">
            <div className="storage-detail-row">
              <span>Batch ID</span>
              <code>{selectedStamp.batchID}</code>
            </div>
            <div className="storage-detail-row">
              <span>Capacity</span>
              <span>{formatBytes(Math.pow(2, selectedStamp.depth) * 4096)}</span>
            </div>
            <div className="storage-detail-row">
              <span>Expires In</span>
              <span className={getExpirationClass(selectedStamp.batchTTL)}>
                {formatDays(selectedStamp.batchTTL)}
              </span>
            </div>
            <div className="storage-detail-row">
              <span>Utilization</span>
              <span>{selectedStamp.utilization || 0}%</span>
            </div>
          </div>

          <div className="storage-actions">
            <button
              className="storage-btn-primary"
              onClick={() => onTopUp && onTopUp(selectedStamp)}
              disabled={!wallet}
            >
              Top Up Stamp
            </button>
            {!wallet && (
              <span className="storage-hint">Connect wallet to top up</span>
            )}
          </div>
        </div>
      )}

      {quote && (
        <div className="storage-quote">
          <h4>Purchase Quote</h4>
          <div className="storage-quote-details">
            <p>100MB storage for 14 days:</p>
            <p className="storage-quote-price">{quote.price} {PaymentToken.XBZZ}</p>
          </div>
          <button
            className="storage-btn-primary"
            onClick={() => onTopUp && onTopUp(null, quote)}
            disabled={!wallet}
          >
            Purchase New Stamp
          </button>
        </div>
      )}
    </div>
  );
}

export default StorageDashboard;
