import React from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import '@/index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('[main] Root element #root not found in index.html')
}

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
if (!clientId) {
  throw new Error('[main] Missing VITE_GOOGLE_CLIENT_ID in environment')
}

createRoot(rootElement).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('[SW] Registered successfully with scope:', registration.scope)
      })
      .catch(error => {
        console.error('[SW] Registration failed:', error)
      })
  })
}
