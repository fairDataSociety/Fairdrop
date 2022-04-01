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

import React, { useCallback, useEffect, useMemo } from 'react'
import { FILE_UPLOAD_TYPES, useFileManager } from '../../../../../hooks/fileManager/useFileManager'
import styles from './SummaryStep.module.css'
import Text from '../../../../../components/atoms/text/Text'
import { useTheme } from '../../../../../hooks/theme/useTheme'
import { colors } from '../../../../../config/colors'
import Utils from '../../../../../services/Utils'
import { Input } from '../../../../../components/atoms/input/Input'
import Button from '../../../../../components/atoms/button/Button'
import { routes } from '../../../../../config/routes'
import { useHistory } from 'react-router-dom'
import { ReactComponent as IconLock } from './assets/fairdrop-lock.svg'
import { ReactComponent as IconCircleTick } from './assets/circle-tick.svg'
import CopyToClipboard from '../../../../../components/molecules/copyToClipboard/CopyToClipboard'

const SummaryStep = () => {
  const [{ files, type, link }] = useFileManager()
  const { setVariant, setBackground } = useTheme()
  const history = useHistory()

  const isEncrypted = useMemo(() => {
    return type === FILE_UPLOAD_TYPES.ENCRYPTED
  }, [type])

  const handleFinishClick = useCallback(() => {
    history.replace(routes.upload.home)
  }, [])

  useEffect(() => {
    setVariant('white')
    setBackground(colors.gray)
  }, [])

  return (
    <div className={styles.container}>
      <Text className={styles.headline} element="h1" size="l" weight="500">
        <IconCircleTick className={styles.icon} /> Sent.
      </Text>

      <div className={styles.content}>
        {files.map((file, idx) => {
          return (
            <div key={`${idx}-${file.name}`} className={styles.fileInfo}>
              <Text size="ml" className={styles.filename} truncate>
                {file.name}
              </Text>
              <Text className={styles.fileSize}>{Utils.humanFileSize(file.size)}</Text>
            </div>
          )
        })}
        {!isEncrypted && (
          <div className={styles.download}>
            <Text align="center">File Download Link</Text>

            <Input className={styles.input} defaultValue={link} />

            <CopyToClipboard textToCopy={link} />
          </div>
        )}

        {isEncrypted && (
          <Text className={styles.encrypted} align="center">
            <IconLock className={styles.icon} /> Encrypted
          </Text>
        )}

        <Button className={styles.action} variant="white" type="submit" onClick={handleFinishClick}>
          Finish
        </Button>
      </div>
    </div>
  )
}

export default React.memo(SummaryStep)
