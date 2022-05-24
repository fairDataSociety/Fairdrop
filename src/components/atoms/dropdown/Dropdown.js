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

import React, { memo, useEffect, useState } from 'react'
import styled, { css } from 'styled-components/macro'
import { Collapsible } from '../collapsible/Collapsible'
import { Icon } from '../icon/Icon'
import { Box } from '../box/Box'

const DropdownButton = styled.button`
  border: 0;
  outline: 0;
  background: transparent;
  cursor: pointer;
`

const CollapsibleStyled = styled(Collapsible)`
  position: absolute;
  top: 40px;
`

const Options = styled.ul`
  width: 200px;
  padding: 8px 0;
  border-radius: 4px;
  box-sizing: border-box;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);

  ${({ theme }) => css`
    border: solid 1px ${theme.colors.ntrl_light.main};
    background: ${theme.colors.white.main};
  `};
`

export const Dropdown = memo(function Dropdown({ id, children, expanded: givenExpanded, align }) {
  const [{ expanded }, setState] = useState({ expanded: givenExpanded })

  const handleClick = () => {
    setState((old) => ({ ...old, expanded: !expanded }))
  }

  const handleClickOption = () => {
    setState((old) => ({ ...old, expanded: !expanded }))
  }

  useEffect(() => {
    if (givenExpanded !== expanded) {
      setState((old) => ({ ...old, expanded: givenExpanded }))
    }
  }, [givenExpanded])

  return (
    <Box direction="column" hAlign={align}>
      <DropdownButton onClick={handleClick} aria-haspopup="listbox" aria-labelledby={id}>
        <Icon name="options" />
      </DropdownButton>
      <CollapsibleStyled id={id} aria-expanded={expanded} expanded={expanded} onClick={handleClickOption}>
        <Options role="listbox">{children}</Options>
      </CollapsibleStyled>
    </Box>
  )
})
