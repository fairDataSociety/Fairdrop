/**
 * Application Entry Point
 *
 * Renders the React application with providers.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './app/providers'
import App from './app/App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="system">
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
