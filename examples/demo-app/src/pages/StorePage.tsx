import { useRef, useState } from 'react'

interface Product {
  id: string
  name: string
  price: number
  kind: string
  mount: string
  switchName: string
  note: string
  stock: string
  tone: string
  rows: number[]
  accentKey: number
}

const products: Product[] = [
  {
    id: 'stem-60',
    name: 'Stem 60',
    price: 189,
    kind: '60% / gasket',
    mount: 'gasket mount',
    switchName: 'lubed linears',
    note: 'A quiet tray for long writing days. Aluminium case, foam shelf, no brass weight.',
    stock: '3 in stock / demo',
    tone: 'cat-1',
    rows: [13, 13, 12, 7],
    accentKey: 4,
  },
  {
    id: 'stem-65',
    name: 'Stem 65',
    price: 224,
    kind: '65% / top mount',
    mount: 'top mount',
    switchName: 'tactile 62g',
    note: 'Arrow cluster and a delete key without giving up the small footprint.',
    stock: 'Backorder / demo',
    tone: 'cat-2',
    rows: [15, 14, 13, 10],
    accentKey: 11,
  },
  {
    id: 'stem-75',
    name: 'Stem 75',
    price: 249,
    kind: '75% / gasket',
    mount: 'gasket mount',
    switchName: 'silent linears',
    note: 'Function row, knob, and a plate that keeps the low end out of the next room.',
    stock: '1 in stock / demo',
    tone: 'cat-3',
    rows: [16, 16, 14, 12],
    accentKey: 9,
  },
  {
    id: 'split-stem',
    name: 'Split Stem',
    price: 310,
    kind: 'split 60 / tented',
    mount: 'tented halves',
    switchName: 'linears 55g',
    note: 'Two halves, one USB-C cable, and a 12° tent kit. Built to order on the bench.',
    stock: 'Built to order / demo',
    tone: 'cat-4',
    rows: [7, 7, 7, 7],
    accentKey: 3,
  },
  {
    id: 'grid-40',
    name: 'Grid 40',
    price: 165,
    kind: 'ortho 40 / plate',
    mount: 'plate mount',
    switchName: 'clicky 58g',
    note: 'A small ortholinear board for layer-minded people. Loud on purpose.',
    stock: '2 in stock / demo',
    tone: 'cat-5',
    rows: [12, 12, 12, 11],
    accentKey: 6,
  },
  {
    id: 'bench-macro',
    name: 'Bench Macropad',
    price: 84,
    kind: '3 × 3 + knob',
    mount: 'tray mount',
    switchName: 'linear 45g',
    note: 'Nine keys and one knob for the shortcuts you keep forgetting.',
    stock: '5 in stock / demo',
    tone: 'cat-6',
    rows: [3, 3, 3, 3],
    accentKey: 8,
  },
]

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function BoardIllustration({ product }: { product: Product }) {
  const keyGap = 2
  const maxCount = Math.max(...product.rows)
  const keyWidth = Math.min(22, (300 - (maxCount - 1) * keyGap) / maxCount)
  const rowHeight = 13
  return (
    <svg viewBox="0 0 340 150" role="img" aria-label={`Line drawing of a ${product.kind} keyboard`}>
      <rect x="18" y="27" width="304" height="96" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="18" y1="132" x2="322" y2="132" stroke="currentColor" strokeWidth="1" />
      {product.rows.map((count, rowIndex) => {
        const total = count * keyWidth + (count - 1) * keyGap
        const start = (340 - total) / 2
        const y = 38 + rowIndex * (rowHeight + 4)
        return (
          <g key={rowIndex}>
            {Array.from({ length: count }, (_, keyIndex) => {
              const isAccent = rowIndex * 4 + keyIndex === product.accentKey
              return (
                <rect
                  key={keyIndex}
                  x={start + keyIndex * (keyWidth + keyGap)}
                  y={y}
                  width={keyWidth}
                  height={rowHeight}
                  fill={isAccent ? 'var(--board-accent)' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity={isAccent ? 1 : 0.7}
                />
              )
            })}
          </g>
        )
      })}
      <text x="18" y="20" fill="currentColor" fontSize="8" fontFamily="var(--font-mono)" letterSpacing="1.4">{product.kind.toUpperCase()}</text>
      <text x="322" y="20" textAnchor="end" fill="currentColor" fontSize="8" fontFamily="var(--font-mono)" letterSpacing="1.4">DEMO</text>
    </svg>
  )
}

function CartContents({
  lines,
  count,
  subtotal,
  onQty,
  onRemove,
  onClose,
  onCheckout,
  checkoutNote,
}: {
  lines: { product: Product; qty: number }[]
  count: number
  subtotal: number
  onQty: (id: string, delta: number) => void
  onRemove: (id: string) => void
  onClose: () => void
  onCheckout: () => void
  checkoutNote: string
}) {
  if (lines.length === 0) {
    return (
      <div className="cart-empty">
        <p className="kicker">Cart / empty</p>
        <h3>No boards on the bench.</h3>
        <p>Pick a board and it will show up here. Prices and stock are placeholders.</p>
        <button className="button" type="button" onClick={onClose}>Browse the six boards</button>
      </div>
    )
  }

  return (
    <>
      <ul className="cart-lines">
        {lines.map(({ product, qty }) => (
          <li key={product.id} className="cart-line">
            <div>
              <p className="cart-line__name">{product.name}</p>
              <p className="cart-line__meta">{product.kind} / {product.switchName}</p>
            </div>
            <div className="cart-line__qty" role="group" aria-label={`Quantity for ${product.name}`}>
              <button type="button" onClick={() => onQty(product.id, -1)} aria-label={`Decrease ${product.name} quantity`}>−</button>
              <span aria-label={`${qty} in cart`}>{qty}</span>
              <button type="button" onClick={() => onQty(product.id, 1)} aria-label={`Increase ${product.name} quantity`}>+</button>
            </div>
            <p className="cart-line__price">{money.format(product.price * qty)}</p>
            <button className="cart-line__remove" type="button" onClick={() => onRemove(product.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="cart-total">
        <span>{count} {count === 1 ? 'board' : 'boards'} / placeholder prices</span>
        <strong>{money.format(subtotal)}</strong>
      </div>
      {checkoutNote && <p className="cart-note" role="status">{checkoutNote}</p>}
      <button className="button button--primary cart-checkout" type="button" onClick={onCheckout}>
        Checkout / demo
      </button>
      <p className="cart-fine">Demo shop. No payment is processed and no order is placed.</p>
    </>
  )
}

export function StorePage() {
  const [cart, setCart] = useState<Record<string, number>>({})
  const [cartMessage, setCartMessage] = useState('')
  const [checkoutNote, setCheckoutNote] = useState('')
  const cartDialog = useRef<HTMLDialogElement>(null)
  const cartButton = useRef<HTMLButtonElement>(null)
  const cartTrigger = useRef<HTMLElement | null>(null)

  const lines = products
    .filter((product) => (cart[product.id] || 0) > 0)
    .map((product) => ({ product, qty: cart[product.id] }))
  const count = lines.reduce((total, line) => total + line.qty, 0)
  const subtotal = lines.reduce((total, line) => total + line.product.price * line.qty, 0)

  const openCart = () => {
    cartTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    cartDialog.current?.showModal()
  }

  const add = (product: Product) => {
    setCart((current) => ({ ...current, [product.id]: (current[product.id] || 0) + 1 }))
    setCartMessage(`${product.name} added. Cart has ${count + 1} ${count === 0 ? 'board' : 'boards'}.`)
    setCheckoutNote('')
    openCart()
  }

  const changeQty = (id: string, delta: number) => {
    setCart((current) => {
      const next = (current[id] || 0) + delta
      if (next <= 0) {
        const rest = { ...current }
        delete rest[id]
        return rest
      }
      return { ...current, [id]: next }
    })
    setCheckoutNote('')
  }

  const remove = (id: string) => {
    setCart((current) => {
      const rest = { ...current }
      delete rest[id]
      return rest
    })
    setCheckoutNote('')
  }

  return (
    <main id="main" className="store">
      <header className="store-top">
        <a className="store-brand" href="#top">
          <span className="store-brand__mark" aria-hidden="true">S/S</span>
          <span>
            Solder &amp; Stem
            <small>One bench / fictional shop</small>
          </span>
        </a>
        <nav className="store-nav" aria-label="Shop sections">
          <a href="#boards">Boards</a>
          <a href="#bench-notes">Bench notes</a>
          <a href="#about">About</a>
        </nav>
        <button ref={cartButton} className="store-cart-button" type="button" onClick={openCart} aria-haspopup="dialog">
          Cart <span>{String(count).padStart(2, '0')}</span>
        </button>
      </header>

      <section className="store-hero" id="top" aria-labelledby="store-title">
        <div>
          <p className="kicker">Small-batch keyboards / placeholder catalogue</p>
          <h1 id="store-title" className="display">Six boards. One bench.</h1>
        </div>
        <p className="store-lede">
          One person, a solder iron and a small run of aluminium cases. Read the six by
          layout and mount first; each row keeps its stock, switch and honest note.
          Nothing here is a real product.
        </p>
      </section>

      <div className="store-layout">
        <div className="store-catalog">
          <div className="store-section-head">
            <h2 id="boards" className="section-title">The six</h2>
            <p className="meta">USD / placeholder prices / sorted by shape</p>
          </div>
          <div className="store-index-head" aria-hidden="true">
            <span>No.</span>
            <span>Layout</span>
            <span>Board / notes</span>
            <span>Mount / stock</span>
            <span>Price</span>
            <span />
          </div>
          <div className="store-index" role="list">
            {products.map((product, index) => (
              <article className="store-row" key={product.id} role="listitem">
                <span className="store-row__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <div className={`store-row__figure product-figure--${product.tone}`}>
                  <BoardIllustration product={product} />
                </div>
                <div className="store-row__identity">
                  <h3>{product.name}</h3>
                  <p className="product-kind">{product.kind} / {product.switchName}</p>
                  <p className="product-note">{product.note}</p>
                </div>
                <div className="store-row__facts">
                  <span>{product.mount}</span>
                  <span className="product-stock">{product.stock}</span>
                </div>
                <p className="product-price">{money.format(product.price)}</p>
                <button
                  className="button button--primary button--sm store-row__add"
                  type="button"
                  aria-label={`Add ${product.name} to cart`}
                  onClick={() => add(product)}
                >
                  Add
                </button>
              </article>
            ))}
          </div>
          <div className="store-note">
            <p className="kicker">Fine print / demo</p>
            <p>
              Product names, stock counts and prices are invented. No checkout is connected.
              Adding to cart only changes what you see on this page.
            </p>
          </div>
        </div>

        <aside className="cart-panel" aria-labelledby="cart-title">
          <div className="cart-panel__head">
            <h2 id="cart-title">Cart</h2>
            <span>{String(count).padStart(2, '0')}</span>
          </div>
          <CartContents
            lines={lines}
            count={count}
            subtotal={subtotal}
            onQty={changeQty}
            onRemove={remove}
            onClose={() => document.getElementById('boards')?.scrollIntoView()}
            onCheckout={() => setCheckoutNote('Demo only. Checkout is not connected; no payment is processed.')}
            checkoutNote={checkoutNote}
          />
        </aside>
      </div>

      <section id="bench-notes" className="store-notes" aria-labelledby="bench-title">
        <div>
          <p className="kicker">Bench notes / placeholder</p>
          <h2 id="bench-title" className="title-xl">What is on the bench this week.</h2>
        </div>
        <div className="store-notes__list">
          <p><strong>Stem 60 / batch 04.</strong> Cases are back from anodising. Two boards are waiting on switches; one is ready to leave.</p>
          <p><strong>Split Stem.</strong> Tent kits are cut. The next build slot opens after the current batch is packed.</p>
          <p><strong>No reviews, no countdowns.</strong> This is a demo shop; it does not pretend to have customers or urgency.</p>
        </div>
      </section>

      <section id="about" className="store-about" aria-labelledby="about-title">
        <div className="store-about__mark" aria-hidden="true">S/S</div>
        <div>
          <p className="kicker">About / fictional</p>
          <h2 id="about-title" className="title-xl">Built one at a time, on purpose.</h2>
          <p>
            Solder &amp; Stem is a placeholder for a one-person workshop. The layout favours
            readable stock and price over urgency: no invented reviews, no crossed-out prices,
            no stock timers.
          </p>
        </div>
      </section>

      <footer className="store-footer">
        <span>Solder &amp; Stem / demo shop / all products invented</span>
        <span>Bench 01 / 2026</span>
      </footer>

      <dialog
        ref={cartDialog}
        className="cart-dialog dialog-surface"
        aria-labelledby="cart-dialog-title"
        onClose={() => {
          const target = cartTrigger.current ?? cartButton.current
          window.requestAnimationFrame(() => target?.focus())
        }}
      >
        <div className="cart-panel__head">
          <h2 id="cart-dialog-title">Your cart</h2>
          <button className="button button--sm" type="button" onClick={() => cartDialog.current?.close()}>Close</button>
        </div>
        <p className="cart-dialog__status" aria-live="polite">{cartMessage}</p>
        <CartContents
          lines={lines}
          count={count}
          subtotal={subtotal}
          onQty={changeQty}
          onRemove={remove}
          onClose={() => cartDialog.current?.close()}
          onCheckout={() => setCheckoutNote('Demo only. Checkout is not connected; no payment is processed.')}
          checkoutNote={checkoutNote}
        />
      </dialog>
    </main>
  )
}
