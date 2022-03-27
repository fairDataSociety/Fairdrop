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
import styled, { css } from 'styled-components'

const AvatarWrapper = styled.div`
  display: flex;
  justify-items: center;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`

const AvatarName = styled.span`
  font-family: 'Space Grotesk';
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;

  ${({ theme }) => css`
    color: ${theme.colors.ntrl_darkest.main};
  `}
`

const AvatarWrapperImg = styled.div`
  position: relative;
  width: 32px;
  height: 32px;
  overflow: hidden;
  border-radius: 50%;
  object-fit: cover;
  box-sizing: border-box;

  ${({ theme }) => css`
    border: solid 1px ${theme.colors.white.main};
    background: ${theme.colors.ntrl_darkest.main};
  `}
`

const AvatarImg = styled.img`
  display: block;
  width: 100%;
  height: 100%;
`

export const Avatar = memo(function Avatar({ name, src, ...rest }) {
  return (
    <AvatarWrapper role="avatar" {...rest}>
      {name && <AvatarName>{name}</AvatarName>}
      <AvatarWrapperImg>{src && <AvatarImg src={src} alt="avatar image" />}</AvatarWrapperImg>
    </AvatarWrapper>
  )
})
