import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Calendar from './Calender/Calender'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Home route */}
        <Route path="/" element={<App />} />

        {/* Full-page calendar route */}
        <Route path="/calendar" element={<Calendar />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
