import React, { useState } from 'react'
import { useMediaQuery } from '../../../hooks/useMediaQuery/useMediaQuery'
import { DEVICE_SIZE } from '../../../theme/theme'
import { TableDesktop } from './TableDesktop'
import { TableMobile } from './TableMobile'
import { FileDetailsAnimated } from './FileDetailsAnimated'
import styled from 'styled-components/macro'
import { Box } from '../../atoms/box/Box'

const WrapperTable = styled(Box)`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`

const Content = styled.section`
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
`

export const TableFiles = ({ className, messages, mode, hideFrom, onClick, children }) => {
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
    <WrapperTable className={className}>
      <Content>
        {children}
        {minTabletMediaQuery ? (
          <TableDesktop messages={messages} hideFrom={hideFrom} mode={mode} onClick={handleClickFile} />
        ) : (
          <TableMobile messages={messages} hideFrom={hideFrom} mode={mode} onClick={handleClickFile} />
        )}
      </Content>

      <FileDetailsAnimated show={!!fileDetails} fileDetails={fileDetails} onExited={handleExitedFile} />
    </WrapperTable>
  )
}
