import React from 'react'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import { routes } from '../../../../config/routes'
import styles from './Claim.module.css'
import c from 'classnames'
import Text from '../../../../components/atoms/text/Text'
import Button from '../../../../components/atoms/button/Button'

const Claim = ({ className }) => {
  const history = useHistory()

  const handleJoinUs = () => {
    history.push(routes.register)
  }

  return (
    <div className={c(styles.content, className)}>
      <Text className={styles.claim} element="h1" variant="white" size="xl" align="left">
        Join us by using a tool design for{' '}
        <Text className={styles.extraSize} element="span" size="xxl" weight="500" variant="white">
          censorship-resistant
        </Text>{' '}
        and{' '}
        <Text className={styles.extraSize} element="span" size="xxl" weight="500" variant="white">
          free journalism
        </Text>
        .
      </Text>

      <Button className={styles.cta} variant="white" inverted onClick={handleJoinUs}>
        Join Fairdrop
      </Button>
    </div>
  )
}

export default React.memo(Claim)
