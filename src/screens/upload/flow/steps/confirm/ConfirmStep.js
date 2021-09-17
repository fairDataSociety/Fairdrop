import React, { Fragment } from 'react'
import { useFileManager } from '../../../../../hooks/fileManager/useFileManager'
import styles from './ConfirmStep.module.css'
import Utils from '../../../../../services/Utils'
import Button from '../../../../../components/atoms/button/Button'
import Text from '../../../../../components/atoms/text/Text'

const ConfirmStep = ({ prevStep, nextStep }) => {
  const [{ files, type }] = useFileManager()

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
      <Button variant="green">Encrypt and Send</Button>
    </div>
  )
}

export default React.memo(ConfirmStep)
