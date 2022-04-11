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

import React, { memo, useState } from 'react'
import styled, { css } from 'styled-components/macro'
import Utils from '../../../services/Utils'
import { VARIANT } from '../../../theme/theme'
import { Input } from '../input/Input'

const Container = styled.div`
  display: flex;
  flex-direction: row;
`

const StyledInput = styled(Input)`
  & input {
    width: 100%;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
`

const StyledButton = styled.button`
  background-color: ${({ theme }) => theme?.colors?.[VARIANT.WHITE]?.main};
  border: solid 1px ${({ theme }) => theme?.colors?.[VARIANT.NTRL_LIGHT]?.main};
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  border-left: 0;
  color: ${({ theme }) => theme?.colors?.[VARIANT.PRIMARY]?.main};
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
  padding: 0 16px;

  ${({ copied }) =>
    copied &&
    css`
      color: ${({ theme }) => theme?.colors?.[VARIANT.POSITIVE]?.main};
    `}
`

export const ClipboardInput = memo(({ className, value, copyText, ...props }) => {
  const [copied, setCopied] = useState(false)

  const handleCopyClick = () => {
    Utils.copyToClipboard(value).then(() => {
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    })
  }

  return (
    <Container className={className}>
      <StyledInput defaultValue={value} {...props} />
      <StyledButton type="button" onClick={handleCopyClick} copied={copied}>
        {copied ? 'Copied!' : copyText}
      </StyledButton>
    </Container>
  )
})

ClipboardInput.defaultProps = {
  copyText: 'Copy Link',
}

ClipboardInput.displayName = 'ClipboardInput'
