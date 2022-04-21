import React, { useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import Button from '../../components/atoms/button/Button'
import { Input } from '../../components/atoms/input/Input'
import Text from '../../components/atoms/text/Text'
import CopyToClipboard from '../../components/molecules/copyToClipboard/CopyToClipboard'
import styles from './DownloadScreen.module.css'

const DownloadScreen = ({ location }) => {
  let { address, name } = useParams()
  const fileSize = useMemo(() => new URLSearchParams(location.search))

  const isMultiDownload = useMemo(() => {
    return !name
  }, [name])

  const downloadLink = useMemo(() => {
    let url = window.location.origin
    if (isMultiDownload) {
      url += `bzz-list:/${address}`
    } else {
      url += `bzz:/${address}/${name}`
    }
    return url
  }, [isMultiDownload, address, fileSize, name])

  const handleDownloadClick = useCallback(() => {
    // TODO
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Text className={styles.headline} element="h1" variant="white" size="xl" align="center">
          Download
        </Text>

        <Text variant="white" align="center">
          {isMultiDownload ? 'This is your link to download your files.' : 'This is your link to download your file.'}
        </Text>

        <div className={styles.download}>
          <Input className={styles.input} defaultValue={downloadLink} />

          <CopyToClipboard textToCopy={downloadLink} />
        </div>

        <Button className={styles.action} variant="white" type="button" onClick={handleDownloadClick}>
          Start download
        </Button>
      </div>
    </div>
  )
}

export default React.memo(DownloadScreen)
