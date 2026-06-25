import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import LocationMap from '../components/LocationMap'
import { useUserLocation } from '../contexts/UserLocationContext'
import { haversineKm, formatDistance } from '../lib/geo'

const COMPLEXITY = {
  basico: { bg: '#DCFCE7', text: '#166534', label: 'Básico' },
  intermediario: { bg: '#FEF3C7', text: '#92400E', label: 'Intermediário' },
  avancado: { bg: '#FECACA', text: '#991B1B', label: 'Avançado' },
}

const BOOKING_STATUS = {
  pendente: { bg: '#FEF3C7', text: '#92400E', label: 'Candidatura Pendente' },
  confirmado: { bg: '#DCFCE7', text: '#166534', label: 'Confirmado' },
  rejeitado: { bg: '#FECACA', text: '#991B1B', label: 'Rejeitado' },
  concluido: { bg: '#D1D5DB', text: '#374151', label: 'Concluído' },
  cancelado: { bg: '#E5E7EB', text: '#4B5563', label: 'Cancelado' },
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?'
}

function Bubble({ msg, currentUserId, mentorId }) {
  const mine = msg.sender_id === currentUserId
  const isMentorSender = msg.sender_id === mentorId
  const senderName = msg.sender_nome || (mine ? 'Você' : 'Participante')
  const ini = initials(senderName)
  return (
    <div className={`flex gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${mine ? 'bg-[#2563EB]' : isMentorSender ? 'bg-[#1E3A8A]' : 'bg-[#7C3AED]'}`}>
        {ini}
      </div>
      <div className={`flex flex-col max-w-[75%] ${mine ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-center gap-1.5 mb-1 ${mine ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-semibold text-[#374151]">{senderName}</span>
          {isMentorSender && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#1E3A8A] text-white leading-none">Mentor</span>
          )}
        </div>
        <div className={`px-3 py-2 rounded-xl text-sm break-words ${mine ? 'bg-[#DBEAFE] text-[#1E293B]' : 'bg-[#F1F5F9] text-[#1E293B]'}`}>
          {msg.conteudo}
        </div>
        <span className="text-[10px] text-[#94A3B8] mt-0.5">{fmtTime(msg.created_at)}</span>
      </div>
    </div>
  )
}

function ChatPane({ messages, input, setInput, onSend, sending, placeholder, currentUserId, mentorId, emptyText, endRef, readOnly, readOnlyMessage }) {
  return (
    <div className="flex flex-col" style={{ height: 360 }}>
      <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-[#F8FAFC] rounded-xl mb-3 min-h-0">
        {messages.length === 0 ? (
          <p className="text-center text-[#94A3B8] text-sm py-8">{emptyText}</p>
        ) : (
          messages.map(m => <Bubble key={m.id} msg={m} currentUserId={currentUserId} mentorId={mentorId} />)
        )}
        <div ref={endRef} />
      </div>
      {readOnly ? (
        <div className="flex-shrink-0 px-4 py-2.5 bg-[#FEF3C7] rounded-xl text-center text-xs text-[#92400E] font-medium">
          {readOnlyMessage}
        </div>
      ) : (
        <div className="flex gap-2 flex-shrink-0">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() } }}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-xl text-sm resize-none focus:outline-none focus:border-[#2563EB] bg-white"
            rows={2}
          />
          <button
            onClick={onSend}
            disabled={sending || !input.trim()}
            className="px-4 bg-[#1E3A8A] text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-[#2563EB] transition-colors self-stretch"
          >
            {sending ? '…' : 'Enviar'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function OfferingDetail() {
  const { id: offeringId } = useParams()
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const userLoc = useUserLocation()

  const [offering, setOffering] = useState(null)
  const [procedure, setProcedure] = useState(null)
  const [mentor, setMentor] = useState(null)
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('detalhes')
  const [chatMode, setChatMode] = useState('global')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  // Global chat
  const [globalMessages, setGlobalMessages] = useState([])
  const [globalInput, setGlobalInput] = useState('')
  const [sendingGlobal, setSendingGlobal] = useState(false)

  // Private chat
  const [privateMessages, setPrivateMessages] = useState([])
  const [privateInput, setPrivateInput] = useState('')
  const [sendingPrivate, setSendingPrivate] = useState(false)

  // Mentor: list of all enrolled students + which one is selected
  const [allBookings, setAllBookings] = useState([])
  const [selectedBookingId, setSelectedBookingId] = useState(null)

  const globalEndRef = useRef(null)
  const privateEndRef = useRef(null)

  const isMentor = profile?.papel === 'mentor' && user?.id === offering?.mentor_id
  // Private chat: any non-cancelled booking (including rejected — lets mentor communicate outcome)
  const hasPrivateAccess = isMentor || (booking && booking.status !== 'cancelado')
  // Global chat: only confirmed/pending enrollments + mentor (rejected are excluded)
  const hasGlobalAccess = isMentor || (booking && !['cancelado', 'rejeitado'].includes(booking.status))
  const canWriteGlobal = isMentor || booking?.status === 'confirmado'
  const hasAccess = hasPrivateAccess
  const selectedBooking = allBookings.find(b => b.id === selectedBookingId)

  // Load offering + own booking
  useEffect(() => { loadOfferingData() }, [offeringId, user])

  // Load global messages when chat opens (only if user has global access)
  useEffect(() => {
    if (hasGlobalAccess && activeTab === 'chat') loadGlobalMessages()
  }, [hasGlobalAccess, activeTab, offering?.id])

  // Mentor: load all bookings when chat opens
  useEffect(() => {
    if (isMentor && activeTab === 'chat') loadAllBookings()
  }, [isMentor, activeTab, offering?.id])

  // Load private messages when switching to private mode
  useEffect(() => {
    if (chatMode !== 'privado') return
    if (isMentor && selectedBookingId) loadPrivateMessages(selectedBookingId)
    if (!isMentor && booking?.id) loadPrivateMessages(booking.id)
  }, [chatMode, selectedBookingId, booking?.id, isMentor])

  useEffect(() => { globalEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [globalMessages])
  useEffect(() => { privateEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [privateMessages])

  async function loadOfferingData() {
    setLoading(true)
    const { data, error } = await supabase
      .from('offerings')
      .select('*, procedures(*), mentor:profiles!mentor_id(id, nome, foto, cidade)')
      .eq('id', offeringId)
      .single()
    if (error || !data) { setLoading(false); return }
    setOffering(data)
    setProcedure(data.procedures)
    setMentor(data.mentor)
    if (user && profile?.papel === 'aluno') {
      const { data: bk } = await supabase
        .from('bookings')
        .select('*')
        .eq('offering_id', offeringId)
        .eq('aluno_id', user.id)
        .maybeSingle()
      setBooking(bk)
    }
    setLoading(false)
  }

  async function loadGlobalMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*, sender_nome')
      .eq('offering_id', offeringId)
      .is('booking_id', null)
      .order('created_at', { ascending: true })
    setGlobalMessages(data || [])
  }

  async function loadPrivateMessages(bookingId) {
    const { data } = await supabase
      .from('messages')
      .select('*, sender_nome')
      .eq('offering_id', offeringId)
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true })
    setPrivateMessages(data || [])
  }

  async function loadAllBookings() {
    const { data } = await supabase
      .from('bookings')
      .select('id, status, aluno:profiles!aluno_id(id, nome)')
      .eq('offering_id', offeringId)
      .neq('status', 'cancelado')
      .order('created_at')
    setAllBookings(data || [])
  }

  async function handleSendGlobal() {
    if (!globalInput.trim() || !user) return
    setSendingGlobal(true)
    await supabase.from('messages').insert({
      offering_id: offeringId,
      booking_id: null,
      sender_id: user.id,
      conteudo: globalInput.trim(),
    })
    setGlobalInput('')
    await loadGlobalMessages()
    setSendingGlobal(false)
  }

  async function handleSendPrivate() {
    const targetBookingId = isMentor ? selectedBookingId : booking?.id
    if (!privateInput.trim() || !user || !targetBookingId) return
    setSendingPrivate(true)
    await supabase.from('messages').insert({
      offering_id: offeringId,
      booking_id: targetBookingId,
      sender_id: user.id,
      conteudo: privateInput.trim(),
    })
    setPrivateInput('')
    await loadPrivateMessages(targetBookingId)
    setSendingPrivate(false)
  }

  async function handleApply() {
    if (!user || !mentor) return
    const { error } = await supabase.from('bookings').upsert(
      { aluno_id: user.id, mentor_id: mentor.id, offering_id: offeringId, status: 'pendente' },
      { onConflict: 'aluno_id,offering_id' }
    )
    if (!error) await loadOfferingData()
  }

  async function handleCancelBooking() {
    if (!booking) return
    const { error } = await supabase.from('bookings').update({ status: 'cancelado' }).eq('id', booking.id)
    if (!error) await loadOfferingData()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-10 h-10 rounded-full border-4 border-[#1E3A8A] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!offering || !mentor || !procedure) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#64748B] mb-4">Mentoria não encontrada</p>
          <button onClick={() => navigate('/home')} className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm">
            Voltar
          </button>
        </div>
      </div>
    )
  }

  const cx = COMPLEXITY[procedure.complexidade] || COMPLEXITY.basico

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-[#E2E8F0] z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-[#64748B] hover:text-[#1E293B] text-sm font-medium">
            ← Voltar
          </button>
          <div className="flex-1" />
          {user && profile?.nome && (
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(o => !o)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white text-xs font-bold hover:opacity-90"
              >
                {initials(profile.nome)}
              </button>
              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-[#E2E8F0] rounded-xl shadow-lg py-1 z-50">
                    <button
                      onClick={() => { navigate('/home'); setProfileMenuOpen(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F8FAFC]"
                    >
                      Meu Perfil
                    </button>
                    <hr className="my-1 border-[#F1F5F9]" />
                    <button
                      onClick={async () => { await signOut(); navigate('/') }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                    >
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Offering header */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-2xl font-bold text-[#0F172A]">{procedure.nome}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: cx.bg, color: cx.text }}>
                    {cx.label}
                  </span>
                </div>
                <p className="text-[#64748B] text-sm">{procedure.especialidade}</p>
              </div>
            </div>

            {/* Mentor row */}
            <div className="flex items-center gap-3 p-4 bg-[#F8FAFC] rounded-xl mb-5">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {initials(mentor.nome)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1E293B] text-sm">{mentor.nome}</p>
                <p className="text-xs text-[#64748B]">{mentor.cidade}</p>
              </div>
              <button
                onClick={() => navigate(`/mentor/${mentor.id}`)}
                className="text-[#2563EB] text-sm font-medium hover:underline flex-shrink-0"
              >
                Ver perfil →
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Data', value: fmtDate(offering.inicio) },
                { label: 'Horário', value: fmtTime(offering.inicio) },
                { label: 'Vagas', value: offering.max_vagas },
              ].map(s => (
                <div key={s.label} className="p-3 bg-[#EFF6FF] rounded-xl">
                  <p className="text-[10px] text-[#64748B] mb-0.5">{s.label}</p>
                  <p className="font-semibold text-[#1E293B] text-sm">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E2E8F0] pt-4">
              <p className="text-xs text-[#64748B] mb-1">Local</p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-[#1E293B] text-sm">{offering.cidade}</p>
                {userLoc.status === 'granted' && offering.latitude != null && offering.longitude != null && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-sm font-semibold">
                    📡 {formatDistance(haversineKm(userLoc.lat, userLoc.lng, offering.latitude, offering.longitude))}
                  </span>
                )}
              </div>
              {offering.latitude != null && offering.longitude != null && (
                <div className="mt-3">
                  <LocationMap
                    lat={offering.latitude}
                    lng={offering.longitude}
                    offeringId={offering.id}
                  />
                  <p className="text-[10px] text-[#94A3B8] mt-1.5">
                    Área aproximada — endereço exato fornecido após confirmação da candidatura
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="flex border-b border-[#E2E8F0]">
              {[{ id: 'detalhes', label: 'Detalhes' }, { id: 'chat', label: 'Chat' }].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === t.id
                      ? 'border-[#1E3A8A] text-[#1E3A8A]'
                      : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Detalhes */}
            {activeTab === 'detalhes' && (
              <div className="p-6">
                <h3 className="font-semibold text-[#1E293B] mb-3">Sobre esta mentoria</h3>
                <p className="text-[#374151] text-sm whitespace-pre-wrap mb-6 leading-relaxed">{offering.descricao}</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-[#64748B] mb-1">Horário</p>
                    <p className="text-sm text-[#1E293B]">
                      {fmtDate(offering.inicio)} — {fmtTime(offering.inicio)} às {fmtTime(offering.fim)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#64748B] mb-1">Investimento</p>
                    <p className="text-2xl font-bold text-[#1E3A8A]">R$ {parseFloat(offering.preco).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Chat */}
            {activeTab === 'chat' && (
              <div className="p-6">
                {!user ? (
                  // Anon
                  <div className="text-center py-12">
                    <p className="text-3xl mb-3">💬</p>
                    <p className="font-semibold text-[#1E293B] mb-1">Crie uma conta para participar</p>
                    <p className="text-sm text-[#64748B] mb-5">O chat fica disponível após criar uma conta e se candidatar</p>
                    <button onClick={() => navigate('/auth')} className="px-5 py-2.5 bg-[#1E3A8A] text-white rounded-xl text-sm font-medium hover:bg-[#2563EB]">
                      Cadastrar-se
                    </button>
                  </div>
                ) : !hasAccess ? (
                  // Student with no valid booking
                  <div className="text-center py-12">
                    <p className="text-3xl mb-3">💬</p>
                    <p className="font-semibold text-[#1E293B] mb-1">Candidate-se para acessar o chat</p>
                    <p className="text-sm text-[#64748B]">O chat estará disponível após sua candidatura</p>
                  </div>
                ) : (
                  // Mentor or enrolled student
                  <div>
                    {/* Chat mode tabs */}
                    <div className="flex gap-1 mb-5 bg-[#F1F5F9] p-1 rounded-xl">
                      <button
                        onClick={() => setChatMode('global')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          chatMode === 'global' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-[#64748B]'
                        }`}
                      >
                        👥 Chat da Turma
                      </button>
                      <button
                        onClick={() => setChatMode('privado')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          chatMode === 'privado' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-[#64748B]'
                        }`}
                      >
                        💬 {isMentor ? 'Mensagens Privadas' : 'Chat com Mentor'}
                      </button>
                    </div>

                    {/* Global chat */}
                    {chatMode === 'global' && (
                      hasGlobalAccess ? (
                        <ChatPane
                          messages={globalMessages}
                          input={globalInput}
                          setInput={setGlobalInput}
                          onSend={handleSendGlobal}
                          sending={sendingGlobal}
                          placeholder="Mensagem para toda a turma…"
                          currentUserId={user.id}
                          mentorId={offering.mentor_id}
                          emptyText="Nenhuma mensagem ainda. Seja o primeiro a escrever!"
                          endRef={globalEndRef}
                          readOnly={!canWriteGlobal}
                          readOnlyMessage="Sua candidatura precisa ser confirmada pelo mentor para participar do chat"
                        />
                      ) : (
                        <div className="text-center py-10 bg-[#F8FAFC] rounded-xl">
                          <p className="text-2xl mb-2">🔒</p>
                          <p className="font-semibold text-[#1E293B] text-sm mb-1">Chat da turma indisponível</p>
                          <p className="text-xs text-[#64748B]">Sua candidatura não foi aprovada. Use o chat privado para falar com o mentor.</p>
                        </div>
                      )
                    )}

                    {/* Private chat */}
                    {chatMode === 'privado' && (
                      isMentor ? (
                        // Mentor: student picker or thread
                        selectedBookingId ? (
                          <div>
                            <button
                              onClick={() => { setSelectedBookingId(null); setPrivateMessages([]) }}
                              className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1E293B] mb-4"
                            >
                              ← {selectedBooking?.aluno?.nome || 'Aluno'}
                            </button>
                            <ChatPane
                              messages={privateMessages}
                              input={privateInput}
                              setInput={setPrivateInput}
                              onSend={handleSendPrivate}
                              sending={sendingPrivate}
                              placeholder={`Mensagem para ${selectedBooking?.aluno?.nome || 'aluno'}…`}
                              currentUserId={user.id}
                              mentorId={offering.mentor_id}
                              emptyText="Nenhuma mensagem ainda nesta conversa."
                              endRef={privateEndRef}
                            />
                          </div>
                        ) : (
                          // Student list
                          <div>
                            <p className="text-sm font-medium text-[#1E293B] mb-3">
                              {allBookings.length === 0 ? 'Nenhum aluno inscrito ainda' : `${allBookings.length} aluno${allBookings.length > 1 ? 's' : ''} inscrito${allBookings.length > 1 ? 's' : ''}`}
                            </p>
                            {allBookings.length === 0 ? (
                              <div className="text-center py-10 bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1]">
                                <p className="text-2xl mb-2">👥</p>
                                <p className="text-sm text-[#64748B]">Quando alunos se candidatarem, suas conversas aparecerão aqui</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {allBookings.map(b => {
                                  const bst = BOOKING_STATUS[b.status] || BOOKING_STATUS.pendente
                                  return (
                                    <button
                                      key={b.id}
                                      onClick={() => { setSelectedBookingId(b.id); loadPrivateMessages(b.id) }}
                                      className="w-full flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] hover:border-[#93C5FD] hover:bg-[#EFF6FF] transition-colors text-left"
                                    >
                                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        {initials(b.aluno?.nome)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#1E293B] truncate">{b.aluno?.nome}</p>
                                      </div>
                                      <span className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: bst.bg, color: bst.text }}>
                                        {bst.label}
                                      </span>
                                      <span className="text-[#94A3B8] text-sm">›</span>
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      ) : (
                        // Student: their 1:1 thread with mentor
                        <ChatPane
                          messages={privateMessages}
                          input={privateInput}
                          setInput={setPrivateInput}
                          onSend={handleSendPrivate}
                          sending={sendingPrivate}
                          placeholder={`Mensagem para ${mentor.nome}…`}
                          currentUserId={user.id}
                          mentorId={offering.mentor_id}
                          emptyText="Nenhuma mensagem ainda. Diga olá ao mentor!"
                          endRef={privateEndRef}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
            <h3 className="font-semibold text-[#1E293B] mb-4">Resumo</h3>
            <div className="space-y-2.5 mb-5 text-sm">
              {[
                { label: 'Preço', value: `R$ ${parseFloat(offering.preco).toFixed(2)}` },
                { label: 'Vagas', value: offering.max_vagas },
                { label: 'Mentor', value: mentor.nome },
              ].map(r => (
                <div key={r.label} className="flex justify-between">
                  <span className="text-[#64748B]">{r.label}</span>
                  <span className="font-semibold text-[#1E293B]">{r.value}</span>
                </div>
              ))}
            </div>

            {!user ? (
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-medium hover:opacity-90"
                >
                  Cadastre-se para participar
                </button>
                <button
                  onClick={() => navigate('/auth', { state: { login: true } })}
                  className="w-full py-2.5 border-2 border-[#1E3A8A] text-[#1E3A8A] rounded-xl text-sm font-medium hover:bg-[#EFF6FF]"
                >
                  Já tenho conta — Entrar
                </button>
              </div>
            ) : isMentor ? (
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-3 text-center">
                <p className="text-sm font-medium text-[#1E3A8A]">Esta é sua mentoria</p>
                <p className="text-xs text-[#3B82F6] mt-0.5">Acesse o chat para falar com seus alunos</p>
              </div>
            ) : booking && booking.status !== 'cancelado' ? (
              <div className="space-y-2">
                <div
                  className="px-4 py-3 rounded-xl font-medium text-center text-sm"
                  style={{ backgroundColor: BOOKING_STATUS[booking.status]?.bg, color: BOOKING_STATUS[booking.status]?.text }}
                >
                  {BOOKING_STATUS[booking.status]?.label}
                </div>
                {(booking.status === 'pendente' || booking.status === 'confirmado') && (
                  <button
                    onClick={handleCancelBooking}
                    className="w-full py-2.5 text-red-500 border border-red-200 rounded-xl text-sm hover:bg-red-50"
                  >
                    Cancelar candidatura
                  </button>
                )}
                {booking.status === 'confirmado' && (
                  <button
                    onClick={() => { setActiveTab('chat'); setChatMode('privado') }}
                    className="w-full py-2.5 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E3A8A] rounded-xl text-sm font-medium hover:bg-[#DBEAFE]"
                  >
                    💬 Falar com o mentor
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleApply}
                className="w-full py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-medium hover:opacity-90"
              >
                {booking?.status === 'cancelado' ? 'Candidatar-se novamente' : 'Candidatar-se'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
