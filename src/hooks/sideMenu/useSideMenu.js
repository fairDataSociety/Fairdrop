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

import React, { useContext, useState, useCallback, useMemo } from 'react'
import SlideMenu from '../../components/molecules/slideMenu/SlideMenu'

const SideMenuContext = React.createContext()
const { Provider } = SideMenuContext

export const SideMenuProvider = ({ target, children }) => {
  const [sideMenuOpened, setSideMenuOpened] = useState(false)
  const [sideMenuParams, setSideMenuParams] = useState({})

  const showSideMenu = useCallback((params) => {
    if (!params.Component) {
      return
    }

    setSideMenuParams(params)
    setSideMenuOpened(true)
  }, [])

  const hideSideMenu = useCallback(() => {
    setSideMenuOpened(false)
  }, [])

  const handleSideMenuOpened = useCallback(() => {
    // Perform any operation
  }, [])

  const hadleSideMenuClosed = useCallback(() => {
    setSideMenuParams({})
  }, [])

  const portalTarget = target ? document.querySelector(target) : document.body
  const ChildrenComponent = useMemo(() => {
    return sideMenuParams.Component ?? null
  }, [sideMenuParams])

  return (
    <Provider value={{ showSideMenu, hideSideMenu }}>
      {children}
      <SlideMenu
        shown={sideMenuOpened}
        target={portalTarget}
        showBack={sideMenuParams?.showBack ?? true}
        onEnter={handleSideMenuOpened}
        onExited={hadleSideMenuClosed}
      >
        {ChildrenComponent}
      </SlideMenu>
    </Provider>
  )
}

export const useSideMenu = () => {
  const ctx = useContext(SideMenuContext)
  if (!ctx) {
    throw Error('The `useSideMenu` hook must be called from a descendent of the `SideMenuProvider`.')
  }
  return ctx
}
