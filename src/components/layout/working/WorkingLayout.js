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

import React from 'react'
import Text from '../../atoms/text/Text'
import styled from 'styled-components/macro'
import { CircleLoader } from '../../atoms/circleLoader/CircleLoader'

const Container = styled.section`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 24px;
`

const WorkingLayout = ({ headline, description, showLoader = true, ...rest }) => {
  return (
    <Container {...rest}>
      {showLoader && <CircleLoader variant="primary" />}

      {headline && (
        <Text as="h2" size="l" align="center" variant="black">
          {headline}
        </Text>
      )}
      {description && (
        <Text align="center" variant="black">
          {description}
        </Text>
      )}
    </Container>
  )
}

export default React.memo(WorkingLayout)
