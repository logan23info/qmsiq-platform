import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext({})

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('auditiq-theme') || 'dark')

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      root.classList.add('dark')
      root.classList.remove('light')
    }
    localStorage.setItem('auditiq-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
