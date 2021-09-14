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
import styles from './Item.module.css'
import c from 'classnames'
import { Link, useLocation } from 'react-router-dom'

const Item = ({ className, id, isOpened, label, items, onClick }) => {
  const handleClick = useCallback(
    (evt) => {
      evt.preventDefault()
      onClick?.(id)
    },
    [id, onClick],
  )

  return (
    <div className={c(styles.container, className)}>
      <a href="" className={c(styles.item, isOpened && styles.itemActive)} onClick={handleClick}>
        {label}
      </a>

      <div className={c(styles.links, isOpened && styles.linksOpened)}>
        {items.map(({ label, path }) => {
          return (
            <Link key={path} className={styles.linkItem} to={path}>
              {label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default React.memo(Item)
