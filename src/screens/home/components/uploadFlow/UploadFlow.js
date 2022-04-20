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

import React, { memo, useCallback, useState } from 'react'
import { useFileManager } from '../../../../hooks/fileManager/useFileManager'
import { Done } from './components/done/Done'
import { Error } from './components/error/Error'
import { SelectFile } from './components/selectFile/SelectFile'
import { Upload } from './components/upload/Upload'

const STEPS = {
  SELECT_FILE: 0,
  UPLOAD: 1,
  DONE: 2,
  ERROR: 3,
}

export const UploadFlow = memo(() => {
  const [step, setStep] = useState(STEPS.ERROR)
  const [, { resetFileManager }] = useFileManager()

  const handleStartUpload = useCallback(() => {
    setStep(STEPS.UPLOAD)
  }, [])

  const handleCancel = useCallback(() => {
    resetFileManager?.()
    setStep(STEPS.UPLOAD)
  }, [resetFileManager])

  const handleError = useCallback(() => {
    setStep(STEPS.ERROR)
  }, [])

  const handleSuccess = useCallback(() => {
    setStep(STEPS.DONE)
  }, [])

  const handleFinishFlow = useCallback(() => {
    resetFileManager?.()
    setStep(STEPS.SELECT_FILE)
  }, [resetFileManager])

  const getContent = () => {
    switch (step) {
      case STEPS.SELECT_FILE:
        return <SelectFile onStartUpload={handleStartUpload} />

      case STEPS.UPLOAD:
        return <Upload onCancel={handleCancel} onError={handleError} onSuccess={handleSuccess} />

      case STEPS.DONE:
        return <Done onFinish={handleFinishFlow} />

      case STEPS.ERROR:
        return <Error onFinish={handleFinishFlow} />

      default:
        return null
    }
  }

  return getContent()
})

UploadFlow.displayName = 'UploadFlow'
