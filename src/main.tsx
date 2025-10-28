import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import Calendar from './Calender/Calender'
import Login from './Login/Login'
import CreateAccount from './Login/CreateAccount'
import AdminDashboard from './Admin/Admin'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Home route - redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Create account */}
        <Route path="/register" element={<CreateAccount />} />

        {/* Full-page calendar route */}
        <Route path="/calendar" element={<Calendar />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
