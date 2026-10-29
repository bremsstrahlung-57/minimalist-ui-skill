import { useEffect, useRef, useState, type FormEvent } from 'react'

type EnquiryField = 'name' | 'email' | 'city'
type EnquiryErrors = Partial<Record<EnquiryField, string>>

const initialValues = {
  name: '',
  email: '',
  city: '',
  interest: 'No. 4 — brushed steel',
  note: '',
}

const dialTicks = Array.from({ length: 60 }, (_, index) => index)
const movementArcs = Array.from({ length: 7 }, (_, index) => index)
const subdialTicks = Array.from({ length: 12 }, (_, index) => index)

type WatchLayer = 'case' | 'dial' | 'movement'

const watchLayers: { id: WatchLayer; label: string }[] = [
  { id: 'case', label: 'Case' },
  { id: 'dial', label: 'Dial' },
  { id: 'movement', label: 'Movement' },
]

function CalibreStudy() {
  const ratchetTeeth = Array.from({ length: 12 }, (_, index) => index)
  return (
    <g fill="none">
      <circle className="lux-move__edge" r="126" />
      <circle className="lux-move__edge" r="112" />
      <g className="lux-move__cotes">
        {movementArcs.map((arc) => (
          <path key={arc} d={`M-88 ${-66 + arc * 22} Q0 ${-84 + arc * 22} 88 ${-66 + arc * 22}`} />
        ))}
      </g>

      {/* Barrel and ratchet wheel, offset to the upper left. */}
      <g className="lux-move__gear lux-move__barrel" transform="translate(-44 -38)">
        <circle r="42" />
        <circle r="32" />
        {ratchetTeeth.map((tooth) => {
          const angle = (tooth * 30 * Math.PI) / 180
          return (
            <line
              key={tooth}
              x1={Math.sin(angle) * 32}
              y1={-Math.cos(angle) * 32}
              x2={Math.sin(angle) * 39}
              y2={-Math.cos(angle) * 39}
            />
          )
        })}
        <circle r="6" />
      </g>

      {/* Train wheels below the barrel bridge. */}
      <g className="lux-move__gear" transform="translate(-88 42)">
        <circle r="20" />
        <circle r="5" />
        <path d="M-88 18 L-88 22 M-88 62 L-88 66 M-112 42 L-108 42 M-68 42 L-64 42" />
      </g>
      <g className="lux-move__gear" transform="translate(-14 84)">
        <circle r="24" />
        <circle r="6" />
        <path d="M-14 56 L-14 60 M-14 108 L-14 112 M-42 84 L-38 84 M10 84 L14 84" />
      </g>
      <g className="lux-move__gear" transform="translate(22 -82)">
        <circle r="17" />
        <circle r="4" />
        <path d="M22 -103 L22 -99 M22 -65 L22 -61 M1 -82 L5 -82 M39 -82 L43 -82" />
      </g>

      {/* Balance wheel under its cock, the only large wheel. */}
      <g className="lux-move__wheel" transform="translate(48 48)">
        <circle r="43" />
        <circle r="35" />
        <path d="M0 -35 L0 35 M-30 17 L30 -17 M-30 -17 L30 17" />
        <circle r="9" />
      </g>
      <path className="lux-move__bridge lux-move__cock" d="M12 12 C40 -2 84 6 100 36 L80 64 C62 44 36 40 8 48 Z" />
      <path className="lux-move__hairspring" transform="translate(48 48)" d="M0 -5 C5 -5 7 0 5 4 C3 8 -4 7 -5 1 C-7 -7 3 -11 8 -6 C13 0 9 10 1 10" />

      {/* Bridges: three plates meeting at jewelled pivots, not rings. */}
      <path className="lux-move__bridge" d="M-100 -70 C-86 -104 -34 -116 2 -96 L12 -64 C-18 -52 -58 -44 -78 -22 Z" />
      <path className="lux-move__bridge" d="M8 -92 C50 -108 98 -84 108 -42 L72 -22 C64 -54 38 -68 12 -58 Z" />

      <g className="lux-move__jewels">
        <circle cx="-44" cy="-38" r="2.8" />
        <circle cx="-88" cy="42" r="2.8" />
        <circle cx="-14" cy="84" r="2.8" />
        <circle cx="48" cy="48" r="2.8" />
        <circle cx="12" cy="-70" r="2.8" />
      </g>
      <g className="lux-move__screws">
        <circle cx="-102" cy="-4" r="3.6" />
        <path d="M-105 -4 L-99 -4" />
        <circle cx="86" cy="-74" r="3.6" />
        <path d="M83 -74 L89 -74" />
      </g>
      <text className="lux-move__label" x="0" y="120.5" textAnchor="middle">CAL. A-04</text>
    </g>
  )
}

function WatchLayers() {
  const [exploded, setExploded] = useState(false)
  const [visible, setVisible] = useState<Record<WatchLayer, boolean>>({
    case: true,
    dial: true,
    movement: true,
  })

  const toggle = (layer: WatchLayer) => {
    setVisible((current) => ({ ...current, [layer]: !current[layer] }))
  }

  return (
    <figure className={`lux-watch ${exploded ? 'is-exploded' : ''}`}>
      <div className="lux-watch__stage">
        <svg className="lux-watch__drawing" viewBox="0 0 440 680" role="img" aria-labelledby="lux-watch-title lux-watch-desc">
          <title id="lux-watch-title">Aurelia No. 4, three-layer watch study</title>
          <desc id="lux-watch-desc">
            A round wristwatch split into three stackable studies: a brushed case and strap,
            an opaline dial with twelve markers and two hands, and a hand-wound calibre with
            a barrel, gear train, jewelled bridges and a balance wheel. The watch is a
            fictional design study.
          </desc>

          <g className={`lux-layer lux-layer--movement ${visible.movement ? '' : 'is-hidden'}`} aria-hidden={!visible.movement}>
            <g transform="translate(220 340)">
              <CalibreStudy />
            </g>
          </g>

          <g className={`lux-layer lux-layer--dial ${visible.dial ? '' : 'is-hidden'}`} aria-hidden={!visible.dial}>
            <g transform="translate(220 340)">
              <circle className="lux-watch__dial" r="142" />
              <g className="lux-watch__ticks">
                {dialTicks.map((tick) => {
                  const angle = (tick * 6 * Math.PI) / 180
                  const inner = tick % 5 === 0 ? 119 : 126
                  return (
                    <line
                      key={tick}
                      x1={Math.sin(angle) * inner}
                      y1={-Math.cos(angle) * inner}
                      x2={Math.sin(angle) * 134}
                      y2={-Math.cos(angle) * 134}
                      className={tick % 5 === 0 ? 'is-major' : undefined}
                    />
                  )
                })}
              </g>
              <g className="lux-watch__numerals">
                <text x="0" y="-91" textAnchor="middle">XII</text>
                <text x="93" y="5" textAnchor="middle">III</text>
                <text x="-93" y="5" textAnchor="middle">IX</text>
              </g>
              <g className="lux-watch__brandmark">
                <text y="-44" textAnchor="middle">AURELIA</text>
                <text y="-26" textAnchor="middle" className="lux-watch__model">NO. 4</text>
              </g>
              <g className="lux-watch__subdial" transform="translate(0 67)">
                <circle r="31" />
                {subdialTicks.map((tick) => {
                  const angle = (tick * 30 * Math.PI) / 180
                  return (
                    <line
                      key={tick}
                      x1={Math.sin(angle) * 25}
                      y1={-Math.cos(angle) * 25}
                      x2={Math.sin(angle) * 29}
                      y2={-Math.cos(angle) * 29}
                    />
                  )
                })}
                <line className="lux-watch__subhand" x1="0" y1="4" x2="12" y2="-15" />
              </g>
              <line className="lux-watch__hand" x1="0" y1="0" x2="-49" y2="-34" />
              <line className="lux-watch__hand lux-watch__hand--minute" x1="0" y1="0" x2="86" y2="-50" />
              <circle className="lux-watch__pin" r="5" />
              <text className="lux-watch__study" y="125" textAnchor="middle">ÉTUDE / 04</text>
            </g>
          </g>

          <g className={`lux-layer lux-layer--case ${visible.case ? '' : 'is-hidden'}`} aria-hidden={!visible.case}>
            <g transform="translate(220 340)">
              <g className="lux-watch__strap" fill="none">
                <path d="M-64 -164 L-74 -328 L74 -328 L64 -164 Z" />
                <path d="M-64 164 L-74 328 L74 328 L64 164 Z" />
                <path d="M-62 -300 L62 -300" />
                <path d="M-62 -200 L62 -200" />
                <path d="M-62 200 L62 200" />
                <path d="M-62 300 L62 300" />
              </g>
              <rect className="lux-watch__crown" x="158" y="-12" width="28" height="24" rx="4" />
              <path className="lux-watch__crown-line" d="M168 -8 L168 8 M176 -8 L176 8" />
              <circle className="lux-watch__case" r="160" />
              <circle className="lux-watch__case" r="150" />
            </g>
          </g>

          <g className="lux-watch__guides" aria-hidden="true">
            <path d="M220 200 V480" />
            <path d="M212 200 H228 M212 480 H228" />
            <path d="M330 186 H360 M330 340 H360 M330 494 H360" />
          </g>
        </svg>
        <span className="lux-watch__tag lux-watch__tag--case" aria-hidden="true">01 / case</span>
        <span className="lux-watch__tag lux-watch__tag--dial" aria-hidden="true">02 / dial</span>
        <span className="lux-watch__tag lux-watch__tag--movement" aria-hidden="true">03 / movement</span>
      </div>

      <div className="lux-watch__controls" role="group" aria-label="Watch layer study">
        <div className="lux-watch__mode">
          <button type="button" aria-pressed={!exploded} onClick={() => setExploded(false)}>Assembled</button>
          <button type="button" aria-pressed={exploded} onClick={() => setExploded(true)}>Exploded</button>
        </div>
        <div className="lux-watch__layers">
          {watchLayers.map((layer) => (
            <button
              key={layer.id}
              type="button"
              aria-pressed={visible[layer.id]}
              onClick={() => toggle(layer.id)}
            >
              <i aria-hidden="true" /> {layer.label}
            </button>
          ))}
        </div>
      </div>

      <figcaption>No. 4 / three layers / <span>placeholder</span></figcaption>
    </figure>
  )
}
function MovementDrawing() {
  return (
    <svg className="lux-movement__drawing" viewBox="0 0 400 400" role="img" aria-labelledby="lux-move-title lux-move-desc">
      <title id="lux-move-title">Calibre A-04 movement study</title>
      <desc id="lux-move-desc">
        A technical line drawing of a fictional hand-wound calibre: a ratchet-toothed barrel,
        three gear-train wheels, a balance wheel with hairspring under its cock, jewelled pivots
        and two bridges. All details are placeholders.
      </desc>
      <g transform="translate(200 200) scale(1.28)">
        <CalibreStudy />
      </g>
    </svg>
  )
}

export function LuxuryPage() {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<EnquiryErrors>({})
  const [sent, setSent] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const successHeading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (sent) successHeading.current?.focus()
  }, [sent])

  const update = (field: keyof typeof initialValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    if (field in errors) {
      setErrors((current) => {
        const next = { ...current }
        delete next[field as EnquiryField]
        return next
      })
    }
  }

  const focusField = (field: string) => {
    formRef.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus()
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next: EnquiryErrors = {}
    if (values.name.trim().length < 2) next.name = 'Please give a name of at least two characters.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Please use a complete email address.'
    if (values.city.trim().length < 2) next.city = 'Please tell us where you are writing from.'
    setErrors(next)
    if (Object.keys(next).length > 0) {
      focusField(Object.keys(next)[0])
      return
    }
    setSent(true)
  }

  const returnToForm = () => {
    setSent(false)
    requestAnimationFrame(() => focusField('name'))
  }

  const errorEntries = Object.entries(errors) as [EnquiryField, string][]

  return (
    <div className="luxury grain">
      <header className="lux-header">
        <a className="lux-wordmark" href="/luxury" aria-label="Aurelia, return to the top">
          <span className="lux-wordmark__mark" aria-hidden="true">A</span>
          <span>Aurelia</span>
        </a>
        <nav className="lux-nav" aria-label="Aurelia study">
          <a href="#object">The object</a>
          <a href="#movement">Movement</a>
          <a href="#atelier">Atelier</a>
          <a className="lux-nav__enquire" href="#enquire">Enquire</a>
        </nav>
      </header>

      <main id="main">
        <section className="lux-hero" aria-labelledby="lux-hero-title">
          <div className="lux-hero__copy">
            <p className="lux-kicker">Fictional maison / horlogerie / étude no. 4</p>
            <h1 id="lux-hero-title" className="lux-title">A small dial for a <em>long</em> day.</h1>
            <p className="lux-lede">
              A hand-wound study in restraint: thirty-nine millimetres of brushed steel, a dial left
              without a signature at twelve, and a movement made to be heard only when you listen.
            </p>
            <div className="lux-actions">
              <a className="lux-button lux-button--solid" href="#enquire">Request an introduction</a>
              <a className="lux-link" href="#object">Read the specification</a>
            </div>
            <p className="lux-disclaimer">Aurelia is a fiction. No watch exists. Every specification is a placeholder.</p>
          </div>
          <WatchLayers />
        </section>

        <section id="object" className="lux-section lux-object" aria-labelledby="lux-object-title">
          <p className="lux-section__marker"><span>01</span> The object</p>
          <div className="lux-object__lead">
            <h2 id="lux-object-title" className="lux-title lux-title--section">A watch that keeps its <em>counsel.</em></h2>
            <p>
              The case is round because the day is not. The dial carries only what the eye needs:
              twelve quiet markers, a small seconds at six, and hands that sit close to the surface.
              Nothing announces the maker until you turn the watch over.
            </p>
            <p>
              This is a design study, not a product. The proportions below are invented to test a
              restrained, editorial reading of the same token system used by the other seven routes.
            </p>
          </div>
          <div className="lux-specs-wrap">
            <p className="lux-specs__caption">Specification / fictional</p>
            <dl className="lux-specs">
              <div><dt>Case</dt><dd>39 mm, brushed steel</dd></div>
              <div><dt>Height</dt><dd>8.7 mm</dd></div>
              <div><dt>Movement</dt><dd>Calibre A-04, hand-wound</dd></div>
              <div><dt>Reserve</dt><dd>56 hours</dd></div>
              <div><dt>Dial</dt><dd>Opaline, no signature</dd></div>
              <div><dt>Crystal</dt><dd>Domed sapphire</dd></div>
              <div><dt>Water</dt><dd>50 metres</dd></div>
              <div><dt>Strap</dt><dd>Black calf, pin buckle</dd></div>
            </dl>
            <p className="lux-specs__note">All figures are placeholders for a fictional object.</p>
          </div>
        </section>

        <section id="movement" className="lux-section lux-movement" aria-labelledby="lux-move-heading">
          <p className="lux-section__marker"><span>02</span> Movement</p>
          <div className="lux-movement__figure">
            <MovementDrawing />
            <p className="lux-caption">Calibre A-04 / line study / placeholder</p>
          </div>
          <div className="lux-movement__copy">
            <h2 id="lux-move-heading" className="lux-title lux-title--section">Finished where <em>no one looks.</em></h2>
            <p>
              The back is not a secret. It is a private room. Bridges are angled by hand, screws are
              blued over a flame, and the balance is left visible because a good mechanism should not
              need a lid.
            </p>
            <p>
              None of this has happened. The movement is a drawing, the finishing is a sentence, and
              the calibre is a placeholder. What remains true is the intention: fewer gestures, held
              for longer.
            </p>
            <p className="lux-pullquote">“A quiet object should reward a second look, not demand a first one.”<span>Atelier note / fictional</span></p>
          </div>
        </section>

        <section id="atelier" className="lux-section lux-atelier" aria-labelledby="lux-atelier-title">
          <p className="lux-section__marker"><span>03</span> Atelier</p>
          <div className="lux-atelier__lead">
            <h2 id="lux-atelier-title" className="lux-title lux-title--section">A short series, made <em>slowly.</em></h2>
            <p>
              Aurelia is imagined as a small maison with a long bench and a short catalogue. The
              pleasure is in the interval between things: the pause before a hand moves, the weight
              of a crown between two fingers.
            </p>
          </div>
          <div className="lux-atelier__notes">
            <article>
              <p className="lux-kicker">01 / The hand</p>
              <h3>Set by eye</h3>
              <p>Hands are aligned under a loupe, then checked again in daylight. A small ritual, repeated.</p>
            </article>
            <article>
              <p className="lux-kicker">02 / The finish</p>
              <h3>Brushed, not polished</h3>
              <p>The case is meant to gather faint marks. A watch that stays perfect has not been worn.</p>
            </article>
            <article>
              <p className="lux-kicker">03 / The interval</p>
              <h3>A slower reply</h3>
              <p>Enquiries are imagined as conversations, not transactions. This demo sends nothing at all.</p>
            </article>
          </div>
          <p className="lux-disclaimer">Atelier copy and all descriptive details are placeholders.</p>
        </section>

        <section id="enquire" className="lux-enquire" aria-labelledby="lux-enquire-title">
          <div className="lux-enquire__intro">
            <p className="lux-section__marker"><span>04</span> Enquire</p>
            <h2 id="lux-enquire-title" className="lux-title lux-title--section">Begin a <em>conversation.</em></h2>
            <p>
              Tell us where you are and what you would like to see. This is a local design demo: no
              message is transmitted, no details are stored remotely, and no watch is reserved.
            </p>
            <dl className="lux-contact">
              <div><dt>Maison</dt><dd>Paris / fictional</dd></div>
              <div><dt>Appointments</dt><dd>By conversation / demo copy</dd></div>
              <div><dt>Reply</dt><dd>No live mailbox</dd></div>
            </dl>
          </div>

          {sent ? (
            <div className="lux-enquire__sent" role="status">
              <p className="lux-kicker">Enquiry / demo complete</p>
              <h3 tabIndex={-1} ref={successHeading}>Thank you — nothing was sent.</h3>
              <p>
                This page does not have a server. Your words stayed in this browser and were discarded
                when the form closed.
              </p>
              <p className="lux-disclaimer">No appointment exists. No personal data was transmitted.</p>
              <button className="lux-button lux-button--outline" type="button" onClick={returnToForm}>
                Make another enquiry
              </button>
            </div>
          ) : (
            <form className="lux-form" ref={formRef} onSubmit={submit} noValidate>
              {errorEntries.length > 0 && (
                <div className="lux-form__errors" role="alert">
                  <p>Please check the marked fields.</p>
                  <ul>
                    {errorEntries.map(([field, message]) => (
                      <li key={field}>
                        <button type="button" onClick={() => focusField(field)}>{message}</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="lux-form__row">
                <label className="lux-field">
                  <span>Name</span>
                  <input
                    name="name"
                    autoComplete="name"
                    value={values.name}
                    onChange={(event) => update('name', event.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'lux-name-error' : undefined}
                    placeholder="Your name"
                  />
                  {errors.name && <span className="lux-field__error" id="lux-name-error">{errors.name}</span>}
                </label>
                <label className="lux-field">
                  <span>Email</span>
                  <input
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={(event) => update('email', event.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'lux-email-error' : undefined}
                    placeholder="you@example.com"
                  />
                  {errors.email && <span className="lux-field__error" id="lux-email-error">{errors.email}</span>}
                </label>
              </div>
              <div className="lux-form__row">
                <label className="lux-field">
                  <span>City</span>
                  <input
                    name="city"
                    autoComplete="address-level2"
                    value={values.city}
                    onChange={(event) => update('city', event.target.value)}
                    aria-invalid={Boolean(errors.city)}
                    aria-describedby={errors.city ? 'lux-city-error' : undefined}
                    placeholder="Where are you writing from?"
                  />
                  {errors.city && <span className="lux-field__error" id="lux-city-error">{errors.city}</span>}
                </label>
                <label className="lux-field">
                  <span>Interest</span>
                  <select
                    name="interest"
                    value={values.interest}
                    onChange={(event) => update('interest', event.target.value)}
                  >
                    <option>No. 4 — brushed steel</option>
                    <option>No. 4 — rose gold study</option>
                    <option>A private appointment</option>
                    <option>A conversation only</option>
                  </select>
                </label>
              </div>
              <label className="lux-field">
                <span>Note <em>(optional)</em></span>
                <textarea
                  name="note"
                  rows={4}
                  value={values.note}
                  onChange={(event) => update('note', event.target.value)}
                  placeholder="A sentence about what you would like to see."
                />
              </label>
              <div className="lux-form__footer">
                <button className="lux-button lux-button--solid" type="submit">Send enquiry</button>
                <p>This form is a demonstration. Nothing leaves this page.</p>
              </div>
            </form>
          )}
        </section>

        <footer className="lux-footer">
          <p>Aurelia is a fictional maison. No watch exists, no orders are taken, and every specification is a placeholder.</p>
          <a className="lux-link" href="#main">Return to top</a>
        </footer>
      </main>
    </div>
  )
}
