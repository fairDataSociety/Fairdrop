/**
 * ENS Migration Component
 *
 * Allows users to:
 * 1. View their current fairdrop.eth subdomain
 * 2. Migrate to a custom ENS domain they own
 */

import React, { useState, useEffect } from 'react';
import { migrateToCustomDomain, resolveENSName, isENSName, ENS_DOMAIN } from '../lib/ens';

const MigrationStatus = {
  IDLE: 'idle',
  CHECKING: 'checking',
  MIGRATING: 'migrating',
  SUCCESS: 'success',
  ERROR: 'error'
};

function ENSMigration({ wallet, currentUsername, onMigrationComplete }) {
  const [customDomain, setCustomDomain] = useState('');
  const [domainValid, setDomainValid] = useState(null);
  const [domainOwner, setDomainOwner] = useState(null);
  const [status, setStatus] = useState(MigrationStatus.IDLE);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const currentENS = `${currentUsername}.${ENS_DOMAIN}`;

  useEffect(() => {
    if (customDomain && isENSName(customDomain)) {
      checkDomain();
    } else {
      setDomainValid(null);
      setDomainOwner(null);
    }
  }, [customDomain]);

  async function checkDomain() {
    setStatus(MigrationStatus.CHECKING);
    setDomainValid(null);
    setDomainOwner(null);

    try {
      const address = await resolveENSName(customDomain);

      if (!address) {
        setDomainValid(false);
        setError('Domain not found on ENS');
        setStatus(MigrationStatus.IDLE);
        return;
      }

      setDomainOwner(address);

      // Check if connected wallet owns this domain
      if (wallet) {
        const walletAddress = wallet.address;
        const matches = address.toLowerCase() === walletAddress?.toLowerCase();
        setDomainValid(matches);

        if (!matches) {
          setError('Connected wallet does not own this domain');
        } else {
          setError(null);
        }
      } else {
        setDomainValid(null);
        setError('Connect wallet to verify ownership');
      }

      setStatus(MigrationStatus.IDLE);
    } catch (err) {
      setDomainValid(false);
      setError(err.message);
      setStatus(MigrationStatus.IDLE);
    }
  }

  async function handleMigrate() {
    if (!wallet || !domainValid) return;

    setStatus(MigrationStatus.MIGRATING);
    setError(null);
    setResult(null);

    try {
      const migrationResult = await migrateToCustomDomain(
        customDomain,
        currentUsername,
        wallet
      );

      if (migrationResult.success) {
        setResult(migrationResult);
        setStatus(MigrationStatus.SUCCESS);
        if (onMigrationComplete) {
          onMigrationComplete(migrationResult);
        }
      } else {
        throw new Error(migrationResult.error);
      }
    } catch (err) {
      setError(err.message);
      setStatus(MigrationStatus.ERROR);
    }
  }

  function formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return (
    <div className="ens-migration">
      <div className="ens-migration-current">
        <span className="ens-migration-label">Current Identity</span>
        <code className="ens-migration-domain">{currentENS}</code>
      </div>

      {status === MigrationStatus.SUCCESS ? (
        <div className="ens-migration-success">
          <div className="ens-migration-check">✓</div>
          <h4>Migration Complete!</h4>
          <p>
            Your Fairdrop identity has been migrated from
            <code>{currentENS}</code> to <code>{customDomain}</code>
          </p>
          <div className="ens-migration-txs">
            {result?.txHashes?.map((hash, i) => (
              <a
                key={i}
                href={`https://etherscan.io/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Transaction {i + 1}
              </a>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="ens-migration-form">
            <label>Migrate to Custom Domain</label>
            <div className="ens-migration-input-row">
              <input
                type="text"
                placeholder="yourname.eth"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
                disabled={status === MigrationStatus.MIGRATING}
              />
              {status === MigrationStatus.CHECKING && (
                <span className="ens-migration-checking">Checking...</span>
              )}
            </div>

            {domainOwner && (
              <div className="ens-migration-owner">
                <span>Owner:</span>
                <code>{formatAddress(domainOwner)}</code>
                {domainValid ? (
                  <span className="ens-migration-valid">✓ Yours</span>
                ) : (
                  <span className="ens-migration-invalid">✗ Not yours</span>
                )}
              </div>
            )}

            {error && status !== MigrationStatus.MIGRATING && (
              <div className="ens-migration-error">{error}</div>
            )}
          </div>

          <div className="ens-migration-info">
            <h5>What gets migrated?</h5>
            <ul>
              <li>Your Fairdrop public key</li>
              <li>Your inbox parameters (GSOC settings)</li>
            </ul>
            <p className="ens-migration-note">
              After migration, people can send to <code>{customDomain || 'yourname.eth'}</code> instead of <code>{currentENS}</code>
            </p>
          </div>

          <div className="ens-migration-actions">
            <button
              className="ens-migration-btn-primary"
              onClick={handleMigrate}
              disabled={!domainValid || status === MigrationStatus.MIGRATING || !wallet}
            >
              {status === MigrationStatus.MIGRATING ? 'Migrating...' : 'Migrate Identity'}
            </button>

            {!wallet && (
              <span className="ens-migration-hint">Connect wallet first</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ENSMigration;
