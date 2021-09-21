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

import React, { useCallback, useContext, useReducer } from 'react'
import { initialState, reducer, SET_MAILBOX } from './reducer'

const MailboxContext = React.createContext()

export const MailboxProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const login = useCallback(({ mailbox, password }) => {
    const testMailbox = {
      subdomain: 'TEST',
      wallet: {
        version: 3,
        id: 'TEST_ID',
        address: 'TEST_ADDRESS',
        crypto: {
          ciphertext: 'TEST_TEXT',
          cipherparams: { iv: 'TEST_PARAMS' },
          cipher: 'aes-128-ctr',
          kdf: 'scrypt',
          kdfparams: {
            dklen: 32,
            salt: 'TEST_SALT',
            n: 8192,
            r: 8,
            p: 1,
          },
          mac: 'TEST_MAC',
        },
      },
      version: 1,
    }
    dispatch({
      type: SET_MAILBOX,
      payload: {
        mailbox: testMailbox,
      },
    })
    return Promise.resolve({ mailbox: testMailbox })
  }, [])

  return <MailboxContext.Provider value={[state, { login }]}>{children}</MailboxContext.Provider>
}

export const useMailbox = () => {
  const ctx = useContext(MailboxContext)
  return ctx
}
