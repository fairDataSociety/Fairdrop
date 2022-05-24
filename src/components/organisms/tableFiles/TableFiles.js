import React, { useEffect, useMemo, useState } from 'react'
import { useMediaQuery } from '../../../hooks/useMediaQuery/useMediaQuery'
import { DEVICE_SIZE } from '../../../theme/theme'
import { TableDesktop, TABLE_MODE } from './TableDesktop'
import { TableMobile } from './TableMobile'
import { FileDetailsAnimated } from './FileDetailsAnimated'
import styled from 'styled-components/macro'
import { Box } from '../../atoms/box/Box'
import { useMailbox } from '../../../hooks/mailbox/useMailbox'
import { toast } from 'react-toastify'

const WrapperTable = styled(Box)`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`

const Content = styled.section`
  height: 100%;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
`

export const TableFiles = ({ className, messages, mode, hideFrom, onClick, children }) => {
  const [fileDetails, setFileDetails] = useState(null)
  const [{ appState }, { markAsRead, getAppState }] = useMailbox()
  const minTabletMediaQuery = useMediaQuery(`(min-width: ${DEVICE_SIZE.TABLET})`)

  const readMessages = useMemo(() => {
    if (mode === TABLE_MODE.SENT) {
      return []
    }

    return appState?.markedAsRead ?? []
  }, [appState, mode])

  const handleClickFile = (details) => {
    setFileDetails(details)
    markAsRead?.({ message: details }).catch(() => toast.error('Opps! Something went wrong'))
    onClick?.(details)
  }

  const handleExitedFile = () => {
    setFileDetails(null)
  }

  useEffect(() => {
    getAppState()
  }, [])

  return (
    <WrapperTable className={className}>
      <Content>
        {children}
        {minTabletMediaQuery ? (
          <TableDesktop
            readMessages={readMessages}
            messages={messages}
            hideFrom={hideFrom}
            mode={mode}
            onClick={handleClickFile}
          />
        ) : (
          <TableMobile
            readMessages={readMessages}
            messages={messages}
            hideFrom={hideFrom}
            mode={mode}
            onClick={handleClickFile}
          />
        )}
      </Content>

      <FileDetailsAnimated show={!!fileDetails} fileDetails={fileDetails} onExited={handleExitedFile} />
    </WrapperTable>
  )
}
