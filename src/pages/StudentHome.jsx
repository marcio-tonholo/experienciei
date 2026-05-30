import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const mentors = [
  {
    id: 1,
    name: 'Dr. Carlos Silva',
    specialty: 'Cirurgião Cardiovascular',
    rating: 4.9,
    reviews: 127,
    city: 'São Paulo, SP',
    years: 15,
    price: 1200,
    dates: ['15', '18', '22 Jun'],
    top: true,
    initials: 'CS',
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: 2,
    name: 'Dra. Marina Costa',
    specialty: 'Neurocirurgiã',
    rating: 4.8,
    reviews: 94,
    city: 'Rio de Janeiro, RJ',
    years: 12,
    price: 1500,
    dates: ['16', '20', '25 Jun'],
    top: true,
    initials: 'MC',
    color: 'from-purple-400 to-purple-600',
  },
  {
    id: 3,
    name: 'Dr. Rafael Mendes',
    specialty: 'Cirurgião Ortopédico',
    rating: 4.7,
    reviews: 85,
    city: 'Belo Horizonte, MG',
    years: 10,
    price: 1100,
    dates: ['17', '21', '24 Jun'],
    top: false,
    initials: 'RM',
    color: 'from-green-400 to-green-600',
  },
  {
    id: 4,
    name: 'Dra. Juliana Santos',
    specialty: 'Cirurgiã Torácica',
    rating: 4.9,
    reviews: 112,
    city: 'Curitiba, PR',
    years: 14,
    price: 1350,
    dates: ['19', '23', '26 Jun'],
    top: true,
    initials: 'JS',
    color: 'from-rose-400 to-rose-600',
  },
]

const procedures = [
  { name: 'Revascularização Miocárdica', category: 'Cardiologia', duration: '4-6h', level: 'Avançado', price: 1500 },
  { name: 'Clipagem de Aneurisma', category: 'Neurologia', duration: '3-5h', level: 'Avançado', price: 1600 },
  { name: 'Artroplastia de Joelho', category: 'Ortopedia', duration: '2-3h', level: 'Intermediário', price: 1100 },
  { name: 'Lobectomia Pulmonar', category: 'Torácica', duration: '3-4h', level: 'Avançado', price: 1400 },
  { name: 'Troca de Valva Aórtica', category: 'Cardiologia', duration: '3-5h', level: 'Avançado', price: 1400 },
  { name: 'Laminectomia Lombar', category: 'Neurologia', duration: '2-3h', level: 'Intermediário', price: 1200 },
]

const procedureCategories = ['Todos', 'Cardiologia', 'Neurologia', 'Ortopedia', 'Torácica']

const levelColor = { 'Avançado': 'bg-red-100 text-red-700', 'Intermediário': 'bg-yellow-100 text-yellow-700' }

export default function StudentHome() {
  const navigate = useNavigate()
  const [searchTab, setSearchTab] = useState('mentor')
  const [procCategory, setProcCategory] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [filters, setFilters] = useState({ specialty: '', location: '', price: '', availability: '' })

  const filteredProcedures = procCategory === 'Todos'
    ? procedures
    : procedures.filter(p => p.category === procCategory)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 512 512">
                <path d="M272 464h-32a32 32 0 01-32-32l.05-85.82a4 4 0 00-6-3.47l-74.34 43.06a31.48 31.48 0 01-43-11.52l-16.5-28.64a31.65 31.65 0 0111.56-42.8l74.61-43.25a4 4 0 000-6.92l-74.54-43.21a31.41 31.41 0 01-11.55-43l16.44-28.55a31.48 31.48 0 0143.07-11.54l74.31 43a4 4 0 006-3.47L208 80a32 32 0 0132-32h32a32 32 0 0132 32v85.72a4 4 0 006 3.47l74.34-43.06a31.51 31.51 0 0143 11.52l16.49 28.73a31.52 31.52 0 01-11.64 42.86l-74.53 43.2a4 4 0 000 6.92l74.53 43.2a31.42 31.42 0 0111.56 43l-16.44 28.55a31.48 31.48 0 01-43.07 11.54l-74.31-43a4 4 0 00-6 3.46L304 432a32 32 0 01-32 32z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-[#1E3A8A] hidden sm:block">Experenciei</span>
          </button>

          <button className="hidden sm:flex px-4 py-2 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-lg text-sm font-medium">
            Agendar Mentoria
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white text-sm font-bold">
                JS
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-[#1E293B] leading-none">João Silva</p>
                <p className="text-xs text-[#94A3B8]">Residente</p>
              </div>
            </div>
            <button
              className="sm:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <div className="w-5 h-0.5 bg-gray-700 mb-1" />
              <div className="w-5 h-0.5 bg-gray-700 mb-1" />
              <div className="w-5 h-0.5 bg-gray-700" />
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="sm:hidden bg-white border-t border-[#E2E8F0] px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white text-sm font-bold">JS</div>
              <div>
                <p className="text-sm font-semibold">João Silva</p>
                <p className="text-xs text-[#94A3B8]">Residente</p>
              </div>
            </div>
            <button className="w-full py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-lg text-sm font-medium">
              Agendar Mentoria
            </button>
          </div>
        )}
      </header>

      {/* Search Section */}
      <section className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-white text-2xl sm:text-3xl font-bold text-center mb-2">
            Encontre sua Próxima Experiência
          </h1>
          <p className="text-blue-200 text-center text-sm mb-8">Busque por mentor ou procedimento cirúrgico</p>

          {/* Search Tabs */}
          <div className="flex bg-white/15 rounded-xl p-1 mb-5 max-w-sm mx-auto">
            {['mentor', 'procedimento'].map(tab => (
              <button
                key={tab}
                onClick={() => setSearchTab(tab)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${searchTab === tab ? 'bg-white text-[#1E3A8A]' : 'text-white hover:bg-white/10'}`}
              >
                {tab === 'mentor' ? 'Buscar Mentor' : 'Buscar Procedimento'}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xl">
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={searchTab === 'mentor' ? 'Nome do mentor, especialidade...' : 'Nome do procedimento...'}
                className="flex-1 px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A]"
              />
              <button className="px-5 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-semibold whitespace-nowrap">
                Buscar
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'specialty', label: 'Especialidade', options: ['Cardiologia', 'Neurologia', 'Ortopedia'] },
                { key: 'location', label: 'Localização', options: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte'] },
                { key: 'price', label: 'Faixa de Preço', options: ['Até R$ 1.000', 'R$ 1.000 - R$ 1.500', 'Acima de R$ 1.500'] },
                { key: 'availability', label: 'Disponibilidade', options: ['Esta Semana', 'Este Mês', 'Próximo Mês'] },
              ].map(f => (
                <select
                  key={f.key}
                  value={filters[f.key]}
                  onChange={e => setFilters({ ...filters, [f.key]: e.target.value })}
                  className="px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B] focus:outline-none focus:border-[#1E3A8A] bg-white"
                >
                  <option value="">{f.label}</option>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Featured Mentors */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#0F172A]">Mentores em Destaque</h2>
            <button className="text-[#2563EB] text-sm font-medium hover:underline">Ver todos os mentores →</button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mentors.map(mentor => (
              <div key={mentor.id} className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden hover:shadow-md transition-shadow">
                {mentor.top && (
                  <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white text-xs font-semibold px-3 py-1.5 flex items-center gap-1">
                    ⭐ Top Mentor
                  </div>
                )}
                <div className="p-5">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${mentor.color} flex items-center justify-center text-white font-bold text-lg mb-4`}>
                    {mentor.initials}
                  </div>
                  <h3 className="font-bold text-[#1E293B] text-sm">{mentor.name}</h3>
                  <p className="text-[#64748B] text-xs mb-2">{mentor.specialty}</p>

                  <div className="flex items-center gap-1 mb-3">
                    <svg className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-semibold text-[#1E293B]">{mentor.rating}</span>
                    <span className="text-xs text-[#94A3B8]">({mentor.reviews} avaliações)</span>
                  </div>

                  <div className="space-y-1 mb-4">
                    <p className="text-xs text-[#64748B] flex items-center gap-1">
                      📍 {mentor.city}
                    </p>
                    <p className="text-xs text-[#64748B] flex items-center gap-1">
                      ⏱ {mentor.years} anos de experiência
                    </p>
                  </div>

                  <div className="bg-[#F8FAFC] rounded-xl p-3 mb-4">
                    <p className="text-xs text-[#94A3B8] mb-0.5">A partir de</p>
                    <p className="text-[#1E3A8A] font-bold text-base">R$ {mentor.price.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-[#94A3B8] mt-1">Próximas datas: {mentor.dates.join(', ')}</p>
                  </div>

                  <button
                    onClick={() => navigate(`/mentor/${mentor.id}`)}
                    className="w-full py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Ver Perfil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Procedures */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#0F172A]">Procedimentos em Alta</h2>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
            {procedureCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setProcCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  procCategory === cat
                    ? 'bg-[#1E3A8A] text-white'
                    : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#1E3A8A] hover:text-[#1E3A8A]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProcedures.map(proc => (
              <div
                key={proc.name}
                className="bg-white rounded-2xl p-5 shadow-sm border border-[#E2E8F0] hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate('/home')}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold text-[#2563EB] bg-[#DBEAFE] px-2.5 py-1 rounded-full">
                    {proc.category}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${levelColor[proc.level]}`}>
                    {proc.level}
                  </span>
                </div>
                <h3 className="font-semibold text-[#1E293B] mb-2">{proc.name}</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#64748B]">⏱ {proc.duration}</span>
                  <span className="font-bold text-[#1E3A8A]">R$ {proc.price.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
