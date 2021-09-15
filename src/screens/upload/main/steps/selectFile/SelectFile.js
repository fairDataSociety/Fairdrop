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
import { useFileManager } from '../../../../../hooks/fileManager/useFileManager'
import styles from './SelectFile.module.css'

const SelectFile = ({ ...rest }) => {
  const { setFile } = useFileManager()

  return (
    <div className={styles.container}>
      <div className={styles.instructions}>
        <h2>An easy and secure way to send your files.</h2>
        <h2>
          <span className={styles.noWrap}>No central server.&nbsp;</span>
          <span className={styles.noWrap}>No tracking.&nbsp;</span>
          <span className={styles.noWrap}>No backdoors.&nbsp;</span>
        </h2>

        <h3 className={styles.actions}>
          <img alt="click to select a file" className={styles.selectIcon} src="assets/images/fairdrop-select.svg" />{' '}
          <span className={styles.selectFileAction} onClick={() => {}}>
            select
          </span>{' '}
          or <img alt="drop file glyph" className={styles.dropIcon} src="assets/images/fairdrop-drop.svg" /> drop a file
        </h3>
      </div>
    </div>
  )
}

export default React.memo(SelectFile)
