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

export const SET_MESSAGES = 'SET_MESSAGES'
export const SET_BALANCE = 'SET_BALANCE'
export const SET_MAILBOX = 'SET_MAILBOX'
export const SET_AVAILABLE_MAILBOXES = 'SET_AVAILABLE_MAILBOXES'
export const RESET = 'RESET'

export const initialState = {
  messages: [],
  balance: 0,
  mailbox: null,
  accounts: [],
}

export const reducer = (prevState, { type, payload }) => {
  switch (type) {
    case SET_MESSAGES:
      return {
        ...prevState,
        messages: payload.messages,
      }

    case SET_BALANCE:
      return {
        ...prevState,
        balance: payload.balance,
      }

    case SET_MAILBOX:
      return {
        ...prevState,
        mailbox: payload.mailbox,
      }

    case SET_AVAILABLE_MAILBOXES:
      return {
        ...prevState,
        accounts: payload.accounts,
      }

    case RESET:
      return {
        ...initialState,
        accounts: prevState.accounts,
      }

    default:
      return prevState
  }
}
