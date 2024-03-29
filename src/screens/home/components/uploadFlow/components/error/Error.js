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

import React, { memo } from 'react'
import styled from 'styled-components/macro'
import { Box, Button, Text } from '../../../../../../components'
import { DEVICE_SIZE } from '../../../../../../theme/theme'
import { ReactComponent as Illustration } from './assets/illustration.svg'

const Container = styled(Box)`
  width: 100%;
  height: 100%;
`

const Content = styled(Box)`
  width: 100%;

  @media (max-width: ${DEVICE_SIZE.MOBILE_L}) {
    flex: 1;
  }
`

const ErrorIllustration = styled(Illustration)`
  margin-bottom: 8px;
`

const ActionButton = styled(Button)`
  @media (max-width: ${DEVICE_SIZE.MOBILE_L}) {
    width: 100%;
  }
`

export const Error = memo(({ onFinish }) => {
  return (
    <Container direction="column" vAlign="center" gap="16px">
      <Content direction="column" vAlign="center" gap="16px">
        <ErrorIllustration />
        <Text size="xl" weight="400" variant="black">
          Ooops!
        </Text>

        <Text size="m" weight="400" variant="black">
          Something went wrong. Please select your file again.
        </Text>
      </Content>

      <ActionButton variant="primary" onClick={onFinish}>
        Understood
      </ActionButton>
    </Container>
  )
})

Error.displayName = 'Error'
