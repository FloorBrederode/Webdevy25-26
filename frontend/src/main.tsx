import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Calendar from './Calender/Calender'
import Login from './Login/Login'
import CreateAccount from './Login/CreateAccount'
import ForgotPassword from './Login/ForgotPassword'
import ResetPassword from './Login/ResetPassword'
import AdminDashboard from './Admin/Admin'
import { AccountButton } from './components/AccountButton'
import { RequireAuth } from './Login/RequireAuth'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AccountButton />
      <Routes>
        {/* Home route - redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Create account */}
        <Route path="/register" element={<CreateAccount />} />

        {/* Forgot password */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Full-page calendar route */}
        <Route
          path="/calendar"
          element={(
            <RequireAuth>
              <Calendar />
            </RequireAuth>
          )}
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={(
            <RequireAuth>
              <AdminDashboard />
            </RequireAuth>
          )}
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
