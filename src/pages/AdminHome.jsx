import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const TABS = [
  { id: 'pendente',  label: 'Pendentes'  },
  { id: 'ativo',     label: 'Ativos'     },
  { id: 'rejeitado', label: 'Rejeitados' },
  { id: 'inativo',   label: 'Inativos'   },
  { id: 'repasses',  label: 'Repasses'   },
]

function fmtBRL(value) {
  return Number(value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

const PAPEL_LABELS = { mentor: 'Mentor', aluno: 'Aluno' }
const PAPEL_COLORS = {
  mentor: 'bg-purple-100 text-purple-700',
  aluno:  'bg-blue-100 text-blue-700',
}

const AVATAR_GRADIENTS = [
  ['#7C3AED', '#4F46E5'],
  ['#0891B2', '#0284C7'],
  ['#059669', '#0F766E'],
  ['#D97706', '#B45309'],
  ['#DC2626', '#B91C1C'],
]

function Avatar({ nome }) {
  const [from, to] = AVATAR_GRADIENTS[(nome?.charCodeAt(0) ?? 0) % AVATAR_GRADIENTS.length]
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-base"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {(nome?.[0] ?? '?').toUpperCase()}
    </div>
  )
}

// ─── Modal: visualizar documentos do usuário ─────────────────────────────────
function DocsModal({ user, onClose }) {
  const [docs, setDocs]       = useState({})
  const [loading, setLoading] = useState(true)
  const [viewErr, setViewErr] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('profile_id', user.id)
        .order('data', { ascending: false })
      if (data) {
        const latest = {}
        for (const row of data) {
          if (!latest[row.tipo]) latest[row.tipo] = row
        }
        setDocs(latest)
      }
      setLoading(false)
    }
    load()
  }, [user.id])

  async function handleView(path) {
    setViewErr('')
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    if (error) setViewErr('Não foi possível abrir o documento.')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Avatar nome={user.nome} />
            <div>
              <p className="font-semibold text-[#1E293B]">{user.nome}</p>
              <p className="text-xs text-[#64748B]">
                {PAPEL_LABELS[user.papel]} · {user.cidade}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#64748B] text-xl"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-7 h-7 rounded-full border-4 border-[#1E3A8A] border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { tipo: 'identidade', label: 'Documento de Identidade', icon: '🪪' },
              { tipo: 'crm',        label: 'CRM',                     icon: '🏥' },
            ].map(({ tipo, label, icon }) => {
              const doc = docs[tipo]
              return (
                <div
                  key={tipo}
                  className="flex items-center gap-3 bg-[#F8FAFC] rounded-xl p-3.5 border border-[#E2E8F0]"
                >
                  <span className="text-xl">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#1E293B]">{label}</p>
                    {doc?.data && (
                      <p className="text-xs text-[#94A3B8]">
                        Enviado em {new Date(doc.data).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  {doc ? (
                    <button
                      onClick={() => handleView(doc.arquivo)}
                      className="text-sm font-medium text-[#2563EB] hover:underline flex-shrink-0"
                    >
                      Abrir
                    </button>
                  ) : (
                    <span className="text-xs text-[#94A3B8] flex-shrink-0">Não enviado</span>
                  )}
                </div>
              )
            })}
            {viewErr && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{viewErr}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Modal: rejeitar com motivo ───────────────────────────────────────────────
function RejectModal({ user, onClose, onConfirm }) {
  const [motivo, setMotivo] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleConfirm() {
    if (!motivo.trim()) return
    setSaving(true)
    await onConfirm(user.id, motivo.trim())
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="font-semibold text-[#1E293B] mb-1">Rejeitar cadastro</h3>
        <p className="text-sm text-[#64748B] mb-4">
          Informe o motivo para <strong>{user.nome}</strong>. Ele verá esta mensagem e poderá
          solicitar uma nova análise após corrigir o problema.
        </p>
        <textarea
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          placeholder="Ex: Documento de identidade ilegível. Por favor, reenvie uma foto mais clara."
          rows={4}
          className="w-full border border-[#E2E8F0] rounded-xl p-3 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!motivo.trim() || saving}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50"
          >
            {saving ? 'Rejeitando...' : 'Confirmar rejeição'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Card de usuário ──────────────────────────────────────────────────────────
function UserCard({ profile, tab, saving, onApprove, onReject, onDeactivate, onReactivate, onViewDocs }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4">
      <div className="flex items-start gap-3">
        <Avatar nome={profile.nome} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-[#1E293B] truncate">{profile.nome}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${PAPEL_COLORS[profile.papel]}`}>
              {PAPEL_LABELS[profile.papel]}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            {profile.categoria === 'medico' ? 'Médico' : 'Estudante'} · {profile.cidade}
          </p>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Cadastro: {new Date(profile.created_at).toLocaleDateString('pt-BR')}
          </p>

          {profile.motivo_rejeicao && (
            <div className="mt-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <p className="text-xs font-medium text-red-600 mb-0.5">Motivo da rejeição:</p>
              <p className="text-xs text-red-700">{profile.motivo_rejeicao}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#F1F5F9]">
        <button
          onClick={onViewDocs}
          className="flex-1 py-2 rounded-xl border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC]"
        >
          Ver documentos
        </button>

        {tab === 'pendente' && (
          <>
            <button
              onClick={onReject}
              disabled={saving}
              className="flex-1 py-2 rounded-xl border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Rejeitar
            </button>
            <button
              onClick={onApprove}
              disabled={saving}
              className="flex-1 py-2 rounded-xl bg-[#1E3A8A] text-white text-xs font-medium hover:bg-[#1e40af] disabled:opacity-50"
            >
              {saving ? '…' : 'Aprovar'}
            </button>
          </>
        )}

        {tab === 'ativo' && (
          <button
            onClick={onDeactivate}
            disabled={saving}
            className="flex-1 py-2 rounded-xl border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-50"
          >
            {saving ? '…' : 'Desativar'}
          </button>
        )}

        {(tab === 'rejeitado' || tab === 'inativo') && (
          <button
            onClick={onReactivate}
            disabled={saving}
            className="flex-1 py-2 rounded-xl bg-[#1E3A8A] text-white text-xs font-medium hover:bg-[#1e40af] disabled:opacity-50"
          >
            {saving ? '…' : 'Reativar'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Aba de Repasses ──────────────────────────────────────────────────────────
function RepassesTab({ payments, loading, repassando, onRepasse }) {
  const totalRecebido  = payments.reduce((s, p) => s + Number(p.valor_bruto), 0)
  const totalPendente  = payments.filter(p => p.repasse_status === 'pendente').reduce((s, p) => s + Number(p.valor_bruto), 0)
  const totalRepassado = payments.filter(p => p.repasse_status === 'repassado').reduce((s, p) => s + Number(p.valor_bruto), 0)

  // Agrupar por mentor
  const byMentor = payments.reduce((acc, p) => {
    const id = p.mentor_id
    if (!acc[id]) acc[id] = { mentor: p.mentor, payments: [] }
    acc[id].payments.push(p)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 rounded-full border-4 border-[#1E3A8A] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Stats financeiros */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Total recebido',  value: totalRecebido,  color: 'text-[#1E3A8A]', bg: 'bg-blue-50 border-blue-200'    },
          { label: 'A repassar',      value: totalPendente,  color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200'  },
          { label: 'Já repassado',    value: totalRepassado, color: 'text-green-600', bg: 'bg-green-50 border-green-200'  },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-xl border p-3 text-center ${bg}`}>
            <p className={`text-lg font-bold leading-tight ${color}`}>R$ {fmtBRL(value)}</p>
            <p className={`text-xs font-medium mt-1 ${color}`}>{label}</p>
          </div>
        ))}
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-16 text-[#94A3B8]">
          <p className="text-5xl mb-3">💳</p>
          <p className="font-medium text-[#64748B]">Nenhum pagamento aprovado ainda</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(byMentor).map(([mentorId, { mentor, payments: mps }]) => {
            const pendentes  = mps.filter(p => p.repasse_status === 'pendente')
            const repassados = mps.filter(p => p.repasse_status === 'repassado')
            const totalMentor = pendentes.reduce((s, p) => s + Number(p.valor_bruto), 0)

            return (
              <div key={mentorId} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                {/* Cabeçalho do mentor */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#F1F5F9]">
                  <div>
                    <p className="font-semibold text-[#1E293B] text-sm">{mentor?.nome ?? '—'}</p>
                    <p className="text-xs text-[#64748B]">{mentor?.cidade ?? ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {totalMentor > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-[#64748B]">A repassar</p>
                        <p className="font-bold text-amber-600 text-sm">R$ {fmtBRL(totalMentor)}</p>
                      </div>
                    )}
                    {pendentes.length > 0 && (
                      <button
                        onClick={() => onRepasse(pendentes.map(p => p.id))}
                        disabled={!!repassando}
                        className="px-3 py-1.5 rounded-xl bg-[#1E3A8A] text-white text-xs font-medium hover:bg-[#1e40af] disabled:opacity-50"
                      >
                        {repassando ? '...' : 'Repassar tudo'}
                      </button>
                    )}
                    {pendentes.length === 0 && (
                      <span className="text-xs text-green-600 font-medium">✓ Tudo repassado</span>
                    )}
                  </div>
                </div>

                {/* Linha por pagamento */}
                <div className="divide-y divide-[#F1F5F9]">
                  {mps.map(p => {
                    const isRepassado = p.repasse_status === 'repassado'
                    return (
                      <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1E293B] truncate">
                            {p.aluno?.nome ?? '—'}
                          </p>
                          <p className="text-xs text-[#64748B] truncate">
                            {p.offerings?.titulo ?? '—'}
                            {p.offerings?.inicio && ` · ${new Date(p.offerings.inicio).toLocaleDateString('pt-BR')}`}
                          </p>
                          <p className="text-xs text-[#94A3B8]">
                            {p.metodo_pagamento === 'pix' ? 'PIX' : 'Cartão'}
                            {' · '}{new Date(p.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-[#1E293B] text-sm">R$ {fmtBRL(p.valor_bruto)}</p>
                          {isRepassado ? (
                            <span className="text-xs text-green-600">✓ Repassado</span>
                          ) : (
                            <button
                              onClick={() => onRepasse([p.id])}
                              disabled={!!repassando}
                              className="text-xs text-[#2563EB] hover:underline disabled:opacity-50"
                            >
                              Marcar repassado
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {repassados.length > 0 && (
                  <div className="px-4 py-2 bg-[#F8FAFC] border-t border-[#F1F5F9]">
                    <p className="text-xs text-[#94A3B8]">
                      {repassados.length} pagamento{repassados.length > 1 ? 's' : ''} já repassado{repassados.length > 1 ? 's' : ''} · R$ {fmtBRL(repassados.reduce((s, p) => s + Number(p.valor_bruto), 0))}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function AdminHome() {
  const { signOut }             = useAuth()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('pendente')
  const [docsModal, setDocsModal] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [saving, setSaving]     = useState(null)

  // ── Repasses state ──────────────────────────────────────────────────────────
  const [payments, setPayments]           = useState([])
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [repassando, setRepassando]       = useState(null) // mentorId ou paymentId

  useEffect(() => { loadProfiles() }, [])

  useEffect(() => {
    if (activeTab === 'repasses') loadPayments()
  }, [activeTab])

  async function loadProfiles() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('papel', 'admin')
      .order('created_at', { ascending: false })
    setProfiles(data ?? [])
    setLoading(false)
  }

  async function handleStatus(userId, status, motivo = null) {
    setSaving(userId)
    const payload = { status, motivo_rejeicao: motivo }
    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
    if (!error) {
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, ...payload } : p))
    }
    setSaving(null)
  }

  async function loadPayments() {
    setLoadingPayments(true)
    const { data } = await supabase
      .from('payments')
      .select('*, aluno:profiles!aluno_id(nome), mentor:profiles!mentor_id(nome, cidade), offerings(titulo, inicio)')
      .eq('status', 'pago')
      .order('created_at', { ascending: false })
    setPayments(data ?? [])
    setLoadingPayments(false)
  }

  async function handleRepasse(ids) {
    setRepassando(ids[0])
    await supabase
      .from('payments')
      .update({ repasse_status: 'repassado', repasse_em: new Date().toISOString() })
      .in('id', ids)
    setPayments(prev => prev.map(p =>
      ids.includes(p.id) ? { ...p, repasse_status: 'repassado', repasse_em: new Date().toISOString() } : p
    ))
    setRepassando(null)
  }

  const byStatus = profiles.reduce((acc, p) => {
    acc[p.status] = acc[p.status] ?? []
    acc[p.status].push(p)
    return acc
  }, {})

  const counts = {
    pendente:  byStatus.pendente?.length  ?? 0,
    ativo:     byStatus.ativo?.length     ?? 0,
    rejeitado: byStatus.rejeitado?.length ?? 0,
    inativo:   byStatus.inativo?.length   ?? 0,
  }

  const visible = byStatus[activeTab] ?? []

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#1E3A8A' }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L2 8v10h6v-5h4v5h6V8L10 2z" fill="white" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-[#1E3A8A] text-sm leading-tight">Experenciei</p>
              <p className="text-xs text-[#64748B] leading-tight">Painel Administrativo</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="text-sm text-[#64748B] hover:text-[#1E293B] font-medium"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex bg-white border border-[#E2E8F0] rounded-xl p-1 gap-1 mb-4">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              {t.label}
              {t.id !== 'repasses' && counts[t.id] > 0 && activeTab !== t.id && (
                <span className="ml-1 opacity-70">({counts[t.id]})</span>
              )}
            </button>
          ))}
        </div>

        {activeTab !== 'repasses' ? (
          <>
            {/* Stats de usuários */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Pendentes',  key: 'pendente',  color: 'text-amber-600', bg: 'bg-amber-50  border-amber-200'  },
                { label: 'Ativos',     key: 'ativo',     color: 'text-green-600', bg: 'bg-green-50  border-green-200'  },
                { label: 'Rejeitados', key: 'rejeitado', color: 'text-red-600',   bg: 'bg-red-50    border-red-200'    },
                { label: 'Inativos',   key: 'inativo',   color: 'text-gray-500',  bg: 'bg-gray-50   border-gray-200'   },
              ].map(({ label, key, color, bg }) => (
                <div key={key} className={`rounded-xl border p-3 text-center ${bg}`}>
                  <p className={`text-2xl font-bold leading-none ${color}`}>{counts[key]}</p>
                  <p className={`text-xs font-medium mt-1 ${color}`}>{label}</p>
                </div>
              ))}
            </div>

            {/* Lista de usuários */}
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 rounded-full border-4 border-[#1E3A8A] border-t-transparent animate-spin" />
              </div>
            ) : visible.length === 0 ? (
              <div className="text-center py-16 text-[#94A3B8]">
                <p className="text-5xl mb-3">✓</p>
                <p className="font-medium text-[#64748B]">Nenhum usuário nesta categoria</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visible.map(p => (
                  <UserCard
                    key={p.id}
                    profile={p}
                    tab={activeTab}
                    saving={saving === p.id}
                    onApprove={() => handleStatus(p.id, 'ativo')}
                    onReject={() => setRejectModal(p)}
                    onDeactivate={() => handleStatus(p.id, 'inativo')}
                    onReactivate={() => handleStatus(p.id, 'ativo')}
                    onViewDocs={() => setDocsModal(p)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* ── ABA REPASSES ───────────────────────────────────────────────── */
          <RepassesTab
            payments={payments}
            loading={loadingPayments}
            repassando={repassando}
            onRepasse={handleRepasse}
          />
        )}
      </div>

      {docsModal && (
        <DocsModal user={docsModal} onClose={() => setDocsModal(null)} />
      )}

      {rejectModal && (
        <RejectModal
          user={rejectModal}
          onClose={() => setRejectModal(null)}
          onConfirm={(userId, motivo) => handleStatus(userId, 'rejeitado', motivo)}
        />
      )}
    </div>
  )
}
