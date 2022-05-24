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
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components/macro'

export const NavItemLi = styled.li`
  position: relative;
  list-style: none;
`

export const NavItemContent = styled.span`
  position: relative;
  display: inline-block;
  width: 100%;
  font-family: 'Space Grotesk';
  font-style: normal;
  font-size: 16px;
  line-height: 24px;
  box-sizing: border-box;
  cursor: pointer;

  ${({ theme, variant, $isActive, size = 'm' }) => css`
    color: ${theme.colors[variant]?.main ?? theme.colors.black.main};
    text-decoration-line: ${$isActive ? 'underline' : 'none'};
    font-weight: ${$isActive ? 700 : 400};

    &:hover {
      text-decoration-line: ${$isActive ? 'underline' : 'none'};
    }

    ${css(theme.components.navItem.sizes[size])};
  `};
`

export const NavItem = memo(function NavItem({
  variant = 'ntrl_darkest',
  children,
  to,
  onClick,
  size,
  isActive,
  ...rest
}) {
  const setHandleClick = () => {
    if (onClick) {
      return (e) => {
        onClick?.(e)
      }
    }
    return undefined
  }

  const shitchElement = () => {
    if (to) {
      return Link
    }

    if (onClick) {
      return 'button'
    }

    return 'span'
  }

  return (
    <NavItemLi {...rest}>
      <NavItemContent
        as={shitchElement()}
        to={to}
        size={size}
        $isActive={isActive}
        variant={variant}
        onClick={setHandleClick()}
      >
        {children}
      </NavItemContent>
    </NavItemLi>
  )
})
