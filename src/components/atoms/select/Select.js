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
