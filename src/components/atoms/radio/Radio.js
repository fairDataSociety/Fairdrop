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

const Checkmark = styled.input`
  box-sizing: border-box;

  appearance: none;
  background-color: #fff;
  margin: 0;

  font: inherit;
  color: ${({ theme }) => theme?.colors?.ntrl_light?.main};
  width: 18px;
  height: 18px;
  border: 2px solid ${({ theme }) => theme?.colors?.ntrl_light?.main};
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  &:before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    transform: scale(0);
    transition: 120ms transform ease-in-out;
    box-shadow: inset 8px 8px ${({ theme }) => theme?.colors?.primary?.main};
  }

  &:checked {
    color: ${({ theme }) => theme?.colors?.primary?.main};
    border-color: ${({ theme }) => theme?.colors?.primary?.main};
  }

  &:checked:before {
    transform: scale(1);
  }
`

const Label = styled.label`
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.4;
      cursor: not-allowed;
    `}
`

export const Radio = memo(({ className, id, name, value, checked, children, disabled, ...props }) => {
  return (
    <Label className={className} disabled={disabled}>
      <Checkmark type="radio" id={id} name={name} value={value} checked={checked} disabled={disabled} {...props} />
      {children}
    </Label>
  )
})

Radio.displayName = 'Radio'
