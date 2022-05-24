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
import { toast } from 'react-toastify'
import styled, { keyframes, css } from 'styled-components/macro'
import { ButtonIcon, Icon } from '../../../../../components'
import { ReactComponent as Overlay } from './assets/overlay.svg'

const animation = keyframes`
  from {
    transform: rotate(-360deg)
  },
  to {
    transform: rotate(360deg)
  }
`

const Container = styled.div`
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 224px;
  border-radius: 4px;
`

const Preview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const StyledOverlay = styled(Overlay)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  fill: linear-gradient(0deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), #f4f4f4;
`

const StyledButtonIcon = styled(ButtonIcon)`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
`

const StyledIcon = styled(Icon)`
  animation: ${animation} 1s linear infinite;
  ${({ fetching }) =>
    !fetching &&
    css`
      animation-iteration-count: 1;
    `}
`

export const AvatarPreview = memo(({ className, type, address, onChange }) => {
  const [fetching, isFetching] = useState(false)

  const fetchRandomAvatar = async () => {
    try {
      isFetching(true)
      const response = await fetch('https://source.unsplash.com/random/?productivity,city')
      onChange?.(response.url)
      isFetching(false)
    } catch (error) {
      toast.error('Oops! We could not get a random avatar')
    }
  }

  useEffect(() => {
    if (!address) {
      fetchRandomAvatar()
    }
  }, [address])

  return (
    <Container className={className}>
      <Preview src={address} />
      <StyledOverlay />

      {type === 'random' && (
        <StyledButtonIcon icon={<StyledIcon name="refresh" fetching={fetching} />} onClick={fetchRandomAvatar} />
      )}
    </Container>
  )
})

AvatarPreview.displayName = 'AvatarPreview'
