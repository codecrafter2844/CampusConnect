import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminApp from './staff/AdminApp.jsx'
import OrganizerApp from './staff/OrganizerApp.jsx'

// Three entry points, one per role:
//   /           student site
//   /admin      college admin login + dashboard
//   /organizer  club organizer login + dashboard
const path = window.location.pathname.replace(/\/+$/, '')

const screens = {
  '/admin': <AdminApp />,
  '/organizer': <OrganizerApp />,
}

createRoot(document.getElementById('root')).render(
  <StrictMode>{screens[path] ?? <App />}</StrictMode>,
)
