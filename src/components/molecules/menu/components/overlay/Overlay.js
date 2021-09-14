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
import styles from './Overlay.module.css'
import { CSSTransition } from 'react-transition-group'

const Overlay = ({ isShown, onClick }) => {
  return (
    <CSSTransition in={isShown} timeout={200} unmountOnExit classNames={{ ...styles }}>
      <div className={styles.overlay} onClick={onClick} />
    </CSSTransition>
  )
}

export default React.memo(Overlay)
