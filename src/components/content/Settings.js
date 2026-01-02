// Copyright 2019 The FairDataSociety Authors
// This file is part of the FairDataSociety library.
//
// The FairDataSociety library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The FairDataSociety library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the FairDataSociety library. If not, see <http://www.gnu.org/licenses/>.

import React, { Component } from 'react';
import Utils from '../../services/Utils';
import Switch from "react-switch";
import { isEnabled as analyticsIsEnabled, setEnabled as setAnalyticsEnabled } from '../../lib/analytics';
import { Wallet, WalletType, WalletState } from '../../lib/wallet';


//deal with xbrowser copy paste issues
var ua = window.navigator.userAgent;
var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
var webkit = !!ua.match(/WebKit/i);
var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

class Settings extends Component{

  constructor(props){
    super(props);

    this.state = {
      analyticsState: this.analyticsState(),
      addressCopied: false,
      // Wallet state
      externalWallet: null,
      embeddedWallet: null,
      walletConnecting: null, // 'external' | 'embedded' | null
      walletError: null,
      showMnemonic: false,
      mnemonic: null
    }

    this.handleChangeAnalytics = this.handleChangeAnalytics.bind(this);
    this.handleCopyAddress = this.handleCopyAddress.bind(this);
    this.handleConnectExternal = this.handleConnectExternal.bind(this);
    this.handleConnectEmbedded = this.handleConnectEmbedded.bind(this);
    this.handleDisconnectWallet = this.handleDisconnectWallet.bind(this);
  }

  componentDidMount() {
    // Try to reconnect previously connected wallet
    this.tryReconnectWallet();
  }

  async tryReconnectWallet() {
    try {
      const wallet = await Wallet.reconnect();
      if (wallet) {
        if (wallet.type === WalletType.EXTERNAL) {
          this.setState({ externalWallet: wallet });
        } else {
          this.setState({ embeddedWallet: wallet });
        }
      }
    } catch (error) {
      console.warn('Failed to reconnect wallet:', error);
    }
  }

  async handleConnectExternal() {
    this.setState({ walletConnecting: 'external', walletError: null });

    try {
      const wallet = await Wallet.connect({ type: WalletType.EXTERNAL });
      this.setState({
        externalWallet: wallet,
        walletConnecting: null
      });
    } catch (error) {
      this.setState({
        walletConnecting: null,
        walletError: error.message
      });
    }
  }

  async handleConnectEmbedded() {
    this.setState({ walletConnecting: 'embedded', walletError: null });

    try {
      const wallet = await Wallet.connect({ type: WalletType.EMBEDDED });

      // Check if this is a new wallet with mnemonic to backup
      const result = wallet.adapter._lastConnectResult;

      this.setState({
        embeddedWallet: wallet,
        walletConnecting: null,
        // Show mnemonic if it's a new wallet
        showMnemonic: result?.isNew && result?.mnemonic,
        mnemonic: result?.mnemonic
      });
    } catch (error) {
      this.setState({
        walletConnecting: null,
        walletError: error.message
      });
    }
  }

  handleDisconnectWallet(type) {
    if (type === 'external' && this.state.externalWallet) {
      this.state.externalWallet.disconnect();
      this.setState({ externalWallet: null });
    } else if (type === 'embedded' && this.state.embeddedWallet) {
      this.state.embeddedWallet.disconnect();
      this.setState({ embeddedWallet: null });
    }
  }

  handleCopyAddress(){
    const address = this.props.selectedMailbox.address;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(address).then(() => {
        this.setState({ addressCopied: true });
        setTimeout(() => this.setState({ addressCopied: false }), 2000);
      });
    } else {
      // Fallback
      if(iOSSafari){
        var el = document.querySelector(".mailbox-address-input");
        var oldContentEditable = el.contentEditable,
            oldReadOnly = el.readOnly,
            range = document.createRange();

        el.contentEditable = true;
        el.readOnly = false;
        range.selectNodeContents(el);

        var s = window.getSelection();
        s.removeAllRanges();
        s.addRange(range);

        el.setSelectionRange(0, 999999);

        el.contentEditable = oldContentEditable;
        el.readOnly = oldReadOnly;

        document.execCommand('copy');
      }else{
        var copyText = document.querySelector(".mailbox-address-input");
        copyText.select();
        document.execCommand("copy");
      }
      this.setState({ addressCopied: true });
      setTimeout(() => this.setState({ addressCopied: false }), 2000);
    }
  }

  fileSize(){
    if(this.props.savedAppState && this.props.savedAppState.totalStoredSize){
      return Utils.humanFileSize(this.props.savedAppState.totalStoredSize);
    }else{
      return "0 B"
    }
  }

  mailboxAddress(){
    return this.props.selectedMailbox.address;
  }

  truncatedAddress(){
    const addr = this.props.selectedMailbox.address;
    if (addr && addr.length > 16) {
      return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
    }
    return addr;
  }

  handleChangeAnalytics(input){
    setAnalyticsEnabled(input);
    this.setState({analyticsState: input});
  }

  analyticsState(){
    return analyticsIsEnabled();
  }

  renderWalletSection() {
    const { externalWallet, embeddedWallet, walletConnecting, walletError } = this.state;

    return (
      <div className="settings-section">
        <h2 className="settings-section-title">Wallet</h2>

        {walletError && (
          <div className="settings-error">
            {walletError}
          </div>
        )}

        {/* External Wallet */}
        <div className="settings-row">
          <span className="settings-label">
            External Wallet
            <span className="settings-hint">MetaMask, WalletConnect</span>
          </span>
          <span className="settings-value">
            {externalWallet ? (
              <>
                <code>{externalWallet.formatAddress()}</code>
                <button
                  className="settings-btn-disconnect"
                  onClick={() => this.handleDisconnectWallet('external')}
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                className="settings-btn-primary"
                onClick={this.handleConnectExternal}
                disabled={walletConnecting === 'external'}
              >
                {walletConnecting === 'external' ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </span>
        </div>

        {/* Embedded Wallet */}
        <div className="settings-row">
          <span className="settings-label">
            Embedded Wallet
            <span className="settings-hint">Self-custodial, in-browser</span>
          </span>
          <span className="settings-value">
            {embeddedWallet ? (
              <>
                <code>{embeddedWallet.formatAddress()}</code>
                <button
                  className="settings-btn-disconnect"
                  onClick={() => this.handleDisconnectWallet('embedded')}
                >
                  Lock
                </button>
              </>
            ) : (
              <button
                className="settings-btn-primary"
                onClick={this.handleConnectEmbedded}
                disabled={walletConnecting === 'embedded'}
              >
                {walletConnecting === 'embedded' ? 'Setting up...' : 'Create Wallet'}
              </button>
            )}
          </span>
        </div>

        {/* Mnemonic backup notice */}
        {this.state.showMnemonic && this.state.mnemonic && (
          <div className="settings-mnemonic-notice">
            <strong>Backup your recovery phrase!</strong>
            <p>Write down these 12 words and keep them safe. You will need them to recover your wallet.</p>
            <code className="settings-mnemonic">{this.state.mnemonic}</code>
            <button
              className="settings-btn-primary"
              onClick={() => this.setState({ showMnemonic: false, mnemonic: null })}
            >
              I've saved my recovery phrase
            </button>
          </div>
        )}
      </div>
    );
  }

  render(){
    return (
      <div className="content-outer content-settings">
        <div className="settings-outer">
            <button className={ "close-settings hamburger hamburger--spin is-active" } type="button" onClick={()=>{this.props.toggleContent(false)}}>
              <span className="hamburger-box">
                <span className="hamburger-inner"></span>
              </span>
            </button>
        </div>
        <div className="content-inner">
          <div className="content-text">
            {this.props.selectedMailbox &&
              <div className="settings-inner">
                <h1>Settings</h1>

                {/* Account Section */}
                <div className="settings-section">
                  <h2 className="settings-section-title">Account</h2>

                  <div className="settings-row">
                    <span className="settings-label">Username</span>
                    <span className="settings-value">
                      <strong>{this.props.selectedMailbox.subdomain}</strong>
                      <span className="settings-domain">.fairdrop.eth</span>
                    </span>
                  </div>

                  <div className="settings-row">
                    <span className="settings-label">Address</span>
                    <span className="settings-value settings-address">
                      <code>{this.truncatedAddress()}</code>
                      <button className="settings-copy-btn" onClick={this.handleCopyAddress}>
                        {this.state.addressCopied ? 'Copied!' : 'Copy'}
                      </button>
                      <input
                        type="text"
                        className="mailbox-address-input"
                        value={this.mailboxAddress()}
                        readOnly
                        style={{position: 'absolute', left: '-9999px'}}
                      />
                    </span>
                  </div>
                </div>

                {/* ENS Section - Roadmap Placeholder */}
                <div className="settings-section">
                  <h2 className="settings-section-title">
                    ENS Identity
                    <span className="settings-coming-soon">Coming Soon</span>
                  </h2>

                  <div className="settings-row settings-disabled">
                    <span className="settings-label">Custom Domain</span>
                    <span className="settings-value">
                      <span className="settings-placeholder">yourname.eth</span>
                    </span>
                  </div>

                  <div className="settings-row settings-disabled">
                    <span className="settings-label">Migrate Domain</span>
                    <span className="settings-value">
                      <button className="settings-btn-outline" disabled>Setup ENS</button>
                    </span>
                  </div>
                </div>

                {/* Storage Section */}
                <div className="settings-section">
                  <h2 className="settings-section-title">Storage</h2>

                  <div className="settings-row">
                    <span className="settings-label">Provider</span>
                    <span className="settings-value">Swarm Network</span>
                  </div>

                  <div className="settings-row">
                    <span className="settings-label">Used Space</span>
                    <span className="settings-value">{this.fileSize()}</span>
                  </div>

                  <div className="settings-row">
                    <span className="settings-label">Postage Stamp</span>
                    <span className="settings-value">
                      <span className="settings-stamp-badge">Free Tier</span>
                    </span>
                  </div>

                  <div className="settings-row settings-disabled">
                    <span className="settings-label">Buy Stamp</span>
                    <span className="settings-value">
                      <button className="settings-btn-outline" disabled>
                        Purchase via Beeport
                        <span className="settings-coming-soon-inline">Soon</span>
                      </button>
                    </span>
                  </div>
                </div>

                {/* Wallet Section - Now functional */}
                {this.renderWalletSection()}

                {/* Preferences Section */}
                <div className="settings-section">
                  <h2 className="settings-section-title">Preferences</h2>

                  <div className="settings-row">
                    <span className="settings-label">
                      Analytics
                      <span className="settings-hint">Help improve Fairdrop</span>
                    </span>
                    <span className="settings-value">
                      <Switch
                        onChange={this.handleChangeAnalytics}
                        checked={this.state.analyticsState}
                        onColor="#5B8DEF"
                        offColor="#666"
                        height={24}
                        width={48}
                      />
                    </span>
                  </div>
                </div>

                {/* Version Info */}
                <div className="settings-footer">
                  <span>Fairdrop v0.9.0</span>
                  <span className="settings-footer-links">
                    <a href="https://github.com/fairDataSociety/Fairdrop" target="_blank" rel="noopener noreferrer">GitHub</a>
                    <a href="https://fairdatasociety.org" target="_blank" rel="noopener noreferrer">Fair Data Society</a>
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

export default Settings;
