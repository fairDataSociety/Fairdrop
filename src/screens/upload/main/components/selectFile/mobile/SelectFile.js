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
import { useTheme } from '../../../../../../hooks/theme/useTheme'
import { colors } from '../../../../../../config/colors'
import { useHistory, useLocation } from 'react-router-dom'
import Text from '../../../../../../components/atoms/text/Text'
import { routes } from '../../../../../../config/routes'
import { ReactComponent as IconLock } from './assets/lock.svg'
import { ReactComponent as IconUnlock } from './assets/unlock.svg'
import Button from '../../../../../../components/atoms/button/Button'
import c from 'classnames'

const SelectFile = () => {
  const [{ files }, { setFiles, setType }] = useFileManager()
  const inputRef = useRef()
  const { setVariant, setBackground } = useTheme()
  const history = useHistory()
  const location = useLocation()

  const handleFileChange = useCallback((evt) => {
    const { files } = evt.target
    setFiles({ files: [files[0]] })
  }, [])

  const handleUnencryptedClick = useCallback(() => {
    setType({ type: FILE_UPLOAD_TYPES.QUICK })
    inputRef?.current?.click()
  }, [])

  const handleEncryptedClick = useCallback(() => {
    setType({ type: FILE_UPLOAD_TYPES.ENCRYPTED })
    inputRef?.current?.click()
  }, [])

  const handleStoreClick = useCallback(() => {
    setType({ type: FILE_UPLOAD_TYPES.STORE })
    inputRef?.current?.click()
  }, [])

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
    const type = query.get('t') ?? ''
    const isValidType =
      type === FILE_UPLOAD_TYPES.ENCRYPTED || type === FILE_UPLOAD_TYPES.QUICK || type === FILE_UPLOAD_TYPES.STORE

    if (!isValidType) {
      return
    }

    setTimeout(() => {
      switch (type) {
        case FILE_UPLOAD_TYPES.ENCRYPTED:
          handleEncryptedClick?.()
          break

        case FILE_UPLOAD_TYPES.QUICK:
          handleEncryptedClick?.()
          break

        case FILE_UPLOAD_TYPES.STORE:
          handleStoreClick?.()
          break

        default:
          break
      }
    }, 500)
  }, [location?.search, handleUnencryptedClick, handleEncryptedClick, handleStoreClick])

  return (
    <div className={styles.container}>
      <div className={styles.instructions}>
        <Text element="h2" size="l" weight="400" align="center">
          An easy and secure way to send your files.
        </Text>
        <div className={styles.features}>
          <Text className={styles.noWrap} size="l" element="span" weight="400">
            No central server.&nbsp;
          </Text>
          <Text className={styles.noWrap} size="l" element="span" weight="400">
            No tracking.&nbsp;
          </Text>
          <Text className={styles.noWrap} size="l" element="span" weight="400">
            No backdoors.&nbsp;
          </Text>
        </div>
      </div>

      <div className={styles.actions}>
        <Button className={styles.uploadButton} variant="white" onClick={handleStoreClick}>
          <IconLock className={c(styles.icon, styles.encrypted)} /> Store Encrypted
        </Button>

        <Button className={styles.uploadButton} variant="white" onClick={handleEncryptedClick}>
          <IconLock className={c(styles.icon, styles.encrypted)} /> Send Encrypted
        </Button>

        <Button className={styles.uploadButton} variant="white" inverted onClick={handleUnencryptedClick}>
          <IconUnlock className={styles.icon} /> Send Unencrypted
        </Button>
      </div>

      <input ref={inputRef} hidden type="file" multiple={false} onChange={handleFileChange} />
    </div>
  )
}

export default React.memo(SelectFile)
