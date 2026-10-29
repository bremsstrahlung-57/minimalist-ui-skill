import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import type { Family, Mode, TypeSetting, Voice } from '../lib/routes'
import { routeMeta } from '../lib/routes'
import {
  applyPreferences,
  clearSavedPreferences,
  families,
  preferencesFromDocument,
  readSavedPreferences,
  savePreferences,
} from '../lib/theme'
import type { Preferences } from '../lib/theme'

const indexDefaults: Preferences = {
  family: 'graphite',
  mode: 'light',
  voice: 'neutral',
  type: 'readable',
}

interface ThemeContextValue extends Preferences {
  familyLabel: string
  setFamily: (family: Family) => void
  setMode: (mode: Mode) => void
  setVoice: (voice: Voice) => void
  setType: (type: TypeSetting) => void
  resetToPageDefaults: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const defaultsForPath = (pathname: string): Preferences => {
  const meta = routeMeta(pathname)
  if (!meta) return indexDefaults
  return {
    family: meta.theme,
    mode: 'light',
    voice: meta.voice,
    type: meta.type,
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [preferences, setPreferences] = useState<Preferences>(() => preferencesFromDocument())
  const firstRoute = useRef(true)
  const previewParams = useRef(
    new URLSearchParams(window.location.search).has('theme') ||
      new URLSearchParams(window.location.search).has('voice') ||
      new URLSearchParams(window.location.search).has('type'),
  )
  const followsSystem = useRef(
    !readSavedPreferences().mode && !new URLSearchParams(window.location.search).has('mode'),
  )

  useEffect(() => {
    applyPreferences(preferences)
  }, [preferences])

  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false
      return
    }
    if (previewParams.current) return
    const saved = readSavedPreferences()
    const defaults = defaultsForPath(location.pathname)
    setPreferences((current) => ({
      ...current,
      family: saved.family ? current.family : defaults.family,
      voice: saved.voice ? current.voice : defaults.voice,
      type: saved.type ? current.type : defaults.type,
    }))
  }, [location.pathname])

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (!followsSystem.current) return
      setPreferences((current) => ({ ...current, mode: query.matches ? 'dark' : 'light' }))
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const setFamily = useCallback((family: Family) => {
    setPreferences((current) => ({ ...current, family }))
    savePreferences({ family })
  }, [])

  const setMode = useCallback((mode: Mode) => {
    followsSystem.current = false
    setPreferences((current) => ({ ...current, mode }))
    savePreferences({ mode })
  }, [])

  const setVoice = useCallback((voice: Voice) => {
    setPreferences((current) => ({ ...current, voice }))
    savePreferences({ voice })
  }, [])

  const setType = useCallback((type: TypeSetting) => {
    setPreferences((current) => ({ ...current, type }))
    savePreferences({ type })
  }, [])

  const resetToPageDefaults = useCallback(() => {
    const defaults = defaultsForPath(location.pathname)
    const system: Mode = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    clearSavedPreferences()
    followsSystem.current = true
    setPreferences({ ...defaults, mode: system })
  }, [location.pathname])

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...preferences,
      familyLabel: families[preferences.family].label,
      setFamily,
      setMode,
      setVoice,
      setType,
      resetToPageDefaults,
    }),
    [
      preferences,
      setFamily,
      setMode,
      setVoice,
      setType,
      resetToPageDefaults,
    ],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside ThemeProvider')
  return context
}
