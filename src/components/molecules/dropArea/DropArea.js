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
import React, { memo, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import styled, { css } from 'styled-components/macro'
import { Box } from '../../atoms/box/Box'
import { Icon } from '../../atoms/icon/Icon'
import Text from '../../atoms/text/Text'

const StyledIcon = styled(Icon)``

const getIconOpacity = ({ isDragActive }) =>
  isDragActive &&
  css`
    opacity: 1;
  `

const Container = styled(Box)`
  width: 100%;
  background-color: ${({ theme }) => transparentize(0.98, theme?.colors?.primary?.main)};
  border: 2px dashed ${({ theme }) => transparentize(0.6, theme?.colors?.primary?.main)};
  border-radius: 16px;
  padding: 50px 24px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;

  ${({ isDragActive }) =>
    isDragActive &&
    css`
      border-color: ${({ theme }) => theme?.colors?.primary?.main};
    `}

  ${StyledIcon} {
    opacity: 0.6;
    transition: opacity 0.3s ease;

    ${getIconOpacity}
  }
`

const StyledInput = styled.input``

export const DropArea = memo(({ icon, headline, description, onDrop, multiple, ...props }) => {
  const handleDrop = useCallback(
    (files) => {
      onDrop?.(multiple ? files : files?.[0])
    },
    [multiple, onDrop],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: handleDrop })
  return (
    <Container
      vAlign="center"
      hAlign="center"
      direction="column"
      gap="6px"
      {...props}
      isDragActive={isDragActive}
      {...getRootProps()}
    >
      {icon && <StyledIcon name={icon} size="xxl" />}
      {headline && (
        <Text size="m" weight="300" align="center" variant="black">
          {headline}
        </Text>
      )}
      {description && (
        <Text size="sm" weight="300" align="center" variant="black">
          {description}
        </Text>
      )}

      <StyledInput {...getInputProps()} />
    </Container>
  )
})

DropArea.defaultProps = {
  multiple: false,
}

DropArea.displayName = 'DropArea'
