import { ThemeProvider } from 'styled-components'
import { withThemesProvider } from 'storybook-addon-styled-component-theme'
import { addDecorator } from '@storybook/react'
import { theme } from '../src/theme/theme'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

addDecorator(withThemesProvider([theme]), ThemeProvider)
