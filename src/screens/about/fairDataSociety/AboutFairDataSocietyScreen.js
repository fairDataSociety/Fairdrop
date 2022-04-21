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

import React, { useCallback, useRef } from 'react'
import { toast } from 'react-toastify'
import { ReactComponent as FDSLogo } from './assets/fds.svg'
import styled from 'styled-components/macro'
import { Box, Text, ExternalLink } from '../../../components'
import { DEVICE_SIZE } from '../../../theme/theme'

const Container = styled(Box)`
  box-sizing: border-box;
  padding: 48px 126px;
  height: 100%;
  overflow: auto;

  @media (max-width: ${DEVICE_SIZE.TABLET}) {
    padding: 48px 24px;
  }
`

const AboutFairDataSocietyScreen = () => {
  const timesClicked = useRef(0)
  const easterEggEnabled = useRef(parseInt(localStorage.getItem('hasEnabledMaxFileSizeEasterEgg')) === 1)

  const handleEnableEasterEgg = useCallback((evt) => {
    evt.preventDefault()
    evt.stopPropagation()
    if (easterEggEnabled.current) {
      return
    }

    timesClicked.current = timesClicked.current + 1

    if (timesClicked.current === 10) {
      localStorage.setItem('hasEnabledMaxFileSizeEasterEgg', 1)
      easterEggEnabled.current = true
      toast('🖖 Easter egg discovered! Your file size limit has been set to 500mb!', {
        theme: 'light',
      })
    }
  }, [])

  return (
    <Container gap="32px" direction="column">
      <ExternalLink href="" onClick={handleEnableEasterEgg}>
        <FDSLogo />
      </ExternalLink>

      <Text size="m" variant="black">
        Imagine a society of a completely private digital life where your privacy is not weaponised against you just to
        sell you more things.
      </Text>

      <Text size="m" variant="black">
        Fair Data Society is a non-profit initiative that is reimagining the data economy and creating a fair and
        decentralised data layer.
      </Text>

      <Text size="m" variant="black">
        We have Fair Trade, now why not Fair Data?
      </Text>

      <Text size="m" variant="black">
        Fair Data Society recognises online privacy as a{' '}
        <ExternalLink rel="noopener noreferrer" target="_blank" href="https://en.wikipedia.org/wiki/Right_to_privacy">
          basic human right
        </ExternalLink>{' '}
        and a basis for progress for all.
      </Text>
    </Container>
  )
}

export default React.memo(AboutFairDataSocietyScreen)
