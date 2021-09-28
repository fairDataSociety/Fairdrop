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

import React, { Component } from 'react'
import { withRouter, Link, Route, Switch } from 'react-router-dom'
import FDS from 'fds.js'
import JSZip from 'jszip'
import FileSaver from 'filesaver.js'
import Upload from './components/Upload'
import Dropbox from './components/Dropbox'
import Mailbox from './components/Mailbox'
import DisclaimerSplash from './components/DisclaimerSplash'
import DisclaimerSplash2 from './components/DisclaimerSplash2'
import DisclaimerSplash3 from './components/DisclaimerSplash3'
import Menu from './components/Menu'
import Content from './components/Content'

import FairdropLogo from './components/Shared/svg/FairdropLogo.js'
import MailboxGlyph from './components/Shared/svg/MailboxGlyph.js'
import ProgressBar from './components/Shared/svg/ProgressBar.js'

import * as Sentry from '@sentry/browser'

import FDSPin from './lib/FDSPin.js'
import { notify } from './lib/FDSNotify.js'

import './App.css'
import './lib/DMist.css'
import './lib/DDrop.css'

import { version } from '../package.json'
window.files = []

// let pinningOracleURL = 'https://oracle.fairdrop.pro'; //nb this refers to swarm.fairdrop.pro oracle
let pinningOracleURL = 'https://pinning.fairdrop.pro' //nb this refers to swarm2.fairdatasociety.org's oracle

class App extends Component {
  getInitialState() {
    let hasNotHiddenDisclaimer = localStorage.getItem('hasHiddenDisclaimer') !== 'true'
    let hasNotHiddenDisclaimer2 = localStorage.getItem('hasHiddenDisclaimer2') !== 'true'

    let legacyAccounts = this.FDS.GetAccounts(0)
    let hasNotHiddenDisclaimer3 =
      localStorage.getItem('hasHiddenDisclaimer3') !== 'true' ? legacyAccounts.length > 0 : false

    return {
      navState: true,
      selectedMailbox: false,
      isStoringFile: false,
      isSendingFile: false,
      isQuickFile: false,
      fileIsSelected: false,
      fileWasSelected: false,
      fileIsSelecting0: false,
      fileIsSelecting1: false,
      disclaimersAreShown: hasNotHiddenDisclaimer,
      disclaimersAreShown2: hasNotHiddenDisclaimer2,
      disclaimersAreShown3: hasNotHiddenDisclaimer3,
      menuState: false,
      appRoot: this.props.appRoot,
      receivedMessages: [],
      showReceivedAlert: false,
      isLoading: false,
    }
  }

  resetState(e) {
    e.preventDefault()
    let state = {
      navState: true,
      isStoringFile: false,
      isSendingFile: false,
      isQuickFile: false,
      fileIsSelected: false,
      fileWasSelected: false,
      fileIsSelecting0: false,
      fileIsSelecting1: false,
    }

    window.files = []

    this.setState(state)
    if (this.uploadComponent.current) {
      this.uploadComponent.current.resetToInitialState()
    }
    this.props.history.push('/')
  }

  resetMailboxState() {
    this.setState({
      selectedMailbox: false,
      isStoringFile: false,
      isSendingFile: false,
      isQuickFile: false,
      fileIsSelected: false,
      fileWasSelected: false,
      fileIsSelecting0: false,
      fileIsSelecting1: false,
    })
    this.props.history.push('/')
  }

  resetFileState() {
    this.setState({
      isStoringFile: false,
      isSendingFile: false,
      isQuickFile: false,
      fileIsSelected: false,
      fileWasSelected: false,
      fileIsSelecting0: false,
      fileIsSelecting1: false,
    })
  }

  constructor(props) {
    super(props)

    if (localStorage.getItem('sentryEnabled') === 'true') {
      this.initSentry()
    }

    // let config = {
    //   tokenName: 'gas',
    //   swarmGateway: 'https://swarm.fairdatasociety.org',
    //   ethGateway: 'https://noordung.fairdrop.pro',
    //   faucetAddress: 'https://faucet-noordung.fairdatasociety.org/gimmie',
    //   chainID: '235813',
    //   httpTimeout: 1000,
    //   gasPrice: 0.1,
    //   walletVersion: 1,
    //   ensConfig: {
    //     domain: 'datafund.eth',
    //     registryAddress: '0xA1029cb176082eca658A67fD6807B9bDfB44A695',
    //     subdomainRegistrarAddress: '0x0E6a3B5f6800145bAe95C48934B7b5a90Df50722',
    //     resolverContractAddress: '0xC91AB84FFad79279D47a715eF91F5fbE86302E4D'
    //   }
    // };

    this.FDS = new FDS()
    window.FDS = this.FDS

    this.uploadComponent = React.createRef()
    this.mailboxComponent = React.createRef()

    this.importMailboxInput = React.createRef()
    this.contentComponent = React.createRef()

    this.setSelectedMailbox = this.setSelectedMailbox.bind(this)
    this.fileWasSelected = this.fileWasSelected.bind(this)
    this.hideDisclaimer = this.hideDisclaimer.bind(this)
    this.hideDisclaimer2n = this.hideDisclaimer2n.bind(this)
    this.hideDisclaimer2y = this.hideDisclaimer2y.bind(this)
    this.hideDisclaimer3 = this.hideDisclaimer3.bind(this)
    this.handleSendFile = this.handleSendFile.bind(this)
    this.handleStoreFile = this.handleStoreFile.bind(this)
    this.handleQuickFile = this.handleQuickFile.bind(this)
    this.resetFileState = this.resetFileState.bind(this)
    this.resetMailboxState = this.resetMailboxState.bind(this)
    this.handleNavigateTo = this.handleNavigateTo.bind(this)
    this.exportMailboxes = this.exportMailboxes.bind(this)
    this.exportLegacyMailboxes = this.exportLegacyMailboxes.bind(this)
    this.importMailbox = this.importMailbox.bind(this)
    this.showContent = this.showContent.bind(this)
    this.toggleContent = this.toggleContent.bind(this)
    this.setFileIsSelecting = this.setFileIsSelecting.bind(this)
    this.disableNav = this.disableNav.bind(this)
    this.enableNav = this.enableNav.bind(this)
    this.resetState = this.resetState.bind(this)
    this.updateStoredStats = this.updateStoredStats.bind(this)
    this.setIsLoading = this.setIsLoading.bind(this)

    this.state = this.getInitialState()
  }

  initSentry() {
    if (process.env.NODE_ENV !== 'development') {
      console.log('initialised Sentry')
      Sentry.init({
        dsn: 'https://ed8eb658c579493ea444b73c9997eb2b@sentry.io/1531557',
        release: 'datafund@' + version,
      })
      window.Sentry = Sentry
    }
  }

  componentDidMount() {
    let uInterval = setInterval(this.pollForUpdates.bind(this), 15000)
    let bInterval = setInterval(this.updateBalance.bind(this), 1500)
    this.setState({ checkreceivedInterval: uInterval })
    this.setState({ checkbalanceInterval: bInterval })
    document.getElementById('splash').classList.add('splash-fadeout')
    setTimeout(() => {
      this.setState({ savedAppState: this.getAppState(true) })
    })
    setTimeout(() => {
      this.setState({ menuIsRendered: true })
      document.getElementById('splash').classList.add('splash-hidden')
      document.getElementById('root').classList.add('root-fadein')
    }, 100)
  }

  async getAppState(refresh = true) {
    if (this.state.selectedMailbox) {
      if (refresh === true) {
        let appS
        try {
          let appState = await this.state.selectedMailbox.retrieveDecryptedValue('fairdrop-appState-0.1')
          appS = JSON.parse(appState)
        } catch (error) {
          if (error.response.status) {
            appS = {}
          } else {
            throw new Error(error)
          }
        }
        this.setState({ savedAppState: appS })
        return appS
      } else {
        return this.state.savedAppState
      }
    } else {
      return false
    }
  }

  async saveAppState(appStateUpdate, persist = true) {
    let appState = await this.getAppState(true)

    for (let k in appStateUpdate) {
      appState[k] = appStateUpdate[k]
    }

    if (persist === true) {
      this.state.selectedMailbox.storeEncryptedValue('fairdrop-appState-0.1', JSON.stringify(appState))
    }

    let newAppState = await this.getAppState(false)
    await this.setState({ savedAppState: newAppState })
    return true
  }

  updateBalance() {
    if (this.state.selectedMailbox) {
      this.FDS.currentAccount.getBalance().then((balance) => {
        this.setState({ selectedMailboxBalance: balance })
      })
    }
  }

  updateStoredStats() {
    return this.FDS.currentAccount.storedManifest().then((manifest) => {
      let totalStoredSize = manifest.storedFiles.reduce((total, o, i) => {
        if (i === 1) {
          return o.file.size
        } else {
          return o.file.size + total
        }
      })
      let totalPinned = manifest.storedFiles.filter((o) => {
        return o.meta.pinned === true
      })
      let totalPinnedSize
      if (totalPinned.length > 0) {
        totalPinnedSize = totalPinned.reduce((total, o, i) => {
          if (i === 1) {
            return o.file.size
          } else {
            return o.file.size + total
          }
        })
      } else {
        totalPinnedSize = 0
      }
      return this.saveAppState({
        totalStoredSize: totalStoredSize,
        totalPinnedSize: totalPinnedSize,
      })
    })
  }

  pollForUpdates() {
    if (this.state.selectedMailbox) {
      this.FDS.currentAccount.messages('received', '/shared/fairdrop/encrypted').then((messages) => {
        let lsCount = localStorage.getItem(`fairdrop_receivedSeenCount_${this.FDS.currentAccount.subdomain}`)
        let receivedSeenCount = parseInt(lsCount || 0)
        let firstTime = lsCount === null
        let showReceivedAlert = receivedSeenCount < messages.length ? true : this.state.showReceivedAlert
        let newState = {
          receivedMessages: messages,
          receivedUnseenCount: messages.length - receivedSeenCount,
          receivedSeenCount: receivedSeenCount,
          showReceivedAlert: showReceivedAlert,
        }
        this.setState(newState)
        if (showReceivedAlert === true && !firstTime) {
          this.setState({ showReceivedAlert: false })
          notify('Fairdrop: You received a file!')
          if (this.mailboxComponent.current) {
            this.mailboxComponent.current.showReceived(null, false)
          }
        }
      })
    }
  }

  // unlockMailboxWallet(subdomain, password){
  //   this.FDS.UnlockAccount(subdomain, password).then((account)=>{
  //     this.updateBalance();
  //     if(window.Sentry){
  //       window.Sentry.configureScope((scope) => {
  //         scope.setUser({"username": account.subdomain});
  //       });
  //     }
  //     this.setState({
  //       feedbackMessage: 'Mailbox unlocked.',
  //       mailboxIsUnlocked: true,
  //     });
  //     this.props.mailboxUnlocked();
  //     this.props.setSelectedMailbox(this.FDS.currentAccount);
  //   }).catch((error)=>{
  //     this.setState({
  //       feedbackMessage: 'Password invalid, please try again.',
  //       mailboxIsUnlocked: false
  //     });
  //   });
  // }

  setSelectedMailbox(selectedMailbox) {
    this.setState({
      selectedMailbox: selectedMailbox,
      fdsPin: new FDSPin(selectedMailbox, pinningOracleURL),
    })
    let appStateUpdate = { lastLogin: new Date().toISOString() }
    return this.saveAppState(appStateUpdate).then(() => {
      return this.updateBalance()
    })
  }

  setFileIsSelecting(state = true, i) {
    let obj = {}
    obj[`fileIsSelecting${i}`] = state
    this.setState(obj)
  }

  fileWasSelected(state = true) {
    this.setState({ fileWasSelected: state })
  }

  setIsLoading(state = true) {
    this.setState({ isLoading: state })
  }

  handleSendFile(e) {
    this.setState({ isSendingFile: true })
    this.props.history.push('/')
    if (this.uploadComponent.current) {
      this.uploadComponent.current.resetToInitialState()
      this.uploadComponent.current.aSelectFile.current.handleClickSelectFile()
    }
  }

  handleStoreFile(e) {
    this.setState({ isStoringFile: true })
    this.props.history.push('/')
    if (this.uploadComponent.current) {
      this.uploadComponent.current.resetToInitialState()
      this.uploadComponent.current.aSelectFile.current.handleClickStoreFile()
    }
  }

  handleQuickFile(e) {
    this.setState({ isQuickFile: true })
    this.props.history.push('/')
    if (this.uploadComponent.current) {
      this.uploadComponent.current.resetToInitialState()
      this.uploadComponent.current.aSelectFile.current.handleClickQuickFile()
    }
  }

  hideDisclaimer(e) {
    localStorage.setItem('hasHiddenDisclaimer', true)
    this.setState({ disclaimersAreShown: false })
  }

  hideDisclaimer2n(e) {
    localStorage.setItem('hasHiddenDisclaimer2', true)
    this.setState({ disclaimersAreShown2: false })
  }

  hideDisclaimer2y(e) {
    localStorage.setItem('hasHiddenDisclaimer2', true)
    localStorage.setItem('sentryEnabled', true)
    this.initSentry()
    this.setState({ disclaimersAreShown2: false })
  }

  hideDisclaimer3(e) {
    localStorage.setItem('hasHiddenDisclaimer3', true)
    this.setState({ disclaimersAreShown3: false })
  }

  importMailbox(e) {
    this.importMailboxInput.current.click()
  }

  handleImportMailbox(e) {
    if (e.target.files.length === 1) {
      let file = e.target.files[0]
      this.FDS.RestoreAccount(file)
        .then((o) => {
          alert('Import successful!')
          window.location.reload()
        })
        .catch((e) => {
          alert('Sorry, there was an error - please try again!')
        })
    }
  }

  handleNavigateTo(url) {
    this.props.history.push(this.state.appRoot + url)
  }

  toggleContent(forceOpen) {
    this.contentComponent.current.toggleContent(forceOpen)
  }

  showContent(type) {
    this.toggleContent(true)
    this.setState({ displayContent: false })
    this.setState({ displayedContent: type })
    setTimeout(() => {
      this.setState({ displayContent: true })
    }, 1000)
  }

  exportMailboxes() {
    let zip = new JSZip()
    let accounts = this.FDS.GetAccounts()
    if (accounts.length === 0) {
      alert('No accounts to export.')
      return false
    }
    for (var i = accounts.length - 1; i >= 0; i--) {
      var file = accounts[i].getBackup()
      zip.file(file.name, file.data)
    }
    zip.generateAsync({ type: 'blob' }).then(function (content) {
      FileSaver.saveAs(content, 'fairdrop-mailboxes.zip')
    })
  }

  exportLegacyMailboxes() {
    let zip = new JSZip()
    let accounts = this.FDS.GetAccounts(0)
    if (accounts.length === 0) {
      alert('No accounts to export.')
      return false
    }
    for (var i = accounts.length - 1; i >= 0; i--) {
      var file = accounts[i].getBackup()
      zip.file(file.name, file.data)
    }
    zip.generateAsync({ type: 'blob' }).then(function (content) {
      FileSaver.saveAs(content, 'fairdrop-mailboxes.zip')
    })
  }

  enableNav(e) {
    this.setState({ navState: true })
  }

  disableNav(e) {
    this.setState({ navState: false })
  }

  render() {
    return (
      <div>
        <div
          className={
            'parent-wrapper ' +
            +(this.state.disclaimersAreShown ? 'disclaimers-shown' : '') +
            (this.state.menuState ? 'menu-shown ' : '') +
            (this.props.location.pathname.substring(0, 8) === '/mailbox' ? 'nav-black white ' : ' nav-white red ') +
            (this.state.fileIsSelecting0 || this.state.fileIsSelecting1 ? 'is-selecting' : '')
          }
        >
          <DisclaimerSplash disclaimersAreShown={this.state.disclaimersAreShown} hideDisclaimer={this.hideDisclaimer} />
          <DisclaimerSplash2
            disclaimersAreShown={this.state.disclaimersAreShown2}
            hideDisclaimer2n={this.hideDisclaimer2n}
            hideDisclaimer2y={this.hideDisclaimer2y}
          />
          <DisclaimerSplash3
            disclaimersAreShown={this.state.disclaimersAreShown3}
            hideDisclaimer3={this.hideDisclaimer3}
          />
          <Menu
            isShown={false}
            isRendered={this.state.menuIsRendered}
            menuToggled={(s) => {
              this.setState({ menuState: s })
            }}
            handleSendFile={this.handleSendFile}
            handleStoreFile={this.handleStoreFile}
            handleQuickFile={this.handleQuickFile}
            handleNavigateTo={this.handleNavigateTo}
            exportMailboxes={this.exportMailboxes}
            exportLegacyMailboxes={this.exportLegacyMailboxes}
            importMailbox={this.importMailbox}
            appRoot={this.state.appRoot}
            toggleContent={this.toggleContent}
            showContent={this.showContent}
            disableNav={this.disableNav}
            enableNav={this.enableNav}
            resetMailboxState={this.resetMailboxState}
            selectedMailbox={this.state.selectedMailbox}
            selectedMailboxBalance={this.state.selectedMailboxBalance}
          />
          <Content
            isShown={false}
            displayedContent={this.state.displayedContent}
            displayContent={this.state.displayContent}
            handleNavigateTo={this.handleNavigateTo}
            appRoot={this.state.appRoot}
            savedAppState={this.state.savedAppState}
            selectedMailbox={this.state.selectedMailbox}
            selectedMailboxBalance={this.state.selectedMailboxBalance}
            ref={this.contentComponent}
          />
          <div
            className={
              'wrapper ' +
              (this.props.location.pathname.substring(0, 8) === '/mailbox' ? ' nav-black white' : 'nav-white green') +
              (this.state.navState ? ' nav-enabled' : ' nav-disabled')
            }
            onDragOver={this.disableNav}
            onDragEnter={this.disableNav}
            onDragEnd={this.enableNav}
            onDragExit={this.enableNav}
          >
            <div className="nav-header">
              <div className="nav-header-item-left">
                <div className="nav-header-spacer"></div>
              </div>
              <div className="nav-header-item-left">
                <Link to={'/'} onClick={this.resetState}>
                  <FairdropLogo />
                </Link>
              </div>
              <div className="nav-header-item-left hide-mobile">
                <div className="version-number">
                  {version}{' '}
                  {process.env.REACT_APP_ENV_NAME !== 'production' ? `- ${process.env.REACT_APP_ENV_NAME}` : ''}
                </div>
              </div>
              <div className="nav-header-item-left">
                <div className={(this.state.isLoading ? 'is-loading ' : ' ') + 'loading-icon'}>
                  <ProgressBar />
                </div>
              </div>

              <div className="nav-header-item-right">
                <Link className="nav-key" to={'/mailbox'}>
                  <MailboxGlyph />
                </Link>
              </div>
              {!this.state.selectedMailbox.subdomain && (
                <div className="nav-header-item-right hide-mobile">
                  <Link className="nav-header-item-button nav-header-sign-in" to={'/mailbox'}>
                    Log in / Register
                  </Link>
                </div>
              )}
              {this.state.selectedMailbox.subdomain && (
                <div className="nav-header-item-right hide-mobile">
                  <button className="nav-header-item-button nav-header-sign-out" onClick={this.resetMailboxState}>
                    Log out
                  </button>
                </div>
              )}
              {this.state.selectedMailbox.subdomain && (
                <div className="nav-header-item-right hide-mobile">
                  <Link className="nav-context" to={'/mailbox/received'}>
                    {this.state.selectedMailbox.subdomain}
                  </Link>
                </div>
              )}
              <div
                className={
                  'nav-header-item-right hide-mobile ' +
                  (this.state.selectedMailbox.subdomain && this.state.receivedSeenCount > 0
                    ? 'show-received-alert-shown'
                    : 'show-received-alert-hidden')
                }
              >
                <Link className="show-received-alert" to={'/mailbox'}>
                  {this.state.receivedSeenCount || '-'}
                </Link>
              </div>
              <div
                className={
                  'nav-header-item-right hide-mobile ' +
                  (this.state.selectedMailbox.subdomain && this.state.showReceivedAlert
                    ? 'show-received-alert-shown'
                    : 'show-received-alert-hidden')
                }
              >
                <Link className="show-received-alert" to={'/mailbox'}>
                  {this.state.receivedUnseenCount || '-'}
                </Link>
              </div>
            </div>

            <Switch>
              <Route
                exact={true}
                path={'/'}
                render={() => {
                  return (
                    <Upload
                      FDS={this.FDS}
                      selectedMailbox={this.state.selectedMailbox}
                      fdsPin={this.state.fdsPin}
                      setSelectedMailbox={this.setSelectedMailbox}
                      fileWasSelected={this.fileWasSelected}
                      fileIsSelecting0={this.state.fileIsSelecting0}
                      fileIsSelecting1={this.state.fileIsSelecting1}
                      setFileIsSelecting={this.setFileIsSelecting}
                      isSendingFile={this.state.isSendingFile}
                      isStoringFile={this.state.isStoringFile}
                      isQuickFile={this.state.isQuickFile}
                      resetFileState={this.resetFileState}
                      appRoot={this.state.appRoot}
                      enableNav={this.enableNav}
                      handleNavigateTo={this.handleNavigateTo}
                      updateStoredStats={this.updateStoredStats}
                      ref={this.uploadComponent}
                    />
                  )
                }}
              />
              <Route
                exact={true}
                path={'/mailbox/:filter?'}
                render={(routerArgs) => {
                  return (
                    <Mailbox
                      FDS={this.FDS}
                      setSelectedMailbox={this.setSelectedMailbox}
                      selectedMailbox={this.state.selectedMailbox}
                      fdsPin={this.state.fdsPin}
                      handleSendFile={this.handleSendFile}
                      handleStoreFile={this.handleStoreFile}
                      handleQuickFile={this.handleQuickFile}
                      handleNavigateTo={this.handleNavigateTo}
                      updateStoredStats={this.updateStoredStats}
                      routerArgs={routerArgs}
                      appRoot={this.state.appRoot}
                      isLoading={this.state.isLoading}
                      setIsLoading={this.setIsLoading}
                      ref={this.mailboxComponent}
                    />
                  )
                }}
              />
              <Route
                path={'/:dropbox?'}
                render={(routerArgs) => {
                  return <Dropbox appRoot={this.state.appRoot} routerArgs={routerArgs} ref={this.dropbox} />
                }}
              />
            </Switch>

            <input
              ref={this.importMailboxInput}
              style={{ display: 'none' }}
              type="file"
              onChange={this.handleImportMailbox.bind(this)}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(App)
