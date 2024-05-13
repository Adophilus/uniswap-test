import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { HomePage } from './pages/home'

const rootElement = document.getElementById('app')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <HomePage />
    </StrictMode>,
  )
}
