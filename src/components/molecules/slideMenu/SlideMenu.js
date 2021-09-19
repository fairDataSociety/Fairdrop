import React from 'react'
import { useLocation } from 'react-router-dom'
import styles from './SlideMenu.module.css'
import c from 'classnames'
import { CSSTransition } from 'react-transition-group'

const SlideMenu = ({ className, children }) => {
  const location = useLocation()
  const shown = location?.state?.sideMenu ?? false

  return (
    <CSSTransition in={shown} timeout={300} classNames={{ ...styles }} unmountOnExit>
      <div className={c(styles.container, className)}>{children}</div>
    </CSSTransition>
  )
}

export default React.memo(SlideMenu)
