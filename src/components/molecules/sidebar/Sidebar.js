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

import React, { memo, useCallback, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { matchPath } from 'react-router-dom'
import styled from 'styled-components/macro'
import { DEVICE_SIZE } from '../../../theme/theme'
import { ButtonIcon } from '../../atoms/buttonIcon/ButtonIcon'
import { Icon } from '../../atoms/icon/Icon'
import { Text } from '../../atoms/text/Text'
import { SidebarLink } from '../sidebarLink/SidebarLink'

const Container = styled.div`
  background-color: ${({ theme }) => theme?.colors?.ntrl_lighter?.main};
  width: 100%;
  max-width: 322px;
  height: 100%;
  overflow: hidden;

  @media (max-width: ${DEVICE_SIZE.TABLET}) {
    max-width: unset;
    height: auto;
  }
`

const Content = styled.nav`
  padding: 24px 40px;

  @media (max-width: ${DEVICE_SIZE.TABLET}) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 90;
    transition: transform 0.3s ease-in;
    transform: ${({ opened }) => (opened ? 'translateX(0%)' : 'translateX(-100%)')};
    background-color: ${({ theme }) => theme?.colors?.ntrl_lighter?.main};
    padding: 24px 56px;
  }
`

const CloseButton = styled(ButtonIcon)``

const ContentHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;

  @media (max-width: ${DEVICE_SIZE.TABLET}) {
    margin-left: -46px;
  }

  @media (min-width: ${DEVICE_SIZE.TABLET}) {
    ${CloseButton} {
      display: none;
    }
  }
`

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 40px;
`

const Breadcrumb = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;

  @media (min-width: ${DEVICE_SIZE.TABLET}) {
    display: none;
  }
`

const MenuWrapper = styled.div`
  position: relative;
  display: flex;

  &:before {
    content: '';
    display: ${({ hasNotifications }) => (hasNotifications ? 'block' : 'none')};
    position: absolute;
    top: 2px;
    right: 2px;
    width: 8px;
    height: 8px;
    z-index: 10;
    box-sizing: border-box;
    border-radius: 4px;
    border: ${({ theme }) => `solid 2px ${theme?.colors?.ntrl_lighter?.main}`};
    background-color: ${({ theme }) => theme?.colors?.primary?.main};
  }
`

const SidebarLinkIcon = styled(Icon)`
  margin-left: 3px;
`

export const Sidebar = memo(({ headline, items, ...props }) => {
  const location = useLocation()
  const [opened, setOpened] = useState(false)

  const handleOpenSidebar = useCallback(() => {
    setOpened(true)
  }, [])

  const handleCloseSidebar = useCallback(() => {
    setOpened(false)
  }, [])

  const activePath = useMemo(() => {
    return items.find(({ path }) => matchPath(location?.pathname, { path: path, exact: true }))?.label ?? ''
  }, [location, items])

  const hasNotifications = useMemo(() => {
    return items.some(({ notifications }) => notifications && notifications > 0)
  }, [items])

  return (
    <Container {...props}>
      <Breadcrumb>
        <ButtonIcon
          variant="transparent"
          icon={
            <MenuWrapper hasNotifications={hasNotifications}>
              <Icon name="menu" />
            </MenuWrapper>
          }
          onClick={handleOpenSidebar}
        />

        <Text size="m" weight="regular" variant="ntrl_dark">
          {headline} /{' '}
          <Text size="m" weight="medium" variant="ntrl_darkt" as="span">
            {activePath}
          </Text>
        </Text>
      </Breadcrumb>
      <Content opened={opened}>
        <ContentHeader>
          <CloseButton variant="transparent" icon={<Icon name="close" />} onClick={handleCloseSidebar} />

          <Text size="xl" weight="light" variant="ntrl_dark">
            {headline}
          </Text>
        </ContentHeader>

        <List>
          {items.map((item) => {
            const isActive = matchPath(location?.pathname, { path: item.path, exact: true })

            return (
              <SidebarLink
                key={item.path}
                to={item.path}
                count={item.notifications}
                isActive={!!isActive}
                external={item.external}
              >
                {item.label}
                {item.icon && <SidebarLinkIcon name={item.icon} />}
              </SidebarLink>
            )
          })}
        </List>
      </Content>
    </Container>
  )
})

Sidebar.defaultProps = {
  items: [],
}

Sidebar.displayName = 'Sidebar'
