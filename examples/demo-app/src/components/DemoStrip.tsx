import { Link, useLocation } from 'react-router-dom'
import { routeMeta } from '../lib/routes'
import { DisplaySettings } from './DisplaySettings'
import { useTheme } from './ThemeProvider'

export function DemoStrip() {
  const location = useLocation()
  const meta = routeMeta(location.pathname)
  const { familyLabel, voice, type } = useTheme()

  return (
    <nav className="demo-strip" aria-label="Demo navigation">
      <span className="demo-strip__brand">
        <Link to="/">Textured minimal</Link>
        <span aria-hidden="true"> / </span>
        <span>{meta ? `demo ${meta.number}` : 'index'}</span>
      </span>
      <div className="demo-strip__end">
        <span className="demo-strip__meta">
          {meta ? `${meta.project} · ${meta.title}` : 'Eight short studies'}
          <span className="demo-strip__dot" aria-hidden="true"> · </span>
          {familyLabel}
          <span className="demo-strip__dot" aria-hidden="true"> · </span>
          {voice} / {type}
        </span>
        <DisplaySettings />
      </div>
    </nav>
  )
}
