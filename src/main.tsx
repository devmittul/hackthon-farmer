import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App.tsx'

const REQUIRED_ENV_VARS = [
  { key: 'VITE_API_URL', val: import.meta.env.VITE_API_URL },
  { key: 'VITE_MAPBOX_TOKEN', val: import.meta.env.VITE_MAPBOX_TOKEN },
];

for (const env of REQUIRED_ENV_VARS) {
  if (!env.val) {
    document.body.innerHTML = `<div style="padding: 20px; font-family: sans-serif; color: red;">
      <h2>Configuration Error</h2>
      <p>Missing required environment variable: <strong>${env.key}</strong></p>
      <p>Please check your .env file and restart the development server.</p>
    </div>`;
    throw new Error(`Missing required environment variable: ${env.key}`);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
