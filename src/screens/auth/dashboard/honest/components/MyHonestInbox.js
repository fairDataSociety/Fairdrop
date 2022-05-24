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

import React, { memo, useMemo } from 'react'
import { generatePath } from 'react-router-dom'
import styled from 'styled-components/macro'
import { Box, ClipboardInput, Text } from '../../../../../components'
import { routes } from '../../../../../config/routes'
import { useMailbox } from '../../../../../hooks/mailbox/useMailbox'

const Container = styled(Box)`
  box-sizing: border-box;
  align-self: flex-start;
`

export const MyHonestInbox = memo(({ className }) => {
  const [{ mailbox }] = useMailbox()

  const honestUrl = useMemo(() => {
    return generatePath(routes.mailbox.honest, { ens: mailbox.subdomain })
  }, [mailbox])

  return (
    <Container className={className} padding="0 24px" direction="column" gap="12px">
      <Text className="title" size="ml" weight="600" variant="black">
        Your Personal URL
      </Text>
      <ClipboardInput value={honestUrl} />
    </Container>
  )
})

MyHonestInbox.displayName = 'MyHonestInbox'
