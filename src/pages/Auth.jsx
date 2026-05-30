import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 512 512">
        <path d="M272 464h-32a32 32 0 01-32-32l.05-85.82a4 4 0 00-6-3.47l-74.34 43.06a31.48 31.48 0 01-43-11.52l-16.5-28.64a31.65 31.65 0 0111.56-42.8l74.61-43.25a4 4 0 000-6.92l-74.54-43.21a31.41 31.41 0 01-11.55-43l16.44-28.55a31.48 31.48 0 0143.07-11.54l74.31 43a4 4 0 006-3.47L208 80a32 32 0 0132-32h32a32 32 0 0132 32v85.72a4 4 0 006 3.47l74.34-43.06a31.51 31.51 0 0143 11.52l16.49 28.73a31.52 31.52 0 01-11.64 42.86l-74.53 43.2a4 4 0 000 6.92l74.53 43.2a31.42 31.42 0 0111.56 43l-16.44 28.55a31.48 31.48 0 01-43.07 11.54l-74.31-43a4 4 0 00-6 3.46L304 432a32 32 0 01-32 32z" />
      </svg>
    </div>
    <span className="text-xl font-bold text-white">Experenciei</span>
  </div>
)

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

export default function Auth() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [agreed, setAgreed] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/home')
  }

  const handleForgot = (e) => {
    e.preventDefault()
    setForgotSent(true)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#2563EB] flex-col justify-between p-12">
        <div>
          <Logo />
          <div className="mt-16">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
              <span className="text-4xl font-black text-white">AP</span>
            </div>
            <p className="text-blue-100 italic text-base leading-relaxed mb-3">
              "A plataforma que conectou minha carreira aos melhores cirurgiões do país."
            </p>
            <p className="text-white font-semibold">Dra. Ana Paula</p>
            <p className="text-blue-300 text-sm">Cirurgiã Cardiovascular</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[['500+', 'Médicos Especialistas'], ['1.200+', 'Mentorias Realizadas'], ['50+', 'Especialidades']].map(([num, label]) => (
            <div key={label} className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{num}</p>
              <p className="text-blue-200 text-xs mt-1 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 bg-white">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#1E3A8A] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 512 512">
                <path d="M272 464h-32a32 32 0 01-32-32l.05-85.82a4 4 0 00-6-3.47l-74.34 43.06a31.48 31.48 0 01-43-11.52l-16.5-28.64a31.65 31.65 0 0111.56-42.8l74.61-43.25a4 4 0 000-6.92l-74.54-43.21a31.41 31.41 0 01-11.55-43l16.44-28.55a31.48 31.48 0 0143.07-11.54l74.31 43a4 4 0 006-3.47L208 80a32 32 0 0132-32h32a32 32 0 0132 32v85.72a4 4 0 006 3.47l74.34-43.06a31.51 31.51 0 0143 11.52l16.49 28.73a31.52 31.52 0 01-11.64 42.86l-74.53 43.2a4 4 0 000 6.92l74.53 43.2a31.42 31.42 0 0111.56 43l-16.44 28.55a31.48 31.48 0 01-43.07 11.54l-74.31-43a4 4 0 00-6 3.46L304 432a32 32 0 01-32 32z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[#1E3A8A]">Experenciei</span>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto">
          {/* Tabs */}
          <div className="flex bg-[#F1F5F9] rounded-xl p-1 mb-8">
            <button
              onClick={() => { setIsLogin(false); setShowForgot(false) }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${!isLogin ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-[#64748B] hover:text-[#1E3A8A]'}`}
            >
              Cadastrar
            </button>
            <button
              onClick={() => { setIsLogin(true); setShowForgot(false) }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${isLogin ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-[#64748B] hover:text-[#1E3A8A]'}`}
            >
              Entrar
            </button>
          </div>

          {showForgot ? (
            /* Forgot Password */
            <div>
              <button
                onClick={() => { setShowForgot(false); setForgotSent(false) }}
                className="flex items-center gap-1 text-[#64748B] text-sm mb-6 hover:text-[#1E3A8A]"
              >
                ← Voltar
              </button>
              <h2 className="text-2xl font-bold text-[#0F172A] mb-1">Recuperar Senha</h2>
              <p className="text-[#64748B] text-sm mb-6">Enviaremos um link de redefinição para o seu e-mail.</p>
              {forgotSent ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-green-700 font-medium">✓ E-mail enviado!</p>
                  <p className="text-green-600 text-sm mt-1">Verifique sua caixa de entrada.</p>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">E-mail</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  >
                    Enviar Link
                  </button>
                </form>
              )}
            </div>
          ) : isLogin ? (
            /* Login Form */
            <div>
              <h2 className="text-2xl font-bold text-[#0F172A] mb-1">Bem-vindo de volta</h2>
              <p className="text-[#64748B] text-sm mb-6">Entre com suas credenciais para continuar.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">E-mail</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] text-sm"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-sm font-medium text-[#374151]">Senha</label>
                    <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-[#2563EB] hover:underline">
                      Esqueci minha senha
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl font-semibold shadow hover:opacity-90 transition-opacity"
                >
                  Entrar
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[#E2E8F0]" />
                <span className="text-xs text-[#94A3B8]">ou</span>
                <div className="flex-1 h-px bg-[#E2E8F0]" />
              </div>

              <button
                onClick={() => navigate('/home')}
                className="w-full py-3 border border-[#E2E8F0] rounded-xl flex items-center justify-center gap-3 hover:bg-[#F8FAFC] transition-colors text-sm font-medium text-[#374151]"
              >
                <GoogleIcon />
                Continuar com Google
              </button>

              <p className="text-center text-sm text-[#64748B] mt-5">
                Não tem conta?{' '}
                <button onClick={() => setIsLogin(false)} className="text-[#2563EB] font-medium hover:underline">
                  Cadastrar
                </button>
              </p>
            </div>
          ) : (
            /* Register Form */
            <div>
              <h2 className="text-2xl font-bold text-[#0F172A] mb-1">Criar Nova Conta</h2>
              <p className="text-[#64748B] text-sm mb-6">Preencha seus dados para começar.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Dr. João Silva"
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">E-mail</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">Senha</label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">Confirmar Senha</label>
                  <input
                    type="password"
                    required
                    value={form.confirm}
                    onChange={e => setForm({ ...form, confirm: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] text-sm"
                  />
                </div>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    className="mt-0.5 accent-[#1E3A8A]"
                    required
                  />
                  <span className="text-xs text-[#64748B]">
                    Aceito os{' '}
                    <a href="#" className="text-[#2563EB] hover:underline">Termos de Uso</a>
                    {' '}e{' '}
                    <a href="#" className="text-[#2563EB] hover:underline">Política de Privacidade</a>
                  </span>
                </label>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl font-semibold shadow hover:opacity-90 transition-opacity"
                >
                  Criar Conta
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[#E2E8F0]" />
                <span className="text-xs text-[#94A3B8]">ou</span>
                <div className="flex-1 h-px bg-[#E2E8F0]" />
              </div>

              <button
                onClick={() => navigate('/home')}
                className="w-full py-3 border border-[#E2E8F0] rounded-xl flex items-center justify-center gap-3 hover:bg-[#F8FAFC] transition-colors text-sm font-medium text-[#374151]"
              >
                <GoogleIcon />
                Continuar com Google
              </button>

              <p className="text-center text-sm text-[#64748B] mt-5">
                Já tem uma conta?{' '}
                <button onClick={() => setIsLogin(true)} className="text-[#2563EB] font-medium hover:underline">
                  Entrar
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
