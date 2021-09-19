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
import styles from './Input.module.css'
import c from 'classnames'
import { useTheme } from '../../../hooks/theme/useTheme'

const Input = ({ className, value, onChange, type = 'text', ...rest }) => {
  const { variant } = useTheme()

  return (
    <input
      className={c(styles.input, styles[variant], className)}
      type={type}
      value={value}
      onChange={onChange}
      {...rest}
    />
  )
}

export default React.memo(Input)
