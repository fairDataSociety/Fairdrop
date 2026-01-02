/**
 * ThemeProvider
 *
 * Manages dark/light theme with system preference detection.
 */

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

/**
 * Theme type
 */
type Theme = 'light' | 'dark' | 'system'

/**
 * Theme context value
 */
interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

/**
 * Theme context
 */
const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * Storage key
 */
const THEME_KEY = 'fairdrop_theme'

/**
 * Get system theme
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * ThemeProvider props
 */
interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
}

/**
 * ThemeProvider component
 */
export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
    return defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (theme === 'system') return getSystemTheme()
    return theme
  })

  // Update resolved theme when theme changes
  useEffect(() => {
    const resolved = theme === 'system' ? getSystemTheme() : theme
    setResolvedTheme(resolved)

    // Update document class
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      const resolved = getSystemTheme()
      setResolvedTheme(resolved)
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(resolved)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Set theme
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(THEME_KEY, newTheme)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * useTheme hook
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeProvider
