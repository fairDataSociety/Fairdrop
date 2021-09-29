import QRCode from 'qrcode'
import React, { useEffect, useState } from 'react'

export const QR = ({ resource, size = 263, lightColor = '#fffff00', darkColor = '#000' }) => {
  const [url, setUrl] = useState()

  useEffect(() => {
    QRCode.toDataURL(
      resource,
      {
        width: size,
        height: size,
        color: {
          light: lightColor,
          dark: darkColor,
        },
        margin: 1,
      },
      (error, url) => {
        if (error) {
          setUrl(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&color=333333&data=${resource}`)
          return
        }
        setUrl(url)
      },
    )
  }, [])

  if (!url) {
    return null
  }

  return <img src={url} alt="" />
}

export default QR
