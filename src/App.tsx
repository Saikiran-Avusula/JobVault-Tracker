import { Routes, Route, Navigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import AppLayout from './components/layout/AppLayout'
import ApplicationsPage from './pages/ApplicationsPage'
import ApplicationDetailPage from './pages/ApplicationDetailPage'
import LoginPage from './pages/LoginPage'
import TrashPage from './pages/TrashPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/applications" replace />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="applications/:id" element={<ApplicationDetailPage />} />
          <Route path="trash" element={<TrashPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="applied" element={<ApplicationsPage />} />
          <Route path="interviews" element={<ApplicationsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Analytics />
    </>
  )
}
