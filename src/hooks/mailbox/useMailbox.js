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
import FDS from 'fds.js'
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
} from './reducer'
import { version } from '../../../package.json'
import { toast } from 'react-toastify'
import axios from 'axios'
import qs from 'qs'

const MailboxContext = React.createContext()

export const FDSInstance = new FDS()

export const MailboxProvider = ({ children }) => {
  const updatesInterval = useRef()
  const balanceInterval = useRef()
  const [state, dispatch] = useReducer(reducer, initialState)

  const initSentry = useCallback(() => {
    const sentryEnabled = !!localStorage.getItem('agreedSentry')
    if (process.env.NODE_ENV !== 'development' && sentryEnabled) {
      console.log('initialised Sentry')
      Sentry.init({
        dsn: 'https://ed8eb658c579493ea444b73c9997eb2b@sentry.io/1531557',
        release: 'datafund@' + version,
      })
    }
  }, [])

  const unlockMailbox = useCallback(
    ({ mailbox, password }) => {
      return FDSInstance.UnlockAccount(mailbox, password).then((account) => {
        initSentry?.()
        console.info(account)
        dispatch({
          type: SET_MAILBOX,
          payload: {
            mailbox: FDSInstance.currentAccount,
          },
        })
      })
    },
    [initSentry],
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

  const getSentMessages = useCallback(() => {
    return FDSInstance.currentAccount
      ?.messages('sent')
      .then((messages) => {
        dispatch({ type: SET_SENT_MESSAGES, payload: { messages } })
      })
      .catch((error) => console.info(error))
  }, [])

  const getConsentsMessages = useCallback(() => {
    return FDSInstance.currentAccount
      ?.messages('received', '/shared/consents')
      .then((messages) => {
        dispatch({ type: SET_CONSENTS_MESSAGES, payload: { messages } })
      })
      .catch((error) => console.info(error))
  }, [])

  const pin = useCallback(
    (hash) => {
      if (!state?.mailbox?.address) {
        return Promise.reject(new Error('No mailbox selected'))
      }

      return axios
        .post(
          `${process.env.REACT_APP_PINNING_ORACLE_URL}/pin`,
          qs.stringify({
            account: state?.mailbox?.address,
            address: hash,
            warrant: '',
            endBlock: '9999',
          }),
        )
        .then((result) => {
          console.info(result)
        })
    },
    [state?.mailbox],
  )

  const unpin = useCallback(
    (hash) => {
      if (!state?.mailbox?.address) {
        return Promise.reject(new Error('No mailbox selected'))
      }

      return axios
        .post(
          `${process.env.REACT_APP_PINNING_ORACLE_URL}/unpin`,
          qs.stringify({
            account: state?.mailbox?.address,
            address: hash,
          }),
        )
        .then((result) => {
          console.info(result)
        })
    },
    [state?.mailbox],
  )

  const uploadUnencryptedFile = useCallback(({ files, onProgressUpdate, onStatusChange }) => {
    const sanitizedFiles = files.map((file) => {
      const newFile = new File([file], file.name.replace(/ /g, '_'), { type: file.type })
      const fullPath = file.fullPath || file.webkitRelativePath
      newFile.fullPath = fullPath.replace(/ /g, '_')
      return newFile
    })
    return FDSInstance.Account.Store.storeFilesUnencrypted(sanitizedFiles, onProgressUpdate, onStatusChange).then(
      (hash) => {
        return hash.gatewayLink()
      },
    )
  }, [])

  const uploadEncryptedFile = useCallback(({ to, files, onEncryptedEnd, onProgressUpdate, onStatusChange }) => {
    const multiboxPath = localStorage.getItem('fairdrop_application_domain') || '/shared/fairdrop/encrypted'
    return FDSInstance.currentAccount.send(to, files[0], multiboxPath, onEncryptedEnd, onProgressUpdate, onStatusChange)
  }, [])

  const storeEncryptedFile = useCallback(
    ({ files, onEncryptedEnd, onProgressUpdate, onStatusChange }) => {
      const sanitizedFiles = files.map((file) => {
        const newFile = new File([file], file.name.replace(/ /g, '_'), { type: file.type })
        const fullPath = file.fullPath || file.webkitRelativePath
        newFile.fullPath = fullPath.replace(/ /g, '_')
        return newFile
      })
      return FDSInstance.currentAccount
        .store(sanitizedFiles[0], onEncryptedEnd, onProgressUpdate, onStatusChange, { pinned: true }, true, true)
        .then(async (response) => {
          console.info(response)
          try {
            unpin(response.oldStoredManifestAddress)
          } catch {
            console.info('could not unpin', response.oldStoredManifestAddress)
          }
          try {
            pin(response.storedManifestAddress)
          } catch {
            console.log('could not pin', response.storedManifestAddress)
          }
        })
    },
    [unpin, pin],
  )

  const pollUpdate = useCallback(() => {
    FDSInstance.currentAccount
      ?.messages('received', '/shared/fairdrop/encrypted')
      .then((messages) => {
        // const key = `fairdrop_receivedSeenCount_${FDSInstance.currentAccount.subdomain}`
        // // const lsCount = window.localStorage.getItem(key)
        // const receivedSeenCount = parseInt(lsCount || 0)
        // const firstTime = lsCount === null
        // const showReceivedAlert = receivedSeenCount < messages.length
        // console.info(lsCount, receivedSeenCount, firstTime, showReceivedAlert)
        dispatch({ type: SET_RECEIVED_MESSAGES, payload: { messages } })
      })
      .catch((error) => console.info(error))
  }, [])

  const handleUpdateBalance = useCallback(() => {
    FDSInstance.currentAccount?.getBalance().then((balance) => {
      dispatch({ type: SET_BALANCE, payload: { balance } })
    })
  }, [])

  // Listen to mailbox updates
  useEffect(() => {
    if (!state.mailbox) {
      return
    }

    updatesInterval.current = setInterval(pollUpdate, 15000)
    balanceInterval.current = setInterval(handleUpdateBalance, 1500)

    return () => {
      clearInterval(updatesInterval.current)
      clearInterval(balanceInterval.current)
    }
  }, [state.mailbox, pollUpdate, handleUpdateBalance])

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
          getSentMessages,
          getConsentsMessages,
          uploadUnencryptedFile,
          uploadEncryptedFile,
          storeEncryptedFile,
          pin,
          unpin,
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
