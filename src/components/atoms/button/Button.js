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
import styles from './Button.module.css'
import c from 'classnames'

const Button = ({ className, inverted, variant, children, disabled, ...rest }) => {
  return (
    <button
      className={c(styles.button, inverted && styles.inverted, styles[variant], className)}
      type="button"
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}

export default React.memo(Button)
