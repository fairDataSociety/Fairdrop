import { GlobalCSS } from '../src/theme/GlobalCSS'
import { theme } from '../src/theme/theme'
import { ThemeProvider } from 'styled-components'
import '../src/index.css'

const withTheme = (Story) => (
  <ThemeProvider theme={theme}>
    <GlobalCSS />
    <Story />
  </ThemeProvider>
)

export const globalDecoratos = [withTheme]
