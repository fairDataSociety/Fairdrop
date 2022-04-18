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

import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import App from './App'
import './index.css'

import { Slide } from 'react-toastify'
import { version } from '../package.json'
import FileManagerProvider from './hooks/fileManager/useFileManager'
import SplashScreen from './screens/splash/SplashScreen'
import { SideMenuProvider } from './hooks/sideMenu/useSideMenu'
import { MailboxProvider } from './hooks/mailbox/useMailbox'
import { routes } from './config/routes'
import HonestInboxScreen from './screens/honestInbox/HonestInboxScreen'
import { ThemeProvider as SCThemeProvider } from 'styled-components'
import { theme } from './theme/theme'
import { GlobalCSS } from './theme/GlobalCSS'
import { Toast } from './components'

console.log(`Fairdrop Version ${version} - Created by FDS`)

//enables us to use subdirectory base urls with react router
let basename = window.location.href.match('bzz') !== null ? window.location.href.split('/').slice(3, 6).join('/') : ''

const Root = () => {
  const [appReady, setAppReady] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setAppReady(true)
    }, 3000)
  }, [])

  return (
    <SCThemeProvider theme={theme}>
      <GlobalCSS />
      <Router basename={`/${basename}`}>
        <MailboxProvider>
          <SideMenuProvider>
            <FileManagerProvider>
              {!appReady && <SplashScreen />}
              {appReady && (
                <Switch>
                  <Route exact path={routes.mailbox.honest} component={HonestInboxScreen} />
                  <Route component={App} />
                </Switch>
              )}
              <Toast
                position="bottom-center"
                closeButton={false}
                draggableDirection="y"
                transition={Slide}
                icon={false}
                theme="colored"
              />
            </FileManagerProvider>
          </SideMenuProvider>
        </MailboxProvider>
      </Router>
    </SCThemeProvider>
  )
}

ReactDOM.render(<Root />, document.getElementById('root'))
