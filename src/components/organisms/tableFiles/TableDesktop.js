import React from 'react'
import { DateTime } from 'luxon'
import { Table, TableBody, TableCell, TableHead, TableRow, SwitchFileIcon, Box, ButtonFlat, Text } from '../..'
import Utils from '../../../services/Utils'
import styled, { css } from 'styled-components/macro'
import { toast } from 'react-toastify'

const StyledTable = styled(Table)`
  padding: 0 24px 24px;
  word-break: break-word;
`

const StyledTableCell = styled(TableCell)`
  ${({ theme, hasNotification }) =>
    hasNotification &&
    css`
      &:before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 8px;
        height: 8px;
        border-radius: 4px;
        background-color: ${theme?.colors?.primary?.main};
      }
    `}
`

export const TABLE_MODE = {
  SENT: 0,
  RECEIVED: 1,
}

export const TableDesktop = ({ className, readMessages, messages, hideFrom, mode = TABLE_MODE.RECEIVED, onClick }) => {
  return (
    <StyledTable className={className}>
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
                {mode === TABLE_MODE.RECEIVED ? 'From' : 'Sent to'}
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
          const { hash = {}, from, to } = message
          const { file = {} } = hash

          const isMessageRead =
            mode === TABLE_MODE.RECEIVED ? readMessages.some((address) => address === hash?.address) : true
          const weight = isMessageRead ? '400' : '500'

          return (
            <TableRow
              key={message?.hash?.address}
              hoverActions={
                <Box as="span" gap="32px">
                  <ButtonFlat
                    variant="primary"
                    onClick={(evt) => {
                      evt.preventDefault()
                      evt.stopPropagation()
                      Utils.copyToClipboard(message?.getFileUrl?.()).then(() => {
                        toast.success('Link copied to your clipboard!')
                      })
                    }}
                  >
                    Copy link
                  </ButtonFlat>
                  <ButtonFlat variant="negative">Delete</ButtonFlat>
                </Box>
              }
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
            >
              <StyledTableCell hasNotification={!isMessageRead}>
                <Box gap="14px" vAlign="center">
                  <div>
                    <SwitchFileIcon className type={file.type} onClick={message?.saveAs ?? undefined} />
                  </div>
                  <Text size="sm" variant="black" weight={weight} truncate>
                    {file?.name ?? 'Unkown'}
                  </Text>
                </Box>
              </StyledTableCell>

              {!hideFrom && (
                <TableCell>
                  <Box gap="14px" vAlign="center">
                    <Text size="sm" variant="black" weight={weight} truncate>
                      {mode === TABLE_MODE.RECEIVED ? from ?? 'Unkown' : to ?? 'Unkown'}
                    </Text>
                  </Box>
                </TableCell>
              )}

              <TableCell>
                <Box gap="14px" vAlign="center">
                  <Text size="sm" variant="black" weight={weight} whiteSpace="nowrap">
                    {hash.time ? DateTime.fromMillis(hash.time).toFormat('dd/LL/yyyy HH:mm') : 'Unkown'}
                  </Text>
                </Box>
              </TableCell>

              <TableCell>
                <Text size="sm" variant="black" weight={weight} align="right" whiteSpace="nowrap">
                  {Utils.humanFileSize(file?.size) ?? 'Unkown'}
                </Text>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </StyledTable>
  )
}
