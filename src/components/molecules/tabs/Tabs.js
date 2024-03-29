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

import React, { memo, useMemo, useState, useEffect } from 'react'
import styled from 'styled-components/macro'
import { Box } from '../../atoms/box/Box'
import { Tab } from '../../atoms/tab/Tab'

const Container = styled(Box)`
  width: 100%;
`

const TabsWrapper = styled(Box)`
  width: 100%;
`

export const Tabs = memo(({ children, onTabSelected, initialTab, ...props }) => {
  const [selectedTab, setSelectedTab] = useState(initialTab ?? 0)

  const Tabs = useMemo(() => {
    const childrenArray = React.Children.toArray(children)
    return childrenArray
      .filter((child) => child.type === Tab)
      .map((tab, idx) =>
        React.cloneElement(tab, {
          onClick: () => {
            onTabSelected?.(idx)
            setSelectedTab(idx)
          },
          isActive: idx === selectedTab,
        }),
      )
  }, [children, onTabSelected, selectedTab])

  const Content = useMemo(() => {
    const childrenArray = React.Children.toArray(children)
    const contents = childrenArray.filter((child) => child.type !== Tab)
    return contents?.[selectedTab] ?? null
  }, [selectedTab, children])

  useEffect(() => {
    setSelectedTab(initialTab)
  }, [initialTab])

  return (
    <Container direction="column" {...props}>
      <TabsWrapper vAlign="center">{Tabs}</TabsWrapper>
      {Content}
    </Container>
  )
})

Tabs.defaultProps = {}

Tabs.displayName = 'Tabs'
