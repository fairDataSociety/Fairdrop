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

import React, { useEffect, useMemo, useState } from 'react'
import Text from '../../../../components/atoms/text/Text'
import { useMailbox } from '../../../../hooks/mailbox/useMailbox'
import { toast } from 'react-toastify'
import WorkingLayout from '../../../../components/layout/working/WorkingLayout'
import styled from 'styled-components/macro'
import { Box, TableFiles } from '../../../../components'
import { TABLE_MODE } from '../../../../components/organisms/tableFiles/TableDesktop'

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`

const WrapperTable = styled(Box)`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`

const DashboardSentScreen = () => {
  const [{ sent }, { getSentMessages }] = useMailbox()
  const [isFetchingMessages, setIsFetchingMessages] = useState(true)

  const sortedMessages = useMemo(() => {
    return sent.sort((a, b) => {
      return b?.hash?.time - a?.hash?.time
    })
  }, [sent])

  useEffect(() => {
    getSentMessages()
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
        {sortedMessages.length === 0 ? (
          <Box gap="14px" vAlign="center">
            <Text size="sm" variant="black">
              There is no sent files yet...
            </Text>
          </Box>
        ) : (
          <TableFiles messages={sortedMessages} mode={TABLE_MODE.SENT} />
        )}
      </WrapperTable>
    </Container>
  )
}

export default React.memo(DashboardSentScreen)
