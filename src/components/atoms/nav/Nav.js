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

const NavUl = styled.ul`
  display: flex;
  gap: 24px;

  ${({ vertical }) => css`
    flex-direction: ${vertical ? 'column' : 'row'};
  `};
`

export const Nav = memo(function Nav({ className, children, vertical, onClick }) {
  return (
    <nav className={className} onClick={onClick}>
      <NavUl vertical={vertical}>{children}</NavUl>
    </nav>
  )
})
