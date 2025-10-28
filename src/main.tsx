import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Calendar from './Calender/Calender'
import Login from './Login/Login'
import CreateAccount from './Login/CreateAccount'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Home route */}
        <Route path="/" element={<App />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Create account */}
        <Route path="/register" element={<CreateAccount />} />

        {/* Full-page calendar route */}
        <Route path="/calendar" element={<Calendar />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
