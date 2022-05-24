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

export const ButtonFlat = memo(styled.button`
  padding: 0;
  margin: 0;
  outline: 0;
  font-family: 'Space Grotesk';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: opacity 0.3s ease;

  ${({ theme, variant = 'primary' }) => css`
    color: ${theme.colors[variant].main};
  `};

  &:hover {
    opacity: 0.6;
  }
`)
