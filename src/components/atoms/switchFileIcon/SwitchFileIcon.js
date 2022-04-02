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

import React, { memo } from 'react'
import { Icon } from '../icon/Icon'

const mapTypeWithIcon = [
  {
    name: 'video',
    condition: ({ type }) => type.includes('video'),
  },
  {
    name: 'picture',
    condition: ({ type }) => type.includes('image'),
  },
  {
    name: 'music',
    condition: ({ type }) => type.includes('audio'),
  },
  {
    name: 'file',
    condition: ({ type }) => type.includes('file'),
  },
]

export const SwitchFileIcon = memo(function SwitchFileIcon({ type, ...rest }) {
  const iconConf = mapTypeWithIcon.find((item) => item.condition({ type }))

  if (!iconConf) {
    return null
  }

  return (
    <Icon {...rest} name={iconConf.name}>
      {type}
    </Icon>
  )
})
