/**
 * Stamp Top-Up Component
 *
 * Modal for topping up or purchasing postage stamps.
 */

import React, { useState, useEffect } from 'react';
import { purchaseStamp, getStampQuote, PaymentChain, PaymentToken, StampStatus } from '../lib/beeport';

const STATUS_MESSAGES = {
  [StampStatus.IDLE]: 'Ready',
  [StampStatus.QUOTING]: 'Getting quote...',
  [StampStatus.APPROVING]: 'Approving tokens...',
  [StampStatus.PURCHASING]: 'Purchasing stamp...',
  [StampStatus.CONFIRMING]: 'Waiting for confirmation...',
  [StampStatus.COMPLETE]: 'Complete!',
  [StampStatus.ERROR]: 'Error'
};

function StampTopUp({ wallet, stamp, quote: initialQuote, onClose, onSuccess }) {
  const [chain, setChain] = useState(PaymentChain.GNOSIS);
  const [token, setToken] = useState(PaymentToken.XBZZ);
  const [sizeGB, setSizeGB] = useState(1);
  const [durationDays, setDurationDays] = useState(14);
  const [quote, setQuote] = useState(initialQuote);
  const [status, setStatus] = useState(StampStatus.IDLE);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Mode: 'topup' for existing stamp, 'purchase' for new stamp
  const mode = stamp ? 'topup' : 'purchase';

  useEffect(() => {
    if (!initialQuote) {
      getQuote();
    }
  }, [sizeGB, durationDays, chain, token]);

  async function getQuote() {
    try {
      const q = await getStampQuote({
        sizeBytes: sizeGB * 1024 * 1024 * 1024,
        durationDays,
        paymentChain: chain,
        paymentToken: token
      });
      setQuote(q);
    } catch (err) {
      console.error('Quote error:', err);
    }
  }

  async function handlePurchase() {
    if (!wallet) {
      setError('Please connect your wallet first');
      return;
    }

    setError(null);
    setResult(null);

    try {
      const purchaseResult = await purchaseStamp({
        amount: quote.price,
        paymentChain: chain,
        paymentToken: token,
        wallet,
        depth: quote.depth,
        ttl: durationDays * 24 * 60 * 60,
        onStatusChange: setStatus
      });

      setResult(purchaseResult);
      if (onSuccess) {
        onSuccess(purchaseResult);
      }
    } catch (err) {
      setError(err.message);
      setStatus(StampStatus.ERROR);
    }
  }

  const isProcessing = status !== StampStatus.IDLE && status !== StampStatus.COMPLETE && status !== StampStatus.ERROR;

  return (
    <div className="stamp-topup-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="stamp-topup-modal">
        <button className="stamp-topup-close" onClick={onClose}>×</button>

        <h2>{mode === 'topup' ? 'Top Up Stamp' : 'Purchase Stamp'}</h2>

        {mode === 'topup' && stamp && (
          <div className="stamp-topup-info">
            <p>Top up stamp: <code>{stamp.batchID.slice(0, 12)}...</code></p>
          </div>
        )}

        {!result && (
          <>
            <div className="stamp-topup-form">
              <div className="stamp-topup-row">
                <label>Payment Chain</label>
                <select value={chain} onChange={(e) => setChain(e.target.value)} disabled={isProcessing}>
                  <option value={PaymentChain.GNOSIS}>Gnosis Chain (xBZZ)</option>
                  <option value={PaymentChain.ETHEREUM} disabled>Ethereum (Coming Soon)</option>
                  <option value={PaymentChain.POLYGON} disabled>Polygon (Coming Soon)</option>
                </select>
              </div>

              <div className="stamp-topup-row">
                <label>Payment Token</label>
                <select value={token} onChange={(e) => setToken(e.target.value)} disabled={isProcessing}>
                  <option value={PaymentToken.XBZZ}>xBZZ</option>
                  <option value={PaymentToken.DAI} disabled>DAI (Coming Soon)</option>
                  <option value={PaymentToken.USDC} disabled>USDC (Coming Soon)</option>
                </select>
              </div>

              {mode === 'purchase' && (
                <>
                  <div className="stamp-topup-row">
                    <label>Storage Size</label>
                    <div className="stamp-topup-slider">
                      <input
                        type="range"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value={sizeGB}
                        onChange={(e) => setSizeGB(parseFloat(e.target.value))}
                        disabled={isProcessing}
                      />
                      <span>{sizeGB} GB</span>
                    </div>
                  </div>

                  <div className="stamp-topup-row">
                    <label>Duration</label>
                    <div className="stamp-topup-slider">
                      <input
                        type="range"
                        min="1"
                        max="365"
                        step="1"
                        value={durationDays}
                        onChange={(e) => setDurationDays(parseInt(e.target.value))}
                        disabled={isProcessing}
                      />
                      <span>{durationDays} days</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {quote && (
              <div className="stamp-topup-quote">
                <div className="stamp-topup-quote-row">
                  <span>Estimated Cost</span>
                  <span className="stamp-topup-price">{quote.price} {token}</span>
                </div>
                <div className="stamp-topup-quote-row">
                  <span>Batch Depth</span>
                  <span>{quote.depth}</span>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="stamp-topup-status">
                <div className="stamp-topup-spinner" />
                <span>{STATUS_MESSAGES[status]}</span>
              </div>
            )}

            {error && (
              <div className="stamp-topup-error">
                {error}
              </div>
            )}

            <div className="stamp-topup-actions">
              <button
                className="stamp-topup-btn-secondary"
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                className="stamp-topup-btn-primary"
                onClick={handlePurchase}
                disabled={!quote || isProcessing || !wallet}
              >
                {isProcessing ? STATUS_MESSAGES[status] : (mode === 'topup' ? 'Top Up' : 'Purchase')}
              </button>
            </div>
          </>
        )}

        {result && (
          <div className="stamp-topup-success">
            <div className="stamp-topup-check">✓</div>
            <h3>Stamp {mode === 'topup' ? 'Topped Up' : 'Purchased'}!</h3>
            <div className="stamp-topup-result">
              <div className="stamp-topup-result-row">
                <span>Stamp ID</span>
                <code>{result.stampId.slice(0, 16)}...</code>
              </div>
              <div className="stamp-topup-result-row">
                <span>Transaction</span>
                <a
                  href={`https://gnosisscan.io/tx/${result.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Explorer
                </a>
              </div>
            </div>
            <button className="stamp-topup-btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default StampTopUp;
