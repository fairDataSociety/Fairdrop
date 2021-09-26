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

import React, { useCallback, useState } from 'react'
import Text from '../../../components/atoms/text/Text'
import { useMailbox } from '../../../hooks/mailbox/useMailbox'
import styles from './ProfileScreen.module.css'
import c from 'classnames'
import Input from '../../../components/atoms/input/Input'
import TouchableOpacity from '../../../components/atoms/touchableOpacity/TouchableOpacity'
import Utils from '../../../services/Utils'
import { useSideMenu } from '../../../hooks/sideMenu/useSideMenu'

const ProfileScreen = () => {
  const [{ mailbox, balance, appState }] = useMailbox()
  const [copied, setCopied] = useState(false)
  const { hideSideMenu } = useSideMenu()

  const handleCopyAddress = useCallback(() => {
    Utils.copyToClipboard(mailbox.address).then(() => {
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    })
  }, [mailbox])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text element="h4" size="xl">
          My account
        </Text>

        <button className={styles.close} onClick={hideSideMenu}>
          <span className={styles.closeBox}>
            <span className={styles.closeInner}></span>
          </span>
        </button>
      </div>

      <div className={styles.mailboxInfo}>
        <div className={styles.infoRow}>
          <Text className={styles.label} variant="gray">
            Mailbox Name
          </Text>

          <Text weight="500">{mailbox.subdomain}</Text>
        </div>

        <div className={c(styles.infoRow, styles.address)}>
          <Text className={styles.label} variant="gray">
            Address
          </Text>

          <div className={styles.addressWrapper}>
            <Input className={styles.addressInput} defaultValue={mailbox.address} />
            <TouchableOpacity className={styles.copyAddress} onClick={handleCopyAddress}>
              <Text element="span" size="sm">
                {copied ? 'Copied!' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </div>
        </div>

        <div className={styles.infoRow}>
          <Text className={styles.label} variant="gray">
            Balance
          </Text>

          <Text weight="500">{Utils.formatBalance(balance)}</Text>
        </div>

        <div className={styles.infoRow}>
          <Text className={styles.label} variant="gray">
            Stored Currently
          </Text>

          <Text weight="500">{Utils.humanFileSize(appState?.totalStoredSize ?? undefined)}</Text>
        </div>

        <div className={styles.infoRow}>
          <Text className={styles.label} variant="gray">
            Stored Pinned Currently
          </Text>

          <Text weight="500">{Utils.humanFileSize(appState?.totalPinnedSize ?? undefined)}</Text>
        </div>
      </div>
    </div>
  )
}

export default React.memo(ProfileScreen)
