import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ThemeProvider } from './components/ThemeProvider'
import './styles/tokens.css'
import './styles/base.css'
import './styles/app.css'
import './styles/landing.css'
import './styles/dashboard.css'
import './styles/docs.css'
import './styles/store.css'
import './styles/quiz.css'
import './styles/portfolio.css'
import './styles/checkout.css'
import './styles/luxury.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
