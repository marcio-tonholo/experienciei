import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import AuthCallback from './pages/AuthCallback'
import ResetPassword from './pages/ResetPassword'
import Onboarding from './pages/Onboarding'
import StudentHome from './pages/StudentHome'
import MentorHome from './pages/MentorHome'
import MentorProfile from './pages/MentorProfile'
import OfferingDetail from './pages/OfferingDetail'
import Explorar from './pages/Explorar'

function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="w-10 h-10 rounded-full border-4 border-[#1E3A8A] border-t-transparent animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/" replace />
  if (!profile) return <Navigate to="/onboarding" replace />
  return children
}

function OnboardingRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="w-10 h-10 rounded-full border-4 border-[#1E3A8A] border-t-transparent animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/" replace />
  if (profile) return <Navigate to="/home" replace />
  return children
}

function HomeRouter() {
  const { profile } = useAuth()
  return profile?.papel === 'mentor' ? <MentorHome /> : <StudentHome />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
      <Route path="/explorar" element={<Explorar />} />
      <Route path="/home" element={<ProtectedRoute><HomeRouter /></ProtectedRoute>} />
      <Route path="/mentor/:id" element={<ProtectedRoute><MentorProfile /></ProtectedRoute>} />
      <Route path="/offering/:id" element={<OfferingDetail />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
