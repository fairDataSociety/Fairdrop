import React from 'react'
import styles from './ProgressBar.module.css'
import c from 'classnames'
import Text from '../../atoms/text/Text'

const ProgressBar = ({ className, value }) => {
  return (
    <div className={c(styles.wrapper, className)}>
      <div className={styles.progress}>
        <span className={styles.indicator} style={{ width: `${value}%` }} />
      </div>

      <Text className={styles.label}>{`${value}%`}</Text>
    </div>
  )
}

export default React.memo(ProgressBar)
