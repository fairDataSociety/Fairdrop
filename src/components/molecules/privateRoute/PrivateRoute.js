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

import React, { useMemo } from 'react'
import { Route, Redirect } from 'react-router-dom'
import { routes } from '../../../config/routes'
import { useMailbox } from '../../../hooks/mailbox/useMailbox'

const PrivateRoute = ({ component: Component, componentProps = {}, ...rest }) => {
  const [{ mailbox }] = useMailbox()

  const isLogged = useMemo(() => {
    return !!mailbox?.subdomain ?? false
  }, [mailbox])

  return (
    <Route
      {...rest}
      render={(props) => {
        const computedProps = { ...props, ...componentProps }
        return isLogged ? (
          <Component {...computedProps} />
        ) : (
          <Redirect
            to={{
              pathname: routes.login,
              state: { from: props.location },
            }}
          />
        )
      }}
    />
  )
}

PrivateRoute.propTypes = {}

export default React.memo(PrivateRoute)
