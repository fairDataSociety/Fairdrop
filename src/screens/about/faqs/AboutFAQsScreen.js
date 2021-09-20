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
import Logo from '../../../components/atoms/logo/Logo'
import Text from '../../../components/atoms/text/Text'
import styles from './AboutFAQsScreen.module.css'

const AboutFAQsScreen = () => {
  return (
    <div className={styles.container}>
      <Logo className={styles.logo} />

      <Text className={styles.headline} size="ml" element="h3" weight="500">
        FAQs
      </Text>

      <Text className={styles.p}>
        Fairdrop is a decentralised, private and secure file transfer dapp. Fairdrop is a free, decentralised, private
        and secure file transfer dapp contributed to Fair Data Society by Datafund. It is the first blockchain product
        based on Fair Data Society principles. This means that Fairdrop respects the need for privacy and doesn’t
        collect any personal data. It runs using the{' '}
        <a className={styles.link} rel="noopener noreferrer" target="_blank" href="https://www.ethereum.org/">
          Ethereum
        </a>{' '}
        blockchain and uses{' '}
        <a
          className={styles.link}
          rel="noopener noreferrer"
          target="_blank"
          href="https://swarm-gateways.net/bzz:/theswarm.eth/"
        >
          Swarm’s
        </a>{' '}
        decentralised storage system for file storing and sending. This means:Fairdrop is a decentralised, private and
        secure file transfer dapp. Fairdrop is a free, decentralised, private and secure file transfer dapp contributed
        to Fair Data Society by Datafund. It is the first blockchain product based on Fair Data Society principles. This
        means that Fairdrop respects the need for privacy and doesn’t collect any personal data. It runs using the{' '}
        <a className={styles.link} rel="noopener noreferrer" target="_blank" href="https://www.ethereum.org/">
          Ethereum
        </a>{' '}
        blockchain and uses{' '}
        <a
          className={styles.link}
          rel="noopener noreferrer"
          target="_blank"
          href="https://swarm-gateways.net/bzz:/theswarm.eth/"
        >
          Swarm’s
        </a>{' '}
        decentralised storage system for file storing and sending. This means:
      </Text>

      <ul className={styles.list}>
        <li>
          <Text element="span">No central servers.</Text>
        </li>
        <li>
          <Text element="span">No tracking.</Text>
        </li>
        <li>
          <Text element="span">No backdoors.</Text>
        </li>
      </ul>

      <Text className={styles.p}>
        It also comes with a built-in 256-bit ECDSA signature algorithm and the ability to send files of up to 100 MB in
        size which should increase considerably in the mid-term future.
      </Text>

      <Text className={styles.headline} size="ml" element="h3" weight="500">
        What are Fair Data Principles
      </Text>

      <Text className={styles.p}>
        Fair Data Society principles are a set of eight principles. They provide guidelines for large data systems on
        how to respect the privacy and agency of individuals.
      </Text>

      <Text className={styles.headline} size="ml" element="h3" weight="500">
        How does it work?
      </Text>

      <Text className={styles.p}>
        Fairdrop fundamentally different than any other centralised file transfer apps. The only similarity is the
        simplicity of the user experience. It doesn’t run on any central server and it doesn’t need or collect any
        personal data to function. It’s private and secure.
      </Text>

      <Text className={styles.p}>
        First, you need to upload a file and create a mailbox. The mailbox, simply, acts as a server from which the file
        is sent. After you’ve created a mailbox you must choose a recipient. The recipient can only be another Fairdrop
        mailbox! After you’ve selected the receiving mailbox hit “Create mailbox and Send”. Wait until the file is
        uploaded and hit “Encrypt and Send”.
      </Text>

      <Text className={styles.headline} size="ml" element="h3" weight="500">
        What is a mailbox and why do I need it?
      </Text>

      <Text className={styles.p}>
        A mailbox acts as a sort of server and a point from which you send and receive files. Mailboxes are Fairdrop’s
        defining feature but they are also a lot more. They’re the first step to creating a truly private personal
        storage to which only the individual will have access. Think of it as the first step to your very own digital
        safe zone. And through the simple export/import function you’ll be able to take your private storage anywhere.
      </Text>

      <Text className={styles.headline} size="ml" element="h3" weight="500">
        Is Fairdrop free to use?
      </Text>

      <Text className={styles.p}>
        Right now Fairdrop is free to use since it still runs on testnet. In the future it will roll out to the main
        Ethereum network which will cost ether. The pricing we’ll be added at a later stage of development but it will
        remain non-profit, meaning you’ll only have to cover the network costs. You can also donate on Giveth to keep
        Fairdrop available to everyone.
      </Text>

      <Text className={styles.headline} size="ml" element="h3" weight="500">
        Can I use Fairdrop in any browser?
      </Text>

      <Text className={styles.p}>
        Fairdrop is compatible with Firefox, Chrome, Brave… You can also export and import your mailboxes and take your
        files safely with you anywhere you go. Just click the left-side menu, choose “Settings” and hit “Export”. Unzip
        the file and open Fairdrop in a different browser. Go to “Settings” again and click “Import”.
      </Text>

      <Text className={styles.headline} size="ml" element="h3" weight="500">
        Is Fairdrop open-source?
      </Text>

      <Text className={styles.p}>
        Yes, you can check out our open source libraries on{' '}
        <a className={styles.link} rel="noopener noreferrer" target="_blank" href="https://github.com/FairDataSociety">
          GitHub
        </a>
        .
      </Text>

      <Text className={styles.headline} size="ml" element="h3" weight="500">
        I found a bug, where can I report it?
      </Text>

      <Text className={styles.p}>
        You can report it by following this{' '}
        <a
          className={styles.link}
          rel="noopener noreferrer"
          target="_blank"
          href="https://github.com/fairDataSociety/Fairdrop/issues"
        >
          link
        </a>
      </Text>
    </div>
  )
}

export default React.memo(AboutFAQsScreen)
