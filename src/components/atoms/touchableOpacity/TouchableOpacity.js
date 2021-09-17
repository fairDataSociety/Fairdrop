import React, { useCallback } from 'react'
import styles from './TouchableOpacity.module.css'
import c from 'classnames'

const TouchableOpacity = ({ className, children, onClick }) => {
  const handleClick = useCallback(
    (evt) => {
      evt.preventDefault()
      onClick?.()
    },
    [onClick],
  )

  return (
    <a className={c(styles.link, className)} href="" onClick={handleClick}>
      {children}
    </a>
  )
}

export default React.memo(TouchableOpacity)
