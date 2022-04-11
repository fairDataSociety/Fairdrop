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

import React from 'react'
import styled, { css } from 'styled-components/macro'

export const ALIGN = ['left', 'center', 'right']
export const VARIANTS = ['white', 'black', 'green']
export const SIZES = ['xs', 's', 'sm', 'm', 'ml', 'l', 'xl', 'xxl']
export const TRANSFORM = ['unset', 'capitalize', 'uppercase', 'lowercase', 'inherit']

export const ELEMENTS = ['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']

const getWeight = (weight) => {
  let res
  switch (weight) {
    case '300':
    case 'light':
      res = 300
      break
    case '400':
    case 'regular':
      res = 400
      break
    case '500':
    case 'medium':
      res = 500
      break
    case '600':
    case 'semibold':
      res = 600
      break
    case '700':
    case 'bold':
      res = 700
      break
    case '800':
    case 'black':
      res = 800
      break
    default:
      res = 400
  }
  return res
}

const StyledTextP = styled.p`
  margin: 0;
  padding: 0;
  color: ${({ theme, variant }) => theme.colors?.[variant]?.main};
  font-weight: ${({ weight }) => getWeight(weight)};
  ${({ theme, size }) => css(theme.components?.text?.fontSizes?.[size] ?? '')}
  text-align: ${({ align }) => align};

  ${({ bold }) =>
    bold &&
    css`
      font-weight: 700;
    `}

  text-transform: ${({ transform }) => transform};

  ${({ whiteSpace }) => {
    return css`
      white-space: ${whiteSpace};
    `
  }}

  ${({ truncate }) =>
    truncate &&
    css`
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: ${truncate === true ? 1 : truncate};

      overflow: hidden;

      text-overflow: ellipsis;
    `}
`

export const Text = ({ ...props }) => {
  return <StyledTextP {...props} />
}

Text.defaultProps = {
  size: SIZES[3],
  variant: VARIANTS[0],
  as: ELEMENTS[0],
  weight: 'regular',
  align: ALIGN[0],
  transform: TRANSFORM[0],
  whiteSpace: 'normal',
}

export default Text
