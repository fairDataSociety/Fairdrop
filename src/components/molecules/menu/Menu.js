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
import { useLocation } from 'react-router-dom'
import { CSSTransition } from 'react-transition-group'
import qs from 'qs'
import { routes } from '../../../config/routes'

const Menu = ({ className, isShown, onToggleMenu }) => {
  const menuItems = useMemo(() => {
    return [
      {
        id: routes.login,
        label: 'Login >',
        items: [],
      },
      {
        id: routes.upload.home,
        label: 'Upload >',
        items: [
          {
            label: 'Store',
            path: routes.upload.home,
          },
          {
            label: 'Send',
            path: `${routes.upload.home}?${qs.stringify({ a: 'send' })}`,
          },
          {
            label: 'Quick (Unencrypted)',
            path: `${routes.upload.home}?${qs.stringify({ a: 'quick' })}`,
          },
        ],
      },
      {
        id: routes.mailbox.home,
        label: 'My Files >',
        items: [
          {
            label: 'Received Files',
            path: routes.mailbox.home,
          },
          {
            label: 'Sent Files',
            path: routes.mailbox.sent,
          },
          {
            label: 'Stored Files',
            path: routes.mailbox.quick,
          },
        ],
      },
      {
        id: '/settings',
        label: 'Settings >',
        items: [
          {
            label: 'Import mailbox',
            path: '/settings/import',
          },
          {
            label: 'Export mailboxes',
            path: '/settings/export',
          },
        ],
      },
      {
        id: '/about',
        label: 'About >',
        items: [
          {
            label: 'About Fairdrop',
            path: { pathname: routes.about.fairdrop, state: { sideMenu: true } },
          },
          {
            label: 'About Fair Data Society',
            path: '/about/fair-data-society',
          },
          {
            label: 'FAQs',
            path: '/about/faqs',
          },
          {
            label: 'Terms of Usage',
            path: '/about/terms',
          },
          {
            label: 'Bug Disclosure',
            path: '/about/bug',
            externalPath: 'https://github.com/fairDataSociety/vulnerability-disclosure-policy',
          },
        ],
      },
    ]
  }, [])

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
          {menuItems.map(({ id, label, items }) => {
            return (
              <Item
                id={id}
                key={id}
                label={label}
                items={items}
                isOpened={id === currentItem}
                onClick={handleOpenMenuItem}
              />
            )
          })}
        </div>

        <div className={styles.footer}></div>
      </div>
    </nav>
  )
}

export default React.memo(Menu)
