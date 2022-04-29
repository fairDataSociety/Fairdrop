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
import Utils from '../../../services/Utils'
import { Box } from '../../atoms/box/Box'
import { ButtonIcon } from '../../atoms/buttonIcon/ButtonIcon'
import { Icon } from '../../atoms/icon/Icon'
import { SwitchFileIcon } from '../../atoms/switchFileIcon/SwitchFileIcon'
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

const StyledSwitchFileIcon = styled(SwitchFileIcon)`
  flex-shrink: 0;
  margin-right: 6px;
`

const StyledCloseIcon = styled(Icon)`
  transition: opacity 0.3s ease;
  opacity: 0.4;
`

const CleanButton = styled(ButtonIcon)`
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.3s ease;

  &:not([disabled]):hover,
  &:not([disabled]):focus,
  &:not([disabled]):active {
    background-color: transparent;

    ${StyledCloseIcon} {
      opacity: 1;
    }
  }
`

const FileDetailsContainer = styled(Box)`
  gap: 6px;
  background-color: ${({ theme, disabled }) => (disabled ? 'transparent' : theme?.colors?.white?.main)};
  border: solid 1px ${({ theme }) => theme?.colors?.ntrl_light?.main};
  border-radius: 4px;
  width: 100%;
  min-height: 64px;
  padding: 18px 0 18px 18px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;

  ${({ disabled }) =>
    disabled &&
    css`
      pointer-events: none;
    `}

  ${({ theme }) => {
    return css`
      &:not([disabled]):hover,
      &:not([disabled]):focus,
      &:not([disabled]):active {
        border-color: ${theme.colors.black.main};

        ${CleanButton} {
          opacity: 1;
        }
      }
    `
  }}
`

const FileInfo = styled(Box)`
  flex: 1;
`

export const FileInput = memo(({ file, disabled, accept, onFileChange, onClean, ...props }) => {
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

  if (file) {
    return (
      <FileDetailsContainer {...props} vAlign="center" disabled={disabled} onClick={handleClick}>
        <StyledSwitchFileIcon type={file?.type} />
        <FileInfo direction="column" gap="4px">
          <Text variant="black" weight="400" size="sm" truncate>
            {file?.name}
          </Text>

          <Text weight="400" size="s" variant="ntrl_darker" truncate>
            {Utils.humanFileSize(file?.size)}
          </Text>
        </FileInfo>
        <CleanButton icon={<StyledCloseIcon name="close" />} onClick={onClean} />
      </FileDetailsContainer>
    )
  }

  return (
    <Button type="button" {...props} disabled={disabled} onClick={handleClick}>
      <Icon name="add" size="m" />
      <Text size="m" weight="500" variant="primary">
        Upload file
      </Text>
      <Input ref={inputRef} name="file" type="file" accept={accept} onChange={handleFileChange} />
    </Button>
  )
})

FileInput.defaultProps = {
  disabled: false,
  accept: '*',
}

FileInput.displayName = 'FileInput'
