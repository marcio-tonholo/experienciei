import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// ─── Static data ─────────────────────────────────────────────────────────────

const MENTORS = [
  {
    id: 1, name: 'Dr. Carlos Silva', specialty: 'Cirurgião Cardiovascular',
    rating: 4.9, reviews: 127, city: 'São Paulo, SP', hospital: 'Hospital Sírio-Libanês', years: 15,
    initials: 'CS', color: 'from-blue-400 to-blue-600', top: true,
    mini: 'Especialista em cirurgias cardíacas complexas com mais de 1.200 procedimentos realizados. Preceptor da residência médica do InCor.',
    procedures: [
      { name: 'Revascularização Miocárdica', price: 1500, duration: '4-6h', level: 'Avançado' },
      { name: 'Troca de Valva Aórtica', price: 1400, duration: '3-5h', level: 'Avançado' },
    ],
    slots: ['15 Jun · 08:00', '15 Jun · 13:00', '18 Jun · 09:00', '22 Jun · 07:30'],
  },
  {
    id: 2, name: 'Dra. Marina Costa', specialty: 'Neurocirurgiã',
    rating: 4.8, reviews: 94, city: 'Rio de Janeiro, RJ', hospital: 'Hospital Samaritano', years: 12,
    initials: 'MC', color: 'from-purple-400 to-purple-600', top: true,
    mini: 'Referência nacional em neurocirurgia funcional e cirurgias de base de crânio. Doutora pela UFRJ.',
    procedures: [
      { name: 'Clipagem de Aneurisma', price: 1600, duration: '3-5h', level: 'Avançado' },
      { name: 'Laminectomia Lombar', price: 1200, duration: '2-3h', level: 'Intermediário' },
    ],
    slots: ['16 Jun · 08:00', '20 Jun · 10:00', '25 Jun · 07:00'],
  },
  {
    id: 3, name: 'Dr. Rafael Mendes', specialty: 'Cirurgião Ortopédico',
    rating: 4.7, reviews: 85, city: 'Belo Horizonte, MG', hospital: 'Hospital Mater Dei', years: 10,
    initials: 'RM', color: 'from-green-400 to-green-600', top: false,
    mini: 'Especializado em artroplastias de joelho e quadril. Fellow em cirurgia de revisão pelo Hospital for Special Surgery (NYC).',
    procedures: [
      { name: 'Artroplastia de Joelho', price: 1100, duration: '2-3h', level: 'Intermediário' },
    ],
    slots: ['17 Jun · 07:30', '21 Jun · 09:00', '24 Jun · 08:00'],
  },
  {
    id: 4, name: 'Dra. Juliana Santos', specialty: 'Cirurgiã Torácica',
    rating: 4.9, reviews: 112, city: 'Curitiba, PR', hospital: 'Hospital São Paulo', years: 14,
    initials: 'JS', color: 'from-rose-400 to-rose-600', top: true,
    mini: 'Especialista em cirurgia torácica oncológica e transplante pulmonar. Coordenadora do programa de transplante do HC-UFPR.',
    procedures: [
      { name: 'Lobectomia Pulmonar', price: 1400, duration: '3-4h', level: 'Avançado' },
    ],
    slots: ['19 Jun · 07:00', '23 Jun · 10:00', '26 Jun · 08:30'],
  },
]

const PROCEDURES = [
  { name: 'Revascularização Miocárdica', category: 'Cardiologia', duration: '4-6h', level: 'Avançado', price: 1500 },
  { name: 'Clipagem de Aneurisma', category: 'Neurologia', duration: '3-5h', level: 'Avançado', price: 1600 },
  { name: 'Artroplastia de Joelho', category: 'Ortopedia', duration: '2-3h', level: 'Intermediário', price: 1100 },
  { name: 'Lobectomia Pulmonar', category: 'Torácica', duration: '3-4h', level: 'Avançado', price: 1400 },
  { name: 'Troca de Valva Aórtica', category: 'Cardiologia', duration: '3-5h', level: 'Avançado', price: 1400 },
  { name: 'Laminectomia Lombar', category: 'Neurologia', duration: '2-3h', level: 'Intermediário', price: 1200 },
]

const PROC_CATEGORIES = ['Todos', 'Cardiologia', 'Neurologia', 'Ortopedia', 'Torácica']

const BOOKINGS = [
  {
    id: 1, mentorName: 'Dra. Juliana Santos', mentorInitials: 'JS', mentorColor: 'from-rose-400 to-rose-600',
    procedure: 'Lobectomia Pulmonar', date: '22 Jun 2025', time: '08:00', price: 1400,
    status: 'confirmado', location: 'Hospital São Paulo · Curitiba, PR',
  },
  {
    id: 2, mentorName: 'Dra. Marina Costa', mentorInitials: 'MC', mentorColor: 'from-purple-400 to-purple-600',
    procedure: 'Clipagem de Aneurisma', date: '25 Jun 2025', time: '09:00', price: 1600,
    status: 'aguardando_pagamento', location: 'Hospital Samaritano · Rio de Janeiro, RJ',
  },
  {
    id: 3, mentorName: 'Dr. Rafael Mendes', mentorInitials: 'RM', mentorColor: 'from-green-400 to-green-600',
    procedure: 'Artroplastia de Joelho', date: '30 Jun 2025', time: '07:30', price: 1100,
    status: 'aguardando_aprovacao', location: 'Hospital Mater Dei · Belo Horizonte, MG',
  },
]

const HISTORY = [
  {
    id: 1, mentorName: 'Dr. Carlos Silva', mentorInitials: 'CS', mentorColor: 'from-blue-400 to-blue-600',
    procedure: 'Troca de Valva Aórtica', date: '10 Mai 2025', price: 1400,
    rating: 5, evaluated: true, hasCert: true,
  },
  {
    id: 2, mentorName: 'Dra. Juliana Santos', mentorInitials: 'JS', mentorColor: 'from-rose-400 to-rose-600',
    procedure: 'Lobectomia Pulmonar', date: '28 Abr 2025', price: 1400,
    rating: 0, evaluated: false, hasCert: false,
  },
  {
    id: 3, mentorName: 'Dra. Marina Costa', mentorInitials: 'MC', mentorColor: 'from-purple-400 to-purple-600',
    procedure: 'Laminectomia Lombar', date: '5 Abr 2025', price: 1200,
    rating: 4, evaluated: true, hasCert: true,
  },
]

const DOCS = [
  { id: 1, name: 'Diploma de Medicina', status: 'aprovado', uploaded: '15 Mar 2025' },
  { id: 2, name: 'CRM', status: 'aprovado', uploaded: '15 Mar 2025' },
  { id: 3, name: 'Comprovante de Residência', status: 'pendente', uploaded: '20 Mai 2025' },
  { id: 4, name: 'Foto de Perfil', status: 'rejeitado', uploaded: '1 Jun 2025' },
  { id: 5, name: 'Comprovante de Especialização', status: null, uploaded: null },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const levelColor = { 'Avançado': 'bg-red-100 text-red-700', 'Intermediário': 'bg-yellow-100 text-yellow-700' }

const BOOKING_STATUS = {
  confirmado:           { label: 'Confirmado',           color: 'bg-green-100 text-green-700' },
  aguardando_pagamento: { label: 'Pgto. Pendente',        color: 'bg-yellow-100 text-yellow-700' },
  aguardando_aprovacao: { label: 'Ag. Aprovação',         color: 'bg-blue-100 text-blue-700' },
}

const DOC_STATUS = {
  aprovado:  { label: 'Aprovado',    color: 'bg-green-100 text-green-700' },
  pendente:  { label: 'Em análise',  color: 'bg-yellow-100 text-yellow-700' },
  rejeitado: { label: 'Rejeitado',   color: 'bg-red-100 text-red-700' },
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

function Avatar({ initials, color, size = 'md' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-14 h-14 text-lg' }
  return (
    <div className={`rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold flex-shrink-0 ${sizes[size]}`}>
      {initials}
    </div>
  )
}

// ─── Booking modal ────────────────────────────────────────────────────────────

function BookingModal({ mentor, onClose }) {
  const [step, setStep] = useState('detail')
  const [selectedProc, setSelectedProc] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [payMethod, setPayMethod] = useState('pix')

  const proc = mentor.procedures.find(p => p.name === selectedProc)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar initials={mentor.initials} color={mentor.color} size="sm" />
            <div>
              <p className="font-semibold text-[#1E293B] text-sm">{mentor.name}</p>
              <p className="text-xs text-[#64748B]">{mentor.specialty}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[#F1F5F9] flex items-center justify-center text-[#64748B]">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 p-5">

          {/* STEP: detail */}
          {step === 'detail' && (
            <div>
              <div className="flex items-center gap-1 mb-1">
                {[1,2,3,4,5].map(i => <StarIcon key={i} filled={i <= Math.round(mentor.rating)} />)}
                <span className="text-sm font-semibold text-[#1E293B] ml-1">{mentor.rating}</span>
                <span className="text-xs text-[#94A3B8]">({mentor.reviews} avaliações)</span>
              </div>
              <p className="text-xs text-[#64748B] mb-1">📍 {mentor.city} · 🏥 {mentor.hospital} · ⏱ {mentor.years} anos</p>
              <p className="text-sm text-[#374151] mt-3 mb-5 leading-relaxed">{mentor.mini}</p>

              <h4 className="font-semibold text-[#1E293B] text-sm mb-3">Escolha um Procedimento</h4>
              <div className="space-y-2 mb-6">
                {mentor.procedures.map(p => (
                  <label key={p.name} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedProc === p.name ? 'border-[#1E3A8A] bg-[#EFF6FF]' : 'border-[#E2E8F0] hover:border-[#93C5FD]'
                  }`}>
                    <input type="radio" name="proc" className="accent-[#1E3A8A]" checked={selectedProc === p.name} onChange={() => setSelectedProc(p.name)} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1E293B]">{p.name}</p>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        ⏱ {p.duration} · <span className={`px-1.5 py-0.5 rounded-full text-xs ${levelColor[p.level]}`}>{p.level}</span>
                      </p>
                    </div>
                    <span className="font-bold text-[#1E3A8A] text-sm">R$ {p.price.toLocaleString('pt-BR')}</span>
                  </label>
                ))}
              </div>
              <button
                disabled={!selectedProc}
                onClick={() => setStep('slot')}
                className="w-full py-3.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Escolher Data e Horário →
              </button>
            </div>
          )}

          {/* STEP: slot */}
          {step === 'slot' && (
            <div>
              <button onClick={() => setStep('detail')} className="text-sm text-[#64748B] mb-4 hover:text-[#1E3A8A] flex items-center gap-1">
                ← Voltar
              </button>
              <h4 className="font-semibold text-[#1E293B] mb-0.5">Datas Disponíveis</h4>
              <p className="text-xs text-[#64748B] mb-4">{selectedProc}</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {mentor.slots.map(slot => (
                  <button key={slot} onClick={() => setSelectedSlot(slot)}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                      selectedSlot === slot ? 'border-[#1E3A8A] bg-[#EFF6FF] text-[#1E3A8A]' : 'border-[#E2E8F0] text-[#374151] hover:border-[#93C5FD]'
                    }`}>
                    📅 {slot}
                  </button>
                ))}
              </div>
              {selectedSlot && proc && (
                <div className="bg-[#F8FAFC] rounded-xl p-4 mb-4 text-sm space-y-1">
                  <p className="font-medium text-[#1E293B]">{selectedProc}</p>
                  <p className="text-[#64748B]">{selectedSlot}</p>
                  <p className="font-bold text-[#1E3A8A]">R$ {proc.price.toLocaleString('pt-BR')}</p>
                </div>
              )}
              <button
                disabled={!selectedSlot}
                onClick={() => setStep('pending')}
                className="w-full py-3.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Solicitar Vaga
              </button>
            </div>
          )}

          {/* STEP: pending (awaiting mentor approval) */}
          {step === 'pending' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 text-3xl">⏳</div>
              <h3 className="font-bold text-[#1E293B] text-lg mb-2">Solicitação Enviada!</h3>
              <p className="text-[#64748B] text-sm mb-1">Aguardando aprovação de <strong>{mentor.name}</strong>.</p>
              <p className="text-[#94A3B8] text-xs mb-6">Você receberá um e-mail assim que o mentor aprovar sua vaga. Geralmente em até 24h.</p>
              {proc && (
                <div className="bg-[#F8FAFC] rounded-xl p-4 text-left text-sm space-y-1 mb-6">
                  <p className="text-[#64748B]">Procedimento: <span className="font-medium text-[#1E293B]">{selectedProc}</span></p>
                  <p className="text-[#64748B]">Data/Hora: <span className="font-medium text-[#1E293B]">{selectedSlot}</span></p>
                  <p className="text-[#64748B]">Valor: <span className="font-bold text-[#1E3A8A]">R$ {proc.price.toLocaleString('pt-BR')}</span></p>
                </div>
              )}
              <button onClick={() => setStep('payment')} className="w-full py-3.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl font-semibold text-sm">
                Simular aprovação → Pagamento
              </button>
            </div>
          )}

          {/* STEP: payment */}
          {step === 'payment' && proc && (
            <div>
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3 mb-5">
                <span className="text-xl">✅</span>
                <div>
                  <p className="font-semibold text-green-800 text-sm">Vaga Aprovada!</p>
                  <p className="text-xs text-green-700">Conclua o pagamento para confirmar sua presença.</p>
                </div>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl p-4 text-sm space-y-1 mb-4">
                <p className="text-[#64748B]">Procedimento: <span className="font-medium text-[#1E293B]">{selectedProc}</span></p>
                <p className="text-[#64748B]">Data/Hora: <span className="font-medium text-[#1E293B]">{selectedSlot}</span></p>
                <p className="font-bold text-[#1E3A8A] text-base">R$ {proc.price.toLocaleString('pt-BR')}</p>
              </div>

              <div className="flex bg-[#F1F5F9] rounded-xl p-1 mb-4">
                {['pix', 'card'].map(m => (
                  <button key={m} onClick={() => setPayMethod(m)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${payMethod === m ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-[#64748B]'}`}>
                    {m === 'pix' ? '⚡ PIX' : '💳 Cartão'}
                  </button>
                ))}
              </div>

              {payMethod === 'pix' ? (
                <div className="text-center mb-4">
                  <div className="inline-block bg-white border-2 border-[#E2E8F0] rounded-xl p-4 mb-3">
                    <div className="w-36 h-36 bg-[#F1F5F9] rounded-lg flex items-center justify-center text-[#94A3B8] text-xs">
                      [QR Code PIX]
                    </div>
                  </div>
                  <p className="text-xs text-[#64748B] mb-1">Ou copie a chave PIX:</p>
                  <code className="block text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-[#374151]">
                    experenciei@pagamentos.com.br
                  </code>
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  <input placeholder="Número do cartão" className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#1E3A8A]" />
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Validade MM/AA" className="px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#1E3A8A]" />
                    <input placeholder="CVV" className="px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#1E3A8A]" />
                  </div>
                  <input placeholder="Nome no cartão" className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#1E3A8A]" />
                </div>
              )}

              <button onClick={() => setStep('confirmed')} className="w-full py-3.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl font-semibold text-sm">
                {payMethod === 'pix' ? 'Confirmar Pagamento PIX' : `Pagar R$ ${proc.price.toLocaleString('pt-BR')}`}
              </button>
            </div>
          )}

          {/* STEP: confirmed */}
          {step === 'confirmed' && proc && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-3xl">🎉</div>
              <h3 className="font-bold text-[#1E293B] text-lg mb-2">Presença Confirmada!</h3>
              <p className="text-[#64748B] text-sm mb-4">Sua vaga está garantida. Prepare-se para uma experiência incrível!</p>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left text-sm space-y-1 mb-6">
                <p className="font-semibold text-green-800">✅ {selectedProc}</p>
                <p className="text-green-700">📅 {selectedSlot}</p>
                <p className="text-green-700">👨‍⚕️ {mentor.name}</p>
                <p className="text-green-700">🏥 {mentor.hospital}</p>
              </div>
              <button onClick={onClose} className="w-full py-3.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl font-semibold text-sm">
                Ver Meus Agendamentos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'explorar',     label: 'Explorar',    icon: '🔍' },
  { id: 'agendamentos', label: 'Agendamentos', icon: '📅' },
  { id: 'historico',    label: 'Histórico',   icon: '📚' },
  { id: 'perfil',       label: 'Perfil',       icon: '👤' },
  { id: 'docs',         label: 'Documentos',  icon: '📄' },
]

export default function StudentHome() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()

  const [activeTab, setActiveTab] = useState('explorar')
  const [searchTab, setSearchTab] = useState('mentor')
  const [procCategory, setProcCategory] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [bookingMentor, setBookingMentor] = useState(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [ratingFor, setRatingFor] = useState(null)
  const [starHover, setStarHover] = useState(0)
  const [starPicked, setStarPicked] = useState(0)

  const initials = profile?.nome?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'EU'
  const firstName = profile?.nome?.split(' ')[0] || 'Você'
  const nivelLabel = { estudante: 'Estudante', residente: 'Residente', especialista: 'Especialista' }[profile?.nivel] || 'Aluno'

  const filteredProcedures = procCategory === 'Todos' ? PROCEDURES : PROCEDURES.filter(p => p.category === procCategory)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
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
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === t.id ? 'bg-[#EFF6FF] text-[#1E3A8A]' : 'text-[#64748B] hover:text-[#1E3A8A] hover:bg-[#F8FAFC]'
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </nav>

          {/* Profile menu */}
          <div className="relative ml-auto">
            <button onClick={() => setProfileMenuOpen(o => !o)} className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white text-sm font-bold">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-[#1E293B] leading-none">{firstName}</p>
                <p className="text-xs text-[#94A3B8]">{nivelLabel}</p>
              </div>
            </button>
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-[#E2E8F0] rounded-xl shadow-lg py-1 z-50">
                <button onClick={() => { setActiveTab('perfil'); setProfileMenuOpen(false) }} className="w-full text-left px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F8FAFC]">Meu Perfil</button>
                <button onClick={() => { setActiveTab('docs'); setProfileMenuOpen(false) }} className="w-full text-left px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F8FAFC]">Documentação</button>
                <button onClick={() => { setActiveTab('agendamentos'); setProfileMenuOpen(false) }} className="w-full text-left px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F8FAFC]">Agendamentos</button>
                <hr className="my-1 border-[#F1F5F9]" />
                <button onClick={signOut} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">Sair</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pb-24 md:pb-8">

        {/* ── EXPLORAR ── */}
        {activeTab === 'explorar' && (
          <div>
            <section className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] py-10 md:py-14">
              <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <h1 className="text-white text-2xl sm:text-3xl font-bold text-center mb-1">
                  Olá, {firstName}! 👋
                </h1>
                <p className="text-blue-200 text-center text-sm mb-8">Encontre sua próxima experiência cirúrgica</p>

                <div className="flex bg-white/15 rounded-xl p-1 mb-5 max-w-xs mx-auto">
                  {['mentor', 'procedimento'].map(tab => (
                    <button key={tab} onClick={() => setSearchTab(tab)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${searchTab === tab ? 'bg-white text-[#1E3A8A]' : 'text-white hover:bg-white/10'}`}>
                      {tab === 'mentor' ? 'Mentor' : 'Procedimento'}
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xl">
                  <div className="flex gap-3">
                    <input
                      type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder={searchTab === 'mentor' ? 'Nome do mentor, especialidade...' : 'Nome do procedimento...'}
                      className="flex-1 px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A]"
                    />
                    <button className="px-5 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-semibold">
                      Buscar
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">

              {/* Mentor cards */}
              <div>
                <h2 className="text-xl font-bold text-[#0F172A] mb-6">Mentores em Destaque</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {MENTORS.map(mentor => (
                    <div key={mentor.id} className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden hover:shadow-md transition-shadow">
                      {mentor.top && (
                        <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white text-xs font-semibold px-3 py-1.5">
                          ⭐ Top Mentor
                        </div>
                      )}
                      <div className="p-5">
                        <Avatar initials={mentor.initials} color={mentor.color} size="lg" />
                        <h3 className="font-bold text-[#1E293B] text-sm mt-3">{mentor.name}</h3>
                        <p className="text-[#64748B] text-xs mb-2">{mentor.specialty}</p>
                        <div className="flex items-center gap-0.5 mb-3">
                          {[1,2,3,4,5].map(i => <StarIcon key={i} filled={i <= Math.round(mentor.rating)} />)}
                          <span className="text-xs font-semibold text-[#1E293B] ml-1">{mentor.rating}</span>
                          <span className="text-xs text-[#94A3B8]"> ({mentor.reviews})</span>
                        </div>
                        <div className="space-y-1 mb-4 text-xs text-[#64748B]">
                          <p>📍 {mentor.city}</p>
                          <p>🏥 {mentor.hospital}</p>
                          <p>⏱ {mentor.years} anos de experiência</p>
                        </div>
                        <div className="bg-[#F8FAFC] rounded-xl p-3 mb-4">
                          <p className="text-xs text-[#94A3B8]">A partir de</p>
                          <p className="text-[#1E3A8A] font-bold">R$ {Math.min(...mentor.procedures.map(p => p.price)).toLocaleString('pt-BR')}</p>
                          <p className="text-xs text-[#94A3B8] mt-1">{mentor.slots.length} horários disponíveis</p>
                        </div>
                        <button onClick={() => setBookingMentor(mentor)}
                          className="w-full py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                          Ver & Solicitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Procedure cards */}
              <div>
                <h2 className="text-xl font-bold text-[#0F172A] mb-4">Procedimentos em Alta</h2>
                <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
                  {PROC_CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setProcCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                        procCategory === cat ? 'bg-[#1E3A8A] text-white' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#1E3A8A] hover:text-[#1E3A8A]'
                      }`}>
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProcedures.map(proc => {
                    const mentor = MENTORS.find(m => m.procedures.some(p => p.name === proc.name))
                    return (
                      <div key={proc.name} onClick={() => mentor && setBookingMentor(mentor)}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-[#E2E8F0] hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-semibold text-[#2563EB] bg-[#DBEAFE] px-2.5 py-1 rounded-full">{proc.category}</span>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${levelColor[proc.level]}`}>{proc.level}</span>
                        </div>
                        <h3 className="font-semibold text-[#1E293B] mb-2">{proc.name}</h3>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#64748B]">⏱ {proc.duration}</span>
                          <span className="font-bold text-[#1E3A8A]">R$ {proc.price.toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── AGENDAMENTOS ── */}
        {activeTab === 'agendamentos' && (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
            <h2 className="text-xl font-bold text-[#0F172A] mb-6">Meus Agendamentos</h2>
            <div className="space-y-4">
              {BOOKINGS.map(b => {
                const cfg = BOOKING_STATUS[b.status]
                return (
                  <div key={b.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                      <Avatar initials={b.mentorInitials} color={b.mentorColor} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-[#1E293B] text-sm">{b.mentorName}</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                        </div>
                        <p className="text-sm text-[#374151] mb-1">{b.procedure}</p>
                        <p className="text-xs text-[#64748B]">📅 {b.date} · {b.time}</p>
                        <p className="text-xs text-[#64748B]">📍 {b.location}</p>
                        <p className="text-sm font-bold text-[#1E3A8A] mt-2">R$ {b.price.toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                    {b.status === 'aguardando_pagamento' && (
                      <button className="mt-4 w-full py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-semibold">
                        💳 Efetuar Pagamento
                      </button>
                    )}
                    {b.status === 'confirmado' && (
                      <p className="mt-3 text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                        ✅ Vaga confirmada — você receberá os detalhes por e-mail.
                      </p>
                    )}
                    {b.status === 'aguardando_aprovacao' && (
                      <p className="mt-3 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                        ⏳ O mentor revisará sua solicitação em breve.
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── HISTÓRICO ── */}
        {activeTab === 'historico' && (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
            <h2 className="text-xl font-bold text-[#0F172A] mb-6">Histórico de Experiências</h2>
            <div className="space-y-4">
              {HISTORY.map(h => (
                <div key={h.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <Avatar initials={h.mentorInitials} color={h.mentorColor} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1E293B] text-sm">{h.mentorName}</p>
                      <p className="text-sm text-[#374151]">{h.procedure}</p>
                      <p className="text-xs text-[#64748B] mt-0.5">📅 {h.date}</p>
                      <p className="text-sm font-bold text-[#1E3A8A] mt-1">R$ {h.price.toLocaleString('pt-BR')}</p>
                      {h.evaluated && (
                        <div className="flex items-center gap-0.5 mt-1">
                          {[1,2,3,4,5].map(i => <StarIcon key={i} filled={i <= h.rating} />)}
                          <span className="text-xs text-[#94A3B8] ml-1">Sua avaliação</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {h.hasCert && (
                        <button className="px-3 py-1.5 border border-[#1E3A8A] text-[#1E3A8A] rounded-lg text-xs font-medium hover:bg-[#EFF6FF]">
                          📜 Certificado
                        </button>
                      )}
                      {!h.evaluated && (
                        <button onClick={() => { setRatingFor(h.id); setStarPicked(0) }}
                          className="px-3 py-1.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-lg text-xs font-medium">
                          ⭐ Avaliar
                        </button>
                      )}
                    </div>
                  </div>

                  {ratingFor === h.id && (
                    <div className="mt-4 bg-[#F8FAFC] rounded-xl p-4">
                      <p className="text-sm font-medium text-[#1E293B] mb-2">Avalie sua experiência</p>
                      <div className="flex gap-1 mb-3">
                        {[1,2,3,4,5].map(i => (
                          <button key={i} onMouseEnter={() => setStarHover(i)} onMouseLeave={() => setStarHover(0)} onClick={() => setStarPicked(i)}>
                            <StarIcon filled={i <= (starHover || starPicked)} />
                          </button>
                        ))}
                      </div>
                      <textarea rows={2} placeholder="Deixe um comentário (opcional)..."
                        className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm resize-none focus:outline-none focus:border-[#1E3A8A]" />
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => setRatingFor(null)} className="flex-1 py-2 border border-[#E2E8F0] text-[#64748B] rounded-lg text-sm">Cancelar</button>
                        <button disabled={!starPicked} onClick={() => setRatingFor(null)}
                          className="flex-[2] py-2 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-lg text-sm font-semibold disabled:opacity-40">
                          Enviar Avaliação
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PERFIL ── */}
        {activeTab === 'perfil' && (
          <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
            <h2 className="text-xl font-bold text-[#0F172A] mb-6">Meu Perfil</h2>
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm mb-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white font-bold text-xl">
                  {initials}
                </div>
                <div>
                  <p className="font-bold text-[#1E293B] text-lg">{profile?.nome || '—'}</p>
                  <p className="text-sm text-[#64748B]">{nivelLabel} · {profile?.cidade || '—'}</p>
                </div>
              </div>
              <div className="space-y-0">
                {[
                  { label: 'Especialidade', value: profile?.especialidade || '—' },
                  { label: 'Ano de formação', value: profile?.ano_formacao || '—' },
                  { label: 'CRM', value: profile?.crm || '—' },
                ].map(f => (
                  <div key={f.label} className="flex justify-between items-center py-3 border-b border-[#F1F5F9] text-sm">
                    <span className="text-[#64748B]">{f.label}</span>
                    <span className="font-medium text-[#1E293B]">{f.value}</span>
                  </div>
                ))}
              </div>
              <button className="mt-5 w-full py-2.5 border-2 border-[#1E3A8A] text-[#1E3A8A] rounded-xl text-sm font-semibold hover:bg-[#EFF6FF]">
                Editar Perfil
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Experiências', value: HISTORY.length },
                { label: 'Agendamentos', value: BOOKINGS.length },
                { label: 'Certificados', value: HISTORY.filter(h => h.hasCert).length },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 text-center shadow-sm">
                  <p className="text-2xl font-bold text-[#1E3A8A]">{s.value}</p>
                  <p className="text-xs text-[#64748B] mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DOCUMENTAÇÃO ── */}
        {activeTab === 'docs' && (
          <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
            <h2 className="text-xl font-bold text-[#0F172A] mb-1">Documentação</h2>
            <p className="text-sm text-[#64748B] mb-6">Envie seus documentos para verificação do perfil.</p>
            <div className="space-y-3">
              {DOCS.map(doc => {
                const cfg = doc.status ? DOC_STATUS[doc.status] : { label: 'Não enviado', color: 'bg-gray-100 text-gray-500' }
                return (
                  <div key={doc.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-xl flex-shrink-0">📄</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#1E293B] text-sm">{doc.name}</p>
                      {doc.uploaded && <p className="text-xs text-[#94A3B8]">Enviado em {doc.uploaded}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                      {(!doc.status || doc.status === 'rejeitado') && (
                        <button className="text-xs text-[#2563EB] font-medium hover:underline">
                          {doc.status === 'rejeitado' ? 'Reenviar' : 'Enviar'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] flex z-40 safe-area-inset-bottom">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${activeTab === t.id ? 'text-[#1E3A8A]' : 'text-[#94A3B8]'}`}>
            <span className="text-lg leading-none">{t.icon}</span>
            <span className="text-[10px] font-medium leading-none">{t.label}</span>
          </button>
        ))}
      </nav>

      {bookingMentor && <BookingModal mentor={bookingMentor} onClose={() => setBookingMentor(null)} />}
    </div>
  )
}
