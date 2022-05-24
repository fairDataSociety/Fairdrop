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
import { Icon } from '../icon/Icon'
import { Text } from '../text/Text'

const ListItemContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ListItemWrapper = styled.li`
  list-style: none;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px;

  ${({ theme, onClick }) => css`
    border-bottom: solid 1px ${theme.colors.ntrl_light.main};
    cursor: ${onClick ? 'pointer' : 'auto'};
  `};
`

const Title = styled(Text)`
  margin-bottom: 4px;
`

const IconWrapper = styled.div`
  display: flex;
  position: relative;
  ${({ theme, hasNotification }) =>
    hasNotification &&
    css`
      &:before {
        content: '';
        position: absolute;
        right: -2px;
        top: -2px;
        width: 8px;
        height: 8px;
        border-radius: 6px;
        border: solid 2px ${theme.colors.white.main};
        background-color: ${theme?.colors?.primary?.main};
      }
    `}
`

export const ListItem = memo(function ListItem({ iconName, hasNotification, title, subtitle, options, onClick }) {
  const weight = hasNotification ? '500' : '400'
  return (
    <ListItemWrapper onClick={onClick}>
      {iconName && (
        <IconWrapper hasNotification={hasNotification}>
          <Icon name={iconName} />
        </IconWrapper>
      )}
      <ListItemContent>
        {title && (
          <Title variant="black" weight={weight} size="sm" truncate>
            {title}
          </Title>
        )}
        {subtitle && (
          <Text weight="400" size="s" variant="gray" truncate>
            {subtitle}
          </Text>
        )}
      </ListItemContent>
      {options && <Icon name="options" />}
    </ListItemWrapper>
  )
})
