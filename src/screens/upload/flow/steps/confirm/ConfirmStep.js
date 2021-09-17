import React, { Fragment, useCallback } from 'react'
import { useFileManager } from '../../../../../hooks/fileManager/useFileManager'
import styles from './ConfirmStep.module.css'
import Utils from '../../../../../services/Utils'
import Button from '../../../../../components/atoms/button/Button'
import Text from '../../../../../components/atoms/text/Text'
import TouchableOpacity from '../../../../../components/atoms/touchableOpacity/TouchableOpacity'

const ConfirmStep = ({ prevStep, nextStep }) => {
  const [{ files, type }, { resetFileManager }] = useFileManager()

  const handleCancelClick = useCallback(() => {
    resetFileManager?.()
  }, [])

  return (
    <div className={styles.container}>
      <Text className={styles.headline} element="h1" size="l" weight="500">
        Confirm
      </Text>

      {files.map((file, idx) => {
        return (
          <Fragment key={`${idx}-${file.name}`}>
            <div className={styles.row}>
              <Text>File name</Text>
              <Text>{file.name}</Text>
            </div>

            <div className={styles.row}>
              <Text>Size</Text>
              <Text>{Utils.humanFileSize(file.size)}</Text>
            </div>
          </Fragment>
        )
      })}

      <div className={styles.actions}>
        <Button variant="green">Encrypt and Send</Button>

        <TouchableOpacity onClick={handleCancelClick}>
          <Text>Cancel</Text>
        </TouchableOpacity>
      </div>
    </div>
  )
}

export default React.memo(ConfirmStep)
