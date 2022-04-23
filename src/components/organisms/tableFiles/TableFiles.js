import React, { useState } from 'react'

import { useMediaQuery } from '../../../hooks/useMediaQuery/useMediaQuery'
import { DEVICE_SIZE } from '../../../theme/theme'
import { TableDesktop } from './TableDesktop'
import { TableMobile } from './TableMobile'
import { FileDetailsAnimated } from './FileDetailsAnimated'

export const TableFiles = ({ messages, mode, hideFrom, onClick }) => {
  const [fileDetails, setFileDetails] = useState(null)
  const minTabletMediaQuery = useMediaQuery(`(min-width: ${DEVICE_SIZE.TABLET})`)

  const handleClickFile = (details) => {
    setFileDetails(details)
    onClick?.(details)
  }

  const handleExitedFile = () => {
    setFileDetails(null)
  }

  return (
    <>
      {minTabletMediaQuery ? (
        <TableDesktop messages={messages} hideFrom={hideFrom} mode={mode} onClick={handleClickFile} />
      ) : (
        <TableMobile messages={messages} hideFrom={hideFrom} mode={mode} onClick={handleClickFile} />
      )}

      <FileDetailsAnimated show={!!fileDetails} fileDetails={fileDetails} onExited={handleExitedFile} />
    </>
  )
}
