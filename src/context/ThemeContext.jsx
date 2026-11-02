import React, { createContext, useContext, useEffect, useState } from 'react'
const ThemeContext = createContext(null)
export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('campushub-theme') === 'dark')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('campushub-theme', dark ? 'dark' : 'light')
  }, [dark])
  return <ThemeContext.Provider value={{ dark, setDark, toggleTheme: () => setDark(v => !v) }}>{children}</ThemeContext.Provider>
}
export const useTheme = () => useContext(ThemeContext)
