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

import React, { useState, useMemo, useCallback } from 'react'
import styles from './Menu.module.css'
import c from 'classnames'
import Hamburger from './components/hamburger/Hamburger'
import Overlay from './components/overlay/Overlay'
import Item from './components/item/Item'
import { useLocation, useHistory } from 'react-router-dom'
import { CSSTransition } from 'react-transition-group'
import qs from 'qs'
import { routes } from '../../../config/routes'
import { useSideMenu } from '../../../hooks/sideMenu/useSideMenu'
import AboutFairdropScreen from '../../../screens/about/fairdrop/AboutFairdropScreen'
import AboutFAQsScreen from '../../../screens/about/faqs/AboutFAQsScreen'
import AboutFairDataSocietyScreen from '../../../screens/about/fairDataSociety/AboutFairDataSocietyScreen'
import AboutTermsOfUsageScreen from '../../../screens/about/terms/AboutTermsOfUsageScreen'
import { useMailbox } from '../../../hooks/mailbox/useMailbox'
import Utils from '../../../services/Utils'
import ProfileScreen from '../../../screens/auth/profile/ProfileScreen'
import Footer from './components/footer/Footer'
import { useFileManager } from '../../../hooks/fileManager/useFileManager'

const Menu = ({ className, isShown, onToggleMenu }) => {
  const { showSideMenu } = useSideMenu()
  const [{ mailbox, balance }] = useMailbox()
  const [, { resetFileManager }] = useFileManager()
  const history = useHistory()

  const menuItems = useMemo(() => {
    const items = []

    if (!mailbox) {
      items.push({
        id: routes.login,
        label: 'Login >',
        onClick: function () {
          history.push(routes.login)
        },
        items: [],
      })
    } else {
      items.push({
        id: '/profile',
        label: `${mailbox.subdomain} (${Utils.formatBalance(balance)})`,
        onClick: function () {
          showSideMenu({
            Component: <ProfileScreen />,
            showBack: false,
          })
        },
        items: [],
      })
    }

    items.push(
      {
        id: routes.upload.home,
        label: 'Upload >',
        items: [
          {
            label: 'Store',
            path: routes.upload.home,
            onClick: () => {
              resetFileManager?.()
              history.push(routes.upload.home)
            },
          },
          {
            label: 'Send',
            path: `${routes.upload.home}?${qs.stringify({ a: 'send' })}`,
            onClick: () => {
              resetFileManager?.()
              history.push(`${routes.upload.home}?${qs.stringify({ a: 'send' })}`)
            },
          },
          {
            label: 'Quick (Unencrypted)',
            path: `${routes.upload.home}?${qs.stringify({ a: 'quick' })}`,
            onClick: () => {
              resetFileManager?.()
              history.push(`${routes.upload.home}?${qs.stringify({ a: 'quick' })}`)
            },
          },
        ],
      },
      {
        id: routes.mailbox.dashboard,
        label: 'My Files >',
        items: [
          {
            label: 'Received Files',
            path: routes.mailbox.received,
          },
          {
            label: 'Sent Files',
            path: routes.mailbox.sent,
          },
          {
            label: 'Consents',
            path: routes.mailbox.consents,
          },
        ],
      },
      {
        id: routes.settings.home,
        label: 'Settings >',
        items: [
          {
            label: 'Import mailbox',
            path: routes.settings.import,
          },
          {
            label: 'Export mailboxes',
            path: routes.settings.export,
          },
        ],
      },
      {
        id: '/about',
        label: 'About >',
        items: [
          {
            label: 'About Fairdrop',
            path: routes.about.fairdrop,
            onClick: function () {
              showSideMenu({ Component: <AboutFairdropScreen /> })
            },
          },
          {
            label: 'About Fair Data Society',
            path: routes.about.fds,
            onClick: function () {
              showSideMenu({ Component: <AboutFairDataSocietyScreen /> })
            },
          },
          {
            label: 'FAQs',
            path: routes.about.faq,
            onClick: function () {
              showSideMenu({ Component: <AboutFAQsScreen /> })
            },
          },
          {
            label: 'Terms of Usage',
            path: routes.about.terms,
            onClick: function () {
              showSideMenu({ Component: <AboutTermsOfUsageScreen /> })
            },
          },
          {
            label: 'Bug Disclosure',
            path: routes.about.bugs,
            onClick: function () {
              window.open('https://github.com/fairDataSociety/vulnerability-disclosure-policy', '_blank', 'noopener')
            },
          },
        ],
      },
    )

    return items
  }, [mailbox, balance, showSideMenu])

  const location = useLocation()
  const locationCurrentItem = useMemo(() => {
    return menuItems.find(({ id }) => location?.pathname?.startsWith(id))?.id ?? ''
  }, [location, menuItems])

  const [currentItem, setCurrentItem] = useState(locationCurrentItem)

  const handleOpenMenuItem = useCallback((id) => {
    setCurrentItem(id)
  }, [])

  return (
    <nav className={c(styles.container, className)}>
      <div className={styles.menuToggle}>
        <Hamburger isActive={isShown} onClick={onToggleMenu} />
      </div>

      <Overlay isShown={isShown} onClick={onToggleMenu} />

      <div className={c(styles.content, isShown && styles.shown)}>
        <CSSTransition
          in={isShown}
          timeout={{
            enter: 700,
            exit: 500,
          }}
          classNames={{
            enter: styles.headerEnter,
            enterActive: styles.headerEnterActive,
            enterDone: styles.headerEnterDone,
            exit: styles.headerExit,
            exitActive: styles.headerExitActive,
          }}
        >
          <div className={styles.header}></div>
        </CSSTransition>

        <div className={styles.menu}>
          {menuItems.map(({ id, label, items, onClick }) => {
            return (
              <Item
                id={id}
                key={id}
                label={label}
                items={items}
                isOpened={id === currentItem}
                onMenuItemOpened={handleOpenMenuItem}
                onClick={onClick}
              />
            )
          })}
        </div>

        <Footer />
      </div>
    </nav>
  )
}

export default React.memo(Menu)
