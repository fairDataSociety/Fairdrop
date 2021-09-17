import React from 'react'
import CircleLoader from '../../components/atoms/circleLoader/CircleLoader'
import Logo from '../../components/atoms/logo/Logo'
import styles from './SplashScreen.module.css'

const SplashScreen = () => {
  return (
    <div className={styles.container}>
      <Logo className={styles.logo} />

      <CircleLoader />
    </div>
  )
}

export default React.memo(SplashScreen)
