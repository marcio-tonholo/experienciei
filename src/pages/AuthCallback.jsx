import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AuthCallback() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (!user) navigate('/auth', { replace: true })
      else if (!profile) navigate('/onboarding', { replace: true })
      else navigate('/home', { replace: true })
    }
  }, [loading, user, profile, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#1E3A8A] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-[#64748B] text-sm">Autenticando...</p>
      </div>
    </div>
  )
}
