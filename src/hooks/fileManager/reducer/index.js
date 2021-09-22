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

export const SET_FILES = 'SET_FILES'
export const SET_RECIPIENT = 'SET_RECIPIENT'
export const SET_LINK = 'SET_LINK'
export const CLEAN = 'CLEAN'

export const initialState = {
  files: [],
  type: 'quick',
  recipient: '',
  link: '',
}

export const reducer = (prevState, { type, payload }) => {
  switch (type) {
    case SET_FILES:
      return {
        ...prevState,
        files: payload?.files ?? [],
        type: payload?.type ?? 'quick',
      }

    case SET_RECIPIENT:
      return {
        ...prevState,
        recipient: payload?.recipient ?? '',
      }

    case SET_LINK:
      return {
        ...prevState,
        link: payload?.link ?? '',
      }

    case CLEAN:
      return {
        ...initialState,
      }

    default:
      return prevState
  }
}
