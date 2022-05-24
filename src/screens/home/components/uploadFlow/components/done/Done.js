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
import styled from 'styled-components/macro'
import { Box, Button, Text, FileInput, ClipboardInput } from '../../../../../../components'
import { FILE_UPLOAD_TYPES, useFileManager } from '../../../../../../hooks/fileManager/useFileManager'
import { DEVICE_SIZE } from '../../../../../../theme/theme'

const Container = styled(Box)`
  width: 100%;
  height: 100%;
`

const Content = styled(Box)`
  width: 100%;

  @media (max-width: ${DEVICE_SIZE.MOBILE_L}) {
    flex: 1;
  }
`

const ActionButton = styled(Button)`
  @media (max-width: ${DEVICE_SIZE.MOBILE_L}) {
    width: 100%;
  }
`

export const Done = memo(({ onFinish }) => {
  const [{ files, link, type, recipient }] = useFileManager()

  return (
    <Container direction="column" gap="16px" vAlign="center">
      <Content direction="column" vAlign="center" gap="16px">
        <Text size="xl" weight="400" variant="black">
          {type === FILE_UPLOAD_TYPES.QUICK ? "You're done!" : `File sent to ${recipient}!`}
        </Text>

        <FileInput file={files?.[0]} disabled />

        <ClipboardInput value={link} />
      </Content>

      <ActionButton variant="primary" onClick={onFinish}>
        Finish
      </ActionButton>
    </Container>
  )
})

Done.displayName = 'Done'
