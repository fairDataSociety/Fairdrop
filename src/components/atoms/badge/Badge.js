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
import styled, { css } from 'styled-components'

const Root = styled.span`
  position: relative;
  display: inline-flex;
  vertical-align: middle;
  flex-shrink: 0;
`

const BadgeContainer = styled.span`
  display: flex;
  flex-flow: row wrap;
  place-content: center;
  align-items: center;
  position: absolute;
  box-sizing: border-box;
  ${({ theme, variant }) => css`
    font-size: ${theme.components?.badge?.font?.size};
    font-weight: ${theme.components?.badge?.font?.weight};
    color: ${theme.components?.badge?.font?.color};
    background-color: ${theme.colors?.[variant]?.main};
  `};
  min-width: 20px;
  line-height: 1;
  padding: 0px 6px;
  height: 20px;
  border-radius: 10px;
  z-index: 1;
  transition: transform 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  top: 0px;
  right: 0px;
  transform: scale(1) translate(50%, -50%);
  transform-origin: 100% 0%;
`

export const Badge = memo(({ children, count, showZero, variant, ...props }) => {
  const sanitizedCount = useMemo(() => {
    if (!count) {
      return '0'
    }
    return count > 99 ? '99+' : `${count}`
  }, [count])

  const shouldShowBadge = useMemo(() => {
    return showZero || parseInt(count) > 0
  }, [showZero, count])

  return (
    <Root {...props}>
      {children} {shouldShowBadge && <BadgeContainer variant={variant}>{sanitizedCount}</BadgeContainer>}
    </Root>
  )
})

Badge.defaultProps = {
  variant: 'primary',
  showZero: false,
}

Badge.displayName = 'Badge'
