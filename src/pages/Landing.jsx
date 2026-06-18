import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const Logo = ({ white }) => (
  <div className="flex items-center gap-2">
    <div
      className={`w-9 h-9 rounded-lg flex items-center justify-center ${white ? 'bg-white/20' : 'bg-[#1E3A8A]'}`}
    >
      <svg
        className="w-5 h-5 text-white"
        fill="currentColor"
        viewBox="0 0 512 512"
      >
        <path d="M272 464h-32a32 32 0 01-32-32l.05-85.82a4 4 0 00-6-3.47l-74.34 43.06a31.48 31.48 0 01-43-11.52l-16.5-28.64a31.65 31.65 0 0111.56-42.8l74.61-43.25a4 4 0 000-6.92l-74.54-43.21a31.41 31.41 0 01-11.55-43l16.44-28.55a31.48 31.48 0 0143.07-11.54l74.31 43a4 4 0 006-3.47L208 80a32 32 0 0132-32h32a32 32 0 0132 32v85.72a4 4 0 006 3.47l74.34-43.06a31.51 31.51 0 0143 11.52l16.49 28.73a31.52 31.52 0 01-11.64 42.86l-74.53 43.2a4 4 0 000 6.92l74.53 43.2a31.42 31.42 0 0111.56 43l-16.44 28.55a31.48 31.48 0 01-43.07 11.54l-74.31-43a4 4 0 00-6 3.46L304 432a32 32 0 01-32 32z" />
      </svg>
    </div>
    <span
      className={`text-xl font-bold ${white ? 'text-white' : 'text-[#1E3A8A]'}`}
    >
      Experenciei
    </span>
  </div>
);

const LAND_CX = {
  basico: {
    label: 'Básico',
    strip: 'bg-blue-50 text-blue-600 border-b border-blue-100',
    badge: 'bg-blue-100 text-blue-700',
  },
  intermediario: {
    label: 'Intermediário',
    strip: 'bg-yellow-50 text-yellow-700 border-b border-yellow-100',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  avancado: {
    label: 'Avançado',
    strip: 'bg-purple-50 text-purple-700 border-b border-purple-100',
    badge: 'bg-purple-100 text-purple-700',
  },
};

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const specialties = [
  { name: 'Cardiologia', count: 45, icon: '❤️' },
  { name: 'Neurologia', count: 38, icon: '🧠' },
  { name: 'Ortopedia', count: 52, icon: '🦴' },
  { name: 'Oncologia', count: 31, icon: '🔬' },
  { name: 'Pneumologia', count: 28, icon: '🫁' },
  { name: 'Oftalmologia', count: 41, icon: '👁️' },
  { name: 'Pediatria', count: 47, icon: '👶' },
  { name: 'Radiologia', count: 33, icon: '🩻' },
];

const testimonials = [
  {
    name: 'Dr. Carlos Silva',
    role: 'Cirurgião Cardiovascular',
    text: 'O Experenciei transformou minha forma de ensinar. Consigo compartilhar conhecimento prático de forma estruturada e alcançar estudantes de todo o Brasil.',
    avatar: 'CS',
  },
  {
    name: 'Dra. Marina Costa',
    role: 'Residente em Neurologia',
    text: 'Participar de mentorias com especialistas renomados foi um divisor de águas na minha formação. A experiência prática que adquiri é inestimável.',
    avatar: 'MC',
  },
  {
    name: 'Dr. Rafael Mendes',
    role: 'Cirurgião Ortopédico',
    text: 'Plataforma excepcional! A qualidade dos profissionais e a facilidade de agendamento tornaram o processo de mentoria muito mais acessível.',
    avatar: 'RM',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials =
    profile?.nome
      ?.split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';
  const firstName = profile?.nome?.split(' ')[0] || 'Você';

  const [upcomingOfferings, setUpcomingOfferings] = useState([]);

  function goExplorar() {
    navigate(profile?.papel === 'aluno' ? '/home' : '/explorar');
  }

  useEffect(() => {
    if (authLoading) return;
    supabase
      .from('offerings')
      .select(
        'id, titulo, inicio, fim, preco, cidade, local_descricao, max_vagas, mentor_id, procedures(nome, especialidade, complexidade), profiles(nome)',
      )
      .eq('status', 'publicado')
      .gte('inicio', new Date().toISOString())
      .order('inicio')
      .limit(6)
      .then(({ data }) => {
        if (data) setUpcomingOfferings(data);
      });
  }, [authLoading]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {[].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm font-medium text-[#374151] hover:text-[#1E3A8A] transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-[#374151]">
                    Olá, {firstName}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/home')}
                  className="px-5 py-2 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-lg text-sm font-medium shadow hover:opacity-90 transition-opacity"
                >
                  Acessar plataforma →
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/auth', { state: { login: true } })}
                  className="px-5 py-2 border-2 border-[#1E3A8A] text-[#1E3A8A] rounded-lg text-sm font-medium hover:bg-[#EFF6FF] transition-colors"
                >
                  Entrar
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  className="px-5 py-2 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-lg text-sm font-medium shadow hover:opacity-90 transition-opacity"
                >
                  Cadastrar
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="w-5 h-0.5 bg-gray-700 mb-1" />
            <div className="w-5 h-0.5 bg-gray-700 mb-1" />
            <div className="w-5 h-0.5 bg-gray-700" />
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-[#E2E8F0] px-4 py-4 space-y-3">
            {[].map((item) => (
              <a
                key={item}
                href="#"
                className="block text-sm font-medium text-[#374151] py-1"
              >
                {item}
              </a>
            ))}
            {user ? (
              <button
                onClick={() => navigate('/home')}
                className="w-full py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-lg text-sm font-medium"
              >
                Acessar plataforma →
              </button>
            ) : (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => navigate('/auth', { state: { login: true } })}
                  className="flex-1 py-2 border-2 border-[#1E3A8A] text-[#1E3A8A] rounded-lg text-sm font-medium"
                >
                  Entrar
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  className="flex-1 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm font-medium"
                >
                  Cadastrar
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#2563EB] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
                Primeira Plataforma no Brasil
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                Conecte-se com os{' '}
                <span className="text-[#93C5FD]">Melhores</span> Cirurgiões do
                Brasil
              </h1>
              <p className="text-blue-100 text-base sm:text-lg mb-8 leading-relaxed">
                Experiência cirúrgica real através de mentorias práticas com
                especialistas renomados. Aprenda, observe e evolua sua carreira
                médica.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/auth')}
                  className="px-7 py-3 bg-white text-[#1E3A8A] rounded-xl font-semibold shadow-lg hover:bg-blue-50 transition-colors"
                >
                  Começar Agora
                </button>
                <button
                  onClick={goExplorar}
                  className="px-7 py-3 border-2 border-white/40 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
                >
                  Explorar Mentorias
                </button>
              </div>
            </div>

            {/* Stats card */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 sm:p-8 w-full max-w-sm">
                {/* Mentor preview */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/20">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                    JS
                  </div>
                  <div>
                    <p className="font-semibold">Dr. João Santos</p>
                    <p className="text-blue-200 text-sm">
                      Cirurgião Cardiovascular
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg
                          key={s}
                          className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-xs text-blue-200 ml-1">5.0</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    ['500+', 'Médicos'],
                    ['1.200+', 'Mentorias'],
                    ['50+', 'Especialidades'],
                  ].map(([num, label]) => (
                    <div key={label}>
                      <p className="text-xl font-bold">{num}</p>
                      <p className="text-blue-200 text-xs mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-3">
              Como o Experenciei Funciona
            </h2>
            <p className="text-[#6B7280]">Processo simples em 3 passos</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                num: '01',
                title: 'Encontre seu Especialista',
                desc: 'Navegue por nossa rede de cirurgiões especialistas e encontre o mentor ideal para sua área de interesse médico.',
                icon: '🔍',
              },
              {
                num: '02',
                title: 'Agende sua Mentoria',
                desc: 'Escolha o melhor horário na agenda do especialista e confirme sua sessão de mentoria prática com facilidade.',
                icon: '📅',
              },
              {
                num: '03',
                title: 'Ganhe Experiência Real',
                desc: 'Participe de mentorias práticas, observe procedimentos e desenvolva habilidades essenciais para sua carreira.',
                icon: '🏆',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="bg-white rounded-2xl p-7 shadow-sm border border-[#E2E8F0] relative"
              >
                <span className="absolute top-5 right-5 text-5xl font-black text-[#DBEAFE] select-none">
                  {step.num}
                </span>
                <div className="text-3xl mb-4">{step.icon}</div>
                <h3 className="font-semibold text-[#0F172A] text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentorias Disponíveis */}
      {upcomingOfferings.length > 0 && (
        <section className="py-16 md:py-24 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-3">
                Mentorias Disponíveis
              </h2>
              <p className="text-[#6B7280]">
                Vagas abertas por especialistas — candidate-se e evolua sua
                carreira
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcomingOfferings.map((o) => {
                const cx = LAND_CX[o.procedures?.complexidade];
                const mentorInitials = (o.profiles?.nome ?? 'M')
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('');
                return (
                  <div
                    key={o.id}
                    className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                  >
                    {o.procedures && (
                      <div
                        className={`px-4 py-2 text-xs font-semibold flex items-center justify-between ${cx?.strip ?? 'bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0]'}`}
                      >
                        <span>{o.procedures.especialidade}</span>
                        {cx && (
                          <span
                            className={`px-2 py-0.5 rounded-full ${cx.badge}`}
                          >
                            {cx.label}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-[#1E293B] text-sm leading-tight mb-3">
                        {o.procedures?.nome ?? o.titulo}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {mentorInitials}
                        </div>
                        <p className="text-xs font-medium text-[#374151] truncate">
                          {o.profiles?.nome ?? 'Especialista'}
                        </p>
                      </div>
                      <div className="text-xs text-[#64748B] space-y-1 mb-4 flex-1">
                        <p>
                          📅 {fmtDate(o.inicio)} · ⏰ {fmtTime(o.inicio)}
                        </p>
                        <p>
                          📍 {o.cidade}
                          {o.local_descricao ? ` · ${o.local_descricao}` : ''}
                        </p>
                        <p>
                          👥 {o.max_vagas}{' '}
                          {o.max_vagas === 1 ? 'vaga' : 'vagas'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-bold text-[#1E3A8A]">
                          R$ {Number(o.preco).toLocaleString('pt-BR')}
                        </span>
                        <span className="text-xs text-[#94A3B8]">
                          por aluno
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          user ? goExplorar() : navigate('/auth')
                        }
                        className="w-full py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                      >
                        {user
                          ? 'Ver todas as mentorias →'
                          : 'Cadastre-se para participar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-10">
              <button
                onClick={goExplorar}
                className="px-7 py-3 border-2 border-[#1E3A8A] text-[#1E3A8A] rounded-xl font-semibold hover:bg-[#EFF6FF] transition-colors"
              >
                Ver todas as mentorias →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Specialties */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-3">
              Especialidades Disponíveis
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {specialties.map((sp) => (
              <button
                key={sp.name}
                onClick={goExplorar}
                className="bg-[#F8FAFC] hover:bg-[#DBEAFE] border border-[#E2E8F0] hover:border-[#93C5FD] rounded-xl p-5 text-center transition-all group"
              >
                <div className="text-3xl mb-3">{sp.icon}</div>
                <p className="font-semibold text-[#1E293B] text-sm group-hover:text-[#1E3A8A]">
                  {sp.name}
                </p>
                <p className="text-[#9CA3AF] text-xs mt-1">
                  {sp.count} especialistas
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-3">
              O Que Dizem Nossos Usuários
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg
                      key={s}
                      className="w-4 h-4 text-yellow-400 fill-yellow-400"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[#374151] text-sm leading-relaxed mb-5 italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1E293B] text-sm">
                      {t.name}
                    </p>
                    <p className="text-[#9CA3AF] text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Pronto para Transformar sua Carreira Médica?
          </h2>
          <p className="text-blue-100 mb-8">
            Junte-se a centenas de médicos que já estão evoluindo suas carreiras
            através de mentorias práticas.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-3.5 bg-white text-[#1E3A8A] rounded-xl font-semibold shadow-lg hover:bg-blue-50 transition-colors"
          >
            Criar Conta Gratuitamente
          </button>
          <p className="text-blue-200 text-sm mt-3">
            Sem cartão de crédito necessário
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <Logo white />
              <p className="text-[#94A3B8] text-sm mt-3 leading-relaxed">
                O primeiro marketplace de experiência cirúrgica do Brasil.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Links Rápidos</h4>
              {[].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="block text-[#94A3B8] text-sm hover:text-white mb-2"
                >
                  {l}
                </a>
              ))}
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Especialidades</h4>
              {['Cardiologia', 'Neurologia', 'Ortopedia', 'Ver Todas'].map(
                (l) => (
                  <a
                    key={l}
                    href="#"
                    className="block text-[#94A3B8] text-sm hover:text-white mb-2"
                  >
                    {l}
                  </a>
                ),
              )}
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Contato</h4>
              <p className="text-[#94A3B8] text-sm">
                contato@experenciei.com.br
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-[#64748B] text-sm">
            © 2024 Experenciei. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
