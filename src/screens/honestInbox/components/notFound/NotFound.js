import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Button from '../../../../components/atoms/button/Button'
import Logo from '../../../../components/atoms/logo/Logo'
import Text from '../../../../components/atoms/text/Text'
import { routes } from '../../../../config/routes'
import { useDimensions } from '../../../../hooks/dimensions/useDimensions'
import Hexagon from './components/Hexagon'
import styles from './NotFound.module.css'

const HEXAGON_WIDTH = 110
const HEXAGON_HEIGHT = 110

const NotFound = ({ ens }) => {
  const { dimensions } = useDimensions()
  const [numberOfRows, setNumberOfRows] = useState(Math.ceil(window.innerHeight / (HEXAGON_HEIGHT / 2)))
  const [numberOfHexagons, setNumberOfHexagons] = useState(Math.ceil(window.innerWidth / HEXAGON_WIDTH) + 1)
  const history = useHistory()

  useEffect(() => {
    setNumberOfRows(Math.ceil(dimensions.height / (HEXAGON_HEIGHT / 2)))
    setNumberOfHexagons(Math.ceil(dimensions.width / HEXAGON_WIDTH) + 1)
  }, [dimensions])

  return (
    <div className={styles.container}>
      <Link to={routes.upload.home}>
        <Logo className={styles.logo} />
      </Link>

      <div className={styles.panel}>
        {[...Array(numberOfRows)].map((_, idx) => {
          return (
            <div key={`row-${idx}`} className={styles.row}>
              {[...Array(numberOfHexagons)].map((_, hexIdx) => {
                return <Hexagon key={`row-${idx}-hex-${hexIdx}`} className={styles.hexagon} />
              })}
            </div>
          )
        })}

        <div className={styles.content}>
          <Text className={styles.headline} weight="500" size="xxl" align="center">
            404
          </Text>

          <Text className={styles.status} size="xxl" align="center">
            {ens} mailbox not found
          </Text>

          <Button variant="white" inverted onClick={() => history.replace(routes.upload.home)}>
            Go back to a safe chain
          </Button>
        </div>
      </div>
    </div>
  )
}

export default React.memo(NotFound)
