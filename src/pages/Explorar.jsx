import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useUserLocation } from '../contexts/UserLocationContext';
import { haversineKm, formatDistance } from '../lib/geo';

const COMPLEXITY = {
  basico: {
    label: 'Básico',
    color: 'bg-blue-50 text-blue-600',
    strip: 'bg-blue-50 border-b border-blue-100 text-blue-600',
  },
  intermediario: {
    label: 'Intermediário',
    color: 'bg-yellow-50 text-yellow-700',
    strip: 'bg-yellow-50 border-b border-yellow-100 text-yellow-700',
  },
  avancado: {
    label: 'Avançado',
    color: 'bg-purple-50 text-purple-700',
    strip: 'bg-purple-50 border-b border-purple-100 text-purple-700',
  },
};

const BOOKING_STATUS = {
  pendente: { label: 'Ag. Aprovação', color: 'bg-blue-100 text-blue-700' },
  confirmado: { label: 'Confirmado', color: 'bg-green-100 text-green-700' },
  rejeitado: { label: 'Não aprovado', color: 'bg-red-100 text-red-700' },
  concluido: { label: 'Concluído', color: 'bg-gray-100 text-gray-600' },
  cancelado: { label: 'Cancelado', color: 'bg-gray-100 text-gray-400' },
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

function StarsDisplay({ value }) {
  const rounded = Math.round(value);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={`w-3.5 h-3.5 ${n <= rounded ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

const LogoSVG = () => (
  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 512 512">
    <path d="M272 464h-32a32 32 0 01-32-32l.05-85.82a4 4 0 00-6-3.47l-74.34 43.06a31.48 31.48 0 01-43-11.52l-16.5-28.64a31.65 31.65 0 0111.56-42.8l74.61-43.25a4 4 0 000-6.92l-74.54-43.21a31.41 31.41 0 01-11.55-43l16.44-28.55a31.48 31.48 0 0143.07-11.54l74.31 43a4 4 0 006-3.47L208 80a32 32 0 0132-32h32a32 32 0 0132 32v85.72a4 4 0 006 3.47l74.34-43.06a31.51 31.51 0 0143 11.52l16.49 28.73a31.52 31.52 0 01-11.64 42.86l-74.53 43.2a4 4 0 000 6.92l74.53 43.2a31.42 31.42 0 0111.56 43l-16.44 28.55a31.48 31.48 0 01-43.07 11.54l-74.31-43a4 4 0 00-6 3.46L304 432a32 32 0 01-32 32z" />
  </svg>
);

export default function Explorar() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();

  const isAluno = profile?.papel === 'aluno';
  const isMentor = profile?.papel === 'mentor';
  const userLoc = useUserLocation();

  const [offerings, setOfferings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpec, setFilterSpec] = useState('Todos');
  const [topMentores, setTopMentores] = useState([]);

  useEffect(() => {
    async function loadRanking() {
      const { data: reviews } = await supabase
        .from('avaliacoes')
        .select('avaliado_id, nota')
        .eq('direcao', 'aluno_para_mentor');
      if (!reviews || reviews.length === 0) return;

      const byMentor = reviews.reduce((acc, r) => {
        const cur = acc[r.avaliado_id] ?? { sum: 0, count: 0 };
        cur.sum += r.nota;
        cur.count += 1;
        acc[r.avaliado_id] = cur;
        return acc;
      }, {});

      const ranked = Object.entries(byMentor)
        .map(([mentorId, { sum, count }]) => ({
          mentorId,
          avg: sum / count,
          count,
        }))
        .sort((a, b) => b.avg - a.avg || b.count - a.count)
        .slice(0, 6);

      const ids = ranked.map((r) => r.mentorId);
      const [{ data: profilesData }, { data: mentorProfilesData }] =
        await Promise.all([
          supabase.from('profiles').select('id, nome, cidade').in('id', ids),
          supabase
            .from('mentor_profiles')
            .select('id, especialidade')
            .in('id', ids),
        ]);
      const profilesById = Object.fromEntries(
        (profilesData ?? []).map((p) => [p.id, p]),
      );
      const especialidadeById = Object.fromEntries(
        (mentorProfilesData ?? []).map((m) => [m.id, m.especialidade]),
      );

      setTopMentores(
        ranked
          .filter((r) => profilesById[r.mentorId])
          .map((r) => ({
            ...r,
            nome: profilesById[r.mentorId].nome,
            cidade: profilesById[r.mentorId].cidade,
            especialidade: especialidadeById[r.mentorId],
          })),
      );
    }
    loadRanking();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    async function loadOfferings() {
      setLoading(true);
      const { data } = await supabase
        .from('offerings')
        .select(
          '*, procedures(nome, especialidade, complexidade), profiles(nome)',
        )
        .eq('status', 'publicado')
        .gte('inicio', new Date().toISOString())
        .order('inicio');
      if (data) {
        setOfferings(data);
        setSpecialties([
          ...new Set(
            data.map((o) => o.procedures?.especialidade).filter(Boolean),
          ),
        ]);
      }
      setLoading(false);
    }
    loadOfferings();
  }, [authLoading]);

  useEffect(() => {
    if (!isAluno || !profile?.id) return;
    supabase
      .from('bookings')
      .select('offering_id, status')
      .eq('aluno_id', profile.id)
      .then(({ data }) => {
        if (data) setBookings(data);
      });
  }, [profile?.id, isAluno]);

  async function handleApply(offeringId, mentorId) {
    if (!isAluno || applying || profile?.status !== 'ativo') return;
    setApplying(offeringId);
    const { data, error } = await supabase
      .from('bookings')
      .upsert(
        {
          aluno_id: profile.id,
          mentor_id: mentorId,
          offering_id: offeringId,
          status: 'pendente',
        },
        { onConflict: 'aluno_id,offering_id' },
      )
      .select('offering_id, status')
      .single();
    if (!error && data)
      setBookings((prev) => {
        const existing = prev.findIndex((b) => b.offering_id === offeringId);
        return existing >= 0
          ? prev.map((b, i) => (i === existing ? data : b))
          : [...prev, data];
      });
    setApplying(null);
  }

  const filtered = offerings.filter((o) => {
    if (filterSpec !== 'Todos' && o.procedures?.especialidade !== filterSpec)
      return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.titulo?.toLowerCase().includes(q) ||
        o.procedures?.nome?.toLowerCase().includes(q) ||
        o.profiles?.nome?.toLowerCase().includes(q) ||
        o.procedures?.especialidade?.toLowerCase().includes(q) ||
        o.cidade?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const initials =
    profile?.nome
      ?.split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] flex items-center justify-center">
              <LogoSVG />
            </div>
            <span className="text-lg font-bold text-[#1E3A8A] hidden sm:block">
              Experenciei
            </span>
          </button>

          <div className="flex-1" />

          {!authLoading &&
            (user ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {initials}
                </div>
                <button
                  onClick={() => navigate('/home')}
                  className="hidden sm:block px-4 py-2 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Meu painel →
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/auth', { state: { login: true } })}
                  className="px-4 py-2 border-2 border-[#1E3A8A] text-[#1E3A8A] rounded-lg text-sm font-medium hover:bg-[#EFF6FF] transition-colors"
                >
                  Entrar
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  className="px-4 py-2 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Cadastrar
                </button>
              </div>
            ))}
        </div>
      </header>

      {/* Hero search */}
      <section className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] py-10 md:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2">
            Explorar Mentorias
          </h1>
          <p className="text-blue-200 text-sm mb-8">
            Vagas abertas com especialistas de todo o Brasil
          </p>
          <div className="bg-white rounded-2xl p-3 shadow-xl flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
              placeholder="Procedimento, especialidade, mentor ou cidade..."
              className="flex-1 px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-2.5 text-[#64748B] hover:text-[#1E293B] text-sm flex-shrink-0"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-16">
        {/* Specialty filter chips */}
        {specialties.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
            {['Todos', ...specialties].map((sp) => (
              <button
                key={sp}
                onClick={() => setFilterSpec(sp)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                  filterSpec === sp
                    ? 'bg-[#1E3A8A] text-white'
                    : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#1E3A8A] hover:text-[#1E3A8A]'
                }`}
              >
                {sp}
              </button>
            ))}
          </div>
        )}

        {topMentores.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-[#0F172A] mb-3">
              🏆 Mentores mais bem avaliados
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {topMentores.map((m) => {
                const mentorInitials = m.nome
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('');
                return (
                  <div
                    key={m.mentorId}
                    className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 flex-shrink-0 w-56"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {mentorInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1E293B] truncate">
                          {m.nome}
                        </p>
                        {m.especialidade && (
                          <p className="text-xs text-[#64748B] truncate">
                            {m.especialidade}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StarsDisplay value={m.avg} />
                      <span className="text-xs text-[#64748B]">
                        {m.avg.toFixed(1)} ({m.count})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && (
          <p className="text-sm text-[#64748B] mb-5">
            {filtered.length}{' '}
            {filtered.length === 1
              ? 'mentoria disponível'
              : 'mentorias disponíveis'}
            {filterSpec !== 'Todos' && ` em ${filterSpec}`}
            {searchQuery && ` para "${searchQuery}"`}
          </p>
        )}

        {/* Banner info para não logados / mentores */}
        {!authLoading && !isAluno && (
          <div
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 mb-6 text-sm ${
              !user
                ? 'bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E3A8A]'
                : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B]'
            }`}
          >
            <span className="text-lg flex-shrink-0">{!user ? 'ℹ️' : '👀'}</span>
            {!user ? (
              <span>
                <strong>Crie uma conta gratuita</strong> para se candidatar a
                qualquer mentoria.
              </span>
            ) : (
              <span>
                Você está navegando como <strong>mentor</strong>. Explore as
                mentorias disponíveis na plataforma.
              </span>
            )}
            {!user && (
              <button
                onClick={() => navigate('/auth')}
                className="ml-auto flex-shrink-0 px-3 py-1.5 bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Cadastrar
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-[#1E3A8A] border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-[#CBD5E1]">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-[#1E293B] mb-1">
              Nenhuma mentoria encontrada
            </p>
            <p className="text-sm text-[#64748B] mb-5">
              Tente outros termos ou remova os filtros.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterSpec('Todos');
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((o) => {
              const cx = COMPLEXITY[o.procedures?.complexidade];
              const existingBooking = bookings.find(
                (b) => b.offering_id === o.id,
              );
              const isApplying = applying === o.id;
              const mentorInitials = (o.profiles?.nome ?? 'M')
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('');

              let actionBtn;
              if (!user) {
                actionBtn = (
                  <button
                    onClick={() => navigate('/auth')}
                    className="w-full py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Cadastre-se para participar
                  </button>
                );
              } else if (isMentor) {
                actionBtn = (
                  <div className="w-full py-2.5 bg-[#F1F5F9] text-[#94A3B8] rounded-xl text-sm font-medium text-center select-none">
                    Somente alunos podem se candidatar
                  </div>
                );
              } else if (
                existingBooking &&
                existingBooking.status !== 'cancelado'
              ) {
                actionBtn = (
                  <div
                    className={`text-center py-2.5 rounded-xl text-sm font-medium ${BOOKING_STATUS[existingBooking.status]?.color ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    ✓{' '}
                    {BOOKING_STATUS[existingBooking.status]?.label ??
                      existingBooking.status}
                  </div>
                );
              } else if (isAluno && profile?.status !== 'ativo') {
                actionBtn = (
                  <div className="w-full py-2.5 bg-[#F1F5F9] text-[#94A3B8] rounded-xl text-sm font-medium text-center select-none">
                    {profile?.status === 'pendente' ? 'Cadastro pendente' : 'Cadastro não aprovado'}
                  </div>
                );
              } else {
                actionBtn = (
                  <button
                    onClick={() => handleApply(o.id, o.mentor_id)}
                    disabled={!!applying}
                    className="w-full py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {isApplying ? 'Candidatando...' : 'Candidatar-se'}
                  </button>
                );
              }

              return (
                <div
                  key={o.id}
                  className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  {o.procedures && (
                    <div
                      className={`px-4 py-2 text-xs font-semibold flex items-center justify-between ${cx?.strip ?? 'bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B]'}`}
                    >
                      <span>{o.procedures.especialidade}</span>
                      {cx && (
                        <span
                          className={`px-2 py-0.5 rounded-full ${cx.color}`}
                        >
                          {cx.label}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-[#1E293B] text-sm leading-tight mb-2">
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
                    <div className="text-xs text-[#64748B] space-y-0.5 mb-4 flex-1">
                      <p>
                        📅 {fmtDate(o.inicio)} · ⏰ {fmtTime(o.inicio)} –{' '}
                        {fmtTime(o.fim)}
                      </p>
                      <p className="flex items-center gap-1 flex-wrap">
                        <span>📍 {o.cidade}</span>
                        {userLoc.status === 'granted' && o.latitude != null && o.longitude != null && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] font-semibold text-xs">
                            📡 {formatDistance(haversineKm(userLoc.lat, userLoc.lng, o.latitude, o.longitude))}
                          </span>
                        )}
                      </p>
                      <p>
                        👥 {o.max_vagas} {o.max_vagas === 1 ? 'vaga' : 'vagas'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-[#1E3A8A]">
                        R$ {Number(o.preco).toLocaleString('pt-BR')}
                      </span>
                      <button
                        onClick={() => navigate(`/offering/${o.id}`)}
                        className="text-xs text-[#2563EB] hover:underline font-medium"
                      >
                        Ver detalhes →
                      </button>
                    </div>
                    {actionBtn}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
