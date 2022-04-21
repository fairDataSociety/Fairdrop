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
import styled from 'styled-components/macro'
import { Box, ExternalLink, Text } from '../../../components'
import { DEVICE_SIZE } from '../../../theme/theme'

const Container = styled(Box)`
  box-sizing: border-box;
  padding: 48px 126px;
  height: 100%;
  overflow: auto;

  @media (max-width: ${DEVICE_SIZE.TABLET}) {
    padding: 48px 24px;
  }
`

const Content = styled(Box)`
  margin-top: 16px;
`

const Section = styled(Box)``

const SectionHeadline = styled(Text)`
  &:before {
    content: '';
    display: block;
    width: 48px;
    height: 4px;
    margin-bottom: 16px;
    background: ${({ theme }) => theme.colors.primary.main};
  }
`

const AboutFAQsScreen = () => {
  return (
    <Container gap="32px" direction="column">
      <Text size="xxl" weight="600" variant="black">
        How can we help?
      </Text>

      <Text size="m" variant="black">
        Here you can find the answers you&apos;re looking for. In case you don&apos;t find it here, please contact us
        and we&apos;ll be happy to help
      </Text>

      <Content gap="64px" direction="column">
        <Section gap="16px" direction="column">
          <SectionHeadline size="ml" variant="black" weight="500">
            What are Fair Data Principles
          </SectionHeadline>
          <Text size="m" variant="black">
            Fair Data Society principles are a set of eight principles. They provide guidelines for large data systems
            on how to respect the privacy and agency of individuals.
          </Text>
        </Section>

        <Section gap="16px" direction="column">
          <SectionHeadline size="ml" variant="black" weight="500">
            How does it work?
          </SectionHeadline>
          <Text size="m" variant="black">
            Fairdrop fundamentally different than any other centralised file transfer apps. The only similarity is the
            simplicity of the user experience. It doesn&apos;t run on any central server and it doesn&apos;t need or
            collect any personal data to function. It&apos;s private and secure.
          </Text>

          <Text size="m" variant="black">
            First, you need to upload a file and create a mailbox. The mailbox, simply, acts as a server from which the
            file is sent. After you&apos;ve created a mailbox you must choose a recipient. The recipient can only be
            another Fairdrop mailbox! After you&apos;ve selected the receiving mailbox hit “Create mailbox and Send”.
            Wait until the file is uploaded and hit “Encrypt and Send”.
          </Text>
        </Section>

        <Section gap="16px" direction="column">
          <SectionHeadline size="ml" variant="black" weight="500">
            What is a mailbox and why do I need it?
          </SectionHeadline>
          <Text size="m" variant="black">
            A mailbox acts as a sort of server and a point from which you send and receive files. Mailboxes are
            Fairdrop&apos;s defining feature but they are also a lot more. They&apos;re the first step to creating a
            truly private personal storage to which only the individual will have access. Think of it as the first step
            to your very own digital safe zone. And through the simple export/import function you&apos;ll be able to
            take your private storage anywhere.
          </Text>
        </Section>

        <Section gap="16px" direction="column">
          <SectionHeadline size="ml" variant="black" weight="500">
            Is Fairdrop free to use?
          </SectionHeadline>
          <Text size="m" variant="black">
            Right now Fairdrop is free to use since it still runs on testnet. In the future it will roll out to the main
            Ethereum network which will cost ether. The pricing we&apos;ll be added at a later stage of development but
            it will remain non-profit, meaning you&apos;ll only have to cover the network costs. You can also donate on
            Giveth to keep Fairdrop available to everyone.
          </Text>
        </Section>

        <Section gap="16px" direction="column">
          <SectionHeadline size="ml" variant="black" weight="500">
            Can I use Fairdrop in any browser?
          </SectionHeadline>
          <Text size="m" variant="black">
            Fairdrop is compatible with Firefox, Chrome, Brave… You can also export and import your mailboxes and take
            your files safely with you anywhere you go. Just click the left-side menu, choose “Settings” and hit
            “Export”. Unzip the file and open Fairdrop in a different browser. Go to “Settings” again and click
            “Import”.
          </Text>
        </Section>

        <Section gap="16px" direction="column">
          <SectionHeadline size="ml" variant="black" weight="500">
            Is Fairdrop open-source?
          </SectionHeadline>
          <Text size="m" variant="black">
            Yes, you can check out our open source libraries on{' '}
            <ExternalLink href="https://github.com/FairDataSociety">Github</ExternalLink>.
          </Text>
        </Section>

        <Section gap="16px" direction="column">
          <SectionHeadline size="ml" variant="black" weight="500">
            I found a bug, where can I report it?
          </SectionHeadline>
          <Text size="m" variant="black">
            You can report it by following this{' '}
            <ExternalLink href="https://github.com/fairDataSociety/Fairdrop/issues">link</ExternalLink>.
          </Text>
        </Section>
      </Content>
    </Container>
  )
}

export default React.memo(AboutFAQsScreen)
