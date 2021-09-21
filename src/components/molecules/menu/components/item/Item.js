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
import { Link, useHistory } from 'react-router-dom'
import Text from '../../../../atoms/text/Text'

const Item = ({ className, id, isOpened, label, items, onClick }) => {
  const history = useHistory()
  const handleClick = useCallback(
    (evt) => {
      evt.preventDefault()
      if (!items.length) {
        history.push(id)
        return
      }
      onClick?.(id)
    },
    [id, onClick, items],
  )

  return (
    <div className={c(styles.container, className)}>
      <a href="" className={c(styles.item, items.length === 0 && styles.noItems)} onClick={handleClick}>
        <Text element="span" weight={isOpened ? '600' : '300'} variant={isOpened ? 'white' : 'gray'}>
          {label}
        </Text>
      </a>

      {items.length > 0 && (
        <div className={c(styles.links, isOpened && styles.linksOpened)}>
          {items.map(({ label, path, onClick }) => {
            const handleItemClick = (evt) => {
              evt.preventDefault()
              evt.stopPropagation()
              onClick?.()
            }
            return (
              <Link key={path} className={styles.linkItem} to={path} onClick={onClick ? handleItemClick : null}>
                <Text element="span">{label}</Text>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default React.memo(Item)
