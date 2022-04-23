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

import { DateTime } from 'luxon'
import React, { memo } from 'react'
import styled, { css } from 'styled-components/macro'
import Utils from '../../../services/Utils'
import { DEVICE_SIZE } from '../../../theme/theme'
import { Box } from '../../atoms/box/Box'
import { ButtonIcon } from '../../atoms/buttonIcon/ButtonIcon'
import { ClipboardInput } from '../../atoms/clipboardInput/ClipboardInput'
import { FilePreview } from '../../atoms/filePreview/FilePreview'
import { Icon } from '../../atoms/icon/Icon'
import Text from '../../atoms/text/Text'

const Container = styled.div`
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 30px;
  box-sizing: border-box;
  max-width: 320px;

  ${({ theme }) => css`
    border-left: solid 1px ${theme?.colors.ntrl_light.main};
    background: ${theme.colors.white.main};
  `}

  @media (max-width: ${DEVICE_SIZE.TABLET}) {
    max-width: 100%;
  }
`

const Header = styled.div`
  display: flex;
  padding: 0 16px;

  @media (max-width: ${DEVICE_SIZE.TABLET}) {
    justify-content: flex-end;
  }
`

const Content = styled(Box)`
  flex: 1;
  overflow: auto;
  padding: 0 40px;

  @media (max-width: ${DEVICE_SIZE.TABLET}) {
    padding: 0 24px;
  }
`

const Filename = styled(Text)`
  margin-top: 32px;
  width: 100%;
  display: block;
`

const FileInfo = styled(Text)`
  margin-top: 16px;
  opacity: 0.7;
`

const Link = styled(ClipboardInput)`
  margin-top: 24px;
`

export const FileDetails = memo(({ account, file, when, link, onClose, ...props }) => {
  const formattedDate = when ? DateTime.fromMillis(when).toFormat('dd/LL/yyyy') : 'Unkown'
  return (
    <Container {...props}>
      <Header>
        <ButtonIcon variant="transparent" icon={<Icon name="close" />} onClick={onClose} />
      </Header>

      <Content direction="column" hAlign="center">
        <FilePreview file={file} link={link} />

        <Filename align="center" size="m" weight="500" variant="black" truncate>
          {file.name}
        </Filename>

        <FileInfo align="center" size="sm" weight="400" variant="ntrl_dark">
          {`${Utils.humanFileSize(file?.size)} · ${account ?? 'Unkown'} · ${formattedDate}`}
        </FileInfo>

        <Link value={link} />
      </Content>
    </Container>
  )
})

FileDetails.defaultProps = {
  onClose: () => {},
}

FileDetails.displayName = 'FileDetails'
