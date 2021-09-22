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

import React, { useEffect, useMemo, useState } from 'react'
import { FILE_UPLOAD_TYPES, useFileManager } from '../../../../../hooks/fileManager/useFileManager'
import styles from './UploadStep.module.css'
import Text from '../../../../../components/atoms/text/Text'
import ProgressBar from '../../../../../components/molecules/progressBar/ProgressBar'
import CircleLoader from '../../../../../components/atoms/circleLoader/CircleLoader'
import { useMailbox } from '../../../../../hooks/mailbox/useMailbox'

const UploadStep = ({ nextStep }) => {
  const [{ files, type }, { setDownloadLink }] = useFileManager()
  const [, { uploadUnencryptedFile }] = useMailbox()
  const [infoMessage, setInfoMessage] = useState()
  const [progress, setProgress] = useState(0)

  const isEncrypted = useMemo(() => {
    return type === FILE_UPLOAD_TYPES.ENCRYPTED
  }, [type])

  useEffect(() => {
    if (isEncrypted) {
      // TODO
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
  }, [files, isEncrypted, setDownloadLink])

  return (
    <div className={styles.container}>
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
    </div>
  )
}

export default React.memo(UploadStep)
