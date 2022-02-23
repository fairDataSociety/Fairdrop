import React from 'react'
import styles from './Hexagon.module.css'
import c from 'classnames'

const Hexagon = ({ className }) => {
  return <div className={c(styles.container, className)}></div>
}

export default React.memo(Hexagon)
