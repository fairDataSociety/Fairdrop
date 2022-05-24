import { createGlobalStyle } from 'styled-components'

export const GlobalCSS = createGlobalStyle`
  * {
    font-family: ${({ theme }) => theme.font.fontFamily.default}
  }

  :root {
    --toastify-color-error: ${({ theme }) => theme?.colors?.negative?.main};
    --toastify-color-warning: ${({ theme }) => theme?.colors?.warning?.main};
    --toastify-color-success: ${({ theme }) => theme?.colors?.positive?.main};
  }
`
