import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

type FeedState = 'live' | 'empty' | 'loading' | 'error'

const incidents = [
  {
    id: 'INC-2041',
    opened: '19:42',
    scope: 'Mill / distribution',
    symptom: 'Packet loss 2.4%',
    severity: 'Degraded',
    owner: 'J. Okafor',
    age: '18m',
    tone: 'warn',
  },
  {
    id: 'INC-2039',
    opened: '17:10',
    scope: 'Foundry / transit',
    symptom: 'BGP session flap',
    severity: 'Major',
    owner: 'Unassigned',
    age: '2h 50m',
    tone: 'danger',
  },
  {
    id: 'INC-2036',
    opened: '14:02',
    scope: 'Northgate / DNS',
    symptom: 'Resolver latency',
    severity: 'Minor',
    owner: 'L. Shen',
    age: '6h 10m',
    tone: 'accent',
  },
]

const ring = [
  { name: 'Northgate', status: 'Healthy', latency: '1.2 ms', tone: 'ok' },
  { name: 'Foundry', status: 'Degraded', latency: '12.4 ms', tone: 'warn' },
  { name: 'Mill', status: 'Healthy', latency: '2.8 ms', tone: 'ok' },
  { name: 'Civic', status: 'Healthy', latency: '2.1 ms', tone: 'ok' },
  { name: 'Harbor', status: 'Maintenance', latency: '—', tone: 'accent' },
  { name: 'Orchard', status: 'Healthy', latency: '3.4 ms', tone: 'ok' },
]

const stateLabels: { value: FeedState; label: string }[] = [
  { value: 'live', label: 'Live' },
  { value: 'empty', label: 'Empty' },
  { value: 'loading', label: 'Loading' },
  { value: 'error', label: 'Error' },
]

export function DashboardPage() {
  const [feed, setFeed] = useState<FeedState>('live')
  const [lastPoll, setLastPoll] = useState('12s ago')
  const [announcement, setAnnouncement] = useState('')
  const [controlsOpen, setControlsOpen] = useState(
    () => typeof window === 'undefined' || !window.matchMedia('(max-width: 720px)').matches,
  )

  useEffect(() => {
    const media = window.matchMedia('(max-width: 720px)')
    const sync = () => { if (!media.matches) setControlsOpen(true) }
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (feed !== 'loading') return
    setAnnouncement('Polling the incident feed.')
    const timer = window.setTimeout(() => {
      setFeed('live')
      setLastPoll('just now')
      setAnnouncement('Live incident feed refreshed.')
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [feed])

  const chooseState = (next: FeedState) => {
    setFeed(next)
    if (next === 'live') {
      setLastPoll('just now')
      setAnnouncement('Showing the live demo feed.')
    }
    if (next === 'empty') setAnnouncement('Showing the empty incident state.')
    if (next === 'error') setAnnouncement('Showing the incident feed failure state.')
    if (next === 'loading') return
  }

  const refresh = () => {
    setLastPoll('polling')
    setFeed('loading')
  }

  return (
    <main id="main" className="dash">
      <header className="dash-top">
        <div className="dash-brand">
          <span className="dash-brand__mark" aria-hidden="true">NN</span>
          <div>
            <strong>Northline Net</strong>
            <span>NOC / Underwood / demo tenant</span>
          </div>
        </div>
        <nav className="dash-nav" aria-label="Network sections">
          <a href="#overview" aria-current="page">Overview</a>
          <a href="#ring">Core ring</a>
          <a href="#incidents">Incidents</a>
          <a href="#maintenance">Maintenance</a>
        </nav>
      </header>

      <div className="dash-layout">
        <div className="dash-main dash-main--top">
          <section id="overview" className="dash-overview" aria-labelledby="dash-title">
            <div className="dash-title-row">
              <div>
                <p className="kicker">Overview / placeholder telemetry</p>
                <h1 id="dash-title">Network status</h1>
                <p className="dash-sub">
                  Last poll {lastPoll}. <span className="tag">Demo data</span>
                </p>
              </div>
              <button className="button button--primary" type="button" onClick={refresh} disabled={feed === 'loading'}>
                {feed === 'loading' ? 'Polling…' : 'Poll now'}
              </button>
            </div>

            <div className="stats dash-stats">
              <div className="stat">
                <p className="stat__value">99.94<small>%</small></p>
                <p className="stat__label">Availability / 30d demo</p>
                <div className="meter" style={{ '--v': '99.94%' } as CSSProperties} aria-hidden="true" />
              </div>
              <div className="stat">
                <p className="stat__value">1,284</p>
                <p className="stat__label">Subscribers / placeholder</p>
                <div className="meter" style={{ '--v': '71%' } as CSSProperties} aria-hidden="true" />
              </div>
              <div className="stat">
                <p className="stat__value">2.4<small> Gb/s</small></p>
                <p className="stat__label">Core throughput / peak</p>
                <div className="meter" style={{ '--v': '62%' } as CSSProperties} aria-hidden="true" />
              </div>
              <div className="stat">
                <p className="stat__value">02</p>
                <p className="stat__label">Open incidents / demo</p>
                <div className="meter" style={{ '--v': '18%' } as CSSProperties} aria-hidden="true" />
              </div>
            </div>
            <p className="dash-source">
              Source: demo tenant snapshot. Figures do not represent a real network.
            </p>
          </section>

          <section id="ring" className="dash-ring" aria-labelledby="ring-title">
            <div className="dash-section-head">
              <div>
                <p className="kicker">Topology / six nodes</p>
                <h2 id="ring-title" className="section-title">Core fibre ring</h2>
              </div>
              <p className="tag">2 paths / 1 degraded</p>
            </div>
            <figure className="ring-figure">
              <svg viewBox="0 0 420 420" role="img" aria-label="Placeholder fibre ring with six nodes. Northgate, Mill, Civic and Orchard are healthy. Foundry is degraded. Harbor is under maintenance.">
                <circle cx="210" cy="210" r="130" className="ring-figure__link" />
                <circle cx="210" cy="210" r="122" className="ring-figure__link ring-figure__link--inner" />
                <path d="M80 210 H340" className="ring-figure__axis" />
                <g className="ring-figure__nodes">
                  <circle cx="80" cy="210" r="8" className="ring-node ring-node--ok" />
                  <circle cx="145" cy="97.4" r="8" className="ring-node ring-node--ok" />
                  <circle cx="275" cy="97.4" r="8" className="ring-node ring-node--warn" />
                  <circle cx="340" cy="210" r="8" className="ring-node ring-node--ok" />
                  <circle cx="275" cy="322.6" r="8" className="ring-node ring-node--ok" />
                  <circle cx="145" cy="322.6" r="8" className="ring-node ring-node--accent" />
                </g>
                <text x="62" y="214" className="ring-label ring-label--end">Northgate</text>
                <text x="145" y="78" className="ring-label">Foundry</text>
                <text x="275" y="78" className="ring-label">Mill</text>
                <text x="358" y="214" className="ring-label ring-label--start">Civic</text>
                <text x="283" y="348" className="ring-label ring-label--start">Harbor</text>
                <text x="137" y="348" className="ring-label ring-label--end">Orchard</text>
                <text x="210" y="214" className="ring-centre">DEMO</text>
              </svg>
              <figcaption>
                <span className="sr-only">Node states: </span>
                {ring.map((node) => (
                  <span key={node.name} className={`ring-legend ring-legend--${node.tone}`}>
                    <i aria-hidden="true" />
                    {node.name} <b>{node.status}</b> <span>{node.latency}</span>
                  </span>
                ))}
              </figcaption>
            </figure>
          </section>
        </div>

        <aside className="dash-side" aria-label="View controls and demo states">
          <details
            className="dash-side__details"
            open={controlsOpen}
            onToggle={(event) => setControlsOpen(event.currentTarget.open)}
          >
            <summary className="dash-side__summary">
              <span className="kicker">View / demo</span>
              <strong>Status, controls and demo states</strong>
            </summary>
            <div className="dash-side__body">
              <div className="dash-side__block">
                <p className="kicker">This view</p>
                <ul className="dash-side__list">
                  <li><a href="#overview">Network status</a></li>
                  <li><a href="#ring">Core ring</a></li>
                  <li><a href="#incidents">Incident feed</a></li>
                  <li><a href="#maintenance">Maintenance</a></li>
                </ul>
              </div>
              <div className="dash-side__block">
                <p className="kicker">Demo state</p>
                <div className="state-switch" role="group" aria-label="Incident feed state">
                  {stateLabels.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      aria-pressed={feed === item.value}
                      onClick={() => chooseState(item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="dash-side__note">
                  These control the incident feed only. All persons, incidents and readings are
                  placeholder data.
                </p>
              </div>
              <div className="dash-side__block dash-side__block--quiet">
                <p className="kicker">On call</p>
                <p className="dash-oncall"><span aria-hidden="true">●</span> R. Patel</p>
                <p className="meta">Handover 07:00 / placeholder</p>
              </div>
            </div>
          </details>
        </aside>

        <div className="dash-main dash-main--rest">
          <section id="incidents" className="dash-incidents" aria-labelledby="incidents-title" aria-busy={feed === 'loading'}>
            <div className="dash-section-head">
              <div>
                <p className="kicker">Incident feed / {feed}</p>
                <h2 id="incidents-title" className="section-title">Open incidents</h2>
              </div>
              <span className="meta" aria-live="polite">{announcement}</span>
            </div>

            {feed === 'live' && (
              <>
                <div className="table-scroll dash-table" role="region" aria-label="Open incident records" tabIndex={0}>
                  <table>
                    <caption className="sr-only">Three placeholder open incidents</caption>
                    <thead>
                      <tr>
                        <th scope="col">Incident</th>
                        <th scope="col">Scope</th>
                        <th scope="col">Symptom</th>
                        <th scope="col">Severity</th>
                        <th scope="col">Owner</th>
                        <th scope="col">Opened</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incidents.map((incident) => (
                        <tr key={incident.id}>
                          <th scope="row" className="mono">{incident.id}</th>
                          <td>{incident.scope}</td>
                          <td>{incident.symptom}</td>
                          <td><span className={`status status--${incident.tone}`}>{incident.severity}</span></td>
                          <td>{incident.owner}</td>
                          <td className="mono">{incident.opened} <span className="meta">/ {incident.age}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="dash-table__foot">Acknowledged by on-call within 4 min / placeholder.</p>
              </>
            )}

            {feed === 'loading' && (
              <div className="dash-loading" role="status">
                <p><strong>Loading incident feed…</strong> Cached totals remain visible above.</p>
                <div className="table-scroll dash-table" aria-hidden="true">
                  <table>
                    <tbody>
                      {[0, 1, 2].map((row) => (
                        <tr key={row}>
                          <td><span className="skeleton skeleton--short" /></td>
                          <td><span className="skeleton" /></td>
                          <td><span className="skeleton" /></td>
                          <td><span className="skeleton skeleton--short" /></td>
                          <td><span className="skeleton skeleton--short" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {feed === 'empty' && (
              <div className="empty-state dash-empty">
                <p className="kicker">Feed clear</p>
                <h3>No open incidents.</h3>
                <p>
                  No unresolved incidents in the current demo snapshot. The last resolved
                  incident closed at 16:08.
                </p>
                <button className="button" type="button" onClick={() => chooseState('live')}>
                  Show last 7 days
                </button>
              </div>
            )}

            {feed === 'error' && (
              <div className="dash-error" role="alert">
                <div>
                  <p className="kicker">Feed failure / demo</p>
                  <h3>Incident feed unavailable.</h3>
                  <p>
                    The feed did not answer. Cached totals and the core ring remain visible.
                    No incident has been lost — this is a local demo state.
                  </p>
                  <p className="meta">Last successful poll: 19:58 / placeholder.</p>
                </div>
                <button className="button button--primary" type="button" onClick={() => setFeed('loading')}>
                  Retry feed
                </button>
              </div>
            )}
          </section>

          <section id="maintenance" className="dash-maintenance" aria-labelledby="maintenance-title">
            <div>
              <p className="kicker">Scheduled / demo</p>
              <h2 id="maintenance-title" className="section-title">Maintenance window</h2>
            </div>
            <div className="dash-maintenance__body">
              <p><strong>Core B / firmware 4.2.1</strong> <span className="tag">Window 02:00–03:00</span></p>
              <p className="meta">
                Expected impact: none. Customer traffic reroutes to path A. Placeholder schedule.
              </p>
            </div>
            <button className="button button--quiet" type="button" onClick={() => setAnnouncement('Maintenance detail is placeholder in this demo.')}>
              View runbook
            </button>
          </section>
        </div>
      </div>
    </main>
  )
}
