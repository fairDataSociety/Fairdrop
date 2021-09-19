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
import styles from './ProgressBar.module.css'
import c from 'classnames'
import Text from '../../atoms/text/Text'

const ProgressBar = ({ className, value }) => {
  return (
    <div className={c(styles.wrapper, className)}>
      <div className={styles.progress}>
        <span className={styles.indicator} style={{ width: `${value}%` }} />
      </div>

      <Text className={styles.label}>{`${value}%`}</Text>
    </div>
  )
}

export default React.memo(ProgressBar)
