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

import React, { useCallback, useContext, useEffect, useReducer, useRef } from 'react'
import FDS from '@fairdatasociety/fds'
import * as Sentry from '@sentry/browser'
import JSZip from 'jszip'
import FileSaver from 'filesaver.js'
import {
  reducer,
  initialState,
  SET_SENT_MESSAGES,
  SET_RECEIVED_MESSAGES,
  SET_BALANCE,
  SET_MAILBOX,
  SET_AVAILABLE_MAILBOXES,
  RESET,
  SET_CONSENTS_MESSAGES,
  SET_STORED_MESSAGES,
  SET_APP_STATE,
  SET_WARRANT_BALANCE,
} from './reducer'
import { version } from '../../../package.json'
import { toast } from 'react-toastify'
import PinningManager from '../../lib/abi/PinningManager.json'
import PinWarrant from '../../lib/abi/PinWarrant.json'

const MailboxContext = React.createContext()

export const FDSInstance = new FDS()

const APP_STATE_KEY = 'fairdrop-appState-0.1'

export const MailboxProvider = ({ children }) => {
  const updatesInterval = useRef()
  const balanceInterval = useRef()
  const sentryInitialized = useRef(false)
  const [state, dispatch] = useReducer(reducer, initialState)

  const initSentry = useCallback((account) => {
    const sentryEnabled = !!localStorage.getItem('agreedSentry')
    if (process.env.NODE_ENV !== 'development' && sentryEnabled) {
      if (!sentryInitialized.current) {
        console.log('initialised Sentry')
        Sentry.init({
          dsn: 'https://ed8eb658c579493ea444b73c9997eb2b@sentry.io/1531557',
          release: 'fairdrop@' + version,
        })
        sentryInitialized.current = true
      }

      if (account) {
        Sentry.configureScope((scope) => {
          scope.setUser({ username: account.subdomain })
        })
      }
    }
  }, [])

  const getAppState = useCallback(async () => {
    if (!FDSInstance.currentAccount) {
      return Promise.reject(new Error('No mailbox selected'))
    }

    try {
      let appState = (await FDSInstance.currentAccount.retrieveDecryptedValue(APP_STATE_KEY)) ?? {}
      appState = JSON.parse(appState)
      return appState
    } catch (error) {
      console.error(error)
      if (error?.response?.status) {
        return {}
      }

      throw new Error(error)
    }
  }, [])

  const updateAppState = useCallback(
    async (state = {}) => {
      if (!FDSInstance.currentAccount) {
        return Promise.reject(new Error('No mailbox selected'))
      }

      const currentAppState = await getAppState().catch(() => {})

      const newAppState = {
        ...(currentAppState ?? {}),
        ...state,
      }
      await FDSInstance.currentAccount.storeEncryptedValue(APP_STATE_KEY, JSON.stringify(newAppState))
      dispatch({
        type: SET_APP_STATE,
        payload: {
          appState: newAppState,
        },
      })
    },
    [getAppState],
  )

  const updateStoredStats = useCallback(async () => {
    if (!state.mailbox) {
      return Promise.reject(new Error('No mailbox selected'))
    }

    const manifest = await FDSInstance.currentAccount.storedManifest()
    const totalStoredSize = manifest.storedFiles.reduce((total, o) => {
      return total + o?.file?.size ?? 0
    }, 0)
    const totalPinnedSize = manifest.storedFiles
      .filter((o) => {
        return o.meta.pinned === true
      })
      .reduce((total, o) => {
        return total + o?.file?.size ?? 0
      }, 0)

    const ndxPerKbPerBlock = 1000
    const blockTimeInSeconds = 1
    const pinnedTimeRemainingInBlocks = state?.balance ?? 0 / (ndxPerKbPerBlock * totalPinnedSize)
    const pinnedTimeRemainingInSecs = pinnedTimeRemainingInBlocks / blockTimeInSeconds

    await updateAppState({
      totalStoredSize,
      totalPinnedSize,
      pinnedTimeRemainingInSecs,
    })
  }, [state?.mailbox, updateAppState, state?.balance])

  const unlockMailbox = useCallback(
    ({ mailbox, password }) => {
      return FDSInstance.UnlockAccount(mailbox, password).then(async (account) => {
        initSentry?.(account)
        console.info(account)

        dispatch({
          type: SET_MAILBOX,
          payload: {
            mailbox: FDSInstance.currentAccount,
          },
        })

        await updateAppState({ lastLogin: new Date().toISOString() })
          .catch((e) => console.info(e))
          .then(() => {
            return {}
          })
      })
    },
    [initSentry, updateAppState],
  )

  const createMailbox = useCallback(
    ({ mailbox, password, callback }) => {
      return FDSInstance.CreateAccount(mailbox, password, callback).then(() => {
        return unlockMailbox({ mailbox, password })
      })
    },
    [unlockMailbox],
  )

  const exportMailboxes = useCallback(() => {
    const zip = new JSZip()
    const accounts = FDSInstance.GetAccounts()
    if (accounts.length === 0) {
      toast('🤷‍♂️ There is no mailboxes to export', { theme: 'light' })
      return false
    }
    accounts.forEach((account) => {
      const file = account.getBackup()
      zip.file(file.name, file.data)
    })
    zip.generateAsync({ type: 'blob' }).then((content) => {
      FileSaver.saveAs(content, 'fairdrop-mailboxes.zip')
    })
  }, [])

  const importMailbox = useCallback(({ file }) => {
    return new Promise((resolve, reject) => {
      try {
        FDSInstance.RestoreAccount(file)
          .then(() => {
            const accounts = FDSInstance.GetAccounts() ?? []
            dispatch({
              type: SET_AVAILABLE_MAILBOXES,
              payload: { accounts: accounts.map(({ subdomain }) => subdomain) },
            })
            resolve()
          })
          .catch(reject)
      } catch (error) {
        reject(error)
      }
    })
  }, [])

  const resetMailbox = useCallback(() => {
    dispatch({ type: RESET })
  }, [])

  const getReceivedMessages = useCallback(() => {
    return (
      FDSInstance.currentAccount
        ?.messages('received', '/shared/fairdrop/encrypted')
        .then(async (messages) => {
          if (messages?.length > 0) {
            const appState = await getAppState()
            const lastMessage = Math.max(
              ...(messages ?? []).reduce((times, message) => {
                times.push(message?.hash?.time ?? 0)
                return times
              }, []),
            )

            if (lastMessage && appState?.lastReceivedMessage !== lastMessage) {
              await updateAppState({
                lastReceivedMessage: lastMessage,
              })
              toast('🎉 Yay! You have received a new file!')
            }
          }

          dispatch({ type: SET_RECEIVED_MESSAGES, payload: { messages: messages ?? [] } })
        })
        .catch((error) => console.info(error)) ?? Promise.reject(new Error('No mailbox selected'))
    )
  }, [getAppState, updateAppState])

  const getSentMessages = useCallback(() => {
    return (
      FDSInstance.currentAccount
        ?.messages('sent')
        .then((messages) => {
          dispatch({ type: SET_SENT_MESSAGES, payload: { messages } })
        })
        .catch((error) => console.info(error)) ?? Promise.reject(new Error('No mailbox selected'))
    )
  }, [])

  const getConsentsMessages = useCallback(() => {
    return (
      FDSInstance.currentAccount
        ?.messages('received', '/shared/consents')
        .then((messages) => {
          dispatch({ type: SET_CONSENTS_MESSAGES, payload: { messages } })
        })
        .catch((error) => console.info(error)) ?? Promise.reject(new Error('No mailbox selected'))
    )
  }, [])

  const getStoredMessages = useCallback(() => {
    return (
      FDSInstance.currentAccount
        ?.stored()
        .then((messages) => {
          dispatch({ type: SET_STORED_MESSAGES, payload: { messages } })
        })
        .catch((error) => console.info(error)) ?? Promise.reject(new Error('No mailbox selected'))
    )
  }, [])

  const pin = useCallback(
    (hash) => {
      if (!state?.mailbox?.address) {
        return Promise.reject(new Error('No mailbox selected'))
      }

      return fetch(
        `${process.env.REACT_APP_PINNING_ORACLE_URL}/pin?acount=${state?.mailbox?.address}&address=${hash}&warrant=&endBlock=9999`,
      ).then((response) => console.info(response))
    },
    [state?.mailbox],
  )

  const unpin = useCallback(
    (hash) => {
      if (!state?.mailbox?.address) {
        return Promise.reject(new Error('No mailbox selected'))
      }

      return fetch(
        `${process.env.REACT_APP_PINNING_ORACLE_URL}/unpin?acount=${state?.mailbox?.address}&address=${hash}`,
      ).then((response) => console.info(response))
    },
    [state?.mailbox],
  )

  const uploadUnencryptedFile = useCallback(async ({ files, onProgressUpdate, onStatusChange }) => {
    onProgressUpdate?.(100)
    return FDSInstance.Account.Store.storeFilesUnencrypted(files, onProgressUpdate, onStatusChange).then((hash) => {
      onProgressUpdate?.(100)
      console.info(hash)
      return hash
      // const index_idx = files.findIndex((file) => {
      //   const fullPath = file.fullPath || file.webkitRelativePath
      //   if (fullPath.split('/')[1] === 'index.html') {
      //     return true
      //   }

      //   return false
      // })

      // // We have an index.html
      // if (index_idx !== -1) {
      //   return `${FDSInstance.swarmGateway}/bzz:/${hash.address}/index.html`
      // }

      // if (files.length > 1) {
      //   return generatePath(routes.downloads.multiple, { address: hash.address })
      // } else {
      //   return generatePath(
      //     `${routes.downloads.single}?${qs.stringify({
      //       size: hash?.file?.size ?? 0,
      //     })}`,
      //     { address: hash.address, name: hash?.file?.name },
      //   )
      // }
    })
  }, [])

  const uploadEncryptedFile = useCallback(({ to, files, onEncryptedEnd, onProgressUpdate, onStatusChange }) => {
    const multiboxPath = localStorage.getItem('fairdrop_application_domain') || '/shared/fairdrop/encrypted'
    return FDSInstance.currentAccount.send(to, files[0], multiboxPath, onEncryptedEnd, onProgressUpdate, onStatusChange)
  }, [])

  const storeEncryptedFile = useCallback(
    ({ files, onEncryptedEnd, onProgressUpdate, onStatusChange }) => {
      return FDSInstance.currentAccount
        .store(files[0], onEncryptedEnd, onProgressUpdate, onStatusChange, { pinned: true }, true, true)
        .then(async (response) => {
          try {
            await pin(response.storedFile.address)
          } catch (error) {
            console.info('could not pin', response.storedFile.address)
          }
          return response
        })
        .then(async (response) => {
          if (response.oldStoredManifestAddress !== undefined) {
            try {
              await unpin(response.oldStoredManifestAddress)
            } catch {
              console.info('could not unpin', response.oldStoredManifestAddress)
            }
          }
          try {
            pin(response.storedManifestAddress)
          } catch {
            console.log('could not pin', response.storedManifestAddress)
          }
        })
        .then(() => {
          setTimeout(() => {
            updateStoredStats()
          }, 1000)
        })
    },
    [unpin, pin, updateStoredStats],
  )

  const getMyBalance = useCallback(async () => {
    try {
      const PM = await FDSInstance.currentAccount.getContract(
        PinningManager.abi,
        process.env.REACT_APP_PINNING_MANAGER_ADDRESS,
      )
      const warrantAddress = await PM.getMyWarrant()
      const PW = await FDSInstance.currentAccount.getContract(PinWarrant.abi, warrantAddress)
      const warrantBalance = PW.getBalance()
      dispatch({ type: SET_WARRANT_BALANCE, payload: { warrantBalance } })
    } catch (error) {
      // TODO handle error
      console.info(error)
      throw new Error(error)
    }
  }, [])

  const getBalance = useCallback(() => {
    if (!FDSInstance.currentAccount) {
      return Promise.resolve()
    }

    return Promise.all([
      FDSInstance.currentAccount?.getBalance().then((balance) => {
        dispatch({ type: SET_BALANCE, payload: { balance } })
        return balance
      }),
      // getMyBalance(),
    ])
  }, [])

  const createWarrant = useCallback(async () => {
    try {
      const appState = await getAppState()
      const balance = await getBalance()

      // TODO check balance
      if (appState?.warrantWasCreated) {
        return
      }
      const warrantBalance = Math.floor((balance * 80) / 100)

      const PM = await FDSInstance.currentAccount.getContract(
        PinningManager.abi,
        process.env.REACT_APP_PINNING_MANAGER_ADDRESS,
      )

      await PM.send('createWarrant', [], true, 15000000, warrantBalance)
      const warrant = PM.getMyWarrant()

      await updateAppState({ warrantWasCreated: true })
      await getBalance()

      return warrant
    } catch (error) {
      // TODO handle error
      console.info(error)
      throw new Error(error)
    }
  }, [getBalance, updateAppState, getAppState])

  // Listen to mailbox updates
  useEffect(() => {
    if (!state.mailbox) {
      clearInterval(updatesInterval.current)
      clearInterval(balanceInterval.current)
      return
    }

    updatesInterval.current = setInterval(getReceivedMessages, 15000)
    balanceInterval.current = setInterval(getBalance, 30000)

    return () => {
      clearInterval(updatesInterval.current)
      clearInterval(balanceInterval.current)
    }
  }, [state.mailbox, getReceivedMessages, getBalance])

  // Get all accounts
  useEffect(() => {
    const accounts = FDSInstance.GetAccounts() ?? []
    dispatch({ type: SET_AVAILABLE_MAILBOXES, payload: { accounts: accounts.map(({ subdomain }) => subdomain) } })
  }, [])

  // Init sentry if needed
  useEffect(() => {
    if (localStorage.getItem('sentryEnabled') === 'true') {
      initSentry()
    }
  }, [initSentry])

  return (
    <MailboxContext.Provider
      value={[
        state,
        {
          unlockMailbox,
          createMailbox,
          initSentry,
          exportMailboxes,
          importMailbox,
          resetMailbox,
          getReceivedMessages,
          getSentMessages,
          getConsentsMessages,
          getStoredMessages,
          uploadUnencryptedFile,
          uploadEncryptedFile,
          storeEncryptedFile,
          pin,
          unpin,
          getAppState,
          updateAppState,
          updateStoredStats,
          createWarrant,
          getMyBalance,
        },
      ]}
    >
      {children}
    </MailboxContext.Provider>
  )
}

export const useMailbox = () => {
  const ctx = useContext(MailboxContext)
  return ctx
}
