import React from 'react'
import { List, ListItem, getFileIcon } from '../../../../components'
import { DateTime } from 'luxon'
import Utils from '../../../../services/Utils'

export const ListReceived = ({ sortedMessages, honestInboxRegex, onClick }) => {
  return (
    <List>
      {sortedMessages.map((message) => {
        const { hash = {}, from } = message
        const { file = {} } = hash

        let sanitizedFrom = from
        if (new RegExp(honestInboxRegex).test(from)) {
          sanitizedFrom = 'Honest Inbox'
        }

        const subtitleArr = [
          sanitizedFrom,
          hash.time ? DateTime.fromMillis(hash.time).toFormat('dd/LL/yyyy') : 'Unkown',
          Utils.humanFileSize(file?.size) ?? 'Unkown',
        ]

        return (
          <ListItem
            key={message?.hash?.address}
            iconName={getFileIcon({ type: file.type })?.name}
            title={sanitizedFrom ?? 'Unkown'}
            subtitle={subtitleArr.join(' · ')}
            onClick={() => onClick({ file, from, time: hash.time })}
          />
        )
      })}
    </List>
  )
}
