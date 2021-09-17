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

import React from 'react'
import styles from './Header.module.css'
import c from 'classnames'
import Logo from '../../atoms/logo/Logo'
import { version } from '../../../../package.json'
import { Link } from 'react-router-dom'
import Text from '../../atoms/text/Text'

const Header = ({ className }) => {
  return (
    <header className={c(styles.container, className)}>
      <Logo />

      <Text className={styles.version} element="span" size="s">
        {`${version} ${process.env.REACT_APP_ENV_NAME !== 'production' ? `- ${process.env.REACT_APP_ENV_NAME}` : ''}`}
      </Text>

      <div className={styles.actions}>
        <Link className={styles.login} to="/mailbox">
          <Text element="span" size="sm" weight="500">
            Log in / Register
          </Text>
        </Link>
      </div>
    </header>
  )
}

export default React.memo(Header)