import { Link } from 'react-router-dom'
import { demos } from '../lib/routes'
import type { DemoMeta } from '../lib/routes'
import { resolveVariant } from '../lib/theme'
import { useTheme } from '../components/ThemeProvider'

function Palette({ meta }: { meta: DemoMeta }) {
  const { mode } = useTheme()
  return (
    <span
      className="index-palette"
      data-theme={resolveVariant(meta.theme, mode)}
      data-mode={mode}
      aria-hidden="true"
    >
      <i style={{ background: 'var(--page)' }} />
      <i style={{ background: 'var(--ink)' }} />
      <i style={{ background: 'var(--accent)' }} />
    </span>
  )
}

export function IndexPage() {
  return (
    <main id="main" className="index-page">
      <div className="shell shell--wide">
        <header className="index-hero">
          <div className="index-hero__text">
            <p className="kicker">Textured minimal / demonstration build</p>
            <h1 className="display">
              Eight rooms, one set of <em>materials</em>.
            </h1>
            <p className="index-lede">
              Eight fictional product surfaces, built as separate routes with plain CSS and
              mapped semantic tokens. Every name, price, reading and result is a placeholder.
            </p>
            <ul className="rule-labels kicker">
              <li>8 routes</li>
              <li>8 theme families</li>
              <li>0 component libraries</li>
            </ul>
            <div className="index-actions">
              <a className="button button--primary" href="#demo-list">Read the index</a>
              <span className="meta">Start anywhere. The display button changes tokens.</span>
            </div>
          </div>
          <aside className="index-note" aria-labelledby="reading-heading">
            <p className="kicker">Reading the specimens</p>
            <h2 id="reading-heading" className="section-title">Dials, not categories</h2>
            <p>
              Each route states <strong>TEXTURE / DENSITY / MOTION</strong> before it was built.
              The values describe how much ornament, information and movement the task can
              carry. Voice and body type are set separately.
            </p>
            <p className="meta">
              The eighth study is a deliberate exception. Luxury design is not a terminal
              costume, so <Link className="link" to="/luxury">Aurelia</Link> keeps the tokens
              and drops the monospace frame.
            </p>
          </aside>
        </header>

        <section id="demo-list" aria-labelledby="list-heading" className="index-list-section">
          <div className="index-list-head">
            <h2 id="list-heading" className="section-title">The eight</h2>
            <p className="meta">Route / offer / thesis / dials / palette</p>
          </div>
          <ol className="index-list">
            {demos.map((meta) => (
              <li key={meta.path}>
                <Link className="index-row" to={meta.path}>
                  <span className="index-row__number" aria-hidden="true">{meta.number}</span>
                  <span className="index-row__identity">
                    <span className="index-row__route">/{meta.path.slice(1)}</span>
                    <span className="index-row__project">{meta.project}</span>
                    <span className="index-row__title">{meta.title}</span>
                  </span>
                  <span className="index-row__thesis">{meta.thesis}</span>
                  <span className="index-row__dials" aria-label={`Texture ${meta.texture}, density ${meta.density}, motion ${meta.motion}`}>
                    <span><b>T</b>{meta.texture}</span>
                    <span><b>D</b>{meta.density}</span>
                    <span><b>M</b>{meta.motion}</span>
                  </span>
                  <span className="index-row__theme">
                    <Palette meta={meta} />
                    <span>{meta.themeLabel}</span>
                    <span className="index-row__voice">{meta.voice} / {meta.type}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section className="index-foot" aria-labelledby="foot-heading">
          <div>
            <h2 id="foot-heading" className="section-title">What this is not</h2>
            <p>
              Not a real product catalogue, network, shop, assessment or watch house. Nothing
              is submitted, charged or measured. The forms say so before they accept input.
            </p>
          </div>
          <div>
            <p className="kicker">Stack</p>
            <p className="meta">
              Vite / React / TypeScript / React Router / plain CSS. No Tailwind, no component
              library. Theme roles are CSS custom properties; the adapter is React effects,
              not a second styling system.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
