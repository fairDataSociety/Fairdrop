// Copyright 2019 The FairDataSociety Authors
// This file is part of the FairDataSociety library.
//
// The FairDataSociety library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The FairDataSociety library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the FairDataSociety library. If not, see <http://www.gnu.org/licenses/>.

import { transparentize } from 'polished'
import React, { memo, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { toast } from 'react-toastify'
import styled, { css } from 'styled-components/macro'
import { routes } from '../../../../../config/routes'
import { useMailbox } from '../../../../../hooks/mailbox/useMailbox'
import Utils from '../../../../../services/Utils'
import { DEVICE_SIZE } from '../../../../../theme/theme'
import { Box } from '../../../../atoms/box/Box'
import { Collapsible } from '../../../../atoms/collapsible/Collapsible'
import Text from '../../../../atoms/text/Text'

const Container = styled(Collapsible)`
  position: absolute;
  top: 64px;
  right: 18px;
  z-index: 1;
  overflow: hidden;
  border-radius: 4px;
  width: 280px;

  ${({ expanded }) =>
    expanded &&
    css`
      box-shadow: 0px 4px 8px 4px rgba(0, 0, 0, 0.15);
    `}

  @media (max-width: ${DEVICE_SIZE.MOBILE_L}) {
    top: 48px;
    width: 100%;
    left: 0;
    right: 0;
    border-radius: 0;
    box-shadow: none;
  }
`

const Options = styled.ul`
  width: 100%;
  padding: 8px 0;
  box-sizing: border-box;
  list-style: none;
`

const Option = styled.li`
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background-color 0.3s ease;

  ${({ theme, hasLink }) =>
    hasLink &&
    css`
      cursor: pointer;
      &:not([disabled]):hover,
      &:not([disabled]):focus,
      &:not([disabled]):active {
        background-color: ${transparentize(0.8, theme.colors.ntrl_light.main)};
      }
    `}
`

const Separator = styled.li`
  margin: 8px 0;
  height: 0;
  border-bottom: solid 1px ${({ theme }) => theme.colors.ntrl_light.main};
`

const CopyLink = styled.a`
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.primary.main};
  font-weight: 500;
  font-family: 14px;
  cursor: pointer;
  transition: opacity 0.3s ease;

  &:hover,
  &:active,
  &:focus {
    opacity: 0.6;
  }
`

const Address = styled(Text)`
  width: 100%;
  display: block;
`

const ProfileBox = styled(Box)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`

export const Profile = memo(({ onClick, ...rest }) => {
  const [{ mailbox }, { exportMailboxes }] = useMailbox()
  const history = useHistory()

  const handleExportClick = (evt) => {
    evt.preventDefault()
    exportMailboxes?.()
    onClick?.()
  }

  const handleLogoutClick = (evt) => {
    evt.preventDefault()
    onClick?.()
  }

  const handleEditAvatarClick = (evt) => {
    evt.preventDefault()
    history.push(routes.mailbox.avatar)
  }

  const handleCopyAddressClick = async (evt) => {
    evt.preventDefault()
    await Utils.copyToClipboard(mailbox.address)
    toast.success('Copied to clipboard!')
  }

  const address = useMemo(() => {
    return `${mailbox?.address?.slice(0, 9) ?? ''}...${mailbox?.address?.slice(9, 18) ?? ''}`
  }, [mailbox?.address])

  return (
    <Container direction="column" {...rest}>
      <Options>
        <Option>
          <ProfileBox as="span" direction="column" gap="4px">
            <Text size="sm" variant="black" weight="500">
              {mailbox.subdomain}
            </Text>

            <Address size="sm" variant="gray" weight="400" truncate>
              {address}
            </Address>
          </ProfileBox>

          <CopyLink as="span" size="sm" variant="primary" weight="500" href="" onClick={handleCopyAddressClick}>
            Copy link
          </CopyLink>
        </Option>

        <Separator />

        <Option hasLink onClick={handleEditAvatarClick}>
          <Text size="sm" variant="black" weight="400">
            Edit avatar
          </Text>
        </Option>

        <Option hasLink onClick={handleExportClick}>
          <Box direction="column" fitWidth gap="4px">
            <Text as="span" size="sm" variant="black" weight="400">
              Export mailbox
            </Text>

            <Text as="span" size="s" variant="gray" weight="400">
              Take your files anywhere you need, you own them
            </Text>
          </Box>
        </Option>

        <Separator />

        <Option hasLink onClick={handleLogoutClick}>
          <Text size="sm" variant="black" weight="400">
            Log out
          </Text>
        </Option>
      </Options>
    </Container>
  )
})

Profile.displayName = 'Profile'
