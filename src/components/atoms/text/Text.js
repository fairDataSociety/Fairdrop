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
