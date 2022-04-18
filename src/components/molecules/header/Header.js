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

import React, { useCallback, useState } from 'react'
import styled, { css } from 'styled-components/macro'
import { useLocation } from 'react-router-dom'
import Logo from '../../atoms/logo/Logo'
import { routes } from '../../../config/routes'
import { useMailbox } from '../../../hooks/mailbox/useMailbox'
import ProfileScreen from '../../../screens/auth/profile/ProfileScreen'
import { useSideMenu } from '../../../hooks/sideMenu/useSideMenu'
import { Nav, NavItem, Avatar, Icon, Collapsible } from '../../'
import { useMediaQuery } from '../../../hooks/useMediaQuery/useMediaQuery'
import { DEVICE_SIZE } from '../../../theme/theme'

const HeaderWrapper = styled.header`
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 8px 16px;
  box-sizing: border-box;

  ${({ theme }) => css`
    border-bottom: solid 1px ${theme.colors.ntrl_light.main};
    background: ${theme.colors.white.main};
  `};

  @media (min-width: ${DEVICE_SIZE.TABLET}) {
    padding: 24px;
  }
`

const HeaderNavWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 24px;
`

const HeaderNavDropdown = styled(Collapsible)`
  position: absolute;
  top: 49px;
  width: 100%;
  overflow: hidden;
  z-index: 1;
`

const HeaderNavDropdownContent = styled.div`
  padding: 20px;
`

const LogoWrapper = styled.button`
  // resets
  border: 0;
  background: transparent;
  outline: 0;

  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
`

const IconLogo = styled(Icon)`
  transition: transform 200ms;
  ${({ show = false }) => css`
    transform: ${show ? 'rotate(0deg)' : 'rotate(180deg)'};
  `}
`

const Header = ({ className }) => {
  const [{ mailbox }] = useMailbox()
  const { showSideMenu } = useSideMenu()
  const [{ showNav }, setState] = useState({ showNav: false })
  const location = useLocation()

  const minTabletMediaQuery = useMediaQuery(`(min-width: ${DEVICE_SIZE.TABLET})`)

  const handleProfileClick = useCallback(() => {
    showSideMenu({
      Component: <ProfileScreen />,
    })
  }, [])

  const handleShowNavigation = () => {
    if (minTabletMediaQuery) {
      return
    }
    setState((old) => ({ ...old, showNav: !showNav }))
  }

  const NavItemSized = (props) => {
    return <NavItem {...props} size={minTabletMediaQuery ? 'm' : 'l'} />
  }

  const HeaderNav = () => (
    <>
      {!mailbox && (
        <Nav vertical={!minTabletMediaQuery}>
          <NavItemSized active={location.pathname === routes.login} to={routes.login}>
            Log in / Register
          </NavItemSized>
        </Nav>
      )}

      {mailbox && (
        <Nav vertical={!minTabletMediaQuery}>
          <NavItemSized
            active={Object.values(routes.mailbox).some((path) => location.pathname === path)}
            to={routes.mailbox.received}
          >
            My files
          </NavItemSized>
          <NavItemSized active={location.pathname === routes.about}>About</NavItemSized>
        </Nav>
      )}
    </>
  )

  return (
    <>
      <HeaderWrapper className={className}>
        <LogoWrapper onClick={handleShowNavigation}>
          <Logo />
          {!minTabletMediaQuery && <IconLogo name="arrowUp" size="s" show={showNav} />}
        </LogoWrapper>

        <HeaderNavWrapper>
          {minTabletMediaQuery && <HeaderNav />}
          {mailbox && <Avatar name={mailbox.subdomain} onClick={handleProfileClick} />}
        </HeaderNavWrapper>
      </HeaderWrapper>

      {!minTabletMediaQuery && (
        <HeaderNavDropdown expanded={showNav} onClick={handleShowNavigation}>
          <HeaderNavDropdownContent>
            <HeaderNav />
          </HeaderNavDropdownContent>
        </HeaderNavDropdown>
      )}
    </>
  )
}

export default React.memo(Header)
