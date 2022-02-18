import React from 'react'
import styles from './SlideMenu.module.css'
import c from 'classnames'
import { CSSTransition } from 'react-transition-group'
import { ReactComponent as IconArrowLeft } from './assets/iconArrowLeft.svg'
import { useSideMenu } from '../../../hooks/sideMenu/useSideMenu'

const SlideMenu = ({ className, shown, showBack = true, children, onEnter, onExited }) => {
  const { hideSideMenu } = useSideMenu()

  return (
    <CSSTransition
      in={shown}
      timeout={{ enter: 200, exit: 1000 }}
      classNames={{ ...styles }}
      unmountOnExit
      onEnter={onEnter}
      onExited={onExited}
    >
      <div className={c(styles.container, className)}>
        {showBack && (
          <div className={styles.header}>
            <button className={styles.back} onClick={hideSideMenu}>
              <IconArrowLeft className={styles.icon} />
            </button>
          </div>
        )}
        {children}
      </div>
    </CSSTransition>
  )
}

export default React.memo(SlideMenu)
