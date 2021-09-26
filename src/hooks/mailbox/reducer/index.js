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

export const SET_RECEIVED_MESSAGES = 'SET_RECEIVED_MESSAGES'
export const SET_SENT_MESSAGES = 'SET_SENT_MESSAGES'
export const SET_CONSENTS_MESSAGES = 'SET_CONSENTS_MESSAGES'
export const SET_STORED_MESSAGES = 'SET_STORED_MESSAGES'
export const SET_BALANCE = 'SET_BALANCE'
export const SET_MAILBOX = 'SET_MAILBOX'
export const SET_AVAILABLE_MAILBOXES = 'SET_AVAILABLE_MAILBOXES'
export const SET_APP_STATE = 'SET_APP_STATESET_APP_STATE'
export const RESET = 'RESET'

export const initialState = {
  received: [],
  sent: [],
  consents: [],
  stored: [],
  balance: 0,
  mailbox: null,
  accounts: [],
  appState: {},
}

export const reducer = (prevState, { type, payload }) => {
  switch (type) {
    case SET_RECEIVED_MESSAGES:
      return {
        ...prevState,
        received: payload.messages ?? [],
      }

    case SET_SENT_MESSAGES:
      return {
        ...prevState,
        sent: payload.messages ?? [],
      }

    case SET_CONSENTS_MESSAGES:
      return {
        ...prevState,
        consents: payload.messages ?? [],
      }

    case SET_STORED_MESSAGES:
      return {
        ...prevState,
        stored: payload.messages ?? [],
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

    case SET_APP_STATE:
      return {
        ...prevState,
        appState: payload.appState,
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
