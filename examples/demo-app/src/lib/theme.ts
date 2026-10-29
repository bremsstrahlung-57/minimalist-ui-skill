import type { Family, Mode, TypeSetting, Voice } from './routes'

export const families: Record<Family, { label: string; variants: Record<Mode, string> }> = {
  gruvbox: { label: 'Gruvbox', variants: { light: 'gruvbox', dark: 'gruvbox' } },
  everforest: { label: 'Everforest', variants: { light: 'everforest', dark: 'everforest' } },
  tokyo: { label: 'Tokyo Night / Day', variants: { light: 'tokyo-day', dark: 'tokyo-night' } },
  catppuccin: { label: 'Catppuccin', variants: { light: 'catppuccin-latte', dark: 'catppuccin-mocha' } },
  rosepine: { label: 'Rose Pine', variants: { light: 'rose-pine-dawn', dark: 'rose-pine' } },
  nord: { label: 'Nord', variants: { light: 'nord-snow', dark: 'nord' } },
  graphite: { label: 'Graphite (derived)', variants: { light: 'graphite', dark: 'graphite' } },
  atelier: { label: 'Atelier (derived)', variants: { light: 'atelier', dark: 'atelier' } },
}

export const voices: Voice[] = ['nerd', 'neutral', 'professional']
export const types: TypeSetting[] = ['mono', 'readable']

export interface Preferences {
  family: Family
  mode: Mode
  voice: Voice
  type: TypeSetting
}

const STORAGE_KEY = 'textured-minimal-theme'

export const isFamily = (value: unknown): value is Family =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(families, value)

export const isMode = (value: unknown): value is Mode => value === 'light' || value === 'dark'
export const isVoice = (value: unknown): value is Voice => voices.includes(value as Voice)
export const isType = (value: unknown): value is TypeSetting => types.includes(value as TypeSetting)

export function readSavedPreferences(): Partial<Preferences> {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Record<string, unknown>
    if (!value || typeof value !== 'object') return {}
    const saved: Partial<Preferences> = {}
    if (isFamily(value.family)) saved.family = value.family
    if (isMode(value.mode)) saved.mode = value.mode
    if (isVoice(value.voice)) saved.voice = value.voice
    if (isType(value.type)) saved.type = value.type
    return saved
  } catch {
    return {}
  }
}

export function savePreferences(patch: Partial<Preferences>) {
  try {
    const current = readSavedPreferences()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }))
  } catch {
    /* A blocked storage API must not break the display controls. */
  }
}

export function clearSavedPreferences() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* no-op */
  }
}

export function resolveVariant(family: Family, mode: Mode) {
  return families[family].variants[mode]
}

export function familyFromVariant(variant: string, mode: Mode): Family | undefined {
  return (Object.keys(families) as Family[]).find(
    (family) => families[family].variants[mode] === variant,
  )
}

export function preferencesFromDocument(): Preferences {
  const root = document.documentElement
  const mode: Mode = root.dataset.mode === 'dark' ? 'dark' : 'light'
  const family = isFamily(root.dataset.family)
    ? root.dataset.family
    : familyFromVariant(root.dataset.theme || '', mode) || 'gruvbox'
  return {
    family,
    mode,
    voice: isVoice(root.dataset.voice) ? root.dataset.voice : 'neutral',
    type: isType(root.dataset.type) ? root.dataset.type : 'readable',
  }
}

export function applyPreferences(preferences: Preferences) {
  const root = document.documentElement
  root.dataset.theme = resolveVariant(preferences.family, preferences.mode)
  root.dataset.mode = preferences.mode
  root.dataset.family = preferences.family
  root.dataset.voice = preferences.voice
  root.dataset.type = preferences.type
}
