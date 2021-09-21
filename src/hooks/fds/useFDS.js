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
import { reducer, initialState, SET_MESSAGES, SET_BALANCE } from './reducer'
import { useMailbox } from '../mailbox/useMailbox'

const FDSContext = React.createContext()

export const FDSInstance = new FDS()

export const FDSProvider = ({ children }) => {
  const updatesInterval = useRef()
  const balanceInterval = useRef()
  const [state, dispatch] = useReducer(reducer, initialState)
  const [{ mailbox }] = useMailbox()

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
        dispatch({ type: SET_MESSAGES, payload: { messages } })
      })
      .catch((error) => console.info(error))
  }, [])

  const handleUpdateBalance = useCallback(() => {
    FDSInstance.currentAccount?.getBalance().then((balance) => {
      dispatch({ type: SET_BALANCE, payload: { balance } })
    })
  }, [])

  useEffect(() => {
    if (!mailbox) {
      return
    }

    updatesInterval.current = setInterval(pollUpdate, 15000)
    balanceInterval.current = setInterval(handleUpdateBalance, 1500)

    return () => {
      clearInterval(updatesInterval.current)
      clearInterval(balanceInterval.current)
    }
  }, [mailbox, pollUpdate, handleUpdateBalance])

  return <FDSContext.Provider value={[state]}>{children}</FDSContext.Provider>
}

export const useFDS = () => {
  const ctx = useContext(FDSContext)
  return ctx
}
