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
import React, { memo, useCallback, useEffect, useState } from 'react'
import styled, { css } from 'styled-components/macro'
import { Box } from '../../components'
import { useHeader } from '../../hooks/header/useHeader'
import { useMediaQuery } from '../../hooks/useMediaQuery/useMediaQuery'
import { DEVICE_SIZE } from '../../theme/theme'
import { backgrounds } from './assets'
import Carousel from './components/carousel/Carousel'
import { STEPS, UploadFlow } from './components/uploadFlow/UploadFlow'

const Layout = styled.section`
  display: flex;
  width: 100%;
  height: 100%;
  transition: background 0.6s ease;

  ${({ backgroundIdx }) => css`
    background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
      ${`url(${backgrounds[backgroundIdx]}) no-repeat center center / cover`};
  `}

  @media (max-width: ${DEVICE_SIZE.TABLET}) {
    flex-direction: column;
  }
`

const shouldGrow = ({ carouselHidden }) =>
  carouselHidden &&
  css`
    flex: 1;
  `

const Content = styled.div`
  width: 418px;
  padding: 40px;
  box-sizing: border-box;
  background: ${({ theme }) => transparentize(0.06, theme?.colors?.white?.main)};
  backdrop-filter: blur(20px);

  @media (max-width: ${DEVICE_SIZE.TABLET}) {
    order: 1;
    width: 100%;
    flex: 0;
    padding: 24px;

    ${shouldGrow}
  }
`

const CarouselWrapper = styled(Box)`
  flex: 1;
  padding: 130px;

  ${({ visible }) =>
    !visible &&
    css`
      display: none;
    `}

  @media (max-width: ${DEVICE_SIZE.TABLET}) {
    padding: 40px;
  }
`

export const HomeScreen = memo(() => {
  const [backgroundIdx, setBackgroundIdx] = useState(0)
  const [shouldHideCarousel, setShouldHideCarousel] = useState(false)
  const { setIsTransparent } = useHeader()
  const maxTabletMediaQuery = useMediaQuery(`(max-width: ${DEVICE_SIZE.TABLET})`)

  const handleSlideChange = useCallback((idx) => {
    setBackgroundIdx(idx)
  }, [])

  const handleOnStepChange = useCallback(
    (step) => {
      if (!maxTabletMediaQuery) {
        return
      }
      setShouldHideCarousel(step !== STEPS.SELECT_FILE)
    },
    [maxTabletMediaQuery],
  )

  useEffect(() => {
    setIsTransparent(maxTabletMediaQuery ? false : true)
    return () => setIsTransparent(false)
  }, [])

  return (
    <Layout backgroundIdx={backgroundIdx}>
      <Content carouselHidden={shouldHideCarousel}>
        <UploadFlow onStepChange={handleOnStepChange} />
      </Content>
      <CarouselWrapper vAlign="center" direction="column" visible={!shouldHideCarousel}>
        <Carousel onItemChange={handleSlideChange} />
      </CarouselWrapper>
    </Layout>
  )
})

HomeScreen.displayName = 'HomeScreen'
