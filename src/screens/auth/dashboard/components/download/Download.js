import React, { useCallback } from 'react'
import styles from './Download.module.css'
import c from 'classnames'
import { ReactComponent as DownloadIcon } from './assets/download_icon.svg'

const Download = ({ className, message }) => {
  const handleClick = useCallback(() => {
    message?.saveAs?.()
  }, [message])

  return (
    <button className={c(styles.button, className)} onClick={handleClick}>
      <DownloadIcon className={styles.icon} />
    </button>
  )
}

export default React.memo(Download)
