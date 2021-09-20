import React from 'react'
import styles from './SlideMenu.module.css'
import c from 'classnames'
import { CSSTransition } from 'react-transition-group'

const SlideMenu = ({ className, shown, children, onEnter, onExited }) => {
  return (
    <CSSTransition
      in={shown}
      timeout={{ enter: 200, exit: 1000 }}
      classNames={{ ...styles }}
      unmountOnExit
      onEnter={onEnter}
      onExited={onExited}
    >
      <div className={c(styles.container, className)}>{children}</div>
    </CSSTransition>
  )
}

export default React.memo(SlideMenu)
