import { GlobalCSS } from '../src/theme/GlobalCSS'
import { theme } from '../src/theme/theme'
import { ThemeProvider } from 'styled-components'
import { MemoryRouter } from 'react-router-dom'
import '../src/index.css'

const withTheme = (Story) => (
  <ThemeProvider theme={theme}>
    <GlobalCSS />
    <Story />
  </ThemeProvider>
)

const withRouter = (Story) => (
  <MemoryRouter initialEntries={['/']}>
    <Story />
  </MemoryRouter>
)

export const globalDecoratos = [withTheme, withRouter]
