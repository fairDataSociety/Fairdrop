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
import { BrowserRouter as Router } from 'react-router-dom'

// import 'bootstrap/dist/css/bootstrap.css'

import App from './App'
import './index.css'

import { version } from '../package.json'
import FileManagerProvider from './hooks/fileManager/useFileManager'
import { ThemeProvider } from './hooks/theme/useTheme'
import SplashScreen from './screens/splash/SplashScreen'

console.log(`Fairdrop Version ${version} - Created by FDS`)

//enables us to use subdirectory base urls with react router
let appRoot = window.location.href.match('bzz:') !== null ? window.location.href.split('/').slice(0, 5).join('/') : ''
let basename = window.location.href.match('bzz:') !== null ? window.location.href.split('/').slice(3, 5).join('/') : ''

const Root = () => {
  const [appReady, setAppReady] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setAppReady(true)
    }, 3000)
  }, [])

  return (
    <Router>
      <ThemeProvider>
        <FileManagerProvider>
          {!appReady && <SplashScreen />}
          {appReady && <App />}
        </FileManagerProvider>
      </ThemeProvider>
    </Router>
  )
}

ReactDOM.render(<Root />, document.getElementById('root'))
