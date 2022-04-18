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
import styled, { css } from 'styled-components/macro'
import { Text } from '../text/Text'

const TabContainer = styled.button`
  outline: none;
  padding: 8px 6px;
  border: 0;
  border-bottom: solid 1px ${({ theme }) => theme?.colors?.ntrl_light?.main};
  background-color: transparent;
  position: relative;
  flex: 1;
  align-self: stretch;
  cursor: pointer;

  ${({ isActive, theme }) =>
    isActive &&
    css`
      &:after {
        content: '';
        display: block;
        width: 100%;
        height: 2px;
        position: absolute;
        bottom: -1px;
        left: 0;
        background-color: ${theme?.colors?.primary?.main};
      }
    `};
`

export const Tab = memo(({ children, isActive, ...props }) => {
  return (
    <TabContainer isActive={isActive} {...props}>
      <Text size="m" weight="400" align="center" variant={isActive ? 'black' : 'ntrl_dark'}>
        {children}
      </Text>
    </TabContainer>
  )
})

Tab.defaultProps = {
  isActive: false,
}

Tab.displayName = 'Tab'
