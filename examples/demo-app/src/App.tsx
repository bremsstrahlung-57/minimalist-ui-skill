import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { DemoStrip } from './components/DemoStrip'
import { routeMeta } from './lib/routes'
import { IndexPage } from './pages/IndexPage'
import { LandingPage } from './pages/LandingPage'
import { DashboardPage } from './pages/DashboardPage'
import { DocsPage } from './pages/DocsPage'
import { StorePage } from './pages/StorePage'
import { QuizPage } from './pages/QuizPage'
import { PortfolioPage } from './pages/PortfolioPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { LuxuryPage } from './pages/LuxuryPage'

function RouteEffects() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
    const meta = routeMeta(location.pathname)
    document.title = meta
      ? `${meta.project} — ${meta.title} · Textured minimal`
      : 'Textured minimal — eight demo sites'
    document.body.dataset.route = location.pathname.split('/')[1] || 'index'
  }, [location.pathname])

  return null
}

function NotFoundPage() {
  return (
    <main id="main" className="not-found">
      <p className="kicker">404 / no such demo</p>
      <h1 className="display">Nothing <em>here</em>.</h1>
      <p>The address does not match one of the eight studies.</p>
      <Link className="button button--primary" to="/">Back to the index</Link>
    </main>
  )
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <RouteEffects />
      <DemoStrip />
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/luxury" element={<LuxuryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}
