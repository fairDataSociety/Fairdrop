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
import styles from './AboutFairdropScreen.module.css'

const AboutFairdropScreen = () => {
  return (
    <div className={styles.container}>
      <Logo className={styles.logo} />

      <Text className={styles.p}>
        Fairdrop is a free, decentralised, private and secure file transfer dapp contributed to Fair Data Society by
        Datafund. It is the first blockchain product based on Fair Data Society principles. This means that Fairdrop
        completely respects your privacy and doesn’t need or collect any personal data. It runs on the Ethereum network
        and uses Swarm’s decentralised storage system for file storing and sending. This means:Fairdrop is a free,
        decentralised, private and secure file transfer dapp contributed to Fair Data Society by Datafund. It is the
        first blockchain product based on Fair Data Society principles. This means that Fairdrop completely respects
        your privacy and doesn’t need or collect any personal data. It runs on the Ethereum network and uses Swarm’s
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

      <Text className={styles.p}>
        The above design logic makes Fairdrop fundamentally different than any other centralised file transfer apps. The
        only similarity is the simplicity of the user experience. Whereas centralised solutions rely on personal data
        like an email address Fairdrop’s unique feature is the built-in mailbox that each user has to create. These
        mailboxes serve as a sort of personal server where data can be stored, sent from or received to.
      </Text>

      <Text className={styles.p}>
        They’re the first step to creating a truly private personal storage. Think of it as the first step to your very
        own digital safe zone to which only you will have access to. Fairdrop also has a simple export/import function
        through which you can export your mailbox into a practical json file. You can then take this file and upload it
        on any other computer anywhere.
      </Text>

      <Text className={styles.p}>
        Since Fairdrop is still in its testing phase and for now we can’t guarantee data persistence. So be sure not to
        use it for any files that you can’t afford to lose. You can also see Fairdrop’s code on{' '}
        <a className={styles.link} rel="noopener noreferrer" target="_blank" href="https://github.com">
          GitHub
        </a>{' '}
        or use the library to build your own application on top of the code. It is supported by major browsers like
        Firefox, Chrome and Brave.
      </Text>
    </div>
  )
}

export default React.memo(AboutFairdropScreen)
