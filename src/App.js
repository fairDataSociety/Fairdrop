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

import React, { useState, useCallback, useEffect } from 'react'
import styles from './App.module.css'
import c from 'classnames'
import Menu from './components/molecules/menu/Menu'
import Header from './components/molecules/header/Header'

const App = ({ ...rest }) => {
  const [menuOpened, setMenuOpened] = useState(false)

  const handleToggleMenu = useCallback(() => {
    setMenuOpened(!menuOpened)
  }, [menuOpened])

  useEffect(() => {
    document.getElementById('splash').classList.add('splash-hidden')
    document.getElementById('root').classList.add('root-fadein')
  }, [])

  return (
    <div className={c(styles.container)}>
      <Menu isShown={menuOpened} onToggleMenu={handleToggleMenu} />

      <Header />
    </div>
  )
}

export default React.memo(App)
