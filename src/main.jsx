import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import faviconUrl from './assets/favicon.png'

// Ensure browser tab displays the official brand favicon dynamically
if (typeof document !== 'undefined') {
  const setFavicon = (url) => {
    const existing = document.querySelectorAll("link[rel*='icon'], link[rel='apple-touch-icon']");
    existing.forEach((el) => el.remove());
    const link = document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    link.href = url;
    document.head.appendChild(link);
  };
  setFavicon(faviconUrl);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
