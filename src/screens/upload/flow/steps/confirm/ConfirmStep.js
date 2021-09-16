import React, { Fragment } from 'react'
import { useFileManager } from '../../../../../hooks/fileManager/useFileManager'
import styles from './ConfirmStep.module.css'
import Utils from '../../../../../services/Utils'

const ConfirmStep = ({ prevStep, nextStep }) => {
  const [{ files, type }] = useFileManager()

  return (
    <div className={styles.container}>
      <h1 className={styles.headline}>Confirm</h1>

      {files.map((file, idx) => {
        return (
          <Fragment key={`${idx}-${file.name}`}>
            <div className={styles.row}>
              <span>File name</span>
              <span>{file.name}</span>
            </div>

            <div className={styles.row}>
              <span>Size</span>
              <span>{Utils.humanFileSize(file.size)}</span>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}

export default React.memo(ConfirmStep)
