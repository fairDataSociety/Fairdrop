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
import Stepper from '../../../components/molecules/stepper/Stepper'
import { colors } from '../../../config/colors'
import { useFileManager } from '../../../hooks/fileManager/useFileManager'
import { useTheme } from '../../../hooks/theme/useTheme'
import ConfirmStep from './steps/confirm/ConfirmStep'
import UploadStep from './steps/upload/UploadStep'
import styles from './UploadFlowScreen.module.css'

const UploadFlowScreen = ({ history }) => {
  const { setVariant, setBackground } = useTheme()
  const [{ files }] = useFileManager()

  useEffect(() => {
    setVariant('white')
    setBackground(colors.green)
  }, [])

  useEffect(() => {
    if (files.length < 1) {
      history.replace('/upload')
    }
  }, [files])

  return (
    <div className={styles.container}>
      <Stepper
        steps={[
          {
            label: 'Select File',
            Component: <div />,
          },
          {
            label: 'Confirm',
            Component: <ConfirmStep />,
          },
          {
            label: 'Upload',
            Component: <UploadStep />,
          },
          {
            label: 'Summary',
            Component: <div />,
          },
        ]}
        initialStep={1}
      />
    </div>
  )
}

export default React.memo(UploadFlowScreen)
