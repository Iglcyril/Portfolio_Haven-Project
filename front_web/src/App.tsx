import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import StudentDashboard from './pages/dashboard/StudentDashboard'

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/:portal" element={<AuthPage />} />
        <Route path="/dashboard/student" element={<StudentDashboard />} />
      </Routes>
    </ThemeProvider>
  )
}
