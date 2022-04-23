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
import { Route } from 'react-router-dom'
import styled from 'styled-components/macro'
import { Sidebar } from '../../components'
import { routes } from '../../config/routes'
import { DEVICE_SIZE } from '../../theme/theme'
import AboutFairDataSocietyScreen from './fairDataSociety/AboutFairDataSocietyScreen'
import AboutFairdropScreen from './fairdrop/AboutFairdropScreen'
import AboutFAQsScreen from './faqs/AboutFAQsScreen'
import AboutTermsOfUsageScreen from './terms/AboutTermsOfUsageScreen'

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  box-sizing: border-box;
  @media (max-width: ${DEVICE_SIZE.TABLET}) {
    flex-direction: column;
  }
`

const Content = styled.section`
  position: relative;
  flex: 1;
  height: 100%;

  @media (max-width: ${DEVICE_SIZE.TABLET}) {
    height: unset;
    overflow: auto;
  }
`

export const AboutScreen = memo(() => {
  return (
    <Container>
      <Sidebar
        headline="About Fairdrop"
        items={[
          {
            label: 'Why Fairdrop?',
            path: routes.about.fairdrop,
          },
          {
            label: 'About Fair Data Society',
            path: routes.about.fds,
          },
          {
            label: 'FAQs',
            path: routes.about.faq,
          },
          {
            label: 'Terms of usage',
            path: routes.about.terms,
          },
          {
            label: 'Bug disclosure',
            path: 'https://github.com/fairDataSociety/Fairdrop/issues',
            icon: 'openLink',
            external: true,
          },
        ]}
      />

      <Content>
        <Route exact path={routes.about.fairdrop} component={AboutFairdropScreen} />
        <Route exact path={routes.about.fds} component={AboutFairDataSocietyScreen} />
        <Route exact path={routes.about.faq} component={AboutFAQsScreen} />
        <Route exact path={routes.about.terms} component={AboutTermsOfUsageScreen} />
      </Content>
    </Container>
  )
})

AboutScreen.displayName = 'AboutScreen'
