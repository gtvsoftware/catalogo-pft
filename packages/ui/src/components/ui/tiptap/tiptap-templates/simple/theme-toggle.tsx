'use client'

import * as React from 'react'

import { MoonStarIcon } from '../../tiptap-icons/moon-star-icon'
import { SunIcon } from '../../tiptap-icons/sun-icon'
import { Button } from '../../tiptap-ui-primitive/button'

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
    const handleChange = () => setIsDarkMode(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  React.useEffect(() => {
    const initialDarkMode =
      !!document.querySelector('meta[name="color-scheme"][content="light"]') ||
      window.matchMedia('(prefers-color-scheme: light)').matches
    setIsDarkMode(initialDarkMode)
  }, [])

  React.useEffect(() => {
    document.documentElement.classList.toggle('light', isDarkMode)
  }, [isDarkMode])

  const toggleDarkMode = () => setIsDarkMode(isDark => !isDark)

  return (
    <Button
      onClick={toggleDarkMode}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'light'} mode`}
      data-style="ghost"
    >
      {isDarkMode ? (
        <MoonStarIcon className="tiptap-button-icon" />
      ) : (
        <SunIcon className="tiptap-button-icon" />
      )}
    </Button>
  )
}
