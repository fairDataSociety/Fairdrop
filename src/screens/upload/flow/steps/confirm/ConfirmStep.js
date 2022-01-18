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

import React, { Fragment, useCallback, useMemo } from 'react'
import { FILE_UPLOAD_TYPES, useFileManager } from '../../../../../hooks/fileManager/useFileManager'
import styles from './ConfirmStep.module.css'
import Utils from '../../../../../services/Utils'
import Button from '../../../../../components/atoms/button/Button'
import Text from '../../../../../components/atoms/text/Text'
import TouchableOpacity from '../../../../../components/atoms/touchableOpacity/TouchableOpacity'
import { useMailbox } from '../../../../../hooks/mailbox/useMailbox'
import { routes } from '../../../../../config/routes'
import { useHistory } from 'react-router-dom'

const ConfirmStep = ({ nextStep }) => {
  const [{ files, type, recipient }] = useFileManager()
  const [{ mailbox }] = useMailbox()
  const history = useHistory()

  const isEncrypted = useMemo(() => {
    return type === FILE_UPLOAD_TYPES.ENCRYPTED
  }, [type])

  const handleCancelClick = useCallback(() => {
    history.replace(routes.upload.home)
  }, [history])

  const confirmButtonLabel = useMemo(() => {
    switch (type) {
      case FILE_UPLOAD_TYPES.ENCRYPTED:
        return 'Encrypt and Send'

      case FILE_UPLOAD_TYPES.QUICK:
        return 'Send Unencrypted'

      case FILE_UPLOAD_TYPES.STORE:
        return 'Encrypt and Store'
    }
  }, [type])

  return (
    <div className={styles.container}>
      <Text className={styles.headline} element="h1" size="l" weight="500">
        Confirm
      </Text>

      {files.map((file, idx) => {
        return (
          <Fragment key={`${idx}-${file.name}`}>
            <div className={styles.row}>
              <Text className={styles.label}>File name</Text>
              <Text className={styles.filename} align="right" truncate>
                {file.name}
              </Text>
            </div>

            <div className={styles.row}>
              <Text>Size</Text>
              <Text align="right">{Utils.humanFileSize(file.size)}</Text>
            </div>

            {isEncrypted && (
              <>
                <div className={styles.row}>
                  <Text>Sender</Text>
                  <Text align="right">{`${mailbox?.subdomain}.fairdrop.eth`}</Text>
                </div>

                <div className={styles.row}>
                  <Text>Recipient</Text>
                  <Text align="right">{`${recipient}.fairdrop.eth`}</Text>
                </div>
              </>
            )}
          </Fragment>
        )
      })}

      <div className={styles.actions}>
        <Button variant="green" onClick={nextStep}>
          {confirmButtonLabel}
        </Button>

        <TouchableOpacity onClick={handleCancelClick}>
          <Text>Cancel</Text>
        </TouchableOpacity>
      </div>
    </div>
  )
}

export default React.memo(ConfirmStep)
