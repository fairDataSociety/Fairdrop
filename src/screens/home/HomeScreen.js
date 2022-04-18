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
import React, { memo, useCallback, useState } from 'react'
import styled, { css } from 'styled-components/macro'
import { Box } from '../../components'
import { backgrounds } from './assets'
import Carousel from './components/carousel/Carousel'
import { UploadFlow } from './components/uploadFlow/UploadFlow'

const Layout = styled.section`
  display: flex;
  width: 100%;
  height: 100%;
  transition: background 0.6s ease;

  ${({ backgroundIdx }) => css`
    background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
      ${`url(${backgrounds[backgroundIdx]}) no-repeat center center / cover`};
  `}
`

const Content = styled.div`
  width: 418px;
  padding: 40px;
  box-sizing: border-box;
  background: ${({ theme }) => transparentize(0.06, theme?.colors?.white?.main)};
  backdrop-filter: blur(20px);
`

const CarouselWrapper = styled(Box)`
  flex: 1;
  padding: 130px;
`

export const HomeScreen = memo(() => {
  const [backgroundIdx, setBackgroundIdx] = useState(0)

  const handleSlideChange = useCallback((idx) => {
    setBackgroundIdx(idx)
  }, [])

  return (
    <Layout backgroundIdx={backgroundIdx}>
      <Content>
        <UploadFlow />
      </Content>
      <CarouselWrapper vAlign="center" direction="column">
        <Carousel onItemChange={handleSlideChange} />
      </CarouselWrapper>
    </Layout>
  )
})

HomeScreen.displayName = 'HomeScreen'
