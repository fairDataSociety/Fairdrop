// Copyright 2019 The FairDataSociety Authors
// This file is part of the FairDataSociety library.
//
// The FairDataSociety library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The FairDataSociety library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the FairDataSociety library. If not, see <http://www.gnu.org/licenses/>.

import React, { useCallback, useRef } from 'react'
import { toast } from 'react-toastify'
import Text from '../../../components/atoms/text/Text'
import styles from './AboutFairDataSocietyScreen.module.css'
import { ReactComponent as FDSLogo } from './assets/fair-data-society.svg'

const AboutFairDataSocietyScreen = () => {
  const timesClicked = useRef(0)
  const easterEggEnabled = useRef(parseInt(localStorage.getItem('hasEnabledMaxFileSizeEasterEgg')) === 1)

  const handleEnableEasterEgg = useCallback((evt) => {
    evt.preventDefault()
    evt.stopPropagation()
    if (easterEggEnabled.current) {
      return
    }

    timesClicked.current = timesClicked.current + 1

    if (timesClicked.current === 10) {
      localStorage.setItem('hasEnabledMaxFileSizeEasterEgg', 1)
      easterEggEnabled.current = true
      toast('🖖 Easter egg discovered! Your file size limit has been set to 500mb!', {
        theme: 'light',
      })
    }
  }, [])

  return (
    <div className={styles.container}>
      <a href="" onClick={handleEnableEasterEgg}>
        <FDSLogo className={styles.logo} />
      </a>

      <Text className={styles.p} align="center">
        Imagine a society of a completely private digital life where your privacy is not weaponised against you just to
        sell you more things.
      </Text>

      <Text className={styles.p} align="center">
        Fair Data Society is a non-profit initiative that is reimagining the data economy and creating a fair and
        decentralised data layer.
      </Text>

      <Text className={styles.p} align="center">
        We have Fair Trade, now why not Fair Data?
      </Text>

      <Text className={styles.p} align="center">
        Fair Data Society recognises online privacy as a{' '}
        <a
          className={styles.link}
          rel="noopener noreferrer"
          target="_blank"
          href="https://en.wikipedia.org/wiki/Right_to_privacy"
        >
          basic human right
        </a>{' '}
        and a basis for progress for all.
      </Text>
    </div>
  )
}

export default React.memo(AboutFairDataSocietyScreen)
