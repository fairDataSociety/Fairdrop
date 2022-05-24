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

import React from 'react'
import Button from '../../../components/atoms/button/Button'
import Text from '../../../components/atoms/text/Text'
import { useMailbox } from '../../../hooks/mailbox/useMailbox'
import styles from './SettingsExportScreen.module.css'

const SettingsExportScreen = () => {
  const [, { exportMailboxes }] = useMailbox()

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Text className={styles.headline} element="h1" variant="white" size="xl" align="center">
          Export your mailboxes
        </Text>

        <Text variant="white" align="center">
          If you want to keep your mailbox safe and sound, export them. You will get a zip file containing all your
          mailboxes and its data.
        </Text>

        <Button className={styles.action} variant="white" type="button" onClick={exportMailboxes}>
          Export mailboxes
        </Button>
      </div>
    </div>
  )
}

export default React.memo(SettingsExportScreen)
