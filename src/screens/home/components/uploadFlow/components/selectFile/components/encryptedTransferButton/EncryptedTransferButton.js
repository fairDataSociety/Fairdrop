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

import { transparentize } from 'polished'
import React, { memo, useRef } from 'react'
import styled, { css } from 'styled-components/macro'
import { Icon } from '../../../../../../../../components/atoms/icon/Icon'
import { Text } from '../../../../../../../../components/atoms/text/Text'

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: ${({ theme }) => theme?.colors?.primary?.main};
  border: solid 1px ${({ theme }) => theme?.colors?.primary?.main};
  border-radius: 4px;
  width: 100%;
  height: 64px;
  padding: 0 24px;
  outline: none;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  box-sizing: border-box;

  ${({ theme }) => {
    return css`
      &:not([disabled]):hover,
      &:not([disabled]):focus,
      &:not([disabled]):active {
        opacity: 1;
        background-color: ${transparentize(0.8, theme.colors.ntrl_light.main)};
      }
    `
  }}

  ${({ theme, disabled }) => {
    return (
      disabled &&
      css`
        pointer-events: none;
        background-color: ${theme.colors.ntrl_darker.main};
        border-color: ${theme.colors.ntrl_darker.main};
      `
    )
  }}
`

const Input = styled.input`
  position: absolute;
  top: -100%;
  display: none;
`

export const EncryptedTransferButton = memo(({ accept, onFileChange, ...rest }) => {
  const inputRef = useRef()

  const handleClick = () => {
    inputRef?.current?.click()
  }

  const handleFileChange = async (evt) => {
    const selectedFile = evt.target.files?.[0]
    if (!selectedFile) {
      return
    }
    onFileChange?.(selectedFile)
  }

  return (
    <Button type="button" {...rest} onClick={handleClick}>
      <Icon name="lock" size="m" />
      <Text size="m" weight="500" variant="white">
        Encrypted transfer
      </Text>
      <Input ref={inputRef} name="file" type="file" accept={accept} onChange={handleFileChange} />
    </Button>
  )
})

EncryptedTransferButton.displayName = 'EncryptedTransferButton'
