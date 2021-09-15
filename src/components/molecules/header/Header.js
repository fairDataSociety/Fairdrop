import React from 'react'
import styles from './Header.module.css'
import c from 'classnames'
import Logo from '../../atoms/logo/Logo'
import { version } from '../../../../package.json'
import { Link } from 'react-router-dom'

const Header = ({ className }) => {
  return (
    <header className={c(styles.container, className)}>
      <Logo />

      <span className={styles.version}>
        {`${version} ${process.env.REACT_APP_ENV_NAME !== 'production' ? `- ${process.env.REACT_APP_ENV_NAME}` : ''}`}
      </span>

      <div className={styles.actions}>
        <Link className={styles.login} to="/mailbox">
          Log in / Register
        </Link>
      </div>
    </header>
  )
}

export default React.memo(Header)
