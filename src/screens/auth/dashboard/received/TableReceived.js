import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  SwitchFileIcon,
  Box,
  ButtonFlat,
  Text,
} from '../../../../components'
import { DateTime } from 'luxon'
import Utils from '../../../../services/Utils'

export const TableReceive = ({ sortedMessages, honestInboxRegex }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>
            <Text size="sm" weight="500" variant="black">
              Name
            </Text>
          </TableCell>
          <TableCell>
            <Text size="sm" weight="500" variant="black">
              From
            </Text>
          </TableCell>
          <TableCell>
            <Text size="sm" weight="500" variant="black">
              Time
            </Text>
          </TableCell>
          <TableCell>
            <Text size="sm" weight="500" variant="black" align="right">
              Size
            </Text>
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {sortedMessages.map((message) => {
          const { hash = {}, from } = message
          const { file = {} } = hash
          let sanitizedFrom = from
          if (new RegExp(honestInboxRegex).test(from)) {
            sanitizedFrom = 'Honest Inbox'
          }

          return (
            <TableRow
              key={message?.hash?.address}
              hoverActions={
                <Box gap="32px">
                  <ButtonFlat variant="primary">Copy link</ButtonFlat>
                  <ButtonFlat variant="negative">Delete</ButtonFlat>
                </Box>
              }
            >
              <TableCell>
                <Box gap="14px" vAlign="center">
                  <div>
                    <SwitchFileIcon className type={file.type} onClick={message?.saveAs ?? undefined} />
                  </div>
                  <Text size="sm" variant="black" truncate>
                    {file?.name ?? 'Unkown'}
                  </Text>
                </Box>
              </TableCell>

              <TableCell>
                <Box gap="14px" vAlign="center">
                  <Text size="sm" variant="black" truncate>
                    {sanitizedFrom ?? 'Unkown'}
                  </Text>
                </Box>
              </TableCell>

              <TableCell>
                <Box gap="14px" vAlign="center">
                  <Text size="sm" variant="black">
                    {hash.time ? DateTime.fromMillis(hash.time).toFormat('dd/LL/yyyy HH:mm') : 'Unkown'}
                  </Text>
                </Box>
              </TableCell>

              <TableCell>
                <Text size="sm" variant="black" align="right">
                  {Utils.humanFileSize(file?.size) ?? 'Unkown'}
                </Text>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
