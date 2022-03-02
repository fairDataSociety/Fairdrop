import React from 'react'
import styles from './Notification.module.css'
import c from 'classnames'
import { CSSTransition } from 'react-transition-group'
import ReactDom from 'react-dom'

const Notification = ({ className, opened, onCloseRequest, children }) => {
  return ReactDom.createPortal(
    <CSSTransition
      in={opened}
      mountOnEnter
      unmountOnExit
      timeout={{
        enter: 700,
        exit: 500,
      }}
      classNames={{
        enter: styles.enter,
        enterActive: styles.enterActive,
        enterDone: styles.enterDone,
        exit: styles.exit,
        exitActive: styles.exitActive,
        exitDone: styles.exitDone,
      }}
    >
      <div className={c(styles.notification, className)}>
        <button className={styles.closeButton} type="button" onClick={onCloseRequest}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0.93934 16.9393C0.353553 17.5251 0.353553 18.4749 0.93934 19.0607C1.52513 19.6464 2.47487 19.6464 3.06066 19.0607L10 12.1213L16.9393 19.0607C17.5251 19.6465 18.4749 19.6465 19.0607 19.0607C19.6464 18.4749 19.6464 17.5251 19.0607 16.9393L12.1213 10L19.0607 3.06066C19.6464 2.47487 19.6464 1.52513 19.0607 0.93934C18.4749 0.353553 17.5251 0.353553 16.9393 0.93934L10 7.87868L3.06066 0.939342C2.47487 0.353556 1.52513 0.353556 0.93934 0.939342C0.353553 1.52513 0.353553 2.47488 0.93934 3.06066L7.87868 10L0.93934 16.9393Z"
              fill="white"
            />
          </svg>
        </button>
        {children}
      </div>
    </CSSTransition>,
    document.body,
  )
}

export default React.memo(Notification)
