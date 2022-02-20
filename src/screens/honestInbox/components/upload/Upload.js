import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import styles from './Upload.module.css'
import c from 'classnames'
import Text from '../../../../components/atoms/text/Text'
import Utils from '../../../../services/Utils'
import Button from '../../../../components/atoms/button/Button'

const Upload = ({ className, ens }) => {
  const [file, setFile] = useState()

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({ onDrop, noClick: true })

  const handleSelectFileClick = useCallback(() => {
    inputRef?.current?.click()
  }, [])

  const handleSendFileClick = useCallback(() => {
    console.info(file)
  }, [file])

  return (
    <div className={c(styles.container, className)} {...getRootProps()}>
      {!isDragActive && (
        <>
          <div className={styles.content}>
            <Text className={styles.headline} variant="black" size="l">
              Send any file to{' '}
              <Text element="span" size="l" weight="500" variant="black">
                {ens}
              </Text>{' '}
              anonimously
            </Text>
          </div>

          <div className={c(styles.actions, file && styles.hasFiles)}>
            <div className={styles.fileRow}>
              {file && (
                <>
                  <div className={styles.fileData}>
                    <Text variant="black" truncate>
                      {file.name}
                    </Text>
                    <Text className={styles.fileSize} variant="black" truncate size="sm">
                      {Utils.humanFileSize(file?.size)}
                    </Text>
                  </div>

                  <button className={styles.clearFile} onClick={() => setFile(null)}>
                    X
                  </button>
                </>
              )}
            </div>
            {file && (
              <Button variant="black" onClick={handleSendFileClick}>
                Send selected file
              </Button>
            )}
            {!file && (
              <Button variant="black" onClick={handleSelectFileClick}>
                Select file
              </Button>
            )}
          </div>
        </>
      )}

      {isDragActive && (
        <div className={styles.dropArea}>
          <div className={styles.folder}>
            <span></span>
          </div>

          <Text variant="black">Drop here your file</Text>
        </div>
      )}

      <input {...getInputProps()} />
    </div>
  )
}

export default React.memo(Upload)
