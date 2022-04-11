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
import Text from '../../../../components/atoms/text/Text'
import { useMailbox } from '../../../../hooks/mailbox/useMailbox'
import { toast } from 'react-toastify'
import WorkingLayout from '../../../../components/layout/working/WorkingLayout'
import Notification from '../../../../components/molecules/notification/Notification'
import styled from 'styled-components/macro'
import { Box } from '../../../../components'
import { TableReceive } from './TableReceived'
import { ListReceived } from './ListReceived'
import { useMediaQuery } from '../../../../hooks/useMediaQuery/useMediaQuery'
import { DEVICE_SIZE } from '../../../../theme/theme'
import { FileDetailsReceived } from './FileDetailsReceived'

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
`

const WrapperTable = styled.div`
  flex: 1;
  padding: 24px 40px 24px 24px;
`

const honestInboxRegex = /anonymous-\d{13}/gm

const DashboardReceivedScreen = () => {
  const [{ received }, { getReceivedMessages }] = useMailbox()
  const [isFetchingMessages, setIsFetchingMessages] = useState(true)
  const [shouldOpenNotification, setShouldOpenNotification] = useState(
    !localStorage.getItem('honestInboxDidYouKnowNotification'),
  )
  const [fileDetails, setFileDetails] = useState(null)
  const minTabletMediaQuery = useMediaQuery(`(min-width: ${DEVICE_SIZE.TABLET})`)

  const sortedMessages = useMemo(() => {
    return received.sort((a, b) => {
      return b?.hash?.time - a?.hash?.time
    })
  }, [received])

  const onCloseNotification = useCallback(() => {
    localStorage.setItem('honestInboxDidYouKnowNotification', Date.now())
    setShouldOpenNotification(false)
  }, [])

  const handleClickFile = (data) => {
    setFileDetails(data)
  }

  const handleExitedFile = () => {
    setFileDetails(null)
  }

  useEffect(() => {
    getReceivedMessages()
      .then(() => {
        setIsFetchingMessages(false)
      })
      .catch(() => {
        toast.error('🔥 Something went wrong while trying to retrieve your sent files :(')
        setIsFetchingMessages(false)
      })
  }, [])

  if (isFetchingMessages) {
    return <WorkingLayout headline="We are getting your data..." />
  }

  return (
    <Container>
      <WrapperTable>
        {received.length === 0 ? (
          <Box gap="14px" vAlign="center">
            <Text size="sm" variant="black">
              There is no received files yet...
            </Text>
          </Box>
        ) : (
          <>
            {minTabletMediaQuery ? (
              <TableReceive
                sortedMessages={sortedMessages}
                honestInboxRegex={honestInboxRegex}
                onClick={handleClickFile}
              />
            ) : (
              <ListReceived
                sortedMessages={sortedMessages}
                honestInboxRegex={honestInboxRegex}
                onClick={handleClickFile}
              />
            )}
          </>
        )}
      </WrapperTable>

      <FileDetailsReceived show={!!fileDetails} fileDetails={fileDetails} onExited={handleExitedFile} />

      <Notification opened={shouldOpenNotification} onCloseRequest={onCloseNotification}>
        <div>
          <Text weight="500">Hey! Did you know...</Text>
          <Text>
            ...you can use your{' '}
            <Text weight="500" element="span">
              Honest Inbox
            </Text>{' '}
            so people can send you files anonymously?
          </Text>
        </div>
      </Notification>
    </Container>
  )
}

export default React.memo(DashboardReceivedScreen)
