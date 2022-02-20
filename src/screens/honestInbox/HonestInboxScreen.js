import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Logo from '../../components/atoms/logo/Logo'
import { colors } from '../../config/colors'
import { useTheme } from '../../hooks/theme/useTheme'
import styles from './HonestInboxScreen.module.css'
import Claim from './components/claim/Claim'
import { routes } from '../../config/routes'
import Upload from './components/upload/Upload'

const HonestInboxScreen = ({ history }) => {
  let { ens } = useParams()
  const { setVariant, setBackground } = useTheme()

  // TODO verify ENS
  useEffect(() => {
    setVariant('white')
    setBackground(colors.gray)
  }, [])

  useEffect(() => {
    if (!ens) {
      history.replace(routes.upload.home)
    }
  }, [ens])

  return (
    <div className={styles.container}>
      <Logo className={styles.logo} />

      <div className={styles.card}>
        <Upload ens={ens} />
      </div>

      <div className={styles.claimWrapper}>
        <Claim />
      </div>
    </div>
  )
}

export default React.memo(HonestInboxScreen)
