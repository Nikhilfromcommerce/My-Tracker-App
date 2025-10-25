import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // Imports your main app component
import './index.css' // Imports your Tailwind styles

// Finds the <div id="root"> in your index.html and renders your App inside it
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

