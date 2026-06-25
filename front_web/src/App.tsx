import { Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import StudentDashboard from './pages/dashboard/StudentDashboard'
import ParentOnboarding from './pages/ParentOnboarding'
import ParentDashboard from './pages/dashboard/ParentDashboard'
import ProfessionalOnboarding from './pages/ProfessionalOnboarding'
import ProfessionalDashboard from './pages/dashboard/ProfessionalDashboard'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/:portal" element={<AuthPage />} />
        <Route path="/dashboard/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/onboarding/parent" element={<ParentOnboarding />} />
        <Route path="/dashboard/parent" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
        <Route path="/onboarding/professional" element={<ProfessionalOnboarding />} />
        <Route path="/dashboard/professional" element={<ProtectedRoute><ProfessionalDashboard /></ProtectedRoute>} />
      </Routes>
      </ThemeProvider>
    </AuthProvider>
  )
}
