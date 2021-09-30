import React, { useCallback, useState } from 'react'
import styles from './CopyToClipboard.module.css'
import c from 'classnames'
import TouchableOpacity from '../../atoms/touchableOpacity/TouchableOpacity'
import Text from '../../atoms/text/Text'
import Utils from '../../../services/Utils'

const CopyToClipboard = ({ className, label = 'Copy link', textToCopy }) => {
  const [copied, setCopied] = useState(false)

  const handleCopyClick = useCallback(() => {
    Utils.copyToClipboard(textToCopy).then(() => {
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    })
  }, [textToCopy])

  return (
    <TouchableOpacity className={c(styles.container, className)} onClick={handleCopyClick}>
      <Text size="sm" align="center">
        {copied ? 'Copied!' : label}
      </Text>
    </TouchableOpacity>
  )
}

export default React.memo(CopyToClipboard)
