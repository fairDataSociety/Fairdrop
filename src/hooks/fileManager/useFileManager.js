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
import { CLEAN, initialState, reducer, SET_FILES, SET_RECIPIENT, SET_LINK, SET_TYPE } from './reducer'

const FileManagerContext = React.createContext()

const FileManagerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setFiles = useCallback(({ files, type }) => {
    dispatch({ type: SET_FILES, payload: { files, type } })
  }, [])

  const setType = useCallback(({ type }) => {
    dispatch({ type: SET_TYPE, payload: { type } })
  }, [])

  const setRecipient = useCallback(({ recipient }) => {
    dispatch({ type: SET_RECIPIENT, payload: { recipient } })
  }, [])

  const resetFileManager = useCallback(() => {
    dispatch({ type: CLEAN })
  }, [])

  const setDownloadLink = useCallback(({ link }) => {
    dispatch({ type: SET_LINK, payload: { link } })
  }, [])

  return (
    <FileManagerContext.Provider
      value={[state, { setFiles, resetFileManager, setRecipient, setDownloadLink, setType }]}
    >
      {children}
    </FileManagerContext.Provider>
  )
}

export const useFileManager = () => {
  const ctx = useContext(FileManagerContext)
  return ctx
}

export const FILE_UPLOAD_TYPES = {
  QUICK: 'quick',
  ENCRYPTED: 'encrypted',
  STORE: 'store',
}

export default FileManagerProvider
