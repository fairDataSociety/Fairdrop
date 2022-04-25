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
import { Route } from 'react-router-dom'
import { routes } from '../../../config/routes'
import DashboardReceivedScreen from '../../../screens/auth/dashboard/received/DashboardReceivedScreen'
import DashboardSentScreen from '../../../screens/auth/dashboard/sent/DashboardSentScreen'
import DashboardHonestScreen from '../../../screens/auth/dashboard/honest/DashboardHonestScreen'
import ReactTooltip from 'react-tooltip'
import { Sidebar } from '../../'
import { Container, Content, Tooltip } from './Components'

const Dashboard = () => {
  return (
    <Container>
      <Sidebar
        headline="My files"
        items={[
          {
            label: 'Sent',
            path: routes.mailbox.sent,
          },
          {
            label: 'Received',
            path: routes.mailbox.received,
          },
          {
            label: 'My honest inbox',
            path: routes.mailbox.mailboxHones,
          },
        ]}
      />

      <Content>
        <Route exact path={routes.mailbox.received} component={DashboardReceivedScreen} />
        <Route exact path={routes.mailbox.sent} component={DashboardSentScreen} />
        <Route exact path={routes.mailbox.mailboxHones} component={DashboardHonestScreen} />
      </Content>

      <Tooltip>
        <ReactTooltip />
      </Tooltip>
    </Container>
  )
}

export default React.memo(Dashboard)
