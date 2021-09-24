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

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FILE_UPLOAD_TYPES, useFileManager } from '../../../../../hooks/fileManager/useFileManager'
import styles from './UploadStep.module.css'
import Text from '../../../../../components/atoms/text/Text'
import ProgressBar from '../../../../../components/molecules/progressBar/ProgressBar'
import CircleLoader from '../../../../../components/atoms/circleLoader/CircleLoader'
import { useMailbox } from '../../../../../hooks/mailbox/useMailbox'
import { toast } from 'react-toastify'
import Button from '../../../../../components/atoms/button/Button'
import { useHistory } from 'react-router-dom'
import { routes } from '../../../../../config/routes'

const UploadStep = ({ nextStep }) => {
  const [{ files, type, recipient }, { setDownloadLink }] = useFileManager()
  const [, { uploadUnencryptedFile, uploadEncryptedFile }] = useMailbox()
  const [infoMessage, setInfoMessage] = useState()
  const [progress, setProgress] = useState(0)
  const [uploadFailed, setUploadFailed] = useState(false)
  const history = useHistory()

  const isEncrypted = useMemo(() => {
    return type === FILE_UPLOAD_TYPES.ENCRYPTED
  }, [type])

  const handleTryAgainClick = useCallback(() => {
    history.replace(routes.upload.home)
  }, [history])

  useEffect(() => {
    if (isEncrypted) {
      uploadEncryptedFile({
        to: recipient,
        files,
        onEncryptedEnd: () => setInfoMessage('The file was encrypted, uploading file...'),
        onProgressUpdate: (response) => {
          if (response > 100) {
            return
          }
          setProgress(response)
        },
        onStatusChange: (message) => setInfoMessage(message),
      })
        .then(() => {
          nextStep?.()
        })
        .catch((error) => {
          toast.error(`💩 ${error.message}`)
          setUploadFailed(true)
        })
    } else {
      uploadUnencryptedFile({
        files,
        onProgressUpdate: (response) => {
          if (response > 100) {
            return
          }
          setProgress(response)
        },
        onStatusChange: (message) => setInfoMessage(message),
      }).then((link) => {
        console.info(link)
        setDownloadLink({ link })
        nextStep?.()
      })
    }
  }, [files, recipient, isEncrypted, setDownloadLink])

  return (
    <div className={styles.container}>
      {!uploadFailed && (
        <>
          <Text className={styles.headline} element="h1" size="l" weight="500">
            <CircleLoader className={styles.loader} /> Uploading
          </Text>

          <div className={styles.content}>
            <Text className={styles.statusHeadline} element="h2" size="l" align="center">
              {isEncrypted
                ? 'Encrypting using AES-256 military grade encryption'
                : 'Storing Unencrypted using Swarm network'}
            </Text>

            <ProgressBar className={styles.progress} value={progress} />

            <Text className={styles.statusDescription} size="ml" align="center">
              {infoMessage}
            </Text>
          </div>
        </>
      )}

      {uploadFailed && (
        <>
          <Text className={styles.errorHeadline} element="h1" size="l" weight="500">
            💩 Error
          </Text>

          <div className={styles.content}>
            <Text className={styles.statusHeadline} element="h4" size="ml" align="center">
              There was an error, please try again...
            </Text>

            <Button className={styles.action} variant="white" type="submit" onClick={handleTryAgainClick}>
              Try again!
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default React.memo(UploadStep)
