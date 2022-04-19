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

import React from 'react'
import { Box, Icon, ExternalLink, Text } from '../../../components'
import styled from 'styled-components/macro'

const Container = styled(Box)`
  box-sizing: border-box;
  padding: 48px 126px;
  height: 100%;
  overflow: auto;
`

const List = styled.ul`
  padding: 0;
  list-style-position: none;
  margin: 10px 0;
`

const Item = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;

  & + & {
    margin-top: 20px;
  }
`

const AboutFairdropScreen = () => {
  return (
    <Container gap="32px" direction="column">
      <Text size="xxl" weight="600" variant="black">
        Why Fairdrop?
      </Text>

      <Text size="m" variant="black">
        Fairdrop is a{' '}
        <Text as="span" size="m" variant="black" weight="600">
          free, decentralised, private
        </Text>{' '}
        and{' '}
        <Text as="span" size="m" variant="black" weight="600">
          secure
        </Text>{' '}
        file transfer dapp contributed to Fair Data Society by Datafund. It is the first blockchain product based on
        Fair Data Society principles. This means that Fairdrop completely respects your privacy and doesn&apos;t need or
        collect any personal data. It runs on the Ethereum network and uses Swarm&apos;s decentralised storage system
        for file storing and sending. This means:Fairdrop is a free, decentralised, private and secure file transfer
        dapp contributed to Fair Data Society by Datafund. It is the first blockchain product based on Fair Data Society
        principles. This means that Fairdrop completely respects your privacy and doesn&apos;t need or collect any
        personal data. It runs on the{' '}
        <Text as="span" size="m" variant="primary" weight="600">
          Ethereum
        </Text>{' '}
        network and uses{' '}
        <Text as="span" size="m" variant="primary" weight="600">
          Swarm&apos;s
        </Text>{' '}
        decentralised storage system for file storing and sending. This means:
      </Text>

      <List>
        <Item>
          <Icon size="ml" name="shield" />
          <Text as="span" size="xl" variant="black" weight="400">
            No central servers
          </Text>
        </Item>
        <Item>
          <Icon size="ml" name="shield" />
          <Text as="span" size="xl" variant="black" weight="400">
            No tracking
          </Text>
        </Item>
        <Item>
          <Icon size="ml" name="shield" />
          <Text as="span" size="xl" variant="black" weight="400">
            No backdoors
          </Text>
        </Item>
      </List>

      <Text size="m" variant="black">
        It also comes with a built-in 256-bit ECDSA signature algorithm and the ability to send files of up to 100 MB in
        size which should increase considerably in the mid-term future.
      </Text>

      <Text size="m" variant="black">
        The above design logic makes Fairdrop fundamentally different than any other centralised file transfer apps. The
        only similarity is the simplicity of the user experience. Whereas centralised solutions rely on personal data
        like an email address Fairdrop&apos;s unique feature is the built-in mailbox that each user has to create. These
        mailboxes serve as a sort of personal server where data can be stored, sent from or received to.
      </Text>

      <Text size="m" variant="black">
        They&apos;re the first step to creating a truly private personal storage. Think of it as the first step to your
        very own digital safe zone to which only you will have access to. Fairdrop also has a simple export/import
        function through which you can export your mailbox into a practical json file. You can then take this file and
        upload it on any other computer anywhere.
      </Text>

      <Text size="m" variant="black">
        Since Fairdrop is still in its testing phase and for now we can&apos;t guarantee data persistence. So be sure
        not to use it for any files that you can&apos;t afford to lose. You can also see Fairdrop&apos;s code on{' '}
        <ExternalLink rel="noopener noreferrer" target="_blank" href="https://github.com">
          GitHub
        </ExternalLink>{' '}
        or use the library to build your own application on top of the code. It is supported by major browsers like{' '}
        <Text as="span" size="m" variant="primary" weight="600">
          Firefox
        </Text>
        ,{' '}
        <Text as="span" size="m" variant="primary" weight="600">
          Chrome
        </Text>{' '}
        and{' '}
        <Text as="span" size="m" variant="primary" weight="600">
          Brave
        </Text>
        .
      </Text>
    </Container>
  )
}

export default React.memo(AboutFairdropScreen)
