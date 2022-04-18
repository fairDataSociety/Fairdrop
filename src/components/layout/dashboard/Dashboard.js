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

import React, { useEffect } from 'react'
import { Route } from 'react-router-dom'
import { colors } from '../../../config/colors'
import { routes } from '../../../config/routes'
import { useTheme } from '../../../hooks/theme/useTheme'
import DashboardConsentsScreen from '../../../screens/auth/dashboard/consents/DashboardConsentsScreen'
import DashboardReceivedScreen from '../../../screens/auth/dashboard/received/DashboardReceivedScreen'
import DashboardSentScreen from '../../../screens/auth/dashboard/sent/DashboardSentScreen'
import DashboardStoredScreen from '../../../screens/auth/dashboard/stored/DashboardStoredScreen'
import DashboardHonestScreen from '../../../screens/auth/dashboard/honest/DashboardHonestScreen'
import ReactTooltip from 'react-tooltip'
import { Sidebar } from '../../'
import { useMailbox } from '../../../hooks/mailbox/useMailbox'
import { generatePath } from 'react-router-dom'

import { Container, Content, Tooltip } from './Components'

const Dashboard = () => {
  const { setVariant, setBackground } = useTheme()
  const [{ mailbox }] = useMailbox()

  useEffect(() => {
    setVariant('black')
    setBackground(colors.white)
  }, [])

  return (
    <Container>
      <Sidebar
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
            path: generatePath(routes.mailbox.honest, { ens: mailbox.subdomain }),
          },
          {
            label: 'My honest inbox V2',
            path: routes.mailbox.mailboxHones,
          },
        ]}
      />

      <Content>
        <Route exact path={routes.mailbox.received} component={DashboardReceivedScreen} />
        <Route exact path={routes.mailbox.sent} component={DashboardSentScreen} />
        <Route exact path={routes.mailbox.stored} component={DashboardStoredScreen} />
        <Route exact path={routes.mailbox.consents} component={DashboardConsentsScreen} />
        <Route exact path={routes.mailbox.mailboxHones} component={DashboardHonestScreen} />
      </Content>

      <Tooltip>
        <ReactTooltip />
      </Tooltip>
    </Container>
  )
}

export default React.memo(Dashboard)
