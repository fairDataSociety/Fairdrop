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
import { Switch, Route, useLocation } from 'react-router-dom'
import UploadMainScreen from './screens/upload/main/UploadMainScreen'
import UploadFlowScreen from './screens/upload/flow/UploadFlowScreen'
import LoginScreen from './screens/auth/login/LoginScreen'

const App = () => {
  const [menuOpened, setMenuOpened] = useState(false)
  const location = useLocation()

  const handleToggleMenu = useCallback(() => {
    setMenuOpened(!menuOpened)
  }, [menuOpened])

  useEffect(() => {
    setMenuOpened(false)
  }, [location.pathname])

  return (
    <div className={c(styles.container)}>
      <Menu isShown={menuOpened} onToggleMenu={handleToggleMenu} />

      <Header />

      <div className={styles.content}>
        <Switch>
          <Route exact path="/login" component={LoginScreen} />
          <Route exact path="/upload" component={UploadMainScreen} />
          <Route exact path="/upload/flow" component={UploadFlowScreen} />
        </Switch>
      </div>
    </div>
  )
}

export default React.memo(App)
