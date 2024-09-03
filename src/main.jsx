import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AIProvider } from './hooks/useAi.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <AIProvider>
      <App />
    </AIProvider>
  // </StrictMode>,
)
