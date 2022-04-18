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
import 'react-toastify/dist/ReactToastify.css'
import styles from './App.module.css'
import c from 'classnames'
import Header from './components/molecules/header/Header'
import { Switch, Route } from 'react-router-dom'
import UploadFlowScreen from './screens/upload/flow/UploadFlowScreen'
import LoginScreen from './screens/auth/login/LoginScreen'
import { routes } from './config/routes'
import RegisterScreen from './screens/auth/register/RegisterScreen'
import PrivateRoute from './components/molecules/privateRoute/PrivateRoute'
import SettingsExportScreen from './screens/settings/export/SettingsExportScreen'
import SettingsImportScreen from './screens/settings/import/SettingsImportScreen'
import ProductDisclaimer from './disclaimers/product/ProductDisclaimer'
import ReportingDisclaimer from './disclaimers/reporting/ReportingDisclaimer'
import Dashboard from './components/layout/dashboard/Dashboard'
import DownloadScreen from './screens/download/DownloadScreen'
import { HomeScreen } from './screens/home/HomeScreen'

const App = () => {
  return (
    <div className={c(styles.container)}>
      <Header />

      <div className={styles.content}>
        <Switch>
          <Route exact path={routes.login} component={LoginScreen} />
          <Route exact path={routes.register} component={RegisterScreen} />
          <Route exact path={routes.upload.home} component={HomeScreen} />
          <Route exact path={routes.upload.flow} component={UploadFlowScreen} />

          <Route exact path={routes.settings.export} component={SettingsExportScreen} />
          <Route exact path={routes.settings.import} component={SettingsImportScreen} />

          <PrivateRoute path={routes.mailbox.dashboard} component={Dashboard} />

          <Route path={routes.downloads.multiple} component={DownloadScreen} />
          <Route path={routes.downloads.single} component={DownloadScreen} />
        </Switch>
      </div>

      <ProductDisclaimer />

      <ReportingDisclaimer />
    </div>
  )
}

export default React.memo(App)
