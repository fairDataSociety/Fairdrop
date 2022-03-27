import { createGlobalStyle } from 'styled-components'

export const GlobalCSS = createGlobalStyle`
  * {
    font-family: ${({ theme }) => theme.font.fontFamily.default}
  }
`
