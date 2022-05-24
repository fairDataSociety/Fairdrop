import React from 'react'
import styled from 'styled-components/macro'
import { List, ListItem, getFileIcon } from '../..'
import { DateTime } from 'luxon'
import Utils from '../../../services/Utils'
import { TABLE_MODE } from './TableDesktop'

const WrapperList = styled(List)`
  width: 100%;
`
export const TableMobile = ({ className, readMessages, messages, hideFrom, mode = TABLE_MODE.RECEIVED, onClick }) => {
  return (
    <WrapperList className={className}>
      {messages.map((message) => {
        const { hash = {}, from, to } = message
        const { file = {} } = hash

        const account = mode === TABLE_MODE.RECEIVED ? from ?? 'Unkown' : to ?? 'Unkown'

        const subtitleArr = [
          !hideFrom ? account : undefined,
          hash.time ? DateTime.fromMillis(hash.time).toFormat('dd/LL/yyyy') : 'Unkown',
          Utils.humanFileSize(file?.size) ?? 'Unkown',
        ].filter((item) => !!item)

        const isMessageRead =
          mode === TABLE_MODE.RECEIVED ? readMessages.some((address) => address === hash?.address) : true

        return (
          <ListItem
            key={message?.hash?.address}
            iconName={getFileIcon({ type: file.type })?.name}
            title={file?.name ?? 'Unkown'}
            subtitle={subtitleArr.join(' · ')}
            hasNotification={!isMessageRead}
            onClick={() =>
              onClick?.({
                file,
                from,
                to,
                mode,
                time: hash.time,
                link: message?.getFileUrl?.(),
                address: message?.hash?.address,
              })
            }
          />
        )
      })}
    </WrapperList>
  )
}
