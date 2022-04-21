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

import React, { useCallback } from 'react'
import Button from '../../../components/atoms/button/Button'
import Text from '../../../components/atoms/text/Text'
import { useMailbox } from '../../../hooks/mailbox/useMailbox'
import styles from './SettingsImportScreen.module.css'
import { useDropzone } from 'react-dropzone'
import { ReactComponent as IconDrop } from './assets/iconDrop.svg'
import { toast } from 'react-toastify'

const SettingsImportScreen = () => {
  const [, { importMailbox }] = useMailbox()

  const handleFileDrop = useCallback(async (files) => {
    const file = files[0]
    await importMailbox({ file })
      .then(() => {
        toast('🦄 Your mailbox has been imported!', {
          theme: 'light',
        })
      })
      .catch((error) => {
        console.error(error)
        toast.error('There was a problem while importing your mailbox :(', {
          theme: 'light',
        })
      })
  }, [])

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({ onDrop: handleFileDrop, noClick: true })

  const handleImportClick = useCallback(() => {
    inputRef?.current?.click()
  }, [])

  return (
    <div className={styles.container} {...getRootProps()}>
      {!isDragActive && (
        <div className={styles.content}>
          <Text className={styles.headline} element="h1" variant="white" size="xl" align="center">
            Import your mailboxes
          </Text>

          <Text variant="white" align="center">
            Did your export your mailboxes and you want to bring them back? Just drop the file here or select a file
            from your device.
          </Text>

          <Button className={styles.action} variant="white" type="button" onClick={handleImportClick}>
            Import mailbox
          </Button>
        </div>
      )}

      {isDragActive && (
        <div className={styles.dropzone}>
          <div className={styles.wrapper}>
            <IconDrop className={styles.icon} />
            <Text element="h2" weight="400" size="l" align="center">
              Drop here your file
            </Text>
          </div>
        </div>
      )}

      <input {...getInputProps()} />
    </div>
  )
}

export default React.memo(SettingsImportScreen)
