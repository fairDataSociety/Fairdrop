import React from 'react'
import { DateTime } from 'luxon'
import { Table, TableBody, TableCell, TableHead, TableRow, SwitchFileIcon, Box, ButtonFlat, Text } from '../..'
import Utils from '../../../services/Utils'

export const TableDesktop = ({ className, messages, hideFrom, onClick }) => {
  return (
    <Table className={className}>
      <TableHead>
        <TableRow>
          <TableCell>
            <Text size="sm" weight="500" variant="black">
              Name
            </Text>
          </TableCell>
          {!hideFrom && (
            <TableCell>
              <Text size="sm" weight="500" variant="black">
                From
              </Text>
            </TableCell>
          )}
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
        {messages.map((message) => {
          const { hash = {}, from } = message
          const { file = {} } = hash

          return (
            <TableRow
              key={message?.hash?.address}
              hoverActions={
                <Box gap="32px">
                  <ButtonFlat variant="primary">Copy link</ButtonFlat>
                  <ButtonFlat variant="negative">Delete</ButtonFlat>
                </Box>
              }
              onClick={() => onClick?.({ file, from, time: hash.time })}
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

              {!hideFrom && (
                <TableCell>
                  <Box gap="14px" vAlign="center">
                    <Text size="sm" variant="black" truncate>
                      {from ?? 'Unkown'}
                    </Text>
                  </Box>
                </TableCell>
              )}

              <TableCell>
                <Box gap="14px" vAlign="center">
                  <Text size="sm" variant="black" whiteSpace="nowrap">
                    {hash.time ? DateTime.fromMillis(hash.time).toFormat('dd/LL/yyyy HH:mm') : 'Unkown'}
                  </Text>
                </Box>
              </TableCell>

              <TableCell>
                <Text size="sm" variant="black" align="right" whiteSpace="nowrap">
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
