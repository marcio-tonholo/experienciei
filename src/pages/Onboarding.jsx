import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const UF_LIST = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

function formatCRM(raw) {
  const clean = raw.toUpperCase().replace(/[^0-9A-Z]/g, '')
  const digits = clean.match(/^\d*/)[0].slice(0, 6)
  const letters = clean.slice(digits.length).replace(/[^A-Z]/g, '').slice(0, 2)
  if (letters) return `${digits}-${letters}`
  return digits
}

function isValidCRM(value) {
  return /^\d{4,6}-[A-Z]{2}$/.test(value)
}

const AMBIENTES_OPTIONS = [
  'Hospital Público',
  'Hospital Privado',
  'Clínica',
  'Centro Cirúrgico',
  'Ensino / Universidade',
  'Telemedicina',
]

const NIVEL_OPTIONS = [
  { value: 'estudante', label: 'Estudante de Medicina' },
  { value: 'residente', label: 'Médico Residente' },
  { value: 'especialista', label: 'Médico Especialista' },
]

function TagInput({ values, onChange, placeholder }) {
  const [input, setInput] = useState('')

  function add(raw) {
    const val = raw.trim()
    if (val && !values.includes(val)) onChange([...values, val])
    setInput('')
  }

  function handleKey(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(input)
    } else if (e.key === 'Backspace' && !input && values.length) {
      onChange(values.slice(0, -1))
    }
  }

  return (
    <div className="min-h-[46px] flex flex-wrap gap-1.5 p-2 rounded-xl border border-[#E2E8F0] focus-within:ring-2 focus-within:ring-[#1E3A8A]/30 focus-within:border-[#1E3A8A] bg-white">
      {values.map(v => (
        <span key={v} className="flex items-center gap-1 bg-[#DBEAFE] text-[#1E3A8A] text-xs font-medium px-2.5 py-1 rounded-full">
          {v}
          <button type="button" onClick={() => onChange(values.filter(x => x !== v))} className="hover:text-red-500 leading-none">×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => input.trim() && add(input)}
        placeholder={values.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] outline-none text-sm text-[#374151] bg-transparent placeholder:text-[#94A3B8]"
      />
    </div>
  )
}

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
            i + 1 < current ? 'bg-[#1E3A8A] text-white' :
            i + 1 === current ? 'bg-[#1E3A8A] text-white ring-4 ring-[#DBEAFE]' :
            'bg-[#E2E8F0] text-[#94A3B8]'
          }`}>
            {i + 1 < current ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`h-0.5 w-8 sm:w-16 rounded-full ${i + 1 < current ? 'bg-[#1E3A8A]' : 'bg-[#E2E8F0]'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function Onboarding() {
  const { createProfile, signOut } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [papel, setPapel] = useState('')
  const [common, setCommon] = useState({ nome: '', categoria: '', cidade: '' })
  const [mentorData, setMentorData] = useState({
    crm: '', especialidade: '', subespecialidades: [],
    anos_experiencia: '', mini_curriculo: '', ambientes: [],
  })
  const [studentData, setStudentData] = useState({
    crm: '', especialidade: '', ano_formacao: '', nivel: '', objetivos: [],
  })

  function handleCommon(field, value) {
    setCommon(prev => ({ ...prev, [field]: value }))
  }

  function handleMentor(field, value) {
    setMentorData(prev => ({ ...prev, [field]: value }))
  }

  function handleStudent(field, value) {
    setStudentData(prev => ({ ...prev, [field]: value }))
  }

  function toggleAmbiente(amb) {
    setMentorData(prev => ({
      ...prev,
      ambientes: prev.ambientes.includes(amb)
        ? prev.ambientes.filter(a => a !== amb)
        : [...prev.ambientes, amb],
    }))
  }

  function canAdvanceStep2() {
    return common.nome.trim() && common.cidade.trim()
  }

  function canAdvanceStep3() {
    if (papel === 'mentor') {
      return isValidCRM(mentorData.crm) && mentorData.especialidade.trim() &&
        mentorData.anos_experiencia && mentorData.mini_curriculo.trim() && mentorData.ambientes.length > 0
    }
    if (studentData.nivel === 'residente' || studentData.nivel === 'especialista') {
      return studentData.nivel && isValidCRM(studentData.crm)
    }
    return studentData.nivel
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canAdvanceStep3()) return
    setSubmitting(true)
    setError('')

    const mentorPayload = papel === 'mentor' ? {
      crm: mentorData.crm.split('-')[0],
      uf: (mentorData.crm.split('-')[1] ?? '').toUpperCase(),
      especialidade: mentorData.especialidade,
      subespecialidades: mentorData.subespecialidades,
      anos_experiencia: parseInt(mentorData.anos_experiencia, 10),
      mini_curriculo: mentorData.mini_curriculo,
      ambientes: mentorData.ambientes,
    } : null

    const studentPayload = papel === 'aluno' ? {
      ...studentData,
      ano_formacao: studentData.ano_formacao ? parseInt(studentData.ano_formacao, 10) : null,
      crm: studentData.crm.trim() || null,
    } : null

    const { error } = await createProfile({
      papel,
      categoria: papel === 'mentor' ? 'medico' : (studentData.nivel === 'estudante' ? 'estudante' : 'medico'),
      nome: common.nome,
      cidade: common.cidade,
      mentorData: mentorPayload,
      studentData: studentPayload,
    })

    if (error) {
      setError('Erro ao criar perfil. Tente novamente.')
      setSubmitting(false)
    } else {
      navigate('/home', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0] px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 512 512">
              <path d="M272 464h-32a32 32 0 01-32-32l.05-85.82a4 4 0 00-6-3.47l-74.34 43.06a31.48 31.48 0 01-43-11.52l-16.5-28.64a31.65 31.65 0 0111.56-42.8l74.61-43.25a4 4 0 000-6.92l-74.54-43.21a31.41 31.41 0 01-11.55-43l16.44-28.55a31.48 31.48 0 0143.07-11.54l74.31 43a4 4 0 006-3.47L208 80a32 32 0 0132-32h32a32 32 0 0132 32v85.72a4 4 0 006 3.47l74.34-43.06a31.51 31.51 0 0143 11.52l16.49 28.73a31.52 31.52 0 01-11.64 42.86l-74.53 43.2a4 4 0 000 6.92l74.53 43.2a31.42 31.42 0 0111.56 43l-16.44 28.55a31.48 31.48 0 01-43.07 11.54l-74.31-43a4 4 0 00-6 3.46L304 432a32 32 0 01-32 32z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-[#1E3A8A]">Experenciei</span>
        </div>
        <button
          onClick={() => { signOut(); navigate('/') }}
          className="text-sm text-[#64748B] hover:text-[#1E3A8A]"
        >
          Sair
        </button>
      </header>

      <main className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-lg">
          <StepIndicator current={step} total={3} />

          {/* ── STEP 1: Role selection ── */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Como você vai usar o Experenciei?</h1>
              <p className="text-[#64748B] text-sm mb-8">Escolha seu papel para personalizarmos sua experiência.</p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  {
                    value: 'aluno',
                    icon: '🎓',
                    title: 'Quero Aprender',
                    desc: 'Sou estudante ou médico buscando mentoria prática com especialistas.',
                  },
                  {
                    value: 'mentor',
                    icon: '👨‍⚕️',
                    title: 'Quero Ensinar',
                    desc: 'Sou especialista e quero compartilhar meu conhecimento com a nova geração.',
                  },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPapel(opt.value)}
                    className={`text-left p-6 rounded-2xl border-2 transition-all ${
                      papel === opt.value
                        ? 'border-[#1E3A8A] bg-[#EFF6FF]'
                        : 'border-[#E2E8F0] bg-white hover:border-[#93C5FD]'
                    }`}
                  >
                    <div className="text-4xl mb-3">{opt.icon}</div>
                    <h3 className="font-bold text-[#1E293B] mb-1">{opt.title}</h3>
                    <p className="text-[#64748B] text-sm leading-relaxed">{opt.desc}</p>
                  </button>
                ))}
              </div>

              <button
                disabled={!papel}
                onClick={() => setStep(2)}
                className="w-full py-3.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          )}

          {/* ── STEP 2: Common data ── */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Seus dados básicos</h1>
              <p className="text-[#64748B] text-sm mb-8">Essas informações aparecem no seu perfil público.</p>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">Nome completo</label>
                  <input
                    type="text"
                    required
                    value={common.nome}
                    onChange={e => handleCommon('nome', e.target.value)}
                    placeholder="Dr. João Silva"
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">Cidade</label>
                  <input
                    type="text"
                    required
                    value={common.cidade}
                    onChange={e => handleCommon('cidade', e.target.value)}
                    placeholder="São Paulo, SP"
                    className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 border-2 border-[#E2E8F0] text-[#64748B] rounded-xl font-semibold text-sm hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-colors"
                >
                  Voltar
                </button>
                <button
                  disabled={!canAdvanceStep2()}
                  onClick={() => setStep(3)}
                  className="flex-[2] py-3.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Role-specific data ── */}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
                {papel === 'mentor' ? 'Seus dados profissionais' : 'Seu perfil de aprendizado'}
              </h1>
              <p className="text-[#64748B] text-sm mb-8">
                {papel === 'mentor'
                  ? 'Informações que ajudam os alunos a encontrar e confiar em você.'
                  : 'Conte-nos sobre sua formação e o que quer aprender.'}
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              {papel === 'mentor' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">CRM</label>
                    <input
                      type="text"
                      required
                      value={mentorData.crm}
                      onChange={e => handleMentor('crm', formatCRM(e.target.value))}
                      placeholder="123456-SP"
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">Especialidade principal</label>
                    <input
                      type="text"
                      required
                      value={mentorData.especialidade}
                      onChange={e => handleMentor('especialidade', e.target.value)}
                      placeholder="Cirurgia Cardiovascular"
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Subespecialidades <span className="text-[#94A3B8] font-normal">(Enter para adicionar)</span>
                    </label>
                    <TagInput
                      values={mentorData.subespecialidades}
                      onChange={v => handleMentor('subespecialidades', v)}
                      placeholder="Ex: Revascularização Miocárdica"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">Anos de experiência</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={60}
                      value={mentorData.anos_experiencia}
                      onChange={e => handleMentor('anos_experiencia', e.target.value)}
                      placeholder="18"
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Mini currículo <span className="text-[#94A3B8] font-normal">(até 500 caracteres)</span>
                    </label>
                    <textarea
                      required
                      maxLength={500}
                      rows={4}
                      value={mentorData.mini_curriculo}
                      onChange={e => handleMentor('mini_curriculo', e.target.value)}
                      placeholder="Descreva sua trajetória, formação e o que você oferece nas mentorias..."
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] text-sm resize-none"
                    />
                    <p className="text-xs text-[#94A3B8] mt-1 text-right">{mentorData.mini_curriculo.length}/500</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-2">Onde você atua</label>
                    <div className="grid grid-cols-2 gap-2">
                      {AMBIENTES_OPTIONS.map(amb => (
                        <label key={amb} className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                          mentorData.ambientes.includes(amb)
                            ? 'border-[#1E3A8A] bg-[#EFF6FF]'
                            : 'border-[#E2E8F0] hover:border-[#93C5FD]'
                        }`}>
                          <input
                            type="checkbox"
                            checked={mentorData.ambientes.includes(amb)}
                            onChange={() => toggleAmbiente(amb)}
                            className="accent-[#1E3A8A] w-4 h-4"
                          />
                          <span className="text-sm text-[#374151]">{amb}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">Nível de formação</label>
                    <div className="grid grid-cols-1 gap-2">
                      {NIVEL_OPTIONS.map(opt => (
                        <label key={opt.value} className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          studentData.nivel === opt.value
                            ? 'border-[#1E3A8A] bg-[#EFF6FF]'
                            : 'border-[#E2E8F0] hover:border-[#93C5FD]'
                        }`}>
                          <input
                            type="radio"
                            name="nivel"
                            value={opt.value}
                            checked={studentData.nivel === opt.value}
                            onChange={() => handleStudent('nivel', opt.value)}
                            className="accent-[#1E3A8A] w-4 h-4"
                          />
                          <span className="text-sm font-medium text-[#374151]">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {(studentData.nivel === 'residente' || studentData.nivel === 'especialista') && (
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-1.5">CRM</label>
                      <input
                        type="text"
                        required
                        value={studentData.crm}
                        onChange={e => handleStudent('crm', formatCRM(e.target.value))}
                        placeholder="123456-SP"
                        className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] text-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Especialidade / Área de interesse
                    </label>
                    <input
                      type="text"
                      value={studentData.especialidade}
                      onChange={e => handleStudent('especialidade', e.target.value)}
                      placeholder="Cirurgia Cardiovascular"
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] text-sm"
                    />
                  </div>

                  {(studentData.nivel === 'residente' || studentData.nivel === 'especialista') && (
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-1.5">Ano de formação</label>
                      <input
                        type="number"
                        min={1990}
                        max={new Date().getFullYear()}
                        value={studentData.ano_formacao}
                        onChange={e => handleStudent('ano_formacao', e.target.value)}
                        placeholder={String(new Date().getFullYear() - 2)}
                        className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] text-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Objetivos de aprendizado <span className="text-[#94A3B8] font-normal">(Enter para adicionar)</span>
                    </label>
                    <TagInput
                      values={studentData.objetivos}
                      onChange={v => handleStudent('objetivos', v)}
                      placeholder="Ex: Cirurgia Laparoscópica"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-3.5 border-2 border-[#E2E8F0] text-[#64748B] rounded-xl font-semibold text-sm hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={!canAdvanceStep3() || submitting}
                  className="flex-[2] py-3.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Criando perfil...' : 'Concluir cadastro'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
