import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

type FieldKey = 'email' | 'name' | 'card' | 'expiry' | 'cvc' | 'country' | 'postal'
type Outcome = 'approved' | 'declined' | 'network' | 'authenticate'
type Status = 'idle' | 'processing' | 'success' | 'declined' | 'network' | 'authenticating'

interface Values {
  email: string
  name: string
  card: string
  expiry: string
  cvc: string
  country: string
  postal: string
}

type Errors = Partial<Record<FieldKey, string>>

const fieldLabels: Record<FieldKey, string> = {
  email: 'Email',
  name: 'Name on card',
  card: 'Card number',
  expiry: 'Expiry date',
  cvc: 'Security code',
  country: 'Country',
  postal: 'Postal code',
}

const initialValues: Values = {
  email: '',
  name: '',
  card: '',
  expiry: '',
  cvc: '',
  country: '',
  postal: '',
}

function luhn(value: string) {
  const digits = value.replace(/\D/g, '')
  let sum = 0
  let double = false
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index])
    if (double) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    double = !double
  }
  return sum % 10 === 0
}

function validate(values: Values): Errors {
  const errors: Errors = {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a well-formed email address, such as you@domain.tld.'
  }
  if (values.name.trim().length < 2) {
    errors.name = 'Enter the name printed on the card.'
  }
  const cardDigits = values.card.replace(/\D/g, '')
  if (cardDigits.length < 15 || cardDigits.length > 16 || !luhn(cardDigits)) {
    errors.card = 'Use a 15–16 digit demo card number that passes the checksum. 4242 4242 4242 4242 works.'
  }
  const expiry = /^(\d{2})\/(\d{2})$/.exec(values.expiry)
  if (!expiry) {
    errors.expiry = 'Use MM/YY.'
  } else {
    const month = Number(expiry[1])
    const year = 2000 + Number(expiry[2])
    if (month < 1 || month > 12) {
      errors.expiry = 'Month must be 01–12.'
    } else if (new Date(year, month, 1) <= new Date()) {
      errors.expiry = 'That expiry date has passed. Use a future date.'
    }
  }
  if (!/^\d{3,4}$/.test(values.cvc)) {
    errors.cvc = 'Enter 3 or 4 digits.'
  }
  if (!values.country) {
    errors.country = 'Choose a billing country.'
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/.test(values.postal)) {
    errors.postal = 'Enter a postal code of 3–10 letters, digits, spaces or hyphens.'
  }
  return errors
}

type DocketTone = 'warn' | 'danger' | 'info' | 'ok'

interface DocketStamp {
  id: string
  label: string
  tone: DocketTone
}

function OrderDocket({
  state,
  stamps,
  receipt,
  email,
  compact = false,
}: {
  state: string
  stamps: DocketStamp[]
  receipt?: string
  email?: string
  compact?: boolean
}) {
  return (
    <div
      className={`checkout-docket ${compact ? 'checkout-docket--compact' : ''}`}
      data-state={state.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}
    >
      <div className="checkout-docket__head">
        <p className="kicker">Order docket / demo</p>
        <span className="tag">$12 / month</span>
      </div>
      <div className="checkout-docket__perf" aria-hidden="true" />
      <div className="checkout-docket__item">
        <div>
          <h2>Fathom Logs</h2>
          <p>One seat / 30-day retention / 10 GB ingest</p>
        </div>
        <p className="checkout-docket__price">$12.00</p>
      </div>
      <div className="checkout-docket__stamps" aria-live="polite">
        <span className="checkout-docket__state">State / {state}</span>
        <div className="checkout-docket__stamp-row">
          {stamps.length === 0
            ? <span className="checkout-docket__stamp checkout-docket__stamp--draft">Draft</span>
            : stamps.map((stamp) => (
              <span key={stamp.id} className={`checkout-docket__stamp checkout-docket__stamp--${stamp.tone}`}>
                {stamp.label}
              </span>
            ))}
        </div>
      </div>
      <div className="checkout-receipt">
        <div><span>Plan</span><b>$12.00</b></div>
        <div><span>Seats</span><b>1</b></div>
        <div><span>Tax</span><b>$0.00</b></div>
        {receipt && <div><span>Receipt</span><b>{receipt}</b></div>}
        {email && <div><span>Seat</span><b>{email}</b></div>}
        <div className="checkout-receipt__total">
          <span>{receipt ? 'Charged' : 'Due today'}</span>
          <b>{receipt ? '$0.00' : '$12.00'}</b>
        </div>
      </div>
      <p className="checkout-summary__fine">
        {receipt
          ? 'Demo receipt. No card was charged and no account was created.'
          : 'Monthly from today. Placeholder price; no payment is processed. Card fields never leave this page.'}
      </p>
      {!receipt && (
        <p className="checkout-summary__fine">
          Need a test value? Use <code>4242 4242 4242 4242</code>, <code>12/30</code>, <code>123</code>.
        </p>
      )}
    </div>
  )
}

export function CheckoutPage() {
  const [values, setValues] = useState<Values>(initialValues)
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({})
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [outcome, setOutcome] = useState<Outcome>('approved')
  const [authNote, setAuthNote] = useState('')
  const [receipt, setReceipt] = useState('')
  const [stamps, setStamps] = useState<DocketStamp[]>([])
  const [authOpen, setAuthOpen] = useState(false)
  const authDialog = useRef<HTMLDialogElement>(null)
  const authCompleted = useRef(false)
  const errorSummary = useRef<HTMLDivElement>(null)
  const successHeading = useRef<HTMLHeadingElement>(null)
  const timers = useRef<number[]>([])
  const processing = status === 'processing'

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  useEffect(() => {
    if (status === 'success') successHeading.current?.focus()
  }, [status])

  useEffect(() => {
    if (authOpen) authDialog.current?.showModal()
  }, [authOpen])

  const update = (key: FieldKey, value: string) => {
    const nextValues = { ...values, [key]: value }
    setValues(nextValues)
    if (touched[key] || submitted) {
      setErrors(validate(nextValues))
    }
  }

  const blur = (key: FieldKey) => {
    setTouched((current) => ({ ...current, [key]: true }))
    setErrors(validate(values))
  }

  const formatCard = (raw: string) => raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const formatExpiry = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4)
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
  }

  const addStamp = (stamp: DocketStamp) => {
    setStamps((current) => current.some((item) => item.id === stamp.id) ? current : [...current, stamp])
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (processing) return
    setSubmitted(true)
    const nextErrors = validate(values)
    setErrors(nextErrors)
    setAuthNote('')
    setReceipt('')
    if (Object.keys(nextErrors).length > 0) {
      addStamp({ id: 'checked', label: 'Checked / incomplete', tone: 'warn' })
      setStatus('idle')
      window.requestAnimationFrame(() => errorSummary.current?.focus())
      return
    }
    setStatus('processing')
    const timer = window.setTimeout(() => {
      if (outcome === 'approved') {
        setReceipt(`FTH-${String(Math.floor(1000 + Math.random() * 9000))}`)
        addStamp({ id: 'paid', label: 'Paid / demo', tone: 'ok' })
        setStatus('success')
      } else if (outcome === 'declined') {
        addStamp({ id: 'declined', label: 'Declined', tone: 'danger' })
        setStatus('declined')
      } else if (outcome === 'network') {
        addStamp({ id: 'timeout', label: 'Timed out', tone: 'danger' })
        setStatus('network')
      } else {
        addStamp({ id: 'auth', label: '3-D Secure', tone: 'info' })
        setStatus('authenticating')
        setAuthOpen(true)
      }
    }, 1100)
    timers.current.push(timer)
  }

  const completeAuth = () => {
    authCompleted.current = true
    setAuthOpen(false)
    authDialog.current?.close()
    setReceipt(`FTH-${String(Math.floor(1000 + Math.random() * 9000))}`)
    addStamp({ id: 'paid', label: 'Paid / demo', tone: 'ok' })
    setStatus('success')
    setAuthNote('')
  }

  const cancelAuth = () => {
    authCompleted.current = false
    setAuthOpen(false)
    authDialog.current?.close()
  }

  const onAuthClose = () => {
    if (status === 'authenticating') {
      if (!authCompleted.current) {
        addStamp({ id: 'auth-cancelled', label: 'Auth cancelled', tone: 'warn' })
        setStatus('idle')
        setAuthNote('No charge was made. Try again when ready.')
      }
    }
    authCompleted.current = false
  }

  const resetDemo = () => {
    setValues(initialValues)
    setTouched({})
    setErrors({})
    setSubmitted(false)
    setStatus('idle')
    setAuthNote('')
    setReceipt('')
    setStamps([])
    setOutcome('approved')
  }

  const focusField = (key: FieldKey) => {
    document.getElementById(`checkout-${key}`)?.focus()
  }

  const errorEntries = Object.entries(errors) as [FieldKey, string][]
  const showSummary = (submitted || Object.keys(touched).length > 0) && errorEntries.length > 0
  const docketState = status === 'processing'
    ? 'Authorising'
    : status === 'declined'
      ? 'Declined'
      : status === 'network'
        ? 'No response'
        : status === 'authenticating'
          ? '3-D Secure'
          : showSummary
            ? 'Incomplete'
            : 'Draft'

  if (status === 'success') {
    return (
      <main id="main" className="checkout">
        <header className="checkout-top">
          <a className="checkout-brand" href="#main">
            <span aria-hidden="true">F</span> Fathom
          </a>
          <span className="checkout-secure">Demo checkout / no charge</span>
        </header>
        <section className="checkout-success" aria-labelledby="success-title">
          <p className="kicker">Demo receipt / authorised locally</p>
          <h1 id="success-title" ref={successHeading} tabIndex={-1}>You are in.</h1>
          <p className="checkout-success__lede">
            Fathom Logs is ready for one seat. This is a demonstration: no card was charged,
            no account was created and no data left the page.
          </p>
          <OrderDocket
            state="Paid / demo"
            stamps={stamps}
            receipt={receipt || 'FTH-DEMO'}
            email={values.email}
            compact
          />
          <p className="checkout-success__note">
            A real checkout would charge $12.00 monthly and send a receipt. This one says so
            instead of pretending.
          </p>
          <div className="checkout-success__actions">
            <button className="button button--primary" type="button" onClick={resetDemo}>Reset demo</button>
            <Link className="button" to="/">Back to the index</Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main id="main" className="checkout">
      <header className="checkout-top">
        <a className="checkout-brand" href="#main">
          <span aria-hidden="true">F</span> Fathom
        </a>
        <span className="checkout-secure">Demo checkout / no payment is processed</span>
      </header>

      <div className="checkout-head">
        <div>
          <p className="kicker">Checkout / one seat</p>
          <h1>One seat. Twelve dollars.</h1>
          <p>
            A small checkout for a small product. Every field is validated locally; nothing
            is sent to a payment service. The card fields accept demo values only.
          </p>
        </div>
        <div className="checkout-step">
          <span className="kicker">Step</span>
          <strong>02 / 02</strong>
          <span className="meta">Review and pay</span>
        </div>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={submit} noValidate>
          {status === 'declined' && (
            <div className="checkout-banner checkout-banner--danger" role="alert">
              <strong>Card declined / demo.</strong> The demo payment outcome is set to
              decline. No charge was attempted. Choose another outcome or try again.
              <button className="button button--sm" type="button" onClick={() => { setStatus('idle'); document.getElementById('checkout-card')?.focus() }}>
                Try another card
              </button>
            </div>
          )}
          {status === 'network' && (
            <div className="checkout-banner checkout-banner--danger" role="alert">
              <strong>Payment service unavailable / demo.</strong> The simulated network
              request timed out. Your input is intact. Retry when ready.
              <button className="button button--sm" type="button" onClick={() => setStatus('idle')}>
                Dismiss and retry
              </button>
            </div>
          )}
          {authNote && (
            <div className="checkout-banner" role="status">
              <strong>Authentication cancelled.</strong> {authNote}
            </div>
          )}

          {showSummary && (
            <div className="checkout-errors" ref={errorSummary} tabIndex={-1} role="alert">
              <p className="kicker">Check the form / {errorEntries.length} {errorEntries.length === 1 ? 'issue' : 'issues'}</p>
              <ul>
                {errorEntries.map(([key, message]) => (
                  <li key={key}><button type="button" onClick={() => focusField(key)}>{fieldLabels[key]}: {message}</button></li>
                ))}
              </ul>
            </div>
          )}

          <fieldset className="checkout-fieldset" disabled={processing}>
            <legend><span aria-hidden="true">01</span> Contact</legend>
            <div className="field">
              <label htmlFor="checkout-email">Email</label>
              <input
                id="checkout-email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(event) => update('email', event.target.value)}
                onBlur={() => blur('email')}
                aria-invalid={Boolean(errors.email && (touched.email || submitted))}
                aria-describedby={errors.email && (touched.email || submitted) ? 'checkout-email-error' : undefined}
              />
              {errors.email && (touched.email || submitted) && <p className="field-error" id="checkout-email-error">{errors.email}</p>}
            </div>
          </fieldset>

          <fieldset className="checkout-fieldset" disabled={processing}>
            <legend><span aria-hidden="true">02</span> Payment</legend>
            <div className="field">
              <label htmlFor="checkout-name">Name on card</label>
              <input
                id="checkout-name"
                type="text"
                autoComplete="cc-name"
                value={values.name}
                onChange={(event) => update('name', event.target.value)}
                onBlur={() => blur('name')}
                aria-invalid={Boolean(errors.name && (touched.name || submitted))}
                aria-describedby={errors.name && (touched.name || submitted) ? 'checkout-name-error' : undefined}
              />
              {errors.name && (touched.name || submitted) && <p className="field-error" id="checkout-name-error">{errors.name}</p>}
            </div>
            <div className="field">
              <label htmlFor="checkout-card">Card number</label>
              <input
                id="checkout-card"
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                value={values.card}
                placeholder="4242 4242 4242 4242"
                onChange={(event) => update('card', formatCard(event.target.value))}
                onBlur={() => blur('card')}
                aria-invalid={Boolean(errors.card && (touched.card || submitted))}
                aria-describedby={errors.card && (touched.card || submitted) ? 'checkout-card-error' : 'checkout-card-help'}
              />
              {errors.card && (touched.card || submitted)
                ? <p className="field-error" id="checkout-card-error">{errors.card}</p>
                : <p className="field-help" id="checkout-card-help">Demo number: 4242 4242 4242 4242. Not a real payment field.</p>}
            </div>
            <div className="checkout-split">
              <div className="field">
                <label htmlFor="checkout-expiry">Expiry</label>
                <input
                  id="checkout-expiry"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  value={values.expiry}
                  onChange={(event) => update('expiry', formatExpiry(event.target.value))}
                  onBlur={() => blur('expiry')}
                  aria-invalid={Boolean(errors.expiry && (touched.expiry || submitted))}
                  aria-describedby={errors.expiry && (touched.expiry || submitted) ? 'checkout-expiry-error' : undefined}
                />
                {errors.expiry && (touched.expiry || submitted) && <p className="field-error" id="checkout-expiry-error">{errors.expiry}</p>}
              </div>
              <div className="field">
                <label htmlFor="checkout-cvc">Security code</label>
                <input
                  id="checkout-cvc"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  value={values.cvc}
                  onChange={(event) => update('cvc', event.target.value.replace(/\D/g, '').slice(0, 4))}
                  onBlur={() => blur('cvc')}
                  aria-invalid={Boolean(errors.cvc && (touched.cvc || submitted))}
                  aria-describedby={errors.cvc && (touched.cvc || submitted) ? 'checkout-cvc-error' : undefined}
                />
                {errors.cvc && (touched.cvc || submitted) && <p className="field-error" id="checkout-cvc-error">{errors.cvc}</p>}
              </div>
            </div>
          </fieldset>

          <fieldset className="checkout-fieldset" disabled={processing}>
            <legend><span aria-hidden="true">03</span> Billing address</legend>
            <div className="checkout-split">
              <div className="field">
                <label htmlFor="checkout-country">Country</label>
                <select
                  id="checkout-country"
                  autoComplete="country"
                  value={values.country}
                  onChange={(event) => update('country', event.target.value)}
                  onBlur={() => blur('country')}
                  aria-invalid={Boolean(errors.country && (touched.country || submitted))}
                  aria-describedby={errors.country && (touched.country || submitted) ? 'checkout-country-error' : undefined}
                >
                  <option value="">Choose a country</option>
                  <option value="US">United States</option>
                  <option value="DE">Germany</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                </select>
                {errors.country && (touched.country || submitted) && <p className="field-error" id="checkout-country-error">{errors.country}</p>}
              </div>
              <div className="field">
                <label htmlFor="checkout-postal">Postal code</label>
                <input
                  id="checkout-postal"
                  type="text"
                  autoComplete="postal-code"
                  value={values.postal}
                  onChange={(event) => update('postal', event.target.value.toUpperCase().slice(0, 10))}
                  onBlur={() => blur('postal')}
                  aria-invalid={Boolean(errors.postal && (touched.postal || submitted))}
                  aria-describedby={errors.postal && (touched.postal || submitted) ? 'checkout-postal-error' : undefined}
                />
                {errors.postal && (touched.postal || submitted) && <p className="field-error" id="checkout-postal-error">{errors.postal}</p>}
              </div>
            </div>
          </fieldset>

          <div className="checkout-outcome">
            <label htmlFor="checkout-outcome">Demo payment outcome</label>
            <select
              id="checkout-outcome"
              value={outcome}
              onChange={(event) => setOutcome(event.target.value as Outcome)}
              disabled={processing}
            >
              <option value="approved">Approved / demo</option>
              <option value="declined">Card declined</option>
              <option value="network">Network timeout</option>
              <option value="authenticate">3-D Secure required</option>
            </select>
            <p className="field-help">This is a local simulation. No bank or processor is contacted.</p>
          </div>

          <div className="checkout-submit">
            <button className="button button--primary" type="submit" disabled={processing}>
              {processing ? 'Processing demo…' : 'Pay $12.00 / demo'}
            </button>
            <p className="meta" aria-live="polite">
              {processing ? 'Running the local demo outcome. Input is preserved.' : 'No real payment. Card data never leaves this tab.'}
            </p>
          </div>
        </form>

        <aside className="checkout-aside" aria-label="Order summary">
          <OrderDocket state={docketState} stamps={stamps} />
          <div className="checkout-trust">
            <p className="kicker">What this demonstrates</p>
            <ul className="terminal-list">
              <li>Inline validation, error summary and preserved input.</li>
              <li>Pending, declined, network failure and 3-D Secure states.</li>
              <li>A success receipt that admits it is a demo.</li>
            </ul>
          </div>
        </aside>
      </div>

      <footer className="checkout-footer">
        <span>Fathom / fictional SaaS / placeholder checkout</span>
        <span>No card processing / no account created</span>
      </footer>

      <dialog
        ref={authDialog}
        className="auth-dialog dialog-surface"
        aria-labelledby="auth-title"
        onClose={onAuthClose}
      >
        <p className="kicker">Simulated 3-D Secure</p>
        <h2 id="auth-title">Authentication required.</h2>
        <p>
          A real checkout would hand this step to the card issuer. Here it is a local demo
          dialog. Complete it to see the success state; cancel to return to the form.
        </p>
        <div className="auth-dialog__actions">
          <button className="button button--primary" type="button" onClick={completeAuth}>Complete demo authentication</button>
          <button className="button" type="button" onClick={cancelAuth}>Cancel</button>
        </div>
      </dialog>
    </main>
  )
}
