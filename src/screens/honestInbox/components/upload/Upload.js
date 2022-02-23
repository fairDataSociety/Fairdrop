import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import styles from './Upload.module.css'
import c from 'classnames'
import Text from '../../../../components/atoms/text/Text'
import Utils from '../../../../services/Utils'
import Button from '../../../../components/atoms/button/Button'
import { useMailbox } from '../../../../hooks/mailbox/useMailbox'
import { toast } from 'react-toastify'
import InfiniteProgressBar from '../../../../components/molecules/infiniteProgressBar/InfiniteProgressBar'

const Upload = ({ className, ens }) => {
  const [file, setFile] = useState()
  const [uploading, setUploading] = useState()
  const [infoMessage, setInfoMessage] = useState('File uploaded, processing into Swarm')
  const [uploadFailed, setUploadFailed] = useState(false)
  const [, { createAnonymousMailbox, uploadEncryptedFile, resetMailbox, txToFaucet }] = useMailbox()

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({ onDrop, noClick: true })

  const handleSelectFileClick = useCallback(() => {
    inputRef?.current?.click()
  }, [])

  const handleSendFileClick = useCallback(async () => {
    console.info(file)
    setUploading(true)
    const createAccount = async () => {
      try {
        const account = await createAnonymousMailbox()
        console.info(account)
      } catch (error) {
        console.info(error)
        txToFaucet()
        resetMailbox?.()
        toast.error(`💩 ${error.message}`)
      }
    }

    try {
      await createAccount()
      await uploadEncryptedFile({
        to: ens,
        files: [file],
        onEncryptedEnd: () => setInfoMessage('The file was encrypted, uploading file...'),
        onProgressUpdate: (response) => {
          if (response >= 100) {
            setInfoMessage('File uploaded, processing into Swarm.')
            return
          }
        },
        onStatusChange: (message) => console.info(message) && setInfoMessage(message),
      })
      await txToFaucet()
      toast('🎉 Yay! Your files has been sent!')
      resetMailbox?.()
      setFile(null)
      setUploading(false)
    } catch (error) {
      console.info(error)
      toast.error(`💩 ${error.message}`)
      setUploadFailed(true)
    }
  }, [file])

  if (uploading) {
    return (
      <div className={c(styles.container, className)}>
        {!uploadFailed && (
          <>
            <div className={styles.uploadingMessage}>
              <Text className={styles.headline} variant="black" size="l">
                Sending your file...
              </Text>

              <Text variant="black">{infoMessage}</Text>
            </div>

            <InfiniteProgressBar className={styles.progress} variant="dark" />
          </>
        )}

        {uploadFailed && (
          <>
            <div className={styles.uploadingMessage}>
              <Text className={styles.headline} variant="black" size="l">
                Something went wrong
              </Text>

              <Text variant="black">We are so sorry, but we could not sent your file. Do you want to try again?</Text>
            </div>

            <Button variant="black" onClick={handleSendFileClick}>
              Retry
            </Button>
          </>
        )}
      </div>
    )
  }

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
