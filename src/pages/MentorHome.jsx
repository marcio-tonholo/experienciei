import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// ─── Static data ─────────────────────────────────────────────────────────────

const AGENDA = [
  { id: 1, student: 'Ana Rodrigues', nivel: 'Residente', procedure: 'Revascularização Miocárdica', date: '18 Jun 2025', time: '08:00', status: 'confirmado' },
  { id: 2, student: 'Pedro Alves', nivel: 'Especialista', procedure: 'Troca de Valva Aórtica', date: '20 Jun 2025', time: '13:00', status: 'confirmado' },
  { id: 3, student: 'Carla Lima', nivel: 'Residente', procedure: 'Revascularização Miocárdica', date: '22 Jun 2025', time: '07:30', status: 'aguardando_pagamento' },
  { id: 4, student: 'Bruno Costa', nivel: 'Especialista', procedure: 'Troca de Valva Aórtica', date: '26 Jun 2025', time: '09:00', status: 'aguardando_aprovacao' },
]

const SESSIONS = [
  { id: 1, student: 'Maria Santos', nivel: 'Residente', procedure: 'Revascularização Miocárdica', date: '5 Jun 2025', duration: '5h20min', earned: 1500 },
  { id: 2, student: 'João Pereira', nivel: 'Especialista', procedure: 'Troca de Valva Aórtica', date: '28 Mai 2025', duration: '4h45min', earned: 1400 },
  { id: 3, student: 'Luisa Ferreira', nivel: 'Residente', procedure: 'Revascularização Miocárdica', date: '15 Mai 2025', duration: '5h10min', earned: 1500 },
  { id: 4, student: 'Carlos Mendes', nivel: 'Residente', procedure: 'Troca de Valva Aórtica', date: '2 Mai 2025', duration: '4h30min', earned: 1400 },
]

const REVIEWS = [
  { id: 1, student: 'Maria Santos', rating: 5, date: '7 Jun 2025', comment: 'Experiência incrível! Extremamente didático e paciente. Aprendi técnicas que nunca havia visto na residência.' },
  { id: 2, student: 'João Pereira', rating: 5, date: '30 Mai 2025', comment: 'Profissional excepcional. Conseguiu passar toda a complexidade do procedimento de forma clara e objetiva.' },
  { id: 3, student: 'Luisa Ferreira', rating: 4, date: '17 Mai 2025', comment: 'Ótima experiência. O centro cirúrgico estava bem organizado e o mentor muito atencioso com os detalhes.' },
  { id: 4, student: 'Carlos Mendes', rating: 5, date: '4 Mai 2025', comment: 'Recomendo muito! Uma das melhores experiências práticas que tive durante toda a minha formação.' },
]

const MONTHLY = [
  { month: 'Jan', value: 4200 },
  { month: 'Fev', value: 5600 },
  { month: 'Mar', value: 3900 },
  { month: 'Abr', value: 6800 },
  { month: 'Mai', value: 5800 },
  { month: 'Jun', value: 2900 },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AGENDA_STATUS = {
  confirmado:           { label: 'Confirmado',          color: 'bg-green-100 text-green-700' },
  aguardando_pagamento: { label: 'Pgto. Pendente',       color: 'bg-yellow-100 text-yellow-700' },
  aguardando_aprovacao: { label: 'Ag. Aprovação',        color: 'bg-blue-100 text-blue-700' },
}

const LogoSVG = () => (
  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 512 512">
    <path d="M272 464h-32a32 32 0 01-32-32l.05-85.82a4 4 0 00-6-3.47l-74.34 43.06a31.48 31.48 0 01-43-11.52l-16.5-28.64a31.65 31.65 0 0111.56-42.8l74.61-43.25a4 4 0 000-6.92l-74.54-43.21a31.41 31.41 0 01-11.55-43l16.44-28.55a31.48 31.48 0 0143.07-11.54l74.31 43a4 4 0 006-3.47L208 80a32 32 0 0132-32h32a32 32 0 0132 32v85.72a4 4 0 006 3.47l74.34-43.06a31.51 31.51 0 0143 11.52l16.49 28.73a31.52 31.52 0 01-11.64 42.86l-74.53 43.2a4 4 0 000 6.92l74.53 43.2a31.42 31.42 0 0111.56 43l-16.44 28.55a31.48 31.48 0 01-43.07 11.54l-74.31-43a4 4 0 00-6 3.46L304 432a32 32 0 01-32 32z" />
  </svg>
)

function StarIcon({ filled }) {
  return (
    <svg className={`w-4 h-4 ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

function StudentAvatar({ name }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('')
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
      {initials}
    </div>
  )
}

// ─── Tabs config ──────────────────────────────────────────────────────────────

const TABS = [
  { id: 'agenda',     label: 'Agenda',    icon: '📅' },
  { id: 'sessoes',    label: 'Sessões',   icon: '🏥' },
  { id: 'avaliacoes', label: 'Avaliações', icon: '⭐' },
  { id: 'producao',   label: 'Produção',  icon: '💰' },
]

// ─── Main component ───────────────────────────────────────────────────────────

export default function MentorHome() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('agenda')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [agenda, setAgenda] = useState(AGENDA)

  const initials = profile?.nome?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'DR'
  const displayName = profile?.nome?.split(' ')[0] || 'Doutor(a)'

  const maxEarning = Math.max(...MONTHLY.map(m => m.value))
  const totalEarned = SESSIONS.reduce((s, x) => s + x.earned, 0)
  const avgRating = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1)

  function approveSession(id) {
    setAgenda(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmado' } : a))
  }

  function rejectSession(id) {
    setAgenda(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] flex items-center justify-center">
              <LogoSVG />
            </div>
            <span className="text-lg font-bold text-[#1E3A8A] hidden sm:block">Experenciei</span>
          </button>

          {/* Desktop tabs */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === t.id ? 'bg-[#EFF6FF] text-[#1E3A8A]' : 'text-[#64748B] hover:text-[#1E3A8A] hover:bg-[#F8FAFC]'
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </nav>

          {/* Profile */}
          <div className="relative ml-auto">
            <button onClick={() => setProfileMenuOpen(o => !o)} className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white text-sm font-bold">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-[#1E293B] leading-none">{displayName}</p>
                <p className="text-xs text-[#94A3B8]">Mentor</p>
              </div>
            </button>
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-[#E2E8F0] rounded-xl shadow-lg py-1 z-50">
                <hr className="my-1 border-[#F1F5F9]" />
                <button onClick={signOut} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">Sair</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">

        {/* ── AGENDA ── */}
        {activeTab === 'agenda' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#0F172A]">Minha Agenda</h2>
                <p className="text-sm text-[#64748B]">{agenda.filter(a => a.status === 'confirmado').length} sessões confirmadas</p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                  {agenda.filter(a => a.status === 'aguardando_aprovacao').length} aguardando
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {agenda.map(a => {
                const cfg = AGENDA_STATUS[a.status]
                return (
                  <div key={a.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                      <StudentAvatar name={a.student} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-[#1E293B] text-sm">{a.student}</p>
                          <span className="text-xs text-[#94A3B8]">{a.nivel}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                        </div>
                        <p className="text-sm text-[#374151]">{a.procedure}</p>
                        <p className="text-xs text-[#64748B] mt-1">📅 {a.date} · {a.time}</p>
                      </div>
                    </div>
                    {a.status === 'aguardando_aprovacao' && (
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => rejectSession(a.id)}
                          className="flex-1 py-2 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
                          Recusar
                        </button>
                        <button onClick={() => approveSession(a.id)}
                          className="flex-[2] py-2 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                          ✅ Aprovar Vaga
                        </button>
                      </div>
                    )}
                    {a.status === 'aguardando_pagamento' && (
                      <p className="mt-3 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2">
                        💳 Aguardando pagamento do aluno para confirmar a sessão.
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── SESSÕES REALIZADAS ── */}
        {activeTab === 'sessoes' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#0F172A]">Sessões Realizadas</h2>
              <span className="text-sm text-[#64748B]">{SESSIONS.length} sessões</span>
            </div>
            <div className="space-y-4">
              {SESSIONS.map(s => (
                <div key={s.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <StudentAvatar name={s.student} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1E293B] text-sm">
                        {s.student} <span className="text-xs text-[#94A3B8] font-normal">· {s.nivel}</span>
                      </p>
                      <p className="text-sm text-[#374151]">{s.procedure}</p>
                      <p className="text-xs text-[#64748B] mt-1">📅 {s.date} · ⏱ {s.duration}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-green-600 text-sm">+R$ {s.earned.toLocaleString('pt-BR')}</p>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Pago</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AVALIAÇÕES ── */}
        {activeTab === 'avaliacoes' && (
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] mb-6">Avaliações Recebidas</h2>

            {/* Summary card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm mb-6">
              <div className="flex items-center gap-8">
                <div className="text-center flex-shrink-0">
                  <p className="text-5xl font-bold text-[#1E3A8A]">{avgRating}</p>
                  <div className="flex gap-0.5 justify-center mt-1.5">
                    {[1,2,3,4,5].map(i => <StarIcon key={i} filled={i <= Math.round(Number(avgRating))} />)}
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-1">{REVIEWS.length} avaliações</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5,4,3,2,1].map(star => {
                    const count = REVIEWS.filter(r => r.rating === star).length
                    const pct = Math.round((count / REVIEWS.length) * 100)
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-[#64748B] w-3">{star}</span>
                        <StarIcon filled />
                        <div className="flex-1 bg-[#F1F5F9] rounded-full h-1.5">
                          <div className="bg-yellow-400 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-[#94A3B8] w-4">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {REVIEWS.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <StudentAvatar name={r.student} />
                    <div>
                      <p className="font-semibold text-[#1E293B] text-sm">{r.student}</p>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[1,2,3,4,5].map(i => <StarIcon key={i} filled={i <= r.rating} />)}
                        <span className="text-xs text-[#94A3B8] ml-1">{r.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[#374151] italic">"{r.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PRODUÇÃO / GANHOS ── */}
        {activeTab === 'producao' && (
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] mb-6">Minha Produção</h2>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Acumulado', value: `R$ ${totalEarned.toLocaleString('pt-BR')}`, color: 'text-[#1E3A8A]' },
                { label: 'Este Mês', value: `R$ ${MONTHLY[MONTHLY.length - 1].value.toLocaleString('pt-BR')}`, color: 'text-green-600' },
                { label: 'Sessões', value: SESSIONS.length, color: 'text-[#1E3A8A]' },
                { label: 'Avaliação Média', value: avgRating, color: 'text-yellow-500' },
              ].map(k => (
                <div key={k.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm text-center">
                  <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
                  <p className="text-xs text-[#64748B] mt-1">{k.label}</p>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm mb-6">
              <p className="font-semibold text-[#1E293B] text-sm mb-5">Ganhos — últimos 6 meses</p>
              <div className="flex items-end gap-3 h-32">
                {MONTHLY.map(m => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-[#64748B]">R${(m.value / 1000).toFixed(1)}k</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-[#1E3A8A] to-[#3B82F6]"
                      style={{ height: `${(m.value / maxEarning) * 80}px` }}
                    />
                    <span className="text-xs text-[#94A3B8]">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0]">
                <p className="font-semibold text-[#1E293B] text-sm">Últimas Transações</p>
              </div>
              {SESSIONS.map((s, i) => (
                <div key={s.id} className={`flex items-center gap-4 px-5 py-4 ${i < SESSIONS.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}>
                  <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">💰</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1E293B] truncate">{s.procedure}</p>
                    <p className="text-xs text-[#64748B]">{s.student} · {s.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-green-600 text-sm">+R$ {s.earned.toLocaleString('pt-BR')}</p>
                    <span className="text-xs text-[#94A3B8]">Pago</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] flex z-40">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${activeTab === t.id ? 'text-[#1E3A8A]' : 'text-[#94A3B8]'}`}>
            <span className="text-lg leading-none">{t.icon}</span>
            <span className="text-[10px] font-medium leading-none">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
