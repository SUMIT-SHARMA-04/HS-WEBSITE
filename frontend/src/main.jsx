import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// This site no longer registers a service worker. An earlier one cached the
// page shell, so after each deploy returning visitors were served a stale
// index.html pointing at JS files that no longer existed (the server answered
// those requests with HTML -> "Expected a JavaScript module script but the
// server responded with a MIME type of text/html" and a blank screen).
// Remove any worker and caches left behind by earlier versions.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}
if ('caches' in window) {
  caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
