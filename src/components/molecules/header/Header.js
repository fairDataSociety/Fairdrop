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
import { useLocation } from 'react-router-dom'
import styles from './Header.module.css'
import c from 'classnames'
import Logo from '../../atoms/logo/Logo'
import { version } from '../../../../package.json'
import { Link } from 'react-router-dom'
import Text from '../../atoms/text/Text'
import { useTheme } from '../../../hooks/theme/useTheme'
import { routes } from '../../../config/routes'
import { useMailbox } from '../../../hooks/mailbox/useMailbox'
import Button from '../../atoms/button/Button'
import TouchableOpacity from '../../atoms/touchableOpacity/TouchableOpacity'
import ProfileScreen from '../../../screens/auth/profile/ProfileScreen'
import { useSideMenu } from '../../../hooks/sideMenu/useSideMenu'
import { Nav, NavItem } from '../../'

const Header = ({ className }) => {
  const { variant } = useTheme()
  const [{ mailbox }, { resetMailbox }] = useMailbox()
  const { showSideMenu } = useSideMenu()
  const location = useLocation()

  const handleProfileClick = useCallback(() => {
    showSideMenu({
      Component: <ProfileScreen />,
    })
  }, [])

  return (
    <header className={c(styles.container, className)}>
      <Logo variant={variant} />

      <Text className={styles.version} element="span" size="s" variant={variant}>
        {`${version}`}
      </Text>

      <div className={styles.actions}>
        {!mailbox && (
          <Nav>
            <NavItem active={location.pathname === routes.login}>
              <Link to={routes.login}>Log in / Register</Link>
            </NavItem>
          </Nav>
        )}
        {mailbox && (
          <>
            <Button className={styles.profileButton} variant={variant} inverted onClick={handleProfileClick}>
              {mailbox.subdomain}
            </Button>

            <TouchableOpacity className={styles.logoutButton} onClick={resetMailbox}>
              <Text variant={variant}>Log out</Text>
            </TouchableOpacity>
          </>
        )}
      </div>
    </header>
  )
}

export default React.memo(Header)
