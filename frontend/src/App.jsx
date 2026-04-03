import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import ViralFilter from './pages/ViralFilter'
import Downloader from './pages/Downloader'
import Editor from './pages/Editor'
import Uploader from './pages/Uploader'
import Scheduler from './pages/Scheduler'
import Payment from './pages/Payment'
import Settings from './pages/Settings'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/viral-filter" element={<ViralFilter />} />
      <Route path="/downloader" element={<Downloader />} />
      <Route path="/editor" element={<Editor />} />
      <Route path="/uploader" element={<Uploader />} />
      <Route path="/scheduler" element={<Scheduler />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  )
}
export default App
