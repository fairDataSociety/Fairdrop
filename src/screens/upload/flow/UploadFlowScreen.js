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

import React, { useEffect, useMemo } from 'react'
import { toast } from 'react-toastify'
import Stepper from '../../../components/molecules/stepper/Stepper'
import { colors } from '../../../config/colors'
import { routes } from '../../../config/routes'
import { FILE_UPLOAD_TYPES, useFileManager } from '../../../hooks/fileManager/useFileManager'
import { useMailbox } from '../../../hooks/mailbox/useMailbox'
import { useTheme } from '../../../hooks/theme/useTheme'
import ConfirmStep from './steps/confirm/ConfirmStep'
import SelectRecipientStep from './steps/selectRecipient/SelectRecipientStep'
import SummaryStep from './steps/summary/SummaryStep'
import UploadStep from './steps/upload/UploadStep'
import styles from './UploadFlowScreen.module.css'

const UploadFlowScreen = ({ history, location }) => {
  const { setVariant, setBackground } = useTheme()
  const [{ files, type }] = useFileManager()
  const [{ mailbox }] = useMailbox()

  const steps = useMemo(() => {
    let steps = [
      {
        label: 'Select File',
        Component: <div />,
      },
    ]

    if (type === FILE_UPLOAD_TYPES.ENCRYPTED) {
      steps.push({
        label: 'Select Recipient',
        Component: <SelectRecipientStep />,
      })
    }

    steps.push(
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
        Component: <SummaryStep />,
      },
    )

    return steps
  }, [type])

  useEffect(() => {
    setVariant('white')
    setBackground(colors.green)
  }, [])

  useEffect(() => {
    if (files.length < 1) {
      history.replace(routes.upload.home)
    }
  }, [files])

  useEffect(() => {
    if (!mailbox && type !== FILE_UPLOAD_TYPES.QUICK) {
      const copy =
        type === FILE_UPLOAD_TYPES.ENCRYPTED
          ? '👋 You need to log in your mailbox to send encrypted files.'
          : '👋 You need to log in your mailbox to store encrypted files.'
      toast(copy)
      history.replace(routes.login, { from: location })
    }
  }, [type, mailbox, history, location])

  return (
    <div className={styles.container}>
      <Stepper steps={steps} initialStep={1} />
    </div>
  )
}

export default React.memo(UploadFlowScreen)
