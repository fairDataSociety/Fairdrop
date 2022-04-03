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

import { saturate, lighten } from 'polished'
import React, { memo, useMemo } from 'react'
import styled from 'styled-components/macro'
import { DEVICE_SIZE, VARIANT } from '../../../theme/theme'
import { Icon } from '../icon/Icon'

const Container = styled.div`
  width: ${({ isImage }) => (isImage ? '242px' : '200px')};
  height: ${({ isImage }) => (isImage ? '242px' : '200px')};
  border-radius: ${({ isImage }) => (isImage ? '4px' : '100px')};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => lighten(0.46, saturate(1, theme?.colors?.[VARIANT.PRIMARY]?.main))};
  overflow: hidden;

  @media (max-width: ${DEVICE_SIZE.TABLET}) {
    width: ${({ isImage }) => (isImage ? '200px' : '168px')};
    height: ${({ isImage }) => (isImage ? '200px' : '168px')};
  }
`

const Preview = styled.img`
  max-height: 100%;
  object-fit: cover;
`

export const FilePreview = memo(({ file, ...props }) => {
  const iconName = useMemo(() => {
    const fileType = file?.type
    if (!fileType) {
      return 'file'
    }

    if (fileType.includes('image')) {
      return 'picture'
    } else if (fileType.includes('audio')) {
      return 'music'
    } else if (fileType.includes('video')) {
      return 'video'
    } else {
      return 'file'
    }
  }, [file])

  const isImage = iconName === 'picture'

  return (
    <Container isImage={isImage} {...props}>
      {isImage ? <Preview src={file?.source} /> : <Icon size="xl" name={iconName} />}
    </Container>
  )
})

FilePreview.defaultProps = {}

FilePreview.displayName = 'FilePreview'
