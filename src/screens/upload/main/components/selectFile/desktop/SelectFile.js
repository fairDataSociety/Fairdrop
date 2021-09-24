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

import React, { useCallback, useRef, useEffect } from 'react'
import { FILE_UPLOAD_TYPES, useFileManager } from '../../../../../../hooks/fileManager/useFileManager'
import styles from './SelectFile.module.css'
import { useDropzone } from 'react-dropzone'
import Option from './components/option/Option'
import { useTheme } from '../../../../../../hooks/theme/useTheme'
import { colors } from '../../../../../../config/colors'
import { useHistory, useLocation } from 'react-router-dom'
import Text from '../../../../../../components/atoms/text/Text'
import { routes } from '../../../../../../config/routes'
import { ReactComponent as IconDrop } from './assets/fairdrop-drop.svg'
import { ReactComponent as IconSelect } from './assets/fairdrop-select.svg'

const SelectFile = () => {
  const [{ files }, { setFiles, setType }] = useFileManager()
  const inputRef = useRef()
  const { setVariant, setBackground } = useTheme()
  const history = useHistory()
  const location = useLocation()

  const handleFileDrop = useCallback((type, files) => {
    setFiles({ type, files })
  }, [])

  const handleUploadFileClick = useCallback(() => {
    setType({ type: FILE_UPLOAD_TYPES.ENCRYPTED })
    inputRef?.current?.click()
  }, [])

  const handleFileChange = useCallback((evt) => {
    const { files } = evt.target
    setFiles({ files: [files[0]] })
  }, [])

  const { getRootProps, isDragActive } = useDropzone({ onDrop: () => {} })

  useEffect(() => {
    setVariant('white')
    setBackground(colors.red)
  }, [])

  useEffect(() => {
    if (files.length === 0) {
      return
    }
    history.push(routes.upload.flow)
  }, [files])

  useEffect(() => {
    const query = new URLSearchParams(location?.search)
    const action = query.get('a') ?? ''
    const isValidAction = action === 'send' || action === 'quick'

    if (!isValidAction) {
      return
    }
    console.info(action)
    setTimeout(() => {
      setType({ type: action === 'send' ? FILE_UPLOAD_TYPES.ENCRYPTED : FILE_UPLOAD_TYPES.QUICK })
      inputRef?.current?.click()
    }, 500)
  }, [location?.search])

  return (
    <div className={styles.container} {...getRootProps()}>
      {!isDragActive && (
        <div className={styles.instructions}>
          <Text element="h2" size="xxl" weight="400" align="center">
            An easy and secure way to send your files.
          </Text>
          <div className={styles.features}>
            <Text className={styles.noWrap} size="xxl" element="span" weight="400">
              No central server.&nbsp;
            </Text>
            <Text className={styles.noWrap} size="xxl" element="span" weight="400">
              No tracking.&nbsp;
            </Text>
            <Text className={styles.noWrap} size="xxl" element="span" weight="400">
              No backdoors.&nbsp;
            </Text>
          </div>

          <Text element="h3" size="xl" weight="400" className={styles.actions}>
            <IconSelect className={styles.selectIcon} />{' '}
            <Text
              className={styles.selectFileAction}
              size="xl"
              element="span"
              weight="400"
              onClick={handleUploadFileClick}
            >
              select
            </Text>{' '}
            or <IconDrop className={styles.dropIcon} /> drop a file
          </Text>
        </div>
      )}

      {isDragActive && (
        <div className={styles.options}>
          <Option
            headline="Send encrypted"
            description="Requires logging in to your mailbox"
            type={FILE_UPLOAD_TYPES.ENCRYPTED}
            onFileDrop={handleFileDrop}
          />
          <Option
            headline="Send in a quick way"
            description="Send a file or folder unencrypted - no mailboxes required"
            type={FILE_UPLOAD_TYPES.QUICK}
            onFileDrop={handleFileDrop}
          />
        </div>
      )}

      <input ref={inputRef} hidden type="file" multiple={false} onChange={handleFileChange} />
    </div>
  )
}

export default React.memo(SelectFile)
