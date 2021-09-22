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

import React, { useEffect } from 'react'
import { useFileManager } from '../../../../../hooks/fileManager/useFileManager'
import styles from './SummaryStep.module.css'
import Text from '../../../../../components/atoms/text/Text'
import CircleLoader from '../../../../../components/atoms/circleLoader/CircleLoader'
import { useTheme } from '../../../../../hooks/theme/useTheme'
import { colors } from '../../../../../config/colors'
import Utils from '../../../../../services/Utils'
import Input from '../../../../../components/atoms/input/Input'
import TouchableOpacity from '../../../../../components/atoms/touchableOpacity/TouchableOpacity'

const SummaryStep = ({ nextStep }) => {
  const [{ files, type, link }] = useFileManager()
  const { setVariant, setBackground } = useTheme()

  useEffect(() => {
    setVariant('white')
    setBackground(colors.gray)
  }, [])

  return (
    <div className={styles.container}>
      <Text className={styles.headline} element="h1" size="l" weight="500">
        <CircleLoader className={styles.loader} /> Sent.
      </Text>

      <div className={styles.content}>
        {files.map((file, idx) => {
          return (
            <div key={`${idx}-${file.name}`} className={styles.fileInfo}>
              <Text size="ml">{file.name}</Text>
              <Text className={styles.fileSize}>{Utils.humanFileSize(file.size)}</Text>
            </div>
          )
        })}
        <div className={styles.download}>
          <Text align="center">File Download Link</Text>

          <Input className={styles.input} defaultValue={link} />

          <TouchableOpacity>
            <Text size="sm" align="center">
              Copy link
            </Text>
          </TouchableOpacity>
        </div>
      </div>
    </div>
  )
}

export default React.memo(SummaryStep)
