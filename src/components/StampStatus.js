/**
 * StampStatus Component
 * Shows postage stamp status and remaining free uploads
 */

import React, { Component } from 'react';
import { getAllStamps, requestSponsoredStamp } from '../lib/swarm/stamps';

// Rate limit tracking
const RATE_LIMIT_KEY = 'fairdrop_upload_count';
const RATE_LIMIT_DATE_KEY = 'fairdrop_upload_date';
const FREE_UPLOADS_PER_DAY = 5;

class StampStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'checking', // checking, sponsored, local, none
      remainingFree: this.getRemainingFreeUploads(),
      localStamps: [],
      error: null
    };
  }

  componentDidMount() {
    this.checkStampStatus();
  }

  getRemainingFreeUploads() {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem(RATE_LIMIT_DATE_KEY);

    if (savedDate !== today) {
      // Reset counter for new day
      localStorage.setItem(RATE_LIMIT_DATE_KEY, today);
      localStorage.setItem(RATE_LIMIT_KEY, '0');
      return FREE_UPLOADS_PER_DAY;
    }

    const count = parseInt(localStorage.getItem(RATE_LIMIT_KEY) || '0');
    return Math.max(0, FREE_UPLOADS_PER_DAY - count);
  }

  incrementUploadCount() {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem(RATE_LIMIT_DATE_KEY);

    if (savedDate !== today) {
      localStorage.setItem(RATE_LIMIT_DATE_KEY, today);
      localStorage.setItem(RATE_LIMIT_KEY, '1');
    } else {
      const count = parseInt(localStorage.getItem(RATE_LIMIT_KEY) || '0');
      localStorage.setItem(RATE_LIMIT_KEY, String(count + 1));
    }

    this.setState({ remainingFree: this.getRemainingFreeUploads() });
  }

  async checkStampStatus() {
    try {
      // Check for local stamps first
      const stamps = await getAllStamps();
      const usableStamps = stamps.filter(s => s.usable);

      if (usableStamps.length > 0) {
        this.setState({
          status: 'local',
          localStamps: usableStamps,
          error: null
        });
        return;
      }

      // No local stamps, check if sponsored stamps available
      if (this.getRemainingFreeUploads() > 0) {
        this.setState({
          status: 'sponsored',
          error: null
        });
      } else {
        this.setState({
          status: 'exhausted',
          error: 'Daily free uploads exhausted'
        });
      }
    } catch (error) {
      console.error('Stamp status check failed:', error);
      this.setState({
        status: 'error',
        error: error.message
      });
    }
  }

  renderStatusBadge() {
    const { status, remainingFree } = this.state;

    switch (status) {
      case 'checking':
        return <span className="stamp-badge stamp-checking">Checking...</span>;

      case 'local':
        return <span className="stamp-badge stamp-local">Local Node Active</span>;

      case 'sponsored':
        return (
          <span className="stamp-badge stamp-sponsored">
            {remainingFree} free upload{remainingFree !== 1 ? 's' : ''} today
          </span>
        );

      case 'exhausted':
        return (
          <span className="stamp-badge stamp-exhausted">
            Free tier exhausted
          </span>
        );

      case 'error':
        return <span className="stamp-badge stamp-error">Unavailable</span>;

      default:
        return null;
    }
  }

  render() {
    const { status, error } = this.state;
    const { minimal } = this.props;

    if (minimal) {
      return this.renderStatusBadge();
    }

    return (
      <div className="stamp-status-container">
        <div className="stamp-status-header">
          <span className="stamp-status-label">Storage Status</span>
          {this.renderStatusBadge()}
        </div>

        {status === 'exhausted' && (
          <div className="stamp-status-message">
            <p>You've used your {FREE_UPLOADS_PER_DAY} free uploads for today.</p>
            <p>Get more uploads by:</p>
            <ul>
              <li>Waiting until tomorrow for free tier reset</li>
              <li>Running a local Bee node</li>
              <li>Purchasing your own postage stamp</li>
            </ul>
          </div>
        )}

        {error && status === 'error' && (
          <div className="stamp-status-error">
            {error}
          </div>
        )}
      </div>
    );
  }
}

// Static method for components to check before upload
StampStatus.canUpload = function() {
  const today = new Date().toDateString();
  const savedDate = localStorage.getItem(RATE_LIMIT_DATE_KEY);

  if (savedDate !== today) {
    return true;
  }

  const count = parseInt(localStorage.getItem(RATE_LIMIT_KEY) || '0');
  return count < FREE_UPLOADS_PER_DAY;
};

// Static method to increment after successful upload
StampStatus.recordUpload = function() {
  const today = new Date().toDateString();
  const savedDate = localStorage.getItem(RATE_LIMIT_DATE_KEY);

  if (savedDate !== today) {
    localStorage.setItem(RATE_LIMIT_DATE_KEY, today);
    localStorage.setItem(RATE_LIMIT_KEY, '1');
  } else {
    const count = parseInt(localStorage.getItem(RATE_LIMIT_KEY) || '0');
    localStorage.setItem(RATE_LIMIT_KEY, String(count + 1));
  }
};

export default StampStatus;
