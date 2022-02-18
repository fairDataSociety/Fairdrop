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
import c from 'classnames'
import styles from './Text.module.css'

export const ALIGN = ['left', 'center', 'right']
export const VARIANTS = ['white', 'black', 'green']
export const SIZES = ['xs', 's', 'sm', 'm', 'ml', 'l', 'xl', 'xxl']
export const TRANSFORM = [null, 'capitalize', 'uppercase', 'lowercase', 'inherit']

export const ELEMENTS = ['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']

const Text = ({
  className,
  children,
  element = ELEMENTS[0],
  size = SIZES[3],
  variant = VARIANTS[0],
  weight = 300,
  align = ALIGN[0],
  transform = TRANSFORM[0],
  truncate,
  textStyle,
  disabled = false,
  ...rest
}) => {
  return React.createElement(
    element,
    {
      className: c(
        styles.font,
        className,
        size && styles[`size-${size}`],
        variant && styles[variant],
        align && styles[align],
        styles[`weight-${weight}`],
        transform && styles[`trans-${transform}`],
        truncate && styles.truncate,
        textStyle && styles[textStyle],
        disabled && styles.disabled,
      ),
      ...rest,
    },
    children,
  )
}

export default Text
