import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const mentor = {
  name: 'Dr. Carlos Silva',
  specialty: 'Cirurgião Cardiovascular',
  rating: 5.0,
  reviews: 156,
  city: 'São Paulo, SP',
  years: 18,
  procedures_count: 340,
  initials: 'CS',
  bio: 'Especialista em cirurgia cardiovascular com mais de 18 anos de experiência. Formado pela USP com fellowship na Cleveland Clinic (EUA). Apaixonado por ensinar e compartilhar conhecimento prático com a próxima geração de cirurgiões.',
  specialties: ['Cirurgia Cardíaca', 'Revascularização Miocárdica', 'Valvuloplastia', 'Cirurgia Aórtica', 'Transplante Cardíaco'],
  education: [
    { degree: 'Doutorado em Cirurgia Cardíaca', institution: 'Universidade de São Paulo (USP)', year: 2010 },
    { degree: 'Residência em Cirurgia Cardiovascular', institution: 'Hospital das Clínicas - FMUSP', year: 2006 },
    { degree: 'Graduação em Medicina', institution: 'Universidade Federal de São Paulo (UNIFESP)', year: 2003 },
    { degree: 'Fellowship em Cirurgia Cardíaca', institution: 'Cleveland Clinic - EUA', year: 2012 },
  ],
}

const procedures = [
  { name: 'Revascularização Miocárdica', duration: '4-6 horas', level: 'Avançado', price: 1500 },
  { name: 'Troca de Valva Aórtica', duration: '3-5 horas', level: 'Avançado', price: 1400 },
  { name: 'Cirurgia de Aorta Torácica', duration: '5-8 horas', level: 'Muito Avançado', price: 1800 },
  { name: 'Cirurgia Cardíaca Minimamente Invasiva', duration: '3-4 horas', level: 'Intermediário', price: 1200 },
]

const reviews = [
  { name: 'Dr. Paulo Ferreira', role: 'Cardiologista', rating: 5, text: 'Experiência incrível! Dr. Carlos é um mestre em sua área e transmite o conhecimento com muita clareza e paciência.', initials: 'PF', date: 'Mar 2024' },
  { name: 'Dra. Camila Rocha', role: 'Residente em Cardiologia', rating: 5, text: 'A melhor mentoria que já tive. Aprendi técnicas que não encontro em nenhum livro. Vale cada centavo.', initials: 'CR', date: 'Fev 2024' },
  { name: 'Dr. André Lima', role: 'Cirurgião em Formação', rating: 5, text: 'Profissional excepcional, humano e dedicado ao ensino. Recomendo a todos que querem evoluir na cirurgia cardiovascular.', initials: 'AL', date: 'Jan 2024' },
]

const weekDays = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
const calendarDays = [
  { day: '10', available: false },
  { day: '11', available: false },
  { day: '12', available: true },
  { day: '13', available: false },
  { day: '14', available: true },
  { day: '15', available: true },
  { day: '17', available: false },
  { day: '18', available: true },
  { day: '19', available: false },
  { day: '20', available: false },
  { day: '21', available: true },
  { day: '22', available: false },
  { day: '24', available: true },
  { day: '25', available: false },
  { day: '26', available: true },
  { day: '27', available: true },
  { day: '28', available: false },
  { day: '29', available: true },
]

const levelColor = {
  'Avançado': 'bg-red-100 text-red-700',
  'Muito Avançado': 'bg-orange-100 text-orange-700',
  'Intermediário': 'bg-yellow-100 text-yellow-700',
}

const tabs = ['Sobre', 'Procedimentos', 'Avaliações', 'Disponibilidade']

export default function MentorProfile() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Sobre')
  const [selectedProcedure, setSelectedProcedure] = useState(procedures[0].name)
  const [selectedDate, setSelectedDate] = useState(null)
  const [requested, setRequested] = useState(false)

  const selectedProc = procedures.find(p => p.name === selectedProcedure)

  const handleRequest = () => {
    if (!selectedDate) return
    setRequested(true)
    setTimeout(() => navigate('/home'), 2000)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-[#64748B] hover:text-[#1E3A8A] text-sm font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:block">Voltar à busca</span>
          </button>

          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 512 512">
                <path d="M272 464h-32a32 32 0 01-32-32l.05-85.82a4 4 0 00-6-3.47l-74.34 43.06a31.48 31.48 0 01-43-11.52l-16.5-28.64a31.65 31.65 0 0111.56-42.8l74.61-43.25a4 4 0 000-6.92l-74.54-43.21a31.41 31.41 0 01-11.55-43l16.44-28.55a31.48 31.48 0 0143.07-11.54l74.31 43a4 4 0 006-3.47L208 80a32 32 0 0132-32h32a32 32 0 0132 32v85.72a4 4 0 006 3.47l74.34-43.06a31.51 31.51 0 0143 11.52l16.49 28.73a31.52 31.52 0 01-11.64 42.86l-74.53 43.2a4 4 0 000 6.92l74.53 43.2a31.42 31.42 0 0111.56 43l-16.44 28.55a31.48 31.48 0 01-43.07 11.54l-74.31-43a4 4 0 00-6 3.46L304 432a32 32 0 01-32 32z" />
              </svg>
            </div>
            <span className="text-base font-bold text-[#1E3A8A] hidden sm:block">Experenciei</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white text-sm font-bold">
              JS
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-[#1E293B] leading-none">João Silva</p>
              <p className="text-xs text-[#94A3B8]">Residente</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mentor Hero Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center mb-5">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                    {mentor.initials}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white text-xs font-bold px-2 py-1 rounded-full">
                    Top
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">{mentor.name}</h1>
                  <p className="text-[#64748B] mb-2">{mentor.specialty}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="font-bold text-[#1E293B]">{mentor.rating}</span>
                      <span className="text-[#94A3B8]">({mentor.reviews} avaliações)</span>
                    </div>
                    <span className="text-[#94A3B8]">📍 {mentor.city}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-5 p-4 bg-[#F8FAFC] rounded-xl">
                {[
                  ['18 anos', 'Experiência'],
                  ['340+', 'Procedimentos'],
                  [mentor.reviews, 'Avaliações'],
                ].map(([val, label]) => (
                  <div key={label} className="text-center">
                    <p className="font-bold text-[#1E3A8A] text-lg">{val}</p>
                    <p className="text-[#64748B] text-xs">{label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setActiveTab('Disponibilidade')}
                  className="flex-1 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Solicitar Vaga
                </button>
                <button className="flex-1 py-3 border-2 border-[#1E3A8A] text-[#1E3A8A] rounded-xl font-semibold text-sm hover:bg-[#EFF6FF] transition-colors">
                  Enviar Mensagem
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
              <div className="flex overflow-x-auto border-b border-[#E2E8F0]">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-shrink-0 px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-[#1E3A8A] text-[#1E3A8A]'
                        : 'border-transparent text-[#64748B] hover:text-[#1E3A8A]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'Sobre' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-[#1E293B] mb-3">Sobre o Mentor</h3>
                      <p className="text-[#64748B] text-sm leading-relaxed">{mentor.bio}</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1E293B] mb-3">Especialidades e Áreas de Atuação</h3>
                      <div className="flex flex-wrap gap-2">
                        {mentor.specialties.map(sp => (
                          <span key={sp} className="text-xs font-medium bg-[#DBEAFE] text-[#1E3A8A] px-3 py-1.5 rounded-full">
                            {sp}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1E293B] mb-4">Formação e Certificações</h3>
                      <div className="space-y-3">
                        {mentor.education.map(edu => (
                          <div key={edu.degree} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center flex-shrink-0 text-[#1E3A8A] font-bold text-xs">
                              {edu.year}
                            </div>
                            <div>
                              <p className="font-medium text-[#1E293B] text-sm">{edu.degree}</p>
                              <p className="text-[#64748B] text-xs">{edu.institution}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Procedimentos' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-[#1E293B] mb-4">Procedimentos Oferecidos</h3>
                    {procedures.map(proc => (
                      <div key={proc.name} className="flex items-center justify-between p-4 border border-[#E2E8F0] rounded-xl hover:border-[#93C5FD] hover:bg-[#F0F9FF] transition-all">
                        <div>
                          <p className="font-semibold text-[#1E293B] text-sm">{proc.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-[#64748B]">⏱ {proc.duration}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${levelColor[proc.level]}`}>
                              {proc.level}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#1E3A8A]">R$ {proc.price.toLocaleString('pt-BR')}</p>
                          <button
                            onClick={() => { setSelectedProcedure(proc.name); setActiveTab('Disponibilidade') }}
                            className="text-xs text-[#2563EB] hover:underline mt-1"
                          >
                            Ver Detalhes →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'Avaliações' && (
                  <div>
                    <div className="flex items-center gap-4 mb-6 p-4 bg-[#F8FAFC] rounded-xl">
                      <div className="text-center">
                        <p className="text-4xl font-black text-[#1E3A8A]">{mentor.rating}</p>
                        <div className="flex justify-center gap-0.5 my-1">
                          {[1,2,3,4,5].map(s => (
                            <svg key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-xs text-[#94A3B8]">{mentor.reviews} avaliações</p>
                      </div>
                      <div className="flex-1 space-y-1">
                        {[5,4,3,2,1].map(star => (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs text-[#94A3B8] w-3">{star}</span>
                            <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-400 rounded-full"
                                style={{ width: star === 5 ? '90%' : star === 4 ? '8%' : '2%' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {reviews.map(rev => (
                        <div key={rev.name} className="border border-[#E2E8F0] rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white text-xs font-bold">
                                {rev.initials}
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-[#1E293B]">{rev.name}</p>
                                <p className="text-xs text-[#94A3B8]">{rev.role}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1,2,3,4,5].map(s => (
                                <svg key={s} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-[#374151] text-sm leading-relaxed italic">"{rev.text}"</p>
                          <p className="text-[#94A3B8] text-xs mt-2">{rev.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'Disponibilidade' && (
                  <div>
                    <h3 className="font-bold text-[#1E293B] mb-4">Próximas Disponibilidades — Junho 2024</h3>
                    <div className="grid grid-cols-6 gap-1 mb-3">
                      {weekDays.map(d => (
                        <div key={d} className="text-center text-xs font-semibold text-[#94A3B8] py-1">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-6 gap-1.5">
                      {calendarDays.map((d, i) => (
                        <button
                          key={i}
                          disabled={!d.available}
                          onClick={() => setSelectedDate(d.day)}
                          className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                            selectedDate === d.day
                              ? 'bg-[#1E3A8A] text-white'
                              : d.available
                              ? 'bg-[#EFF6FF] text-[#1E3A8A] hover:bg-[#DBEAFE] border border-[#BFDBFE]'
                              : 'bg-[#F8FAFC] text-[#CBD5E1] cursor-not-allowed'
                          }`}
                        >
                          {d.day}
                        </button>
                      ))}
                    </div>
                    {selectedDate && (
                      <div className="mt-4 p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-sm text-[#1E3A8A] font-medium text-center">
                        ✓ Data selecionada: {selectedDate} de Junho de 2024
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="mt-6 lg:mt-0">
            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 sticky top-24">
              {requested ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-[#1E293B] text-lg mb-2">Vaga Solicitada!</h3>
                  <p className="text-[#64748B] text-sm">Aguardando aprovação do mentor. Você será notificado em breve.</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-5 pb-5 border-b border-[#E2E8F0]">
                    <p className="text-3xl font-black text-[#1E3A8A]">
                      R$ {selectedProc?.price.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-[#94A3B8] text-sm">por sessão</p>
                  </div>

                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-2">Selecionar Procedimento</label>
                      <select
                        value={selectedProcedure}
                        onChange={e => setSelectedProcedure(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#1E3A8A] bg-white"
                      >
                        {procedures.map(p => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-2">Próximas Disponibilidades</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['12 Jun', '14 Jun', '15 Jun', '18 Jun', '21 Jun', '24 Jun'].map(date => (
                          <button
                            key={date}
                            onClick={() => setSelectedDate(date)}
                            className={`py-2 px-1 rounded-lg text-xs font-medium text-center transition-all ${
                              selectedDate === date
                                ? 'bg-[#1E3A8A] text-white'
                                : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:border-[#93C5FD] hover:text-[#1E3A8A]'
                            }`}
                          >
                            {date}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedProc && (
                      <div className="bg-[#F8FAFC] rounded-xl p-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748B]">Duração</span>
                          <span className="text-[#1E293B] font-medium">{selectedProc.duration}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748B]">Nível</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${levelColor[selectedProc.level]}`}>
                            {selectedProc.level}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm pt-1 border-t border-[#E2E8F0]">
                          <span className="font-semibold text-[#1E293B]">Total</span>
                          <span className="font-bold text-[#1E3A8A]">R$ {selectedProc.price.toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleRequest}
                    disabled={!selectedDate}
                    className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                      selectedDate
                        ? 'bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white hover:opacity-90 shadow'
                        : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                    }`}
                  >
                    {selectedDate ? 'Solicitar Vaga' : 'Selecione uma data'}
                  </button>

                  <p className="text-center text-xs text-[#94A3B8] mt-3">
                    Sem cobrança até aprovação do mentor
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
