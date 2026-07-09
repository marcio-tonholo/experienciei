import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import DocumentsTab from '../components/DocumentsTab';
import NotificationsTab from '../components/NotificationsTab';
import LocationPicker from '../components/LocationPicker';

// ─── Static data (sessions + production — hardcoded until bookings land) ──────

const SESSIONS = [
  {
    id: 1,
    student: 'Maria Santos',
    nivel: 'Residente',
    procedure: 'Revascularização Miocárdica',
    date: '5 Jun 2025',
    duration: '5h20min',
    earned: 1500,
  },
  {
    id: 2,
    student: 'João Pereira',
    nivel: 'Especialista',
    procedure: 'Troca de Valva Aórtica',
    date: '28 Mai 2025',
    duration: '4h45min',
    earned: 1400,
  },
  {
    id: 3,
    student: 'Luisa Ferreira',
    nivel: 'Residente',
    procedure: 'Revascularização Miocárdica',
    date: '15 Mai 2025',
    duration: '5h10min',
    earned: 1500,
  },
  {
    id: 4,
    student: 'Carlos Mendes',
    nivel: 'Residente',
    procedure: 'Troca de Valva Aórtica',
    date: '2 Mai 2025',
    duration: '4h30min',
    earned: 1400,
  },
];

const REVIEWS = [
  {
    id: 1,
    student: 'Maria Santos',
    rating: 5,
    date: '7 Jun 2025',
    comment:
      'Experiência incrível! Extremamente didático e paciente. Aprendi técnicas que nunca havia visto na residência.',
  },
  {
    id: 2,
    student: 'João Pereira',
    rating: 5,
    date: '30 Mai 2025',
    comment:
      'Profissional excepcional. Conseguiu passar toda a complexidade do procedimento de forma clara e objetiva.',
  },
  {
    id: 3,
    student: 'Luisa Ferreira',
    rating: 4,
    date: '17 Mai 2025',
    comment:
      'Ótima experiência. O centro cirúrgico estava bem organizado e o mentor muito atencioso com os detalhes.',
  },
  {
    id: 4,
    student: 'Carlos Mendes',
    rating: 5,
    date: '4 Mai 2025',
    comment:
      'Recomendo muito! Uma das melhores experiências práticas que tive durante toda a minha formação.',
  },
];

const MONTHLY = [
  { month: 'Jan', value: 4200 },
  { month: 'Fev', value: 5600 },
  { month: 'Mar', value: 3900 },
  { month: 'Abr', value: 6800 },
  { month: 'Mai', value: 5800 },
  { month: 'Jun', value: 2900 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const OFFERING_STATUS = {
  publicado: { label: 'Publicado', color: 'bg-green-100 text-green-700' },
  rascunho: { label: 'Rascunho', color: 'bg-gray-100 text-gray-500' },
  encerrado: { label: 'Encerrado', color: 'bg-red-50 text-red-500' },
};

const BOOKING_STATUS = {
  pendente: { label: 'Ag. Aprovação', color: 'bg-blue-100 text-blue-700' },
  confirmado: { label: 'Confirmado', color: 'bg-green-100 text-green-700' },
  rejeitado: { label: 'Rejeitado', color: 'bg-red-100 text-red-700' },
  concluido: { label: 'Concluído', color: 'bg-gray-100 text-gray-600' },
  cancelado: { label: 'Cancelado', color: 'bg-gray-100 text-gray-400' },
};

const COMPLEXITY = {
  basico: { label: 'Básico', color: 'bg-blue-50 text-blue-600' },
  intermediario: {
    label: 'Intermediário',
    color: 'bg-yellow-50 text-yellow-700',
  },
  avancado: { label: 'Avançado', color: 'bg-purple-50 text-purple-700' },
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

const LogoSVG = () => (
  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 512 512">
    <path d="M272 464h-32a32 32 0 01-32-32l.05-85.82a4 4 0 00-6-3.47l-74.34 43.06a31.48 31.48 0 01-43-11.52l-16.5-28.64a31.65 31.65 0 0111.56-42.8l74.61-43.25a4 4 0 000-6.92l-74.54-43.21a31.41 31.41 0 01-11.55-43l16.44-28.55a31.48 31.48 0 0143.07-11.54l74.31 43a4 4 0 006-3.47L208 80a32 32 0 0132-32h32a32 32 0 0132 32v85.72a4 4 0 006 3.47l74.34-43.06a31.51 31.51 0 0143 11.52l16.49 28.73a31.52 31.52 0 01-11.64 42.86l-74.53 43.2a4 4 0 000 6.92l74.53 43.2a31.42 31.42 0 0111.56 43l-16.44 28.55a31.48 31.48 0 01-43.07 11.54l-74.31-43a4 4 0 00-6 3.46L304 432a32 32 0 01-32 32z" />
  </svg>
);

function StarIcon({ filled }) {
  return (
    <svg
      className={`w-4 h-4 ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function RatingStars({ value, onChange }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n === value ? null : n)}
          className="p-0.5"
        >
          <StarIcon filled={value != null && n <= value} />
        </button>
      ))}
    </div>
  );
}

function StudentAvatar({ name }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'agenda',        label: 'Agenda',        icon: '📅' },
  { id: 'sessoes',       label: 'Sessões',        icon: '🏥' },
  { id: 'financeiro',    label: 'Financeiro',    icon: '💰' },
  { id: 'notificacoes',  label: 'Notificações',   icon: '🔔' },
  { id: 'perfil',        label: 'Perfil',         icon: '👤' },
  { id: 'docs',          label: 'Documentos',     icon: '📄' },
];

// ─── EncerrarModal ───────────────────────────────────────────────────────────

function EncerrarModal({ offering, mentorId, onClose, onConfirm }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState({});
  const [ratings, setRatings] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('bookings')
      .select('id, aluno_id, aluno:profiles!aluno_id(nome, cidade)')
      .eq('offering_id', offering.id)
      .eq('status', 'confirmado')
      .order('created_at')
      .then(({ data }) => {
        if (data) {
          setBookings(data);
          setCompleted(Object.fromEntries(data.map((b) => [b.id, true])));
        }
        setLoading(false);
      });
  }, [offering.id]);

  function setRating(bookingId, field, value) {
    setRatings((prev) => ({
      ...prev,
      [bookingId]: { ...prev[bookingId], [field]: value },
    }));
  }

  async function handleConfirm() {
    setSaving(true);
    const toRate = Object.entries(ratings).filter(([, r]) => r?.nota);
    if (toRate.length > 0) {
      await supabase.from('avaliacoes').upsert(
        toRate.map(([bookingId, r]) => {
          const b = bookings.find((x) => x.id === bookingId);
          return {
            booking_id: bookingId,
            autor_id: mentorId,
            avaliado_id: b.aluno_id,
            direcao: 'mentor_para_aluno',
            nota: r.nota,
            comentario: r.comentario?.trim() || null,
          };
        }),
        { onConflict: 'booking_id,autor_id' },
      );
    }
    await onConfirm(offering.id, completed);
    setSaving(false);
  }

  const completedCount = Object.values(completed).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">
              Encerrar Mentoria
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5 truncate max-w-[280px]">
              {offering.titulo}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F1F5F9] flex items-center justify-center text-[#64748B] text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 flex-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 rounded-full border-4 border-[#1E3A8A] border-t-transparent animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-[#64748B] text-center py-6">
              Nenhum aluno confirmado nesta mentoria.
            </p>
          ) : (
            <>
              <p className="text-sm text-[#374151] mb-4">
                Confirme quais alunos concluíram a mentoria com sucesso:
              </p>
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <label className="flex items-center gap-3 p-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={completed[b.id] ?? true}
                        onChange={(e) =>
                          setCompleted((prev) => ({
                            ...prev,
                            [b.id]: e.target.checked,
                          }))
                        }
                        className="w-5 h-5 rounded accent-[#2563EB] flex-shrink-0"
                      />
                      <StudentAvatar name={b.aluno.nome} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#0F172A] truncate">
                          {b.aluno.nome}
                        </p>
                        {b.aluno.cidade && (
                          <p className="text-xs text-[#64748B]">
                            {b.aluno.cidade}
                          </p>
                        )}
                      </div>
                      <span
                        className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                          completed[b.id]
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {completed[b.id] ? 'Concluído' : 'Não concluído'}
                      </span>
                    </label>
                    {completed[b.id] && (
                      <div className="px-3 pb-3 flex items-center gap-2">
                        <RatingStars
                          value={ratings[b.id]?.nota}
                          onChange={(n) => setRating(b.id, 'nota', n)}
                        />
                        {ratings[b.id]?.nota && (
                          <input
                            type="text"
                            placeholder="Comentário (opcional)"
                            value={ratings[b.id]?.comentario ?? ''}
                            onChange={(e) =>
                              setRating(b.id, 'comentario', e.target.value)
                            }
                            className="flex-1 min-w-0 border border-[#E2E8F0] rounded-lg px-2.5 py-1 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-4 border-t border-[#E2E8F0] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#E2E8F0] text-[#64748B] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving || loading}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {saving
              ? 'Encerrando...'
              : bookings.length > 0
                ? `Encerrar (${completedCount}/${bookings.length} concluídos)`
                : 'Encerrar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CreateOfferingModal ──────────────────────────────────────────────────────

const EMPTY_FORM = {
  procedure_id: '',
  titulo: '',
  descricao: '',
  inicio: '',
  fim: '',
  max_vagas: 1,
  preco: '',
  cidade: '',
  latitude: null,
  longitude: null,
};

function CreateOfferingModal({ mentorId, onClose, onCreated }) {
  const [procedures, setProcedures] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('procedures')
      .select('*')
      .order('especialidade')
      .order('nome')
      .then(({ data }) => {
        if (data) setProcedures(data);
      });
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleProcedureChange(id) {
    set('procedure_id', id);
    if (id) {
      const p = procedures.find((x) => x.id === id);
      if (p)
        setForm((f) => ({
          ...f,
          procedure_id: id,
          titulo: f.titulo || p.nome,
        }));
    }
  }

  async function submit(status) {
    setError('');
    if (!form.titulo.trim()) return setError('Informe um título.');
    if (!form.inicio) return setError('Informe data/hora de início.');
    if (!form.fim) return setError('Informe data/hora de fim.');
    if (new Date(form.inicio) >= new Date(form.fim))
      return setError('O fim deve ser após o início.');
    if (form.preco === '' || Number(form.preco) < 0)
      return setError('Informe o valor.');
    if (form.latitude == null || form.longitude == null)
      return setError('Defina a localização no mapa.');

    setSaving(true);
    const { error: err } = await supabase.from('offerings').insert({
      mentor_id: mentorId,
      procedure_id: form.procedure_id || null,
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim() || null,
      max_vagas: Number(form.max_vagas),
      preco: Number(form.preco),
      inicio: new Date(form.inicio).toISOString(),
      fim: new Date(form.fim).toISOString(),
      cidade: form.cidade.trim() || 'Brasil',
      latitude: form.latitude,
      longitude: form.longitude,
      status,
    });
    setSaving(false);

    if (err) return setError(err.message);
    onCreated();
  }

  const grouped = procedures.reduce((acc, p) => {
    (acc[p.especialidade] ??= []).push(p);
    return acc;
  }, {});

  const input =
    'w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-bold text-[#0F172A]">Nova Mentoria</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F1F5F9] flex items-center justify-center text-[#64748B] text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 space-y-4 flex-1">
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1.5">
              Procedimento
            </label>
            <select
              value={form.procedure_id}
              onChange={(e) => handleProcedureChange(e.target.value)}
              className={input}
            >
              <option value="">Selecione ou deixe em branco</option>
              {Object.entries(grouped).map(([esp, procs]) => (
                <optgroup key={esp} label={esp}>
                  {procs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1.5">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => set('titulo', e.target.value)}
              placeholder="Ex: Revascularização Miocárdica — Hospital das Clínicas SP"
              className={input}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1.5">
              Descrição
            </label>
            <textarea
              value={form.descricao}
              onChange={(e) => set('descricao', e.target.value)}
              placeholder="Pré-requisitos, o que o aluno vai aprender, equipamentos disponíveis..."
              rows={3}
              className={`${input} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#374151] block mb-1.5">
                Início <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.inicio}
                onChange={(e) => set('inicio', e.target.value)}
                className={input}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#374151] block mb-1.5">
                Fim <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.fim}
                min={form.inicio}
                onChange={(e) => set('fim', e.target.value)}
                className={input}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#374151] block mb-1.5">
                Vagas
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={form.max_vagas}
                onChange={(e) => set('max_vagas', e.target.value)}
                className={input}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#374151] block mb-1.5">
                Valor (R$) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                step={50}
                value={form.preco}
                onChange={(e) => set('preco', e.target.value)}
                placeholder="1500"
                className={input}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1.5">
              Localização <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-[#64748B] mb-2">
              Apenas a área aproximada (raio de 500 m) será exibida aos alunos. A cidade é detectada automaticamente.
            </p>
            <LocationPicker
              lat={form.latitude}
              lng={form.longitude}
              onChange={(lat, lng) => setForm(f => ({ ...f, latitude: lat, longitude: lng }))}
              onCityResolved={(cidade) => setForm(f => ({ ...f, cidade }))}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              {error}
            </p>
          )}
        </div>

        <div className="px-5 py-4 border-t border-[#E2E8F0] flex gap-3">
          <button
            onClick={() => submit('rascunho')}
            disabled={saving}
            className="flex-1 py-2.5 border border-[#E2E8F0] text-[#374151] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] disabled:opacity-50 transition-colors"
          >
            Salvar rascunho
          </button>
          <button
            onClick={() => submit('publicado')}
            disabled={saving}
            className="flex-[2] py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? 'Publicando...' : '🚀 Publicar Mentoria'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EditOfferingModal ────────────────────────────────────────────────────────

function toDatetimeLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d - off).toISOString().slice(0, 16);
}

function EditOfferingModal({ offering, onClose, onSaved }) {
  const [procedures, setProcedures] = useState([]);
  const [form, setForm] = useState({
    procedure_id: offering.procedure_id || '',
    titulo:       offering.titulo || '',
    descricao:    offering.descricao || '',
    inicio:       toDatetimeLocal(offering.inicio),
    fim:          toDatetimeLocal(offering.fim),
    max_vagas:    offering.max_vagas ?? 1,
    preco:        offering.preco ?? '',
    cidade:       offering.cidade || '',
    latitude:     offering.latitude ?? null,
    longitude:    offering.longitude ?? null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('procedures').select('*').order('especialidade').order('nome')
      .then(({ data }) => { if (data) setProcedures(data); });
  }, []);

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function submit() {
    setError('');
    if (!form.titulo.trim()) return setError('Informe um título.');
    if (!form.inicio)        return setError('Informe data/hora de início.');
    if (!form.fim)           return setError('Informe data/hora de fim.');
    if (new Date(form.inicio) >= new Date(form.fim)) return setError('O fim deve ser após o início.');
    if (form.preco === '' || Number(form.preco) < 0) return setError('Informe o valor.');
    if (form.latitude == null || form.longitude == null) return setError('Defina a localização no mapa.');

    setSaving(true);
    const { error: err } = await supabase.from('offerings').update({
      procedure_id: form.procedure_id || null,
      titulo:       form.titulo.trim(),
      descricao:    form.descricao.trim() || null,
      max_vagas:    Number(form.max_vagas),
      preco:        Number(form.preco),
      inicio:       new Date(form.inicio).toISOString(),
      fim:          new Date(form.fim).toISOString(),
      cidade:       form.cidade.trim() || 'Brasil',
      latitude:     form.latitude,
      longitude:    form.longitude,
    }).eq('id', offering.id);
    setSaving(false);
    if (err) return setError(err.message);
    onSaved();
  }

  const grouped = procedures.reduce((acc, p) => {
    (acc[p.especialidade] ??= []).push(p);
    return acc;
  }, {});

  const input = 'w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-bold text-[#0F172A]">Editar Mentoria</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-[#F1F5F9] flex items-center justify-center text-[#64748B] text-lg leading-none">✕</button>
        </div>

        <div className="overflow-y-auto px-5 py-5 space-y-4 flex-1">
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1.5">Procedimento</label>
            <select value={form.procedure_id} onChange={(e) => set('procedure_id', e.target.value)} className={input}>
              <option value="">Selecione ou deixe em branco</option>
              {Object.entries(grouped).map(([esp, procs]) => (
                <optgroup key={esp} label={esp}>
                  {procs.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1.5">Título <span className="text-red-500">*</span></label>
            <input type="text" value={form.titulo} onChange={(e) => set('titulo', e.target.value)} className={input} />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1.5">Descrição</label>
            <textarea value={form.descricao} onChange={(e) => set('descricao', e.target.value)} rows={3} className={`${input} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#374151] block mb-1.5">Início <span className="text-red-500">*</span></label>
              <input type="datetime-local" value={form.inicio} onChange={(e) => set('inicio', e.target.value)} className={input} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#374151] block mb-1.5">Fim <span className="text-red-500">*</span></label>
              <input type="datetime-local" value={form.fim} min={form.inicio} onChange={(e) => set('fim', e.target.value)} className={input} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#374151] block mb-1.5">Vagas</label>
              <input type="number" min={1} max={20} value={form.max_vagas} onChange={(e) => set('max_vagas', e.target.value)} className={input} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#374151] block mb-1.5">Valor (R$) <span className="text-red-500">*</span></label>
              <input type="number" min={0} step={50} value={form.preco} onChange={(e) => set('preco', e.target.value)} className={input} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1.5">
              Localização <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-[#64748B] mb-2">
              Apenas a área aproximada (raio de 500 m) será exibida aos alunos. A cidade é detectada automaticamente.
            </p>
            <LocationPicker
              lat={form.latitude}
              lng={form.longitude}
              onChange={(lat, lng) => setForm(f => ({ ...f, latitude: lat, longitude: lng }))}
              onCityResolved={(cidade) => setForm(f => ({ ...f, cidade }))}
            />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">{error}</p>}
        </div>

        <div className="px-5 py-4 border-t border-[#E2E8F0] flex gap-3">
          <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 border border-[#E2E8F0] text-[#374151] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={submit} disabled={saving} className="flex-[2] py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50">
            {saving ? 'Salvando…' : '💾 Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EditMentorProfileModal ───────────────────────────────────────────────────

function EditMentorProfileModal({ profileId, initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    nome: initial.nome || '',
    cidade: initial.cidade || '',
    especialidade: initial.especialidade || '',
    crm: initial.crm || '',
    uf: initial.uf || '',
    anos_experiencia: initial.anos_experiencia || '',
    mini_curriculo: initial.mini_curriculo || '',
    subespecialidades: initial.subespecialidades || [],
    ambientes: initial.ambientes || [],
  });
  const [subInput, setSubInput] = useState('');
  const [ambInput, setAmbInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addTag(field, raw, clear) {
    const v = raw.trim();
    if (!v || form[field].includes(v)) {
      clear('');
      return;
    }
    set(field, [...form[field], v]);
    clear('');
  }

  function removeTag(field, i) {
    set(
      field,
      form[field].filter((_, idx) => idx !== i),
    );
  }

  async function handleSave() {
    setError('');
    if (!form.nome.trim()) return setError('Nome é obrigatório.');
    if (!form.especialidade.trim())
      return setError('Especialidade é obrigatória.');
    if (!form.crm.trim()) return setError('CRM é obrigatório.');
    if (!form.uf.trim()) return setError('UF é obrigatória.');

    setSaving(true);
    const [r1, r2] = await Promise.all([
      supabase
        .from('profiles')
        .update({ nome: form.nome.trim(), cidade: form.cidade.trim() })
        .eq('id', profileId),
      supabase
        .from('mentor_profiles')
        .update({
          especialidade: form.especialidade.trim(),
          crm: form.crm.trim(),
          uf: form.uf.trim().toUpperCase(),
          anos_experiencia:
            form.anos_experiencia !== '' ? Number(form.anos_experiencia) : null,
          mini_curriculo: form.mini_curriculo.trim() || null,
          subespecialidades: form.subespecialidades,
          ambientes: form.ambientes,
        })
        .eq('id', profileId),
    ]);
    setSaving(false);
    if (r1.error) return setError(r1.error.message);
    if (r2.error) return setError(r2.error.message);
    onSaved(form);
  }

  const inp =
    'w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]';

  function TagRow({ field, value, inputVal, setInput }) {
    return (
      <div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {form[field].map((v, i) => (
            <span
              key={i}
              className="flex items-center gap-1 text-xs bg-[#EFF6FF] text-[#1E3A8A] px-2.5 py-1 rounded-full"
            >
              {v}
              <button
                type="button"
                onClick={() => removeTag(field, i)}
                className="text-[#93C5FD] hover:text-[#1E3A8A] leading-none text-base"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addTag(field, inputVal, setInput);
            }
            if (e.key === 'Backspace' && !inputVal && form[field].length)
              removeTag(field, form[field].length - 1);
          }}
          placeholder="Digite e pressione Enter"
          className={inp}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-bold text-[#0F172A]">Editar Perfil</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F1F5F9] flex items-center justify-center text-[#64748B] text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 space-y-4 flex-1">
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1.5">
              Nome completo
            </label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => set('nome', e.target.value)}
              className={inp}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1.5">
              Cidade
            </label>
            <input
              type="text"
              value={form.cidade}
              onChange={(e) => set('cidade', e.target.value)}
              placeholder="São Paulo, SP"
              className={inp}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1.5">
              Especialidade <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.especialidade}
              onChange={(e) => set('especialidade', e.target.value)}
              className={inp}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#374151] block mb-1.5">
                CRM <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.crm}
                onChange={(e) => set('crm', e.target.value)}
                className={inp}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#374151] block mb-1.5">
                UF <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={2}
                value={form.uf}
                onChange={(e) => set('uf', e.target.value.toUpperCase())}
                placeholder="SP"
                className={inp}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1.5">
              Anos de experiência
            </label>
            <input
              type="number"
              min={0}
              max={60}
              value={form.anos_experiencia}
              onChange={(e) => set('anos_experiencia', e.target.value)}
              className={inp}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1.5">
              Subespecialidades
            </label>
            <TagRow
              field="subespecialidades"
              inputVal={subInput}
              setInput={setSubInput}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1.5">
              Ambientes
            </label>
            <TagRow
              field="ambientes"
              inputVal={ambInput}
              setInput={setAmbInput}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1.5">
              Mini currículo
            </label>
            <textarea
              value={form.mini_curriculo}
              onChange={(e) => set('mini_curriculo', e.target.value)}
              rows={4}
              placeholder="Descreva sua trajetória e experiência..."
              className={`${inp} resize-none`}
            />
          </div>
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              {error}
            </p>
          )}
        </div>

        <div className="px-5 py-4 border-t border-[#E2E8F0] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#E2E8F0] text-[#374151] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MentorHome() {
  const navigate = useNavigate();
  const { profile, signOut, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('agenda');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(null); // offering object being edited
  const [offerings, setOfferings] = useState([]);
  const [loadingOfferings, setLoadingOfferings] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [bookingsByOffering, setBookingsByOffering] = useState({});
  const [mentorProfile, setMentorProfile] = useState(null);
  const [encerrarModal, setEncerrarModal] = useState(null);
  const [modalSession, setModalSession] = useState(null);
  const [sessionParticipants, setSessionParticipants] = useState([]);
  const [sessionReviews, setSessionReviews] = useState({});
  const [ratingDraftFor, setRatingDraftFor] = useState(null);
  const [ratingDraft, setRatingDraft] = useState({ nota: null, comentario: '' });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileOverride, setProfileOverride] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [financeRows, setFinanceRows] = useState([]);
  const [loadingFinance, setLoadingFinance] = useState(true);

  const displayNome = profileOverride.nome ?? profile?.nome ?? '';
  const displayCidade = profileOverride.cidade ?? profile?.cidade ?? '';
  const initials =
    displayNome
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'DR';
  const displayName = displayNome.split(' ')[0] || 'Doutor(a)';
  const maxEarning = Math.max(...MONTHLY.map((m) => m.value));
  const totalEarned = SESSIONS.reduce((s, x) => s + x.earned, 0);
  const avgRating = (
    REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length
  ).toFixed(1);

  const activeOfferings = offerings
    .filter((o) => o.status !== 'encerrado')
    .sort((a, b) => new Date(a.inicio) - new Date(b.inicio));

  const pastOfferings = offerings
    .filter((o) => o.status === 'encerrado')
    .sort((a, b) => new Date(b.fim) - new Date(a.fim));

  const alunosPagos = financeRows.filter((b) => b.payment?.status === 'pago');
  const totalRecebido = alunosPagos.reduce((s, b) => s + Number(b.payment.valor_bruto), 0);
  const totalRepassado = alunosPagos
    .filter((b) => b.payment.repasse_status === 'repassado')
    .reduce((s, b) => s + Number(b.payment.valor_bruto), 0);
  const totalARepassar = totalRecebido - totalRepassado;

  async function loadOfferings() {
    if (!profile?.id) return;
    setLoadingOfferings(true);
    const { data } = await supabase
      .from('offerings')
      .select('*, procedures(nome, especialidade, complexidade)')
      .eq('mentor_id', profile.id)
      .order('inicio', { ascending: true });
    if (data) setOfferings(data);
    setLoadingOfferings(false);
  }

  async function loadFinance() {
    if (!profile?.id) return;
    setLoadingFinance(true);
    const { data } = await supabase
      .from('bookings')
      .select(
        'id, status, aluno:profiles!aluno_id(nome), offerings(titulo, preco)',
      )
      .eq('mentor_id', profile.id)
      .in('status', ['confirmado', 'concluido'])
      .order('created_at', { ascending: false });

    if (data) {
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('booking_id, status, valor_bruto, repasse_status')
        .eq('mentor_id', profile.id);
      const paymentsMap = Object.fromEntries(
        (paymentsData ?? []).map((p) => [p.booking_id, p]),
      );
      setFinanceRows(
        data.map((b) => ({ ...b, payment: paymentsMap[b.id] ?? null })),
      );
    }
    setLoadingFinance(false);
  }

  useEffect(() => {
    loadOfferings();
    loadFinance();
    if (profile?.id) {
      supabase.from('mentor_profiles').select('*').eq('id', profile.id).maybeSingle()
        .then(({ data }) => { if (data) setMentorProfile(data); });
      supabase.from('notifications').select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id).eq('lida', false)
        .then(({ count }) => setUnreadCount(count || 0));
    }
  }, [profile?.id]);

  useEffect(() => {
    if (activeTab === 'notificacoes') setUnreadCount(0);
  }, [activeTab]);

  async function handleStatusChange(id, status) {
    const { error } = await supabase
      .from('offerings')
      .update({ status })
      .eq('id', id);
    if (!error) {
      setOfferings((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o)),
      );
    }
  }

  async function loadBookingsForOffering(offeringId) {
    const { data } = await supabase
      .from('bookings')
      .select('id, status, created_at, aluno:profiles!aluno_id(nome, cidade)')
      .eq('offering_id', offeringId)
      .order('created_at');
    if (!data) return;

    const { data: paymentsData } = await supabase
      .from('payments')
      .select('booking_id, status, metodo_pagamento')
      .in('booking_id', data.map(b => b.id));

    const paymentsMap = Object.fromEntries(
      (paymentsData ?? []).map(p => [p.booking_id, p])
    );

    setBookingsByOffering((prev) => ({
      ...prev,
      [offeringId]: data.map(b => ({ ...b, payment: paymentsMap[b.id] ?? null })),
    }));
  }

  async function handleBookingStatus(bookingId, status, offeringId) {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);
    if (!error) {
      setBookingsByOffering((prev) => ({
        ...prev,
        [offeringId]: (prev[offeringId] ?? []).map((b) =>
          b.id === bookingId ? { ...b, status } : b,
        ),
      }));
    }
  }

  async function confirmEncerrar(offeringId, completed) {
    const toComplete = Object.entries(completed)
      .filter(([, v]) => v)
      .map(([id]) => id);
    if (toComplete.length > 0) {
      await supabase
        .from('bookings')
        .update({ status: 'concluido' })
        .in('id', toComplete);
      setBookingsByOffering((prev) => {
        const updated = (prev[offeringId] ?? []).map((b) =>
          completed[b.id] ? { ...b, status: 'concluido' } : b,
        );
        return { ...prev, [offeringId]: updated };
      });
    }
    await handleStatusChange(offeringId, 'encerrado');
    setEncerrarModal(null);
  }

  async function handleRequestReview() {
    await supabase.from('profiles').update({ status: 'pendente' }).eq('id', profile.id)
    await refreshProfile()
  }

  async function handleSessionClick(offering) {
    const { data } = await supabase
      .from('bookings')
      .select('id, aluno_id, status, aluno:profiles!aluno_id(nome, cidade)')
      .eq('offering_id', offering.id)
      .in('status', ['confirmado', 'concluido'])
      .order('created_at');
    if (data) {
      setSessionParticipants(data);
      setModalSession(offering);
      const { data: reviews } = await supabase
        .from('avaliacoes')
        .select('booking_id, nota, comentario')
        .eq('autor_id', profile.id)
        .eq('direcao', 'mentor_para_aluno')
        .in(
          'booking_id',
          data.map((b) => b.id),
        );
      setSessionReviews(
        Object.fromEntries((reviews ?? []).map((r) => [r.booking_id, r])),
      );
    }
  }

  async function saveSessionReview(bookingId, alunoId, nota, comentario) {
    const { data } = await supabase
      .from('avaliacoes')
      .upsert(
        {
          booking_id: bookingId,
          autor_id: profile.id,
          avaliado_id: alunoId,
          direcao: 'mentor_para_aluno',
          nota,
          comentario: comentario?.trim() || null,
        },
        { onConflict: 'booking_id,autor_id' },
      )
      .select('booking_id, nota, comentario')
      .single();
    if (data) {
      setSessionReviews((prev) => ({ ...prev, [bookingId]: data }));
      setRatingDraftFor(null);
    }
  }

  // ─── Status guard — bloqueia mentores não aprovados ────────────────────────
  if (profile?.status !== 'ativo') {
    const isPendente  = profile?.status === 'pendente'
    const isRejeitado = profile?.status === 'rejeitado'

    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <header className="bg-white border-b border-[#E2E8F0]">
          <div className="max-w-xl mx-auto px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] flex items-center justify-center">
                <LogoSVG />
              </div>
              <span className="font-bold text-[#1E3A8A]">Experenciei</span>
            </div>
            <button onClick={signOut} className="text-sm text-[#64748B] hover:text-[#1E293B] font-medium">
              Sair
            </button>
          </div>
        </header>

        <div className="max-w-xl mx-auto px-4 py-8 space-y-4">
          <div className={`rounded-2xl border p-5 ${
            isPendente  ? 'bg-amber-50 border-amber-200' :
            isRejeitado ? 'bg-red-50 border-red-200' :
                          'bg-gray-50 border-gray-200'
          }`}>
            <p className={`text-lg font-bold mb-1 ${isPendente ? 'text-amber-700' : isRejeitado ? 'text-red-700' : 'text-gray-600'}`}>
              {isPendente  ? '⏳ Cadastro em análise' :
               isRejeitado ? '❌ Cadastro rejeitado'  :
                              'Conta inativa'}
            </p>
            <p className={`text-sm ${isPendente ? 'text-amber-700' : isRejeitado ? 'text-red-700' : 'text-gray-500'}`}>
              {isPendente
                ? 'Nosso time está revisando sua documentação. Enquanto aguarda, envie seus documentos abaixo para agilizar o processo.'
                : isRejeitado
                ? 'Seu cadastro não foi aprovado. Veja o motivo abaixo, corrija a documentação e solicite uma nova análise.'
                : 'Sua conta foi desativada. Entre em contato com o suporte para mais informações.'}
            </p>

            {isRejeitado && profile?.motivo_rejeicao && (
              <div className="mt-3 bg-white rounded-xl border border-red-200 px-3 py-2.5">
                <p className="text-xs font-semibold text-red-600 mb-1">Motivo:</p>
                <p className="text-sm text-[#1E293B]">{profile.motivo_rejeicao}</p>
              </div>
            )}

            {isRejeitado && (
              <button
                onClick={handleRequestReview}
                className="mt-4 w-full py-2.5 rounded-xl bg-[#1E3A8A] text-white text-sm font-medium hover:bg-[#1e40af]"
              >
                Solicitar nova análise
              </button>
            )}
          </div>

          {(isPendente || isRejeitado) && (
            <div>
              <p className="text-sm font-semibold text-[#1E293B] mb-2 px-1">Seus documentos</p>
              <DocumentsTab profileId={profile.id} />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
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

          <nav className="hidden md:flex items-center gap-1 flex-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() =>
                  t.external ? navigate('/explorar') : setActiveTab(t.id)
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  !t.external && activeTab === t.id
                    ? 'bg-[#EFF6FF] text-[#1E3A8A]'
                    : 'text-[#64748B] hover:text-[#1E3A8A] hover:bg-[#F8FAFC]'
                }`}
              >
                {t.icon} {t.label}
                {t.id === 'notificacoes' && unreadCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="relative ml-auto">
            <button
              onClick={() => setProfileMenuOpen((o) => !o)}
              className="flex items-center gap-2"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white text-sm font-bold">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-[#1E293B] leading-none">
                  {displayName}
                </p>
                <p className="text-xs text-[#94A3B8]">Mentor</p>
              </div>
            </button>
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-[#E2E8F0] rounded-xl shadow-lg py-1 z-50">
                <button
                  onClick={() => {
                    setActiveTab('perfil');
                    setProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F8FAFC]"
                >
                  Meu Perfil
                </button>
                <button
                  onClick={() => {
                    setActiveTab('docs');
                    setProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F8FAFC]"
                >
                  Documentação
                </button>
                <hr className="my-1 border-[#F1F5F9]" />
                <button
                  onClick={signOut}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
        {/* ── AGENDA / OFFERINGS ── */}
        {activeTab === 'agenda' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#0F172A]">
                  Minhas Mentorias
                </h2>
                <p className="text-sm text-[#64748B]">
                  {
                    activeOfferings.filter((o) => o.status === 'publicado')
                      .length
                  }{' '}
                  publicadas
                </p>
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
              >
                <span className="text-lg leading-none">+</span>
                Nova Mentoria
              </button>
            </div>

            {loadingOfferings ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 rounded-full border-4 border-[#1E3A8A] border-t-transparent animate-spin" />
              </div>
            ) : activeOfferings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#CBD5E1]">
                <p className="text-4xl mb-3">🏥</p>
                <p className="font-semibold text-[#1E293B] mb-1">
                  Nenhuma mentoria ativa
                </p>
                <p className="text-sm text-[#64748B] mb-5">
                  Publique sua primeira mentoria para começar a receber alunos.
                </p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Criar Mentoria
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOfferings.map((o) => {
                  const st =
                    OFFERING_STATUS[o.status] ?? OFFERING_STATUS.publicado;
                  const cx = o.procedures
                    ? COMPLEXITY[o.procedures.complexidade]
                    : null;
                  return (
                    <div
                      key={o.id}
                      className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-semibold text-[#1E293B] text-sm">
                              {o.titulo}
                            </p>
                            {cx && (
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${cx.color}`}
                              >
                                {cx.label}
                              </span>
                            )}
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.color}`}
                            >
                              {st.label}
                            </span>
                          </div>
                          {o.procedures && o.procedures.nome !== o.titulo && (
                            <p className="text-xs text-[#64748B]">
                              {o.procedures.especialidade} · {o.procedures.nome}
                            </p>
                          )}
                          {o.descricao && (
                            <p className="text-sm text-[#374151] mt-1 line-clamp-2">
                              {o.descricao}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-[#1E3A8A]">
                            R$ {Number(o.preco).toLocaleString('pt-BR')}
                          </p>
                          <p className="text-xs text-[#64748B]">por aluno</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#64748B] mb-3">
                        <span>📅 {fmtDate(o.inicio)}</span>
                        <span>
                          ⏰ {fmtTime(o.inicio)} – {fmtTime(o.fim)}
                        </span>
                        <span>
                          📍 {o.cidade}
                          {o.local_descricao ? ` · ${o.local_descricao}` : ''}
                        </span>
                        <span>
                          👥 {o.max_vagas}{' '}
                          {o.max_vagas === 1 ? 'vaga' : 'vagas'}
                        </span>
                      </div>

                      {o.status !== 'encerrado' && (
                        <div className="flex gap-2 pt-1">
                          {o.status === 'rascunho' && (
                            <button
                              onClick={() =>
                                handleStatusChange(o.id, 'publicado')
                              }
                              className="flex-1 py-2 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                            >
                              🚀 Publicar
                            </button>
                          )}
                          {o.status === 'rascunho' && (
                            <button
                              onClick={() => setShowEdit(o)}
                              className="flex-1 py-2 border border-[#E2E8F0] text-[#64748B] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
                            >
                              ✏️ Editar
                            </button>
                          )}
                          {o.status === 'publicado' && (
                            <>
                              <button
                                onClick={() => setShowEdit(o)}
                                className="py-2 px-3 border border-[#E2E8F0] text-[#64748B] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => navigate(`/offering/${o.id}`)}
                                className="flex-1 py-2 border border-blue-200 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors"
                              >
                                💬 Ver Chat
                              </button>
                              <button
                                onClick={() => setEncerrarModal(o)}
                                className="py-2 px-4 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
                              >
                                Encerrar
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* Candidaturas */}
                      {(() => {
                        const isExpanded = expandedId === o.id;
                        const ofBkgs = bookingsByOffering[o.id] ?? [];
                        const pendingCount = ofBkgs.filter(
                          (b) => b.status === 'pendente',
                        ).length;
                        return (
                          <div className="mt-3 pt-3 border-t border-[#F1F5F9]">
                            <button
                              onClick={() => {
                                const next = isExpanded ? null : o.id;
                                setExpandedId(next);
                                if (next) loadBookingsForOffering(next);
                              }}
                              className="w-full flex items-center justify-between text-sm text-[#64748B] hover:text-[#1E3A8A] py-0.5 transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                Candidaturas
                                {pendingCount > 0 && (
                                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {pendingCount} pendentes
                                  </span>
                                )}
                              </span>
                              <span className="text-xs">
                                {isExpanded ? '▲' : '▼'}
                              </span>
                            </button>

                            {isExpanded && (
                              <div className="mt-3 space-y-2">
                                {ofBkgs.length === 0 ? (
                                  <p className="text-sm text-[#94A3B8] text-center py-3">
                                    Nenhuma candidatura ainda.
                                  </p>
                                ) : (
                                  ofBkgs.map((b) => {
                                    const aluno = b.aluno;
                                    const bst =
                                      BOOKING_STATUS[b.status] ??
                                      BOOKING_STATUS.pendente;
                                    const alunoInitials = (aluno?.nome ?? 'A')
                                      .split(' ')
                                      .map((w) => w[0])
                                      .slice(0, 2)
                                      .join('');
                                    return (
                                      <div
                                        key={b.id}
                                        className="flex items-center gap-3 bg-[#F8FAFC] rounded-xl p-3"
                                      >
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                          {alunoInitials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-[#1E293B] truncate">
                                            {aluno?.nome ?? 'Aluno'}
                                          </p>
                                          <p className="text-xs text-[#64748B]">
                                            {aluno?.cidade ?? '—'}
                                          </p>
                                        </div>
                                        <span
                                          className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${bst.color}`}
                                        >
                                          {bst.label}
                                        </span>
                                        {b.status === 'pendente' && (
                                          <div className="flex gap-1.5 flex-shrink-0">
                                            <button
                                              onClick={() =>
                                                handleBookingStatus(
                                                  b.id,
                                                  'rejeitado',
                                                  o.id,
                                                )
                                              }
                                              title="Rejeitar"
                                              className="w-8 h-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center text-sm transition-colors"
                                            >
                                              ✕
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleBookingStatus(
                                                  b.id,
                                                  'confirmado',
                                                  o.id,
                                                )
                                              }
                                              title="Aprovar"
                                              className="w-8 h-8 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 flex items-center justify-center text-sm transition-colors"
                                            >
                                              ✓
                                            </button>
                                          </div>
                                        )}
                                        {b.status === 'confirmado' && (() => {
                                          const pay = b.payment
                                          return (
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                              {pay?.status === 'pago' ? (
                                                <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                                  💳 Pago
                                                </span>
                                              ) : (
                                                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                                  💳 Ag. pagamento
                                                </span>
                                              )}
                                              <button
                                                onClick={() => handleBookingStatus(b.id, 'rejeitado', o.id)}
                                                title="Rejeitar candidatura"
                                                className="w-8 h-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center text-sm transition-colors"
                                              >
                                                ✕
                                              </button>
                                              <button
                                                onClick={() => handleBookingStatus(b.id, 'concluido', o.id)}
                                                title="Marcar como concluído"
                                                className="px-2.5 py-1.5 rounded-lg bg-[#EFF6FF] text-[#1E3A8A] border border-[#BFDBFE] hover:bg-[#DBEAFE] text-xs font-medium transition-colors"
                                              >
                                                Concluir
                                              </button>
                                            </div>
                                          )
                                        })()}
                                        {b.status === 'rejeitado' && (
                                          <button
                                            onClick={() => handleBookingStatus(b.id, 'confirmado', o.id)}
                                            title="Reativar candidatura"
                                            className="px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 text-xs font-medium transition-colors flex-shrink-0"
                                          >
                                            Reativar
                                          </button>
                                        )}
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── SESSÕES REALIZADAS ── */}
        {activeTab === 'sessoes' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#0F172A]">
                Sessões Realizadas
              </h2>
              <span className="text-sm text-[#64748B]">
                {pastOfferings.length} sessões
              </span>
            </div>
            {pastOfferings.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-[#CBD5E1]">
                <p className="text-3xl mb-2">📋</p>
                <p className="font-medium text-[#1E293B] mb-1">
                  Nenhuma sessão realizada ainda
                </p>
                <p className="text-sm text-[#94A3B8]">
                  As mentorias que você encerrar aparecerão aqui
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastOfferings.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => handleSessionClick(o)}
                    className="w-full bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md transition-shadow text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {o.procedures?.nome
                          ?.split(' ')
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1E293B] text-sm">
                          {o.procedures?.nome || o.titulo}
                        </p>
                        <p className="text-xs text-[#64748B]">
                          {o.procedures?.especialidade}
                        </p>
                        <p className="text-xs text-[#94A3B8] mt-1">
                          📅 {fmtDate(o.fim)} · 📍 {o.cidade}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-blue-600 text-sm">
                          R$ {Number(o.preco).toLocaleString('pt-BR')}
                        </p>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          Ver participantes →
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── AVALIAÇÕES ── */}
        {/* {activeTab === 'avaliacoes' && (
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] mb-6">
              Avaliações Recebidas
            </h2>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm mb-6">
              <div className="flex items-center gap-8">
                <div className="text-center flex-shrink-0">
                  <p className="text-5xl font-bold text-[#1E3A8A]">
                    {avgRating}
                  </p>
                  <div className="flex gap-0.5 justify-center mt-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <StarIcon
                        key={i}
                        filled={i <= Math.round(Number(avgRating))}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    {REVIEWS.length} avaliações
                  </p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = REVIEWS.filter(
                      (r) => r.rating === star,
                    ).length;
                    const pct = Math.round((count / REVIEWS.length) * 100);
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-[#64748B] w-3">
                          {star}
                        </span>
                        <StarIcon filled />
                        <div className="flex-1 bg-[#F1F5F9] rounded-full h-1.5">
                          <div
                            className="bg-yellow-400 h-1.5 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#94A3B8] w-4">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {REVIEWS.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <StudentAvatar name={r.student} />
                    <div>
                      <p className="font-semibold text-[#1E293B] text-sm">
                        {r.student}
                      </p>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <StarIcon key={i} filled={i <= r.rating} />
                        ))}
                        <span className="text-xs text-[#94A3B8] ml-1">
                          {r.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[#374151] italic">"{r.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* ── PRODUÇÃO / GANHOS ── */}
        {/* {activeTab === 'producao' && (
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] mb-6">
              Minha Produção
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: 'Total Acumulado',
                  value: `R$ ${totalEarned.toLocaleString('pt-BR')}`,
                  color: 'text-[#1E3A8A]',
                },
                {
                  label: 'Este Mês',
                  value: `R$ ${MONTHLY[MONTHLY.length - 1].value.toLocaleString('pt-BR')}`,
                  color: 'text-green-600',
                },
                {
                  label: 'Sessões',
                  value: SESSIONS.length,
                  color: 'text-[#1E3A8A]',
                },
                {
                  label: 'Avaliação Média',
                  value: avgRating,
                  color: 'text-yellow-500',
                },
              ].map((k) => (
                <div
                  key={k.label}
                  className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm text-center"
                >
                  <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
                  <p className="text-xs text-[#64748B] mt-1">{k.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm mb-6">
              <p className="font-semibold text-[#1E293B] text-sm mb-5">
                Ganhos — últimos 6 meses
              </p>
              <div className="flex items-end gap-3 h-32">
                {MONTHLY.map((m) => (
                  <div
                    key={m.month}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <span className="text-[10px] text-[#64748B]">
                      R${(m.value / 1000).toFixed(1)}k
                    </span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-[#1E3A8A] to-[#3B82F6]"
                      style={{ height: `${(m.value / maxEarning) * 80}px` }}
                    />
                    <span className="text-xs text-[#94A3B8]">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0]">
                <p className="font-semibold text-[#1E293B] text-sm">
                  Últimas Transações
                </p>
              </div>
              {SESSIONS.map((s, i) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-4 px-5 py-4 ${i < SESSIONS.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}
                >
                  <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                    💰
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1E293B] truncate">
                      {s.procedure}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {s.student} · {s.date}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-green-600 text-sm">
                      +R$ {s.earned.toLocaleString('pt-BR')}
                    </p>
                    <span className="text-xs text-[#94A3B8]">Pago</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* ── NOTIFICAÇÕES ── */}
        {activeTab === 'notificacoes' && (
          <NotificationsTab
            profileId={profile?.id}
            onOpen={() => setUnreadCount(0)}
          />
        )}

        {/* ── PERFIL ── */}
        {activeTab === 'perfil' && (
          <div className="max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-[#0F172A] mb-6">
              Meu Perfil
            </h2>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm mb-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="font-bold text-[#1E293B] text-lg">
                    {displayNome || '—'}
                  </p>
                  <p className="text-sm text-[#64748B]">
                    Mentor · {displayCidade || '—'}
                  </p>
                </div>
              </div>

              <div className="space-y-0">
                {[
                  {
                    label: 'Especialidade',
                    value: mentorProfile?.especialidade || '—',
                  },
                  {
                    label: 'CRM',
                    value: mentorProfile?.crm
                      ? `${mentorProfile.crm} / ${mentorProfile.uf}`
                      : '—',
                  },
                  {
                    label: 'Anos de experiência',
                    value: mentorProfile?.anos_experiencia
                      ? `${mentorProfile.anos_experiencia} anos`
                      : '—',
                  },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="flex justify-between items-center py-3 border-b border-[#F1F5F9] text-sm"
                  >
                    <span className="text-[#64748B]">{f.label}</span>
                    <span className="font-medium text-[#1E293B]">
                      {f.value}
                    </span>
                  </div>
                ))}

                {mentorProfile?.subespecialidades?.length > 0 && (
                  <div className="py-3 border-b border-[#F1F5F9]">
                    <p className="text-sm text-[#64748B] mb-2">
                      Subespecialidades
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {mentorProfile.subespecialidades.map((s) => (
                        <span
                          key={s}
                          className="text-xs bg-[#EFF6FF] text-[#1E3A8A] px-2.5 py-1 rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {mentorProfile?.ambientes?.length > 0 && (
                  <div className="py-3 border-b border-[#F1F5F9]">
                    <p className="text-sm text-[#64748B] mb-2">Ambientes</p>
                    <div className="flex flex-wrap gap-1.5">
                      {mentorProfile.ambientes.map((a) => (
                        <span
                          key={a}
                          className="text-xs bg-[#F1F5F9] text-[#374151] px-2.5 py-1 rounded-full"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {mentorProfile?.mini_curriculo && (
                  <div className="py-3">
                    <p className="text-sm text-[#64748B] mb-1">
                      Mini currículo
                    </p>
                    <p className="text-sm text-[#374151] leading-relaxed">
                      {mentorProfile.mini_curriculo}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowEditProfile(true)}
                className="mt-5 w-full py-2.5 border-2 border-[#1E3A8A] text-[#1E3A8A] rounded-xl text-sm font-semibold hover:bg-[#EFF6FF]"
              >
                Editar Perfil
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Mentorias', value: offerings.length },
                { label: 'Sessões', value: SESSIONS.length },
                { label: 'Avaliação', value: avgRating },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-2xl border border-[#E2E8F0] p-4 text-center shadow-sm"
                >
                  <p className="text-2xl font-bold text-[#1E3A8A]">{s.value}</p>
                  <p className="text-xs text-[#64748B] mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FINANCEIRO ── */}
        {activeTab === 'financeiro' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#0F172A]">Financeiro</h2>
              <span className="text-sm text-[#64748B]">
                {financeRows.length} mentorias
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 text-center shadow-sm">
                <p className="text-lg font-bold text-[#0F172A]">
                  R$ {totalRecebido.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-[#64748B] mt-1">Total recebido</p>
              </div>
              <div className="bg-green-50 rounded-2xl border border-green-100 p-4 text-center shadow-sm">
                <p className="text-lg font-bold text-green-700">
                  R$ {totalRepassado.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-[#64748B] mt-1">Já repassado</p>
              </div>
              <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 text-center shadow-sm">
                <p className="text-lg font-bold text-amber-600">
                  R$ {totalARepassar.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-[#64748B] mt-1">A repassar</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
              {loadingFinance ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 rounded-full border-4 border-[#1E3A8A] border-t-transparent animate-spin" />
                </div>
              ) : financeRows.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-3xl mb-2">💰</p>
                  <p className="font-medium text-[#1E293B] mb-1">
                    Nenhuma mentoria confirmada até o momento
                  </p>
                  <p className="text-sm text-[#94A3B8]">
                    Os pagamentos das suas mentorias aparecerão aqui
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-1">
                    Alunos
                  </p>
                  {financeRows.map((b) => {
                    const paid = b.payment?.status === 'pago';
                    return (
                      <div
                        key={b.id}
                        className="flex items-center gap-3 bg-[#F8FAFC] rounded-xl p-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1E293B] truncate">
                            {b.aluno?.nome ?? 'Aluno'}
                          </p>
                          <p className="text-xs text-[#64748B] truncate">
                            {b.offerings?.titulo ?? '—'}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-[#1E293B] flex-shrink-0">
                          R${' '}
                          {Number(
                            b.payment?.valor_bruto ?? b.offerings?.preco ?? 0,
                          ).toLocaleString('pt-BR')}
                        </p>
                        {paid ? (
                          <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex-shrink-0">
                            💳 Pago
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0">
                            💳 Ag. pagamento
                          </span>
                        )}
                        {paid && (
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                              b.payment.repasse_status === 'repassado'
                                ? 'text-[#1E3A8A] bg-[#EFF6FF]'
                                : 'text-slate-500 bg-slate-100'
                            }`}
                          >
                            {b.payment.repasse_status === 'repassado'
                              ? 'Repassado'
                              : 'Repasse pendente'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── DOCUMENTOS ── */}
        {activeTab === 'docs' && (
          <div className="max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-[#0F172A] mb-1">
              Documentação
            </h2>
            <p className="text-sm text-[#64748B] mb-6">
              Envie seus documentos para verificação do perfil. PDF ou imagem
              (JPG, PNG), máx. 10MB.
            </p>
            <DocumentsTab profileId={profile?.id} />
          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] flex z-40">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() =>
              t.external ? navigate('/explorar') : setActiveTab(t.id)
            }
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${!t.external && activeTab === t.id ? 'text-[#1E3A8A]' : 'text-[#94A3B8]'}`}
          >
            <span className="relative text-lg leading-none">
              {t.icon}
              {t.id === 'notificacoes' && unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-500 rounded-full text-white text-[8px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </span>
            <span className="text-[10px] font-medium leading-none">
              {t.label}
            </span>
          </button>
        ))}
      </nav>

      {encerrarModal && (
        <EncerrarModal
          offering={encerrarModal}
          mentorId={profile.id}
          onClose={() => setEncerrarModal(null)}
          onConfirm={confirmEncerrar}
        />
      )}

      {showEdit && (
        <EditOfferingModal
          offering={showEdit}
          onClose={() => setShowEdit(null)}
          onSaved={async () => {
            setShowEdit(null);
            await loadOfferings();
          }}
        />
      )}

      {showCreate && (
        <CreateOfferingModal
          mentorId={profile?.id}
          onClose={() => setShowCreate(false)}
          onCreated={async () => {
            setShowCreate(false);
            await loadOfferings();
          }}
        />
      )}

      {showEditProfile && (
        <EditMentorProfileModal
          profileId={profile?.id}
          initial={{
            nome: displayNome,
            cidade: displayCidade,
            ...mentorProfile,
          }}
          onClose={() => setShowEditProfile(false)}
          onSaved={(form) => {
            setProfileOverride({ nome: form.nome, cidade: form.cidade });
            setMentorProfile((prev) => ({ ...prev, ...form }));
            setShowEditProfile(false);
          }}
        />
      )}

      {modalSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-96 overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-[#1E293B]">Participantes</h3>
              <button
                onClick={() => setModalSession(null)}
                className="text-[#94A3B8] hover:text-[#1E293B] text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-3">
              <div className="mb-4">
                <p className="text-sm font-semibold text-[#64748B] mb-1">
                  Sessão:
                </p>
                <p className="font-bold text-[#1E293B]">
                  {modalSession.procedures?.nome || modalSession.titulo}
                </p>
                <p className="text-xs text-[#94A3B8]">
                  {fmtDate(modalSession.fim)}
                </p>
              </div>

              {sessionParticipants.length === 0 ? (
                <p className="text-center text-[#94A3B8] py-4">
                  Nenhum participante confirmado
                </p>
              ) : (
                sessionParticipants.map((b) => {
                  const review = sessionReviews[b.id];
                  const isRating = ratingDraftFor === b.id;
                  return (
                    <div
                      key={b.id}
                      className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(b.aluno?.nome ?? 'A')
                            .split(' ')
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1E293B] truncate">
                            {b.aluno?.nome}
                          </p>
                          <p className="text-xs text-[#94A3B8]">
                            {b.aluno?.cidade}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                            b.status === 'confirmado'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {b.status === 'confirmado' ? 'Confirmado' : 'Concluído'}
                        </span>
                      </div>

                      {b.status === 'concluido' && (
                        <div className="mt-2 pt-2 border-t border-[#E2E8F0]">
                          {review ? (
                            <div className="flex items-center gap-2">
                              <RatingStars value={review.nota} onChange={() => {}} />
                              {review.comentario && (
                                <p className="text-xs text-[#64748B] truncate">
                                  “{review.comentario}”
                                </p>
                              )}
                            </div>
                          ) : isRating ? (
                            <div className="space-y-2">
                              <RatingStars
                                value={ratingDraft.nota}
                                onChange={(n) =>
                                  setRatingDraft((d) => ({ ...d, nota: n }))
                                }
                              />
                              <input
                                type="text"
                                placeholder="Comentário (opcional)"
                                value={ratingDraft.comentario}
                                onChange={(e) =>
                                  setRatingDraft((d) => ({
                                    ...d,
                                    comentario: e.target.value,
                                  }))
                                }
                                className="w-full border border-[#E2E8F0] rounded-lg px-2.5 py-1 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setRatingDraftFor(null)}
                                  className="text-xs text-[#64748B] px-2 py-1"
                                >
                                  Cancelar
                                </button>
                                <button
                                  disabled={!ratingDraft.nota}
                                  onClick={() =>
                                    saveSessionReview(
                                      b.id,
                                      b.aluno_id,
                                      ratingDraft.nota,
                                      ratingDraft.comentario,
                                    )
                                  }
                                  className="text-xs font-semibold text-white bg-[#1E3A8A] rounded-lg px-3 py-1 disabled:opacity-50"
                                >
                                  Salvar avaliação
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setRatingDraftFor(b.id);
                                setRatingDraft({ nota: null, comentario: '' });
                              }}
                              className="text-xs font-medium text-[#1E3A8A] hover:underline"
                            >
                              ⭐ Avaliar aluno
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
