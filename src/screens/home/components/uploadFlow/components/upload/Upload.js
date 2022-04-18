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

import React, { memo, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components/macro'
import { Box, Button, CircleLoadingProgress, Text } from '../../../../../../components'
import { FILE_UPLOAD_TYPES, useFileManager } from '../../../../../../hooks/fileManager/useFileManager'
import { useMailbox } from '../../../../../../hooks/mailbox/useMailbox'

const Container = styled(Box)`
  width: 100%;
  height: 100%;
`

const Progress = styled(CircleLoadingProgress)`
  width: 140px;
  height: 140px;
`

const ActionButton = styled(Button)`
  margin-top: 8px;
`

export const Upload = memo(({ onSuccess, onError, onCancel }) => {
  const [{ files, type, recipient }, { setDownloadLink }] = useFileManager()
  const [, { uploadUnencryptedFile, uploadEncryptedFile, storeEncryptedFile }] = useMailbox()
  const [, setInfoMessage] = useState()

  useEffect(() => {
    switch (type) {
      case FILE_UPLOAD_TYPES.ENCRYPTED:
        uploadEncryptedFile({
          to: recipient,
          files,
          onEncryptedEnd: () => setInfoMessage('The file was encrypted, uploading file...'),
          onProgressUpdate: (response) => {
            if (response >= 100) {
              setInfoMessage('File uploaded, processing into Swarm.')
              return
            }
          },
          onStatusChange: (message) => setInfoMessage(message),
        })
          .then(() => {
            onSuccess?.()
          })
          .catch((error) => {
            toast.error(`💩 ${error.message}`)
            onError?.(error)
          })
        break
      case FILE_UPLOAD_TYPES.QUICK:
        uploadUnencryptedFile({
          files,
          onProgressUpdate: (response) => {
            if (response >= 100) {
              setInfoMessage('File uploaded, processing into Swarm.')
              return
            }
          },
          onStatusChange: (message) => setInfoMessage(message),
        })
          .then((link) => {
            setDownloadLink({ link })
            onSuccess?.()
          })
          .catch((error) => {
            toast.error(`💩 ${error.message}`)
            onError?.(error)
          })
        break
      case FILE_UPLOAD_TYPES.STORE:
        storeEncryptedFile({
          files,
          onEncryptedEnd: () => setInfoMessage('The file was encrypted, uploading file...'),
          onProgressUpdate: (response) => {
            if (response >= 100) {
              setInfoMessage('File uploaded, processing into Swarm.')
              return
            }
          },
          onStatusChange: (message) => setInfoMessage(message),
        })
          .then(() => {
            onSuccess?.()
          })
          .catch((error) => {
            toast.error(`💩 ${error.message}`)
            onError?.(error)
          })
        break
    }
  }, [files, recipient, type, setDownloadLink])

  return (
    <Container direction="column" vAlign="center" hAlign="center" gap="24px">
      <Progress />

      <Text size="m" weight="400" variant="black" align="center">
        Uploading file...
      </Text>

      <ActionButton bordered variant="primary" onClick={onCancel}>
        Cancel
      </ActionButton>
    </Container>
  )
})

Upload.displayName = 'Upload'
