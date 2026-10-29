import { useRef, useState } from 'react'
import type { Family, Mode, TypeSetting, Voice } from '../lib/routes'
import { families } from '../lib/theme'
import { useTheme } from './ThemeProvider'

export function DisplaySettings() {
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const [resetNote, setResetNote] = useState('')
  const {
    family,
    mode,
    voice,
    type,
    familyLabel,
    setFamily,
    setMode,
    setVoice,
    setType,
    resetToPageDefaults,
  } = useTheme()

  const open = () => {
    setResetNote('')
    dialog.current?.showModal()
  }

  const close = () => dialog.current?.close()

  return (
    <>
      <button
        ref={opener}
        type="button"
        className="display-toggle"
        onClick={open}
        aria-haspopup="dialog"
      >
        <span aria-hidden="true" className="display-toggle__mark">Aa</span>
        Display
      </button>
      <dialog
        ref={dialog}
        className="display-dialog dialog-surface"
        aria-labelledby="display-title"
        onClose={() => opener.current?.focus()}
      >
        <div className="display-dialog__head">
          <div>
            <p className="kicker">Browser setting</p>
            <h2 id="display-title">Display</h2>
          </div>
          <button type="button" className="button button--sm" onClick={close}>
            Close
          </button>
        </div>
        <p className="meta">
          Theme colours, voice, body type and motion preference. Saved to this browser only.
          The current demo is <strong>{familyLabel}</strong>, {voice}, {type}.
        </p>

        <form className="display-form" onSubmit={(event) => event.preventDefault()}>
          <fieldset className="display-fieldset">
            <legend>Appearance</legend>
            <div className="display-segment">
              {(['light', 'dark'] as Mode[]).map((option) => (
                <label key={option} className="display-radio">
                  <input
                    type="radio"
                    name="mode"
                    value={option}
                    checked={mode === option}
                    onChange={() => setMode(option)}
                  />
                  <span>{option === 'light' ? 'Light' : 'Dark'}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="field">
            <label htmlFor="theme-family">Theme family</label>
            <select
              id="theme-family"
              value={family}
              onChange={(event) => setFamily(event.target.value as Family)}
            >
              {(Object.keys(families) as Family[]).map((key) => (
                <option key={key} value={key}>
                  {families[key].label}
                </option>
              ))}
            </select>
          </div>

          <div className="display-grid">
            <div className="field">
              <label htmlFor="theme-voice">Voice</label>
              <select
                id="theme-voice"
                value={voice}
                onChange={(event) => setVoice(event.target.value as Voice)}
              >
                <option value="nerd">Nerd</option>
                <option value="neutral">Neutral</option>
                <option value="professional">Professional</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="theme-type">Body type</label>
              <select
                id="theme-type"
                value={type}
                onChange={(event) => setType(event.target.value as TypeSetting)}
              >
                <option value="mono">Mono</option>
                <option value="readable">Readable</option>
              </select>
            </div>
          </div>

          <p className="display-note" aria-live="polite">
            {resetNote || 'Changes apply immediately. Every page has its own default theme family.'}
          </p>

          <div className="display-actions">
            <button
              type="button"
              className="button"
              onClick={() => {
                resetToPageDefaults()
                setResetNote('Saved preferences cleared. This page is back to its own defaults.')
              }}
            >
              Reset to page default
            </button>
            <button type="button" className="button button--primary" onClick={close}>
              Done
            </button>
          </div>
        </form>
      </dialog>
    </>
  )
}
