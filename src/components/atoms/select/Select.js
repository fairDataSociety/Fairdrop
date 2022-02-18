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
import ReactDropdown from 'react-dropdown'
import styles from './Select.module.css'
import 'react-dropdown/style.css'
import c from 'classnames'
import { useTheme } from '../../../hooks/theme/useTheme'

const Select = ({ className, placeholder, options = [], value, onChange }) => {
  const { variant } = useTheme()

  return (
    <ReactDropdown
      className={c(styles.select, styles[variant], className)}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  )
}

export default React.memo(Select)
