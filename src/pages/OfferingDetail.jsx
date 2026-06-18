import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const COMPLEXITY = {
  basico: { bg: '#DCFCE7', text: '#166534', label: 'Básico' },
  intermediario: { bg: '#FEF3C7', text: '#92400E', label: 'Intermediário' },
  avancado: { bg: '#FECACA', text: '#991B1B', label: 'Avançado' }
}

const BOOKING_STATUS = {
  pendente: { bg: '#FEF3C7', text: '#92400E', label: 'Candidatura Pendente' },
  confirmado: { bg: '#DCFCE7', text: '#166534', label: 'Confirmado' },
  rejeitado: { bg: '#FECACA', text: '#991B1B', label: 'Rejeitado' },
  concluido: { bg: '#D1D5DB', text: '#374151', label: 'Concluído' },
  cancelado: { bg: '#E5E7EB', text: '#4B5563', label: 'Cancelado' }
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function Avatar({ initials, color = '#1E3A8A', size = 'md' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-12 h-12 text-sm', lg: 'w-16 h-16 text-lg' }
  return (
    <div
      style={{ backgroundColor: color }}
      className={`${sizes[size]} flex items-center justify-center rounded-full text-white font-bold flex-shrink-0`}
    >
      {initials}
    </div>
  )
}

function ChatMessage({ message, isSender, senderName, senderInitials, timestamp }) {
  const avatarColor = isSender ? '#2563EB' : '#1E3A8A'
  return (
    <div className={`flex gap-3 mb-4 ${isSender ? 'flex-row-reverse' : ''}`}>
      <Avatar initials={senderInitials} color={avatarColor} size="sm" />
      <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}>
        <span className="text-xs text-gray-500 mb-1">{senderName}</span>
        <div
          className={`px-4 py-2 rounded-lg max-w-xs break-words ${
            isSender ? 'bg-blue-100 text-gray-900' : 'bg-gray-100 text-gray-900'
          }`}
        >
          {message}
        </div>
        <span className="text-xs text-gray-400 mt-1">{fmtTime(timestamp)}</span>
      </div>
    </div>
  )
}

export default function OfferingDetail() {
  const { id: offeringId } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [offering, setOffering] = useState(null)
  const [procedure, setProcedure] = useState(null)
  const [mentor, setMentor] = useState(null)
  const [booking, setBooking] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('detalhes')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadOfferingData()
  }, [offeringId, user])

  async function loadOfferingData() {
    try {
      setLoading(true)

      const { data: offeringData, error: offeringError } = await supabase
        .from('offerings')
        .select('*, procedures(*), mentor:profiles!mentor_id(id, nome, foto, cidade, papel)')
        .eq('id', offeringId)
        .single()

      if (offeringError) throw offeringError

      setOffering(offeringData)
      setProcedure(offeringData.procedures)
      setMentor(offeringData.mentor)

      if (user && profile?.papel === 'aluno') {
        const { data: bookingData } = await supabase
          .from('bookings')
          .select('*')
          .eq('offering_id', offeringId)
          .eq('aluno_id', user.id)
          .maybeSingle()

        setBooking(bookingData)
      }

      if (user) loadMessages()
    } catch (err) {
      console.error('Error loading offering:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadMessages() {
    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*, sender:profiles!sender_id(nome, foto)')
        .eq('offering_id', offeringId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(messagesData || [])
    } catch (err) {
      console.error('Error loading messages:', err)
    }
  }

  async function handleSendMessage() {
    if (!messageInput.trim() || !user) return

    try {
      setSending(true)

      const { error } = await supabase.from('messages').insert({
        offering_id: offeringId,
        booking_id: booking?.id || null,
        sender_id: user.id,
        conteudo: messageInput
      })

      if (error) throw error

      setMessageInput('')
      await loadMessages()
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  async function handleApply() {
    if (!user || !mentor) return

    try {
      const { error } = await supabase
        .from('bookings')
        .upsert(
          { aluno_id: user.id, mentor_id: mentor.id, offering_id: offeringId, status: 'pendente' },
          { onConflict: 'aluno_id,offering_id' }
        )

      if (error) throw error
      await loadOfferingData()
    } catch (err) {
      console.error('Error applying:', err)
    }
  }

  async function handleCancelBooking() {
    if (!booking) return

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelado' })
        .eq('id', booking.id)

      if (error) throw error
      await loadOfferingData()
    } catch (err) {
      console.error('Error canceling booking:', err)
    }
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
          <p className="text-gray-500 mb-4">Mentoria não encontrada</p>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  const mentorInitials = mentor.nome
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="sticky top-0 bg-white border-b z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Voltar
          </button>
          <div className="flex-1" />
          {user && (
            <div className="w-10 h-10">
              <Avatar initials={profile?.nome?.split(' ').map(n => n[0]).join('').toUpperCase()} size="sm" />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{procedure.nome}</h1>
                  <span
                    style={{
                      backgroundColor: COMPLEXITY[procedure.complexidade].bg,
                      color: COMPLEXITY[procedure.complexidade].text
                    }}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {COMPLEXITY[procedure.complexidade].label}
                  </span>
                </div>
                <p className="text-gray-600">{procedure.especialidade}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
              <Avatar initials={mentorInitials} size="lg" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{mentor.nome}</p>
                <p className="text-sm text-gray-600">{mentor.cidade}</p>
              </div>
              <button
                onClick={() => navigate(`/mentor/${mentor.id}`)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Ver perfil →
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Data</p>
                <p className="font-semibold text-gray-900">{fmtDate(offering.inicio)}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Horário</p>
                <p className="font-semibold text-gray-900">{fmtTime(offering.inicio)}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Vagas</p>
                <p className="font-semibold text-gray-900">{offering.max_vagas}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Local</p>
              <p className="font-semibold text-gray-900 mb-4">{offering.cidade}</p>
              {offering.local_descricao && (
                <p className="text-gray-700">{offering.local_descricao}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg">
            <div className="border-b flex gap-0">
              {['detalhes', 'chat'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 font-medium text-center border-b-2 transition ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'detalhes' ? 'Detalhes' : 'Chat'}
                </button>
              ))}
            </div>

            {activeTab === 'detalhes' && (
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Sobre esta mentoria</h3>
                <p className="text-gray-700 mb-6 whitespace-pre-wrap">{offering.descricao}</p>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Horário</p>
                    <p className="text-gray-900">
                      {fmtDate(offering.inicio)} de {fmtTime(offering.inicio)} até {fmtTime(offering.fim)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Preço</p>
                    <p className="text-2xl font-bold text-blue-600">R$ {parseFloat(offering.preco).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="p-6 flex flex-col h-96">
                {profile?.papel === 'mentor' || booking ? (
                  <>
                    <div className="flex-1 overflow-y-auto mb-4 border rounded-lg p-4 bg-gray-50">
                      {messages.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Nenhuma mensagem ainda</p>
                      ) : (
                        messages.map(msg => (
                          <ChatMessage
                            key={msg.id}
                            message={msg.conteudo}
                            isSender={msg.sender_id === user?.id}
                            senderName={msg.sender.nome}
                            senderInitials={msg.sender.nome
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase()}
                            timestamp={msg.created_at}
                          />
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="flex gap-2">
                      <textarea
                        value={messageInput}
                        onChange={e => setMessageInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 px-4 py-2 border rounded-lg resize-none focus:outline-none focus:border-blue-500"
                        rows="3"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={sending || !messageInput.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {sending ? '...' : 'Enviar'}
                      </button>
                    </div>
                  </>
                ) : !user ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-700 mb-2">💬 Crie uma conta para conversar</p>
                      <p className="text-sm text-gray-600 mb-4">O chat fica disponível após se candidatar</p>
                      <button
                        onClick={() => navigate('/auth')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        Cadastrar-se
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-700 mb-2">💬 Candidature-se para falar com o mentor</p>
                      <p className="text-sm text-gray-600">O chat ficará disponível após sua candidatura ser confirmada</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-lg p-6 border">
            <h3 className="font-semibold text-gray-900 mb-4">Resumo</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Preço</span>
                <span className="font-semibold text-gray-900">R$ {parseFloat(offering.preco).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vagas disponíveis</span>
                <span className="font-semibold text-gray-900">{offering.max_vagas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mentor</span>
                <span className="font-semibold text-gray-900">{mentor.nome}</span>
              </div>
            </div>

            {!user ? (
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-lg hover:opacity-90 font-medium"
                >
                  Cadastre-se para participar
                </button>
                <button
                  onClick={() => navigate('/auth', { state: { login: true } })}
                  className="w-full px-4 py-2 border-2 border-[#1E3A8A] text-[#1E3A8A] rounded-lg hover:bg-blue-50 text-sm font-medium"
                >
                  Já tenho conta — Entrar
                </button>
              </div>
            ) : profile?.papel === 'mentor' && user?.id === offering.mentor_id ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-blue-700">Esta é sua própria mentoria</p>
                <p className="text-xs text-blue-600 mt-1">Você não pode se candidatar a ela</p>
              </div>
            ) : booking && booking.status !== 'cancelado' ? (
              <div className="space-y-3">
                <div
                  style={{
                    backgroundColor: BOOKING_STATUS[booking.status].bg,
                    color: BOOKING_STATUS[booking.status].text
                  }}
                  className="px-4 py-3 rounded-lg font-medium text-center"
                >
                  {BOOKING_STATUS[booking.status].label}
                </div>
                {(booking.status === 'pendente' || booking.status === 'confirmado') && (
                  <button
                    onClick={handleCancelBooking}
                    className="w-full px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    Cancelar candidatura
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleApply}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
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
