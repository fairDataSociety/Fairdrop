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

import React, { useContext, useState } from 'react'
import Background from '../../components/molecules/background/Background'
import { colors } from '../../config/colors'

const ThemeContext = React.createContext()

export const ThemeProvider = ({ children }) => {
  const [background, setBackground] = useState(colors.red)
  const [variant, setVariant] = useState('white')

  return (
    <ThemeContext.Provider value={{ variant, setVariant, background, setBackground }}>
      <Background color={background} /> {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  return ctx
}
