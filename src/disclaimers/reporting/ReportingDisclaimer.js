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
import { useMailbox } from '../../hooks/mailbox/useMailbox'
import styles from './ReportingDisclaimer.module.css'

const ReportingDisclaimer = () => {
  const [shown, setShown] = useState(false)
  const [, { initSentry }] = useMailbox()

  const handleAgreeClick = useCallback(() => {
    localStorage.setItem('agreedReportingDisclaimer', Date.now())
    localStorage.setItem('agreedSentry', Date.now())
    initSentry()
    setShown(false)
  }, [])

  const handleRejectClick = useCallback(() => {
    localStorage.setItem('agreedReportingDisclaimer', Date.now())
    localStorage.removeItem('agreedSentry')
    setShown(false)
  }, [])

  useEffect(() => {
    setShown(typeof localStorage.getItem('agreedReportingDisclaimer') === 'undefined')
  }, [])

  if (!shown) {
    return null
  }

  return (
    <Disclaimer>
      <Text>Is it ok to use bug tracking software to help improve user experience by reporting bugs?</Text>
      <div className={styles.actions}>
        <Button className={styles.action} variant="white" inverted onClick={handleRejectClick}>
          No thanks
        </Button>

        <Button className={styles.action} variant="red" onClick={handleAgreeClick}>
          Sure!
        </Button>
      </div>
    </Disclaimer>
  )
}

export default React.memo(ReportingDisclaimer)
