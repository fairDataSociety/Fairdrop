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

import { memo } from 'react'
import styled, { css } from 'styled-components/macro'

export const Button = memo(styled.button`
  padding: 6px 24px;
  height: 48px;
  box-sizing: border-box;
  outline: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  cursor: pointer;
  transition: opacity 0.3s ease;
  user-select: none;

  &:hover {
    opacity: 0.8;
  }

  ${({ theme, bordered, variant }) =>
    !bordered &&
    css`
      background-color: ${theme?.colors?.[variant]?.main};
      border: solid 1px transparent;
      color: ${theme?.colors?.[variant]?.contrast};
    `}

  ${({ theme, bordered, variant }) =>
    bordered &&
    css`
      background-color: transparent;
      border: solid 1px ${theme?.colors?.[variant]?.main};
      color: ${theme?.colors?.[variant]?.main};
    `}

  ${({ theme, disabled }) =>
    disabled &&
    css`
      background-color: ${theme?.colors?.ntrl_darker?.main};
      border: solid 1px ${theme?.colors?.ntrl_darker?.main};
      color: ${theme?.colors?.ntrl_darker?.contrast};
      pointer-events: none;
    `}
`)

Button.defaultProps = {
  bordered: false,
  disabled: false,
  type: 'button',
  variant: 'primary',
}

Button.displayName = 'Button'

export default Button
