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

const mapAlignWithFlexValue = {
  left: 'flex-start',
  right: 'flex-end',
  center: 'center',
  top: 'flex-start',
  bottom: 'flex-end',
}

export const Box = memo(styled.div`
  display: flex;

  ${({
    gap,
    direction = 'row',
    hAlign = 'left',
    vAlign = 'left',
    margin = '0',
    padding = '0',
    fitWidth = false,
    fit = false,
  }) => css`
    width: ${fitWidth ? '100%' : 'auto'};
    flex: ${fit ? '1' : '0 1 auto'};
    gap: ${gap};
    margin: ${margin};
    padding: ${padding};
    flex-direction: ${direction};
    justify-content: ${mapAlignWithFlexValue[direction === 'column' ? vAlign : hAlign]};
    align-items: ${mapAlignWithFlexValue[direction === 'column' ? hAlign : vAlign]};
  `};
`)
