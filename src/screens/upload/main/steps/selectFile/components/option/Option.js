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

import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import styles from './Option.module.css'
import c from 'classnames'

const Option = ({ headline, description, type, onFileDrop }) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      onFileDrop?.(type, acceptedFiles)
    },
    [onFileDrop],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div className={c(styles.container, isDragActive && styles.active)} {...getRootProps()}>
      <div className={styles.wrapper}>
        <h2>{headline}</h2>
        <span>{description}</span>
      </div>

      <input {...getInputProps()} />
    </div>
  )
}

export default React.memo(Option)
