/**
 * Application Entry Point
 *
 * Renders the React application with providers.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app/App'
import './styles/globals.css'
import './styles/original.css'
import './styles/DMist.css'
import './styles/DDrop.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

// Hide splash screen and show app after React renders
requestAnimationFrame(() => {
  const root = document.getElementById('root')
  const splash = document.getElementById('splash')

  if (root) {
    root.classList.add('root-fadein')
  }

  if (splash) {
    splash.classList.add('splash-fadeout')
    setTimeout(() => {
      splash.classList.add('splash-hidden')
    }, 200)
  }
})
