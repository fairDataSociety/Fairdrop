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

import React, { useCallback } from 'react'
import styled, { css } from 'styled-components/macro'
import { useLocation } from 'react-router-dom'
import Logo from '../../atoms/logo/Logo'
import { Link } from 'react-router-dom'
import { routes } from '../../../config/routes'
import { useMailbox } from '../../../hooks/mailbox/useMailbox'
import ProfileScreen from '../../../screens/auth/profile/ProfileScreen'
import { useSideMenu } from '../../../hooks/sideMenu/useSideMenu'
import { Nav, NavItem, Avatar } from '../../'

const HeaderWrapper = styled.header`
  display: flex;
  align-items: center;
  padding: 24px;
  box-sizing: border-box;

  ${({ theme }) => css`
    border-bottom: solid 1px ${theme.colors.ntrl_light.main};
    background: ${theme.colors.white.main};
  `};
`

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-left: auto;
`

const Header = ({ className }) => {
  const [{ mailbox }] = useMailbox()
  const { showSideMenu } = useSideMenu()
  const location = useLocation()

  const handleProfileClick = useCallback(() => {
    showSideMenu({
      Component: <ProfileScreen />,
    })
  }, [])

  return (
    <HeaderWrapper className={className}>
      <Link to="/">
        <Logo />
      </Link>

      <HeaderRight>
        {!mailbox && (
          <Nav>
            <NavItem active={location.pathname === routes.login}>
              <Link to={routes.login}>Log in / Register</Link>
            </NavItem>
          </Nav>
        )}
        {mailbox && (
          <>
            <Nav>
              <NavItem active={Object.values(routes.mailbox).some((path) => location.pathname === path)}>
                <Link to={routes.mailbox.received}>My files</Link>
              </NavItem>
              <NavItem active={location.pathname === routes.about}>
                <Link to={routes.about}>About</Link>
              </NavItem>
            </Nav>
            <Avatar name={mailbox.subdomain} onClick={handleProfileClick} />
          </>
        )}
      </HeaderRight>
    </HeaderWrapper>
  )
}

export default React.memo(Header)
