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
