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
import Utils from '../../../../services/Utils'
import { DateTime } from 'luxon'
import { toast } from 'react-toastify'
import WorkingLayout from '../../../../components/layout/working/WorkingLayout'
import Notification from '../../../../components/molecules/notification/Notification'
import styled from 'styled-components/macro'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  SwitchFileIcon,
  Box,
  ButtonFlat,
} from '../../../../components'

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`

const honestInboxRegex = /anonymous-\d{13}/gm

const DashboardReceivedScreen = () => {
  const [{ received }, { getReceivedMessages }] = useMailbox()
  const [isFetchingMessages, setIsFetchingMessages] = useState(true)
  const [shouldOpenNotification, setShouldOpenNotification] = useState(
    !localStorage.getItem('honestInboxDidYouKnowNotification'),
  )

  const sortedMessages = useMemo(() => {
    return received.sort((a, b) => {
      return b?.hash?.time - a?.hash?.time
    })
  }, [received])

  const onCloseNotification = useCallback(() => {
    localStorage.setItem('honestInboxDidYouKnowNotification', Date.now())
    setShouldOpenNotification(false)
  }, [])

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
      <div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Text size="sm" weight="500" variant="black">
                  Name
                </Text>
              </TableCell>
              <TableCell>
                <Text size="sm" weight="500" variant="black">
                  From
                </Text>
              </TableCell>
              <TableCell>
                <Text size="sm" weight="500" variant="black">
                  Time
                </Text>
              </TableCell>
              <TableCell>
                <Text size="sm" weight="500" variant="black" align="right">
                  Size
                </Text>
              </TableCell>
            </TableRow>
          </TableHead>

          {received.length > 0 && (
            <TableBody>
              {sortedMessages.map((message) => {
                const { hash = {}, from } = message
                const { file = {} } = hash
                let sanitizedFrom = from
                if (new RegExp(honestInboxRegex).test(from)) {
                  sanitizedFrom = 'Honest Inbox'
                }

                return (
                  <TableRow
                    key={message?.hash?.address}
                    hoverActions={
                      <Box gap="32px">
                        <ButtonFlat variant="primary">Copy link</ButtonFlat>
                        <ButtonFlat variant="negative">Delete</ButtonFlat>
                      </Box>
                    }
                  >
                    <TableCell>
                      <Box gap="14px" vAlign="center">
                        <SwitchFileIcon className type={file.type} onClick={message?.saveAs ?? undefined} />
                        <Text size="sm" variant="black">
                          {file?.name ?? 'Unkown'}
                        </Text>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box gap="14px" vAlign="center">
                        <Text size="sm" variant="black">
                          {sanitizedFrom ?? 'Unkown'}
                        </Text>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box gap="14px" vAlign="center">
                        <Text size="sm" variant="black">
                          {hash.time ? DateTime.fromMillis(hash.time).toFormat('dd/LL/yyyy HH:mm') : 'Unkown'}
                        </Text>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Text size="sm" variant="black" align="right">
                        {Utils.humanFileSize(file?.size) ?? 'Unkown'}
                      </Text>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          )}
        </Table>
        {received.length === 0 && (
          <Box gap="14px" vAlign="center">
            <Text size="sm" variant="black">
              There is no received files yet...
            </Text>
          </Box>
        )}
      </div>

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
