import React, { useEffect, useReducer } from 'react'
import { useParams } from 'react-router-dom'
import Logo from '../../components/atoms/logo/Logo'
import styles from './HonestInboxScreen.module.css'
import Claim from './components/claim/Claim'
import { routes } from '../../config/routes'
import Upload from './components/upload/Upload'
import NotFound from './components/notFound/NotFound'
import { FDSInstance } from '../../hooks/mailbox/useMailbox'
import SplashScreen from '../../screens/splash/SplashScreen'

const SET_VALIDATING_ENS_RESULT = 'SET_VALIDATING_ENS_RESULT'

const HonestInboxScreen = ({ history }) => {
  let { ens } = useParams()
  const [{ isValidENS, isValidating }, dispatch] = useReducer(
    (prevState, { type, payload }) => {
      switch (type) {
        case SET_VALIDATING_ENS_RESULT:
          return {
            ...prevState,
            isValidENS: payload.isValidENS,
            isValidating: false,
          }

        default:
          return prevState
      }
    },
    {
      isValidENS: null,
      isValidating: true,
    },
  )

  useEffect(() => {
    if (!ens) {
      history.replace(routes.upload.home)
    }

    if (!FDSInstance.Account.isMailboxNameValid(ens)) {
      return dispatch({ type: SET_VALIDATING_ENS_RESULT, payload: { isValidENS: false } })
    }

    FDSInstance.Account.isMailboxNameAvailable(ens)
      .then((isAvailable) => {
        dispatch({ type: SET_VALIDATING_ENS_RESULT, payload: { isValidENS: !isAvailable } })
      })
      .catch(() => {
        dispatch({ type: SET_VALIDATING_ENS_RESULT, payload: { isValidENS: false } })
      })
  }, [ens])

  if (isValidating) {
    return <SplashScreen />
  }

  if (!isValidENS) {
    return <NotFound ens={ens} />
  }

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
