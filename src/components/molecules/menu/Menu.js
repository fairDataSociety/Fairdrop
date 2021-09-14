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
import Logo from '../../atoms/logo/Logo'
import Overlay from './components/overlay/Overlay'
import Item from './components/item/Item'
import { useLocation } from 'react-router-dom'

const menuItems = [
  {
    id: '/upload',
    label: 'Upload >',
    items: [
      {
        label: 'Store',
        path: '/upload/store',
      },
      {
        label: 'Send',
        path: '/upload/send',
      },
      {
        label: 'Quick (Unencrypted)',
        path: '/upload/quick',
      },
    ],
  },
  {
    id: '/mailbox',
    label: 'My Files >',
    items: [
      {
        label: 'Received Files',
        path: '/mailbox/store',
      },
      {
        label: 'Sent Files',
        path: '/mailbox/send',
      },
      {
        label: 'Stored Files',
        path: '/mailbox/quick',
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
        path: '/about/fairdrop',
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

const Menu = ({ className, isShown, onToggleMenu }) => {
  const location = useLocation()
  const locationCurrentItem = useMemo(() => {
    return menuItems.find(({ id }) => location?.pathname?.startsWith(id))?.id ?? ''
  }, [location])

  const [currentItem, setCurrentItem] = useState(locationCurrentItem)

  const handleOpenMenuItem = useCallback((id) => {
    setCurrentItem(id)
  }, [])

  return (
    <nav className={c(styles.container)}>
      <div className={styles.menuToggle}>
        <Hamburger isActive={isShown} onClick={onToggleMenu} />
      </div>

      <Overlay isShown={isShown} onClick={onToggleMenu} />

      <div className={c(styles.content, isShown && styles.shown)}>
        <div className={styles.header}>
          <Logo />
        </div>

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
