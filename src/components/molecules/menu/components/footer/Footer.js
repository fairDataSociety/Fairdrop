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
import styles from './Footer.module.css'
import c from 'classnames'
import { ReactComponent as GithubLogo } from './assets/github-logo.svg'
import { ReactComponent as TwitterLogo } from './assets/twitter-logo.svg'
import { ReactComponent as DatafundLogo } from './assets/datafund-logo.svg'
import { ReactComponent as GitterLogo } from './assets/gitter-logo.svg'
import { ReactComponent as RiotLogo } from './assets/riot-logo.svg'

const Footer = ({ className }) => {
  return (
    <div className={c(styles.container, className)}>
      <a rel="noopener noreferrer" target="_blank" href="https://github.com/fairDataSociety">
        <GithubLogo className={styles.github} />
      </a>

      <a rel="noopener noreferrer" target="_blank" href="https://twitter.com/DataFundProject">
        <TwitterLogo className={styles.twitter} />
      </a>

      <a rel="noopener noreferrer" target="_blank" href="https://datafund.io">
        <DatafundLogo className={styles.datafund} />
      </a>

      <a rel="noopener noreferrer" target="_blank" href="https://gitter.im/fairdatasociety/community">
        <GitterLogo className={styles.glitter} />
      </a>

      <a rel="noopener noreferrer" target="_blank" href="https://riot.im/app/#/room/#fairdatasociety:matrix.org">
        <RiotLogo className={styles.riot} />
      </a>
    </div>
  )
}

export default React.memo(Footer)
