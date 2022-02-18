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

import React, { useCallback, useEffect, useState } from 'react'
import Button from '../../components/atoms/button/Button'
import Text from '../../components/atoms/text/Text'
import Disclaimer from '../../components/molecules/disclaimer/Disclaimer'
import styles from './ProductDisclaimer.module.css'

const ProductDisclaimer = () => {
  const [shown, setShown] = useState(false)

  const handleAgreeClick = useCallback(() => {
    localStorage.setItem('agreedProductDisclaimer', Date.now())
    setShown(false)
  }, [])

  useEffect(() => {
    setShown(!localStorage.getItem('agreedProductDisclaimer'))
  }, [])

  if (!shown) {
    return null
  }

  return (
    <Disclaimer>
      <Text>
        Fairdrop is in Beta and provided for evaluation only! File integrity, persistence and security are not assured!{' '}
        <a
          className={styles.link}
          rel="noopener noreferrer"
          target="_blank"
          href="https://github.com/fairDataSociety/Fairdrop/issues"
        >
          Report Bugs
        </a>
      </Text>
      <div className={styles.actions}>
        <Button className={styles.action} variant="red" onClick={handleAgreeClick}>
          Ok, I agree!
        </Button>
      </div>
    </Disclaimer>
  )
}

export default React.memo(ProductDisclaimer)
