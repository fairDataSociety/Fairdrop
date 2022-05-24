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
import React, { memo, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import styled, { css } from 'styled-components/macro'
import { useMailbox } from '../../../hooks/mailbox/useMailbox'
import { Icon } from '../../atoms/icon/Icon'
import Text from '../../atoms/text/Text'

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: ${({ theme }) => theme?.colors?.white?.main};
  border: solid 1px ${({ theme }) => theme?.colors?.ntrl_light?.main};
  border-radius: 4px;
  width: 100%;
  height: 64px;
  padding: 0 24px;
  outline: none;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;

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
        &:after {
          content: '';
          display: block;
          position: absolute;
          inset: 0;
          background-color: ${transparentize(0.3, theme.colors.white.main)};
        }
      `
    )
  }}
`

const Input = styled.input`
  position: absolute;
  top: -100%;
  display: none;
`

export const ImportButton = memo(({ disabled, ...props }) => {
  const [isWorking, setIsWorking] = useState(false)
  const [, { importMailbox }] = useMailbox()
  const inputRef = useRef()

  const handleClick = () => {
    inputRef?.current?.click()
  }

  const handleFileChange = async (evt) => {
    const file = evt.target.files?.[0]
    if (!file) {
      return
    }
    setIsWorking(true)
    await importMailbox({ file })
      .then(() => {
        toast.success('Mailbox imported successfully!')
        setIsWorking(false)
      })
      .catch(() => {
        toast.error('There was a problem while importing your mailbox :(')
        setIsWorking(false)
      })
  }

  return (
    <Button type="button" {...props} disabled={isWorking || disabled} onClick={handleClick}>
      <Icon name="import" size="m" />
      <Text size="m" weight="500" variant="black">
        Import Mailbox
      </Text>
      <Input ref={inputRef} name="mailbox_import" type="file" accept=".json" onChange={handleFileChange} />
    </Button>
  )
})

ImportButton.defaultProps = {
  disabled: false,
}

ImportButton.displayName = 'ImportButton'
