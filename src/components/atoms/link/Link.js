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
import styled, { css } from 'styled-components/macro'
import { Link as RNLink } from 'react-router-dom'

const StyledLink = styled.a`
  ${({ theme, $isActive }) => css`
    font-size: 16px;
    font-weight: ${$isActive ? 700 : 400};
    color: ${$isActive ? theme.colors.primary.main : theme.colors.ntrl_dark.main};
    transition: color 0.3s ease;

    display: flex;
    align-items: center;

    &:hover {
      color: ${theme.colors.primary.main};
    }
  `};
`

export const Link = memo(({ external, to, ...props }) => {
  const navigationProps = useMemo(() => {
    const navProps = {}
    if (external) {
      navProps.href = to
      navProps.rel = 'noopener noreferrer'
      navProps.target = '_blank'
    } else {
      navProps.to = to
    }
    return navProps
  }, [external, to])
  return <StyledLink as={external ? 'a' : RNLink} {...navigationProps} {...props} />
})

Link.defaultProps = {
  external: false,
}

Link.displayName = 'Link'
