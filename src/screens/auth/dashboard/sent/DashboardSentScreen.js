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

import React, { Fragment, useEffect, useState } from 'react'
import Text from '../../../../components/atoms/text/Text'
import { useMailbox } from '../../../../hooks/mailbox/useMailbox'
import Utils from '../../../../services/Utils'
import styles from './DashboardSentScreen.module.css'
import { DateTime } from 'luxon'
import { toast } from 'react-toastify'
import WorkingLayout from '../../../../components/layout/working/WorkingLayout'
import Download from '../components/download/Download'

const DashboardSentScreen = () => {
  const [{ sent }, { getSentMessages }] = useMailbox()
  const [isFetchingMessages, setIsFetchingMessages] = useState(true)

  useEffect(() => {
    getSentMessages()
      .then(() => {
        setIsFetchingMessages(false)
      })
      .catch(() => {
        toast.error('🔥 Something went wrong while trying to retrieve your sent files :(')
        setIsFetchingMessages(false)
      })
  }, [])

  if (isFetchingMessages) {
    return <WorkingLayout headline="We are getting your data..." />
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Text size="sm" weight="500" variant="black">
            Name
          </Text>
        </div>

        <div className={styles.header}>
          <Text size="sm" weight="500" variant="black">
            To
          </Text>
        </div>

        <div className={styles.header}>
          <Text size="sm" weight="500" variant="black">
            Time
          </Text>
        </div>

        <div className={styles.header}>
          <Text size="sm" weight="500" variant="black">
            Size
          </Text>
        </div>

        {sent.length > 0 &&
          sent.reverse().map((message) => {
            const { hash = {}, from } = message
            const { file = {} } = hash

            return (
              <Fragment key={message?.hash?.address}>
                <div className={styles.row}>
                  <Download className={styles.icon} message={message} />
                  <Text size="sm" variant="black">
                    {file?.name ?? 'Unkown'}
                  </Text>
                </div>

                <div className={styles.row}>
                  <Text size="sm" variant="black">
                    {from ?? 'Unkown'}
                  </Text>
                </div>

                <div className={styles.row}>
                  <Text size="sm" variant="black">
                    {hash.time ? DateTime.fromMillis(hash.time).toFormat('dd/LL/yyyy HH:mm') : 'Unkown'}
                  </Text>
                </div>

                <div className={styles.row}>
                  <Text size="sm" variant="black">
                    {Utils.humanFileSize(file?.size) ?? 'Unkown'}
                  </Text>
                </div>
              </Fragment>
            )
          })}
        {sent.length === 0 && (
          <div className={styles.row}>
            <Text size="sm" variant="black">
              There is no sent files yet...
            </Text>
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(DashboardSentScreen)
