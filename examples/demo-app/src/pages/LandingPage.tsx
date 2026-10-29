import { useState } from 'react'
import type { FormEvent } from 'react'

interface Contact {
  id: string
  band: string
  className: string
  confidence: string
  state: 'Confirmed' | 'Review' | 'Unverified'
  cat: number
  x: number
  y: number
  r: number
  bearing: string
  range: string
  why: string
}

const contacts: Contact[] = [
  {
    id: 'Halo-2',
    band: '2.4 GHz / frequency hop',
    className: 'Consumer quadcopter',
    confidence: '0.82',
    state: 'Confirmed',
    cat: 2,
    x: 296,
    y: 142,
    r: 7,
    bearing: '042°',
    range: '0.7 km',
    why: 'The hop cadence and two harmonics match the library entry. Bearing is stable across three sweeps.',
  },
  {
    id: 'Kestrel',
    band: '5.8 GHz / burst',
    className: 'Fixed wing',
    confidence: '0.71',
    state: 'Review',
    cat: 3,
    x: 154,
    y: 116,
    r: 5,
    bearing: '318°',
    range: '0.9 km',
    why: 'A short burst pattern with a fixed-wing doppler shape. The class is plausible, not settled.',
  },
  {
    id: 'Moth-7',
    band: '433 MHz / periodic',
    className: 'Telemetry link',
    confidence: '0.64',
    state: 'Review',
    cat: 3,
    x: 266,
    y: 286,
    r: 6,
    bearing: '128°',
    range: '0.5 km',
    why: 'A periodic heartbeat at low power. It could be a telemetry link or a piece of site equipment.',
  },
  {
    id: 'Drift',
    band: '2.4 GHz / analogue',
    className: 'Unknown emitter',
    confidence: '0.39',
    state: 'Unverified',
    cat: 4,
    x: 124,
    y: 266,
    r: 4,
    bearing: '236°',
    range: '1.1 km',
    why: 'Intermittent analogue energy with no matching cadence. The evidence is too thin to classify.',
  },
  {
    id: 'Lantern',
    band: '1.2 GHz / wideband',
    className: 'Consumer quadcopter',
    confidence: '0.88',
    state: 'Confirmed',
    cat: 2,
    x: 330,
    y: 240,
    r: 5,
    bearing: '091°',
    range: '0.4 km',
    why: 'Wideband video downlink plus a control link. Two independent signatures agree on the class.',
  },
]

const steps = [
  {
    n: '01',
    title: 'Sense',
    body: 'A passive RF and acoustic array records the low-sky envelope. No transmitter, no illumination, no interference licence.',
  },
  {
    n: '02',
    title: 'Compare',
    body: 'A local signature library compares cadence, band and bearing. Operators see the evidence, not a single opaque score.',
  },
  {
    n: '03',
    title: 'Report',
    body: 'Contacts appear on a sector map with a confidence band and a plain-language reason. Nothing is escalated automatically.',
  },
]

export function LandingPage() {
  const [email, setEmail] = useState('')
  const [site, setSite] = useState('')
  const [errors, setErrors] = useState<{ email?: string; site?: string }>({})
  const [status, setStatus] = useState<'idle' | 'success'>('idle')
  const [selected, setSelected] = useState(contacts[0].id)
  const active = contacts.find((contact) => contact.id === selected) ?? contacts[0]
  const confirmed = contacts.filter((contact) => contact.state === 'Confirmed').length

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next: { email?: string; site?: string } = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Enter a work email address in the form name@domain.tld.'
    }
    if (!site) next.site = 'Choose the kind of site you want to cover.'
    setErrors(next)
    if (Object.keys(next).length > 0) {
      setStatus('idle')
      return
    }
    setStatus('success')
  }

  return (
    <main id="main" className="landing">
      <svg className="landing-field-bg" viewBox="0 0 1200 900" aria-hidden="true">
        <g fill="none" stroke="currentColor">
          <circle cx="900" cy="180" r="118" />
          <circle cx="900" cy="180" r="236" />
          <circle cx="900" cy="180" r="354" />
          <circle cx="900" cy="180" r="472" />
          <path d="M0 180H1200M900 0V900M500 0L1200 700M1200 0L500 700" />
        </g>
      </svg>

      <header className="landing-header">
        <a className="landing-brand" href="#top" aria-label="Ironwake, back to top">
          <span className="landing-brand__mark" aria-hidden="true">IW</span>
          <span>Ironwake</span>
        </a>
        <nav className="landing-nav" aria-label="Ironwake sections">
          <a href="#how">How it listens</a>
          <a href="#signatures">Signature library</a>
          <a href="#limits">Limits</a>
          <a href="#deployment">Deployment</a>
        </nav>
        <a className="button button--primary button--sm" href="#deployment">Request a field trial</a>
      </header>

      <section className="landing-hero" id="top" aria-labelledby="landing-title">
        <div className="landing-hero__copy">
          <p className="kicker">Passive counter-drone sensing / fictional product</p>
          <h1 id="landing-title" className="display">
            Listen to the low sky.
          </h1>
          <p className="landing-lede">
            Ironwake is a passive listening field for sites that cannot afford to radiate.
            It records the RF and acoustic envelope above a perimeter, then gives an operator
            a calm, evidence-led picture of what is moving through it.
          </p>
          <div className="landing-actions">
            <a className="button button--primary" href="#deployment">Request a field trial</a>
            <a className="button button--quiet" href="#how">Read the method</a>
          </div>
          <p className="landing-atlas-note">
            <span className="kicker">Atlas / demo sector</span>
            Select a contact in the index to read its bearing, band and confidence. The same
            contacts appear as a linear list on narrow screens and under reduced motion.
          </p>
          <p className="landing-disclaimer">
            Placeholder demo. Ironwake is invented; the sector map, readings and signature
            rows are illustrative, not measured.
          </p>
        </div>

        <div className="landing-atlas">
          <figure className="radar-panel" aria-labelledby="radar-caption">
            <div className="radar-panel__head">
              <span className="kicker">Sector map / demo feed</span>
              <span className="radar-panel__live"><i aria-hidden="true" /> Listening</span>
            </div>
            <svg
              className="radar"
              viewBox="0 0 420 420"
              role="img"
              aria-label={`Placeholder sector map with ${contacts.length} contacts in a 1.2 kilometre field. ${confirmed} are confirmed consumer drones; the rest are under review or unverified. The accessible contact index repeats every reading.`}
            >
              <circle cx="210" cy="210" r="188" className="radar__ring" />
              <circle cx="210" cy="210" r="136" className="radar__ring" />
              <circle cx="210" cy="210" r="84" className="radar__ring" />
              <circle cx="210" cy="210" r="32" className="radar__ring" />
              <path d="M210 22V398M22 210H398M77 77L343 343M343 77L77 343" className="radar__spoke" />
              <g className="radar__sweep" aria-hidden="true">
                <path d="M210 210 L210 24" />
                <circle cx="210" cy="96" r="3" />
                <circle cx="210" cy="156" r="2" />
              </g>
              <line
                className="radar__bearing"
                x1="210"
                y1="210"
                x2={active.x}
                y2={active.y}
              />
              <g className="radar__contacts" aria-hidden="true">
                {contacts.map((contact) => (
                  <circle
                    key={contact.id}
                    cx={contact.x}
                    cy={contact.y}
                    r={contact.r}
                    className={`radar__contact radar__contact--cat-${contact.cat} ${selected === contact.id ? 'is-selected' : ''}`}
                  />
                ))}
                <circle
                  className="radar__selection"
                  cx={active.x}
                  cy={active.y}
                  r={active.r + 8}
                />
              </g>
              <text x="210" y="204" className="radar__centre">IW</text>
              <text x="20" y="16" className="radar__tick">N 000</text>
              <text x="350" y="16" className="radar__tick">042</text>
              <text x="382" y="214" className="radar__tick">E</text>
            </svg>
            <div className="radar-panel__readout" role="group" aria-label="Placeholder sector readings">
              <span><b>{String(contacts.length).padStart(2, '0')}</b> contacts</span>
              <span><b>{String(confirmed).padStart(2, '0')}</b> classified</span>
              <span><b>1.2 km</b> demo radius</span>
            </div>
            <figcaption id="radar-caption" className="radar-panel__caption">
              Demo feed. Five contacts: two confirmed consumer-drone signatures, two under
              review and one unverified emitter. Bearings are placeholder values.
            </figcaption>
          </figure>

          <div className="landing-contact-index" aria-label="Contact index, linear fallback for the sector map">
            <div className="landing-contact-index__head">
              <p className="kicker">Contact index / linear view</p>
              <span className="meta">{String(contacts.length).padStart(2, '0')} rows</span>
            </div>
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <button
                    type="button"
                    className="landing-contact"
                    aria-pressed={selected === contact.id}
                    onClick={() => setSelected(contact.id)}
                  >
                    <span className="landing-contact__id">{contact.id}</span>
                    <span className="landing-contact__band">{contact.band}</span>
                    <span className="landing-contact__meta">
                      {contact.confidence} / {contact.state}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="landing-contact-detail" role="status" aria-live="polite">
              <p className="kicker">Selected / {active.id}</p>
              <p>
                <strong>{active.className}</strong> at {active.bearing} / {active.range}.
                Confidence {active.confidence}; {active.state.toLowerCase()}.
              </p>
              <p>{active.why}</p>
            </div>
          </div>
        </div>
      </section>

      <ul className="landing-facts rule-labels kicker" aria-label="System constraints">
        <li>0 active emitters</li>
        <li>3 bands monitored</li>
        <li>No camera</li>
        <li>No operator identity</li>
      </ul>

      <section id="how" className="landing-section" aria-labelledby="how-title">
        <div className="landing-section__head">
          <p className="kicker">Method / 03</p>
          <h2 id="how-title" className="title-xl">Listening is a chain of custody.</h2>
          <p className="landing-section__lede">
            Every contact keeps its evidence attached. The system reports what it heard and
            why it thinks that matters; a human decides what happens next.
          </p>
        </div>
        <ol className="landing-steps">
          {steps.map((step) => (
            <li key={step.n}>
              <span className="landing-step__n" aria-hidden="true">{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="signatures" className="landing-section" aria-labelledby="sig-title">
        <div className="landing-section__head landing-section__head--row">
          <div>
            <p className="kicker">Signature library / sample</p>
            <h2 id="sig-title" className="title-xl">Known shapes, with the receipts.</h2>
          </div>
          <p className="meta landing-table-note">
            Illustrative rows. Confidence values are placeholders, not field data.
          </p>
        </div>
        <div className="table-scroll landing-table" role="region" aria-label="Placeholder signature library" tabIndex={0}>
          <table>
            <caption className="sr-only">Five placeholder signatures with band, class, confidence and state.</caption>
            <thead>
              <tr>
                <th scope="col">Signature</th>
                <th scope="col">Band / cadence</th>
                <th scope="col">Class</th>
                <th scope="col">Confidence</th>
                <th scope="col">State</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <th scope="row">{contact.id}</th>
                  <td>{contact.band}</td>
                  <td>{contact.className}</td>
                  <td className="mono">{contact.confidence}</td>
                  <td>
                    <span className={`tag tag--cat-${contact.cat}`}>
                      {contact.state}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="limits" className="landing-limits" aria-labelledby="limits-title">
        <div>
          <p className="kicker">Boundaries / non-negotiable</p>
          <h2 id="limits-title" className="title-xl">A sensor, not a weapon.</h2>
        </div>
        <ul className="landing-limits__list">
          <li><span aria-hidden="true">×</span><div><strong>No jamming or spoofing.</strong> Ironwake never transmits into the band it listens to.</div></li>
          <li><span aria-hidden="true">×</span><div><strong>No cameras on the array.</strong> The field records spectrum and bearing, not faces or plates.</div></li>
          <li><span aria-hidden="true">×</span><div><strong>No automatic escalation.</strong> A contact is a question with evidence attached, not a verdict.</div></li>
        </ul>
      </section>

      <section id="deployment" className="landing-deploy" aria-labelledby="deploy-title">
        <div className="landing-deploy__copy">
          <p className="kicker">Field trial / placeholder form</p>
          <h2 id="deploy-title" className="title-xl">Tell us what you need to see.</h2>
          <p>
            A field trial starts with a site walk, a spectrum sweep and a short written
            assessment. This form is part of the fictional demo and sends nothing anywhere.
          </p>
          <p className="meta">Typical placeholder response: 2 working days.</p>
        </div>
        <form className="landing-form" onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="work-email">Work email</label>
            <input
              id="work-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : 'email-help'}
              onChange={(event) => setEmail(event.target.value)}
            />
            {errors.email
              ? <p className="field-error" id="email-error">{errors.email}</p>
              : <p className="field-help" id="email-help">Demo only. Use any well-formed address.</p>}
          </div>
          <div className="field">
            <label htmlFor="site-type">Site type</label>
            <select
              id="site-type"
              name="site"
              value={site}
              aria-invalid={Boolean(errors.site)}
              aria-describedby={errors.site ? 'site-error' : 'site-help'}
              onChange={(event) => setSite(event.target.value)}
            >
              <option value="">Choose a site</option>
              <option>Airfield perimeter</option>
              <option>Utility substation</option>
              <option>Events venue</option>
              <option>Research campus</option>
            </select>
            {errors.site
              ? <p className="field-error" id="site-error">{errors.site}</p>
              : <p className="field-help" id="site-help">No address or precise coordinates are collected here.</p>}
          </div>
          <button className="button button--primary" type="submit">Request the demo trial</button>
          <p className="landing-form__note">
            This button runs a local demo check. No request is sent, no data is stored.
          </p>
          <div aria-live="polite">
            {status === 'success' && (
              <div className="landing-form__success" role="status">
                <strong>Demo check complete.</strong> The form is valid. Nothing was sent and
                no trial has been booked.
              </div>
            )}
          </div>
        </form>
      </section>

      <footer className="landing-colophon">
        <p>Ironwake / a fictional passive sensing company / all content placeholder</p>
        <p>Field notes 001 / 2026 / no real deployment</p>
      </footer>
    </main>
  )
}
