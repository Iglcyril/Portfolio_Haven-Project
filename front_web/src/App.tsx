import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import StudentDashboard from './pages/dashboard/StudentDashboard'
import ParentOnboarding from './pages/ParentOnboarding'
import ParentDashboard from './pages/dashboard/ParentDashboard'
import ProfessionalOnboarding from './pages/ProfessionalOnboarding'
import ProfessionalDashboard from './pages/dashboard/ProfessionalDashboard'

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/:portal" element={<AuthPage />} />
        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/onboarding/parent" element={<ParentOnboarding />} />
        <Route path="/dashboard/parent" element={<ParentDashboard />} />
        <Route path="/onboarding/professional" element={<ProfessionalOnboarding />} />
        <Route path="/dashboard/professional" element={<ProfessionalDashboard />} />
      </Routes>
    </ThemeProvider>
  )
}
