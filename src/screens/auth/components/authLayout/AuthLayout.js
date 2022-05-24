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
import { Box } from '../../../../components/atoms/box/Box'
import { Text } from '../../../../components/atoms/text/Text'
import { DEVICE_SIZE } from '../../../../theme/theme'
import bg from './assets/background.jpg'

const Container = styled.section`
  display: flex;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.white.main};
`

const LeftSide = styled(Box)`
  width: 50%;
  box-sizing: border-box;
  background: ${`url(${bg}) no-repeat center center / cover`};

  @media (max-width: ${DEVICE_SIZE.MOBILE_L}) {
    display: none;
  }
`

const RigthSide = styled.div`
  width: 50%;
  box-sizing: border-box;

  @media (max-width: ${DEVICE_SIZE.MOBILE_L}) {
    width: 100%;
  }
`

export const AuthLayout = memo(({ children, ...props }) => {
  return (
    <Container {...props}>
      <LeftSide direction="column" vAlign="center" padding="64px" gap="16px">
        <Text size="xxl" weight="600">
          The easiest way to send your files privately
        </Text>

        <Text size="xl" weight="300">
          End to end encrypted transfers
        </Text>
      </LeftSide>

      <RigthSide>{children}</RigthSide>
    </Container>
  )
})

AuthLayout.displayName = 'AuthLayout'
