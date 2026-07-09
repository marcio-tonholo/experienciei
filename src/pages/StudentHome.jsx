import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import DocumentsTab from '../components/DocumentsTab';
import NotificationsTab from '../components/NotificationsTab';
import { useUserLocation } from '../contexts/UserLocationContext';
import { haversineKm, formatDistance } from '../lib/geo';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BOOKING_STATUS = {
  pendente: { label: 'Ag. Aprovação', color: 'bg-blue-100 text-blue-700' },
  confirmado: { label: 'Confirmado', color: 'bg-green-100 text-green-700' },
  rejeitado: { label: 'Não aprovado', color: 'bg-red-100 text-red-700' },
  concluido: { label: 'Concluído', color: 'bg-gray-100 text-gray-600' },
  cancelado: { label: 'Cancelado', color: 'bg-gray-100 text-gray-400' },
};

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

// ─── EditStudentProfileModal ──────────────────────────────────────────────────

function EditStudentProfileModal({
  profileId,
  initial,
  studentInitial,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    nome: initial.nome || '',
    cidade: initial.cidade || '',
    nivel: studentInitial.nivel || 'estudante',
    especialidade: studentInitial.especialidade || '',
    crm: studentInitial.crm || '',
    ano_formacao: studentInitial.ano_formacao || '',
    objetivos: studentInitial.objetivos || [],
  });
  const [objInput, setObjInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addObj(raw) {
    const v = raw.trim();
    if (!v || form.objetivos.includes(v)) {
      setObjInput('');
      return;
    }
    set('objetivos', [...form.objetivos, v]);
    setObjInput('');
  }

  function removeObj(i) {
    set(
      'objetivos',
      form.objetivos.filter((_, idx) => idx !== i),
    );
  }

  async function handleSave() {
    setError('');
    if (!form.nome.trim()) return setError('Nome é obrigatório.');

    setSaving(true);
    const [r1, r2] = await Promise.all([
      supabase
        .from('profiles')
        .update({ nome: form.nome.trim(), cidade: form.cidade.trim() })
        .eq('id', profileId),
      supabase
        .from('student_profiles')
        .update({
          nivel: form.nivel,
          especialidade: form.especialidade.trim() || null,
          crm: form.crm.trim() || null,
          ano_formacao:
            form.ano_formacao !== '' ? Number(form.ano_formacao) : null,
          objetivos: form.objetivos,
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
              Nível
            </label>
            <select
              value={form.nivel}
              onChange={(e) => set('nivel', e.target.value)}
              className={inp}
            >
              <option value="estudante">Estudante</option>
              <option value="residente">Residente</option>
              <option value="especialista">Especialista</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1.5">
              Especialidade
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
                CRM (opcional)
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
                Ano de formação
              </label>
              <input
                type="number"
                min={1980}
                max={2030}
                value={form.ano_formacao}
                onChange={(e) => set('ano_formacao', e.target.value)}
                className={inp}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1.5">
              Objetivos
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.objetivos.map((o, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 text-xs bg-[#EFF6FF] text-[#1E3A8A] px-2.5 py-1 rounded-full"
                >
                  {o}
                  <button
                    type="button"
                    onClick={() => removeObj(i)}
                    className="text-[#93C5FD] hover:text-[#1E3A8A] leading-none text-base"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={objInput}
              onChange={(e) => setObjInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  addObj(objInput);
                }
                if (e.key === 'Backspace' && !objInput && form.objetivos.length)
                  removeObj(form.objetivos.length - 1);
              }}
              placeholder="Digite e pressione Enter"
              className={inp}
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

// ─── CertificateModal ────────────────────────────────────────────────────────

function CertificateModal({ booking, studentName, onClose }) {
  const o = booking.offerings;
  const mentorNome = booking.mentor?.nome ?? 'Especialista';
  const procNome = o?.procedures?.nome ?? o?.titulo ?? '—';
  const especialidade = o?.procedures?.especialidade ?? '';
  const dateStr = o?.inicio
    ? new Date(o.inicio).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';
  const cidade = o?.cidade ?? '';
  const certId = booking.id.split('-')[0].toUpperCase();
  const emitido = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  function handlePrint() {
    const logoPath = `M272 464h-32a32 32 0 01-32-32l.05-85.82a4 4 0 00-6-3.47l-74.34 43.06a31.48 31.48 0 01-43-11.52l-16.5-28.64a31.65 31.65 0 0111.56-42.8l74.61-43.25a4 4 0 000-6.92l-74.54-43.21a31.41 31.41 0 01-11.55-43l16.44-28.55a31.48 31.48 0 0143.07-11.54l74.31 43a4 4 0 006-3.47L208 80a32 32 0 0132-32h32a32 32 0 0132 32v85.72a4 4 0 006 3.47l74.34-43.06a31.51 31.51 0 0143 11.52l16.49 28.73a31.52 31.52 0 01-11.64 42.86l-74.53 43.2a4 4 0 000 6.92l74.53 43.2a31.42 31.42 0 0111.56 43l-16.44 28.55a31.48 31.48 0 01-43.07 11.54l-74.31-43a4 4 0 00-6 3.46L304 432a32 32 0 01-32 32z`;
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Certificado · ${studentName}</title>
  <style>
    @page { size: A4 landscape; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, serif; background: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .cert { width: 100%; max-width: 1000px; border: 4px solid #1E3A8A; padding: 52px 80px; position: relative; background: white; }
    .cert::before { content: ''; position: absolute; inset: 10px; border: 1.5px solid #93C5FD; pointer-events: none; }
    .logo-row { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 28px; }
    .logo-box { width: 46px; height: 46px; background: #1E3A8A; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .logo-box svg { width: 26px; height: 26px; fill: white; }
    .logo-text { font-size: 26px; font-weight: bold; color: #1E3A8A; font-family: Arial, sans-serif; }
    .subtitle { text-align: center; font-size: 11px; letter-spacing: 5px; text-transform: uppercase; color: #94A3B8; font-family: Arial, sans-serif; margin-bottom: 6px; }
    .main-title { text-align: center; font-size: 34px; font-weight: bold; color: #1E3A8A; margin-bottom: 28px; }
    .divider { height: 2px; background: linear-gradient(to right, transparent, #1E3A8A, transparent); margin: 0 auto 28px; width: 75%; }
    .body { text-align: center; font-size: 17px; line-height: 2.1; color: #0F172A; margin-bottom: 28px; }
    .name { color: #1E3A8A; font-size: 22px; font-weight: bold; }
    .proc { color: #1E3A8A; font-size: 18px; font-weight: bold; }
    .espec { font-size: 13px; color: #64748B; font-family: Arial, sans-serif; }
    .mentor { color: #1E3A8A; font-weight: bold; }
    .meta { text-align: center; font-family: Arial, sans-serif; margin-top: 4px; }
    .badge { display: inline-block; background: #EFF6FF; color: #1E3A8A; font-size: 11px; padding: 4px 14px; border-radius: 20px; border: 1px solid #BFDBFE; }
    .emitted { font-size: 12px; color: #94A3B8; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="cert">
    <div class="logo-row">
      <div class="logo-box"><svg viewBox="0 0 512 512"><path d="${logoPath}"/></svg></div>
      <span class="logo-text">Experenciei</span>
    </div>
    <p class="subtitle">Plataforma de Mentoria Cirúrgica</p>
    <h1 class="main-title">Certificado de Participação</h1>
    <div class="divider"></div>
    <p class="body">
      Certificamos que<br>
      <span class="name">${studentName}</span><br>
      participou da experiência cirúrgica<br>
      <span class="proc">${procNome}</span><br>
      ${especialidade ? `<span class="espec">${especialidade}</span><br>` : ''}
      realizada em <strong>${dateStr}</strong>${cidade ? `, em <strong>${cidade}</strong>` : ''}<br>
      sob orientação de <span class="mentor">${mentorNome}</span>
    </p>
    <div class="divider"></div>
    <div class="meta">
      <span class="badge">ID: ${certId}</span>
      <p class="emitted">Emitido em ${emitido}</p>
    </div>
  </div>
</body>
</html>`;
    const w = window.open('', '_blank');
    if (!w) {
      alert('Permita pop-ups para gerar o PDF.');
      return;
    }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 350);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#E2E8F0]">
          <h2 className="text-base font-bold text-[#0F172A]">
            Certificado de Participação
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F1F5F9] flex items-center justify-center text-[#64748B] text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          <div
            className="border-4 border-[#1E3A8A] p-8 relative bg-white select-none"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            <div className="absolute inset-2.5 border border-[#93C5FD] pointer-events-none" />

            <div className="flex items-center justify-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] flex items-center justify-center flex-shrink-0">
                <LogoSVG />
              </div>
              <span
                className="text-xl font-bold text-[#1E3A8A]"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                Experenciei
              </span>
            </div>

            <p
              className="text-center text-[10px] tracking-[4px] uppercase text-[#94A3B8] mb-1"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              Plataforma de Mentoria Cirúrgica
            </p>
            <h1 className="text-center text-2xl font-bold text-[#1E3A8A] mb-5">
              Certificado de Participação
            </h1>

            <div
              className="h-0.5 mx-auto mb-5"
              style={{
                width: '75%',
                background:
                  'linear-gradient(to right, transparent, #1E3A8A, transparent)',
              }}
            />

            <p className="text-center text-[#0F172A] leading-loose mb-5">
              Certificamos que
              <br />
              <span className="text-[#1E3A8A] font-bold text-lg">
                {studentName}
              </span>
              <br />
              participou da experiência cirúrgica
              <br />
              <span className="text-[#1E3A8A] font-bold">{procNome}</span>
              {especialidade && (
                <>
                  <br />
                  <span
                    className="text-xs text-[#64748B]"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  >
                    {especialidade}
                  </span>
                </>
              )}
              <br />
              realizada em <strong>{dateStr}</strong>
              {cidade && (
                <>
                  , em <strong>{cidade}</strong>
                </>
              )}
              <br />
              sob orientação de{' '}
              <span className="text-[#1E3A8A] font-bold">{mentorNome}</span>
            </p>

            <div
              className="h-0.5 mx-auto mb-4"
              style={{
                width: '75%',
                background:
                  'linear-gradient(to right, transparent, #1E3A8A, transparent)',
              }}
            />

            <div
              className="text-center"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              <span className="text-xs bg-[#EFF6FF] text-[#1E3A8A] border border-[#BFDBFE] px-3 py-1 rounded-full">
                ID: {certId}
              </span>
              <p className="text-xs text-[#94A3B8] mt-2">
                Emitido em {emitido}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-[#E2E8F0] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#E2E8F0] text-[#374151] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={handlePrint}
            className="flex-[2] py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Gerar PDF / Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AvaliarMentorModal ──────────────────────────────────────────────────────

function StarIcon({ filled }) {
  return (
    <svg
      className={`w-6 h-6 ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function AvaliarMentorModal({ booking, onClose, onSaved }) {
  const [nota, setNota] = useState(null);
  const [comentario, setComentario] = useState('');
  const [saving, setSaving] = useState(false);
  const mentorNome = booking.mentor?.nome ?? 'o mentor';

  async function handleSubmit() {
    if (!nota) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('avaliacoes')
      .insert({
        booking_id: booking.id,
        autor_id: booking.aluno_id,
        avaliado_id: booking.mentor_id,
        direcao: 'aluno_para_mentor',
        nota,
        comentario: comentario.trim() || null,
      })
      .select('booking_id, nota, comentario')
      .single();
    setSaving(false);
    if (!error && data) onSaved(data);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-bold text-[#0F172A]">Avaliar mentor</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F1F5F9] flex items-center justify-center text-[#64748B] text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <p className="text-sm text-[#374151]">
            Como foi sua experiência com <strong>{mentorNome}</strong>?
          </p>
          <div className="flex items-center gap-1 justify-center">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setNota(n)} className="p-1">
                <StarIcon filled={nota != null && n <= nota} />
              </button>
            ))}
          </div>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={3}
            placeholder="Comentário (opcional)"
            className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] resize-none"
          />
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#E2E8F0] text-[#64748B] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
          >
            Agora não
          </button>
          <button
            onClick={handleSubmit}
            disabled={!nota || saving}
            className="flex-1 py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? 'Enviando...' : 'Enviar avaliação'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'explorar',      label: 'Explorar',      icon: '🔍' },
  { id: 'agendamentos',  label: 'Agendamentos',   icon: '📅' },
  { id: 'historico',     label: 'Histórico',      icon: '📚' },
  { id: 'notificacoes',  label: 'Notificações',   icon: '🔔' },
  { id: 'perfil',        label: 'Perfil',         icon: '👤' },
  { id: 'docs',          label: 'Documentos',     icon: '📄' },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function StudentHome() {
  const navigate = useNavigate();
  const { profile, signOut, refreshProfile } = useAuth();
  const userLoc = useUserLocation();

  const [activeTab, setActiveTab] = useState('explorar');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpec, setFilterSpec] = useState('Todos');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [certBooking, setCertBooking] = useState(null);
  const [rateBooking, setRateBooking] = useState(null);
  const [myReviews, setMyReviews] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);

  // Real data
  const [offerings, setOfferings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingOfferings, setLoadingOfferings] = useState(true);
  const [applying, setApplying] = useState(null);
  const [paymentsByBooking, setPaymentsByBooking] = useState({});
  const [paying, setPaying] = useState(null);
  const [studentProfile, setStudentProfile] = useState({});
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileOverride, setProfileOverride] = useState({});

  const displayNome = profileOverride.nome ?? profile?.nome ?? '';
  const displayCidade = profileOverride.cidade ?? profile?.cidade ?? '';
  const displayNivel =
    profileOverride.nivel ?? studentProfile.nivel ?? profile?.nivel;
  const initials =
    displayNome
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'EU';
  const firstName = displayNome.split(' ')[0] || 'Você';
  const nivelLabel =
    {
      estudante: 'Estudante',
      residente: 'Residente',
      especialista: 'Especialista',
    }[displayNivel] || 'Aluno';

  const specialties = [
    ...new Set(
      offerings.map((o) => o.procedures?.especialidade).filter(Boolean),
    ),
  ];
  const filteredOfferings = offerings.filter((o) => {
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

  async function loadOfferings() {
    setLoadingOfferings(true);
    const { data } = await supabase
      .from('offerings')
      .select(
        '*, procedures(nome, especialidade, complexidade), profiles(nome)',
      )
      .eq('status', 'publicado')
      .gte('inicio', new Date().toISOString())
      .order('inicio');
    if (data) setOfferings(data);
    setLoadingOfferings(false);
  }

  async function loadBookings() {
    if (!profile?.id) return;
    const { data } = await supabase
      .from('bookings')
      .select(
        '*, mentor:profiles!mentor_id(nome), offerings(id, titulo, inicio, fim, preco, cidade, local_descricao, status, procedures(nome, especialidade))',
      )
      .eq('aluno_id', profile.id)
      .order('created_at', { ascending: false });
    if (data) {
      setBookings(data);
      // Busca pagamentos associados aos bookings do aluno
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('booking_id, status, valor_bruto, metodo_pagamento')
        .eq('aluno_id', profile.id)
      if (paymentsData) {
        setPaymentsByBooking(
          Object.fromEntries(paymentsData.map(p => [p.booking_id, p]))
        )
      }
      const { data: reviewsData } = await supabase
        .from('avaliacoes')
        .select('booking_id, nota, comentario')
        .eq('autor_id', profile.id)
        .eq('direcao', 'aluno_para_mentor')
      if (reviewsData) {
        setMyReviews(
          Object.fromEntries(reviewsData.map((r) => [r.booking_id, r])),
        )
      }
    }
  }

  useEffect(() => {
    loadOfferings();
    loadBookings();
    if (profile?.id) {
      supabase.from('student_profiles').select('*').eq('id', profile.id).single()
        .then(({ data }) => { if (data) setStudentProfile(data); });
      supabase.from('notifications').select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id).eq('lida', false)
        .then(({ count }) => setUnreadCount(count || 0));
    }
  }, [profile?.id]);

  useEffect(() => {
    if (activeTab === 'notificacoes') setUnreadCount(0);
  }, [activeTab]);

  async function handlePay(bookingId) {
    setPaying(bookingId)
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { booking_id: bookingId, origin: window.location.origin },
    })
    if (data?.url) {
      window.location.href = data.url
    } else {
      console.error('Erro ao criar checkout:', error)
      if (error?.context) {
        error.context.json().then(body => console.error('Response body:', JSON.stringify(body, null, 2))).catch(() => {})
      }
      setPaying(null)
    }
  }

  async function handleRequestReview() {
    await supabase.from('profiles').update({ status: 'pendente' }).eq('id', profile.id)
    await refreshProfile()
  }

  async function handleApply(offeringId, mentorId) {
    if (profile?.status !== 'ativo') return;
    if (applying) return;
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
      .select()
      .single();
    if (!error && data) {
      const offering = offerings.find((o) => o.id === offeringId);
      setBookings((prev) => {
        const existing = prev.findIndex((b) => b.offering_id === offeringId);
        return existing >= 0
          ? prev.map((b, i) =>
              i === existing ? { ...data, offerings: offering } : b,
            )
          : [{ ...data, offerings: offering }, ...prev];
      });
    }
    setApplying(null);
  }

  async function handleCancelBooking(bookingId) {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelado' })
      .eq('id', bookingId);
    if (!error)
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: 'cancelado' } : b,
        ),
      );
  }

  const activeBookings = bookings.filter(
    (b) =>
      b.status === 'pendente' ||
      (b.status === 'confirmado' && b.offerings?.status !== 'encerrado'),
  );
  const pastBookings = bookings.filter(
    (b) =>
      ['concluido', 'rejeitado', 'cancelado'].includes(b.status) ||
      (b.status === 'confirmado' && b.offerings?.status === 'encerrado'),
  );

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

          <nav className="hidden md:flex items-center gap-1 flex-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === t.id
                    ? 'bg-[#EFF6FF] text-[#1E3A8A]'
                    : 'text-[#64748B] hover:text-[#1E3A8A] hover:bg-[#F8FAFC]'
                }`}
              >
                {t.icon} {t.label}
                {t.id === 'agendamentos' && activeBookings.length > 0 && (
                  <span className="ml-1.5 bg-[#1E3A8A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {activeBookings.length}
                  </span>
                )}
                {t.id === 'notificacoes' && unreadCount > 0 && (
                  <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
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
                  {firstName}
                </p>
                <p className="text-xs text-[#94A3B8]">{nivelLabel}</p>
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
                <button
                  onClick={() => {
                    setActiveTab('agendamentos');
                    setProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F8FAFC]"
                >
                  Agendamentos
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

      <main className="pb-24 md:pb-8">
        {/* ── EXPLORAR ── */}
        {activeTab === 'explorar' && (
          <div>
            <section className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] py-10 md:py-14">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
                <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2">
                  Olá, {firstName}! 👋
                </h1>
                <p className="text-blue-200 text-sm mb-8">
                  Encontre sua próxima experiência cirúrgica
                </p>
                <div className="bg-white rounded-2xl p-3 shadow-xl flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Procedimento, especialidade, mentor ou cidade..."
                    style={{ width: '100%' }}
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

            {profile?.status !== 'ativo' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
                <div className={`rounded-2xl border px-4 py-3.5 flex items-start gap-3 ${
                  profile?.status === 'pendente' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
                }`}>
                  <span className="text-xl mt-0.5">
                    {profile?.status === 'pendente' ? '⏳' : '❌'}
                  </span>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${profile?.status === 'pendente' ? 'text-amber-700' : 'text-red-700'}`}>
                      {profile?.status === 'pendente'
                        ? 'Cadastro em análise — candidaturas indisponíveis'
                        : 'Cadastro não aprovado — candidaturas indisponíveis'}
                    </p>
                    <p className={`text-xs mt-0.5 ${profile?.status === 'pendente' ? 'text-amber-600' : 'text-red-600'}`}>
                      {profile?.status === 'pendente'
                        ? 'Nosso time está revisando sua documentação. Enquanto isso, acesse a aba Documentos para enviar seus arquivos.'
                        : 'Seu cadastro foi rejeitado. Acesse Documentos, reenvie seus arquivos e solicite nova análise.'}
                    </p>
                    {profile?.motivo_rejeicao && (
                      <div className="mt-2 bg-white rounded-xl border border-red-200 px-3 py-2">
                        <p className="text-xs font-semibold text-red-600 mb-0.5">Motivo:</p>
                        <p className="text-xs text-[#1E293B]">{profile.motivo_rejeicao}</p>
                      </div>
                    )}
                    {profile?.status === 'rejeitado' && (
                      <button
                        onClick={handleRequestReview}
                        className="mt-3 px-4 py-1.5 rounded-xl bg-[#1E3A8A] text-white text-xs font-medium hover:bg-[#1e40af]"
                      >
                        Solicitar nova análise
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-16">
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

              {!loadingOfferings && (
                <p className="text-sm text-[#64748B] mb-5">
                  {filteredOfferings.length}{' '}
                  {filteredOfferings.length === 1
                    ? 'mentoria disponível'
                    : 'mentorias disponíveis'}
                  {filterSpec !== 'Todos' && ` em ${filterSpec}`}
                  {searchQuery && ` para "${searchQuery}"`}
                </p>
              )}

              {loadingOfferings ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 rounded-full border-4 border-[#1E3A8A] border-t-transparent animate-spin" />
                </div>
              ) : filteredOfferings.length === 0 ? (
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
                  {filteredOfferings.map((o) => {
                    const cx = COMPLEXITY[o.procedures?.complexidade];
                    const existingBooking = bookings.find(
                      (b) => b.offering_id === o.id && b.status !== 'cancelado',
                    );
                    const isApplying = applying === o.id;
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
                              👥 {o.max_vagas}{' '}
                              {o.max_vagas === 1 ? 'vaga' : 'vagas'}
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
                          {existingBooking ? (
                            <div
                              className={`text-center py-2.5 rounded-xl text-sm font-medium ${BOOKING_STATUS[existingBooking.status]?.color ?? 'bg-gray-100 text-gray-600'}`}
                            >
                              ✓{' '}
                              {BOOKING_STATUS[existingBooking.status]?.label ??
                                existingBooking.status}
                            </div>
                          ) : profile?.status !== 'ativo' ? (
                            <div className="w-full py-2.5 bg-[#F1F5F9] text-[#94A3B8] rounded-xl text-sm font-semibold text-center">
                              {profile?.status === 'pendente' ? 'Cadastro pendente' : 'Cadastro não aprovado'}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleApply(o.id, o.mentor_id)}
                              disabled={!!applying}
                              className="w-full py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                            >
                              {isApplying ? 'Candidatando...' : 'Candidatar-se'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── AGENDAMENTOS ── */}
        {activeTab === 'agendamentos' && (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
            <h2 className="text-xl font-bold text-[#0F172A] mb-6">
              Meus Agendamentos
            </h2>

            {activeBookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#CBD5E1]">
                <p className="text-3xl mb-3">📅</p>
                <p className="font-semibold text-[#1E293B] mb-1">
                  Nenhum agendamento ativo
                </p>
                <p className="text-sm text-[#64748B] mb-5">
                  Candidate-se a uma mentoria para começar.
                </p>
                <button
                  onClick={() => setActiveTab('explorar')}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Explorar Mentorias
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeBookings.map((b) => {
                  const o = b.offerings;
                  const mentorNome = b.mentor?.nome ?? 'Especialista';
                  const bst =
                    BOOKING_STATUS[b.status] ?? BOOKING_STATUS.pendente;
                  const mentorInitials = mentorNome
                    .split(' ')
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('');
                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {mentorInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-semibold text-[#1E293B] text-sm">
                              {mentorNome}
                            </p>
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${bst.color}`}
                            >
                              {bst.label}
                            </span>
                          </div>
                          <p className="text-sm text-[#374151] mb-1">
                            {o?.procedures?.nome ?? o?.titulo ?? '—'}
                          </p>
                          {o?.inicio && (
                            <p className="text-xs text-[#64748B]">
                              📅 {fmtDate(o.inicio)} · ⏰ {fmtTime(o.inicio)}
                            </p>
                          )}
                          {o?.cidade && (
                            <p className="text-xs text-[#64748B]">
                              📍 {o.cidade}
                              {o.local_descricao
                                ? ` · ${o.local_descricao}`
                                : ''}
                            </p>
                          )}
                          {o?.preco != null && (
                            <p className="text-sm font-bold text-[#1E3A8A] mt-1">
                              R$ {Number(o.preco).toLocaleString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>

                      {b.status === 'pendente' && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                            ⏳ O mentor revisará sua candidatura em breve.
                          </p>
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Cancelar candidatura
                          </button>
                        </div>
                      )}
                      {b.status === 'confirmado' && (() => {
                        const payment = paymentsByBooking[b.id]
                        const isPago = payment?.status === 'pago'
                        const isPaying = paying === b.id
                        const preco = Number(o?.preco ?? 0)
                          .toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                        return (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                              ✅ Vaga confirmada pelo mentor!
                            </p>
                            {isPago ? (
                              <div className="flex items-center gap-2 bg-[#F0FDF4] border border-green-200 rounded-xl px-3 py-2.5">
                                <span className="text-green-600 font-semibold text-sm">💳 Pagamento confirmado</span>
                                <span className="text-xs text-green-600">
                                  · {payment.metodo_pagamento === 'pix' ? 'PIX' : 'Cartão'}
                                  · R$ {preco}
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handlePay(b.id)}
                                disabled={isPaying}
                                className="w-full py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
                              >
                                {isPaying ? 'Redirecionando para pagamento...' : `Pagar R$ ${preco}`}
                              </button>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── HISTÓRICO ── */}
        {activeTab === 'historico' && (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
            <h2 className="text-xl font-bold text-[#0F172A] mb-6">
              Histórico de Experiências
            </h2>

            {pastBookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#CBD5E1]">
                <p className="text-3xl mb-3">📚</p>
                <p className="font-semibold text-[#1E293B] mb-1">
                  Nenhuma experiência ainda
                </p>
                <p className="text-sm text-[#64748B]">
                  Seu histórico de mentorias aparecerá aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastBookings.map((b) => {
                  const o = b.offerings;
                  const mentorNome = b.mentor?.nome ?? 'Especialista';
                  const bst =
                    BOOKING_STATUS[b.status] ?? BOOKING_STATUS.concluido;
                  const mentorInitials = mentorNome
                    .split(' ')
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('');
                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {mentorInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-semibold text-[#1E293B] text-sm">
                              {mentorNome}
                            </p>
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${bst.color}`}
                            >
                              {bst.label}
                            </span>
                          </div>
                          <p className="text-sm text-[#374151]">
                            {o?.procedures?.nome ?? o?.titulo ?? '—'}
                          </p>
                          {o?.inicio && (
                            <p className="text-xs text-[#64748B] mt-0.5">
                              📅 {fmtDate(o.inicio)}
                            </p>
                          )}
                          {o?.preco != null && (
                            <p className="text-sm font-bold text-[#1E3A8A] mt-1">
                              R$ {Number(o.preco).toLocaleString('pt-BR')}
                            </p>
                          )}
                        </div>
                        {b.status === 'concluido' && (
                          <div className="flex flex-col gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => setCertBooking(b)}
                              className="px-3 py-1.5 border border-[#1E3A8A] text-[#1E3A8A] rounded-lg text-xs font-medium hover:bg-[#EFF6FF] transition-colors"
                            >
                              📜 Certificado
                            </button>
                            {myReviews[b.id] ? (
                              <div className="px-3 py-1 text-xs text-[#64748B] text-center">
                                {'★'.repeat(myReviews[b.id].nota)}
                                {'☆'.repeat(5 - myReviews[b.id].nota)}
                              </div>
                            ) : (
                              <button
                                onClick={() => setRateBooking(b)}
                                className="px-3 py-1.5 border border-[#E2E8F0] text-[#374151] rounded-lg text-xs font-medium hover:bg-[#F8FAFC] transition-colors"
                              >
                                ⭐ Avaliar mentor
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PERFIL ── */}
        {/* ── NOTIFICAÇÕES ── */}
        {activeTab === 'notificacoes' && (
          <NotificationsTab
            profileId={profile?.id}
            onOpen={() => setUnreadCount(0)}
          />
        )}

        {activeTab === 'perfil' && (
          <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
            <h2 className="text-xl font-bold text-[#0F172A] mb-6">
              Meu Perfil
            </h2>
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm mb-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white font-bold text-xl">
                  {initials}
                </div>
                <div>
                  <p className="font-bold text-[#1E293B] text-lg">
                    {displayNome || '—'}
                  </p>
                  <p className="text-sm text-[#64748B]">
                    {nivelLabel} · {displayCidade || '—'}
                  </p>
                </div>
              </div>
              <div className="space-y-0">
                {[
                  {
                    label: 'Especialidade',
                    value:
                      (profileOverride.especialidade ??
                        studentProfile.especialidade) ||
                      '—',
                  },
                  {
                    label: 'Ano de formação',
                    value:
                      (profileOverride.ano_formacao ??
                        studentProfile.ano_formacao) ||
                      '—',
                  },
                  {
                    label: 'CRM',
                    value: (profileOverride.crm ?? studentProfile.crm) || '—',
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
                {
                  label: 'Experiências',
                  value: pastBookings.filter((b) => b.status === 'concluido')
                    .length,
                },
                { label: 'Agendamentos', value: activeBookings.length },
                { label: 'Candidaturas', value: bookings.length },
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

        {/* ── DOCUMENTAÇÃO ── */}
        {activeTab === 'docs' && (
          <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
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
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors relative ${activeTab === t.id ? 'text-[#1E3A8A]' : 'text-[#94A3B8]'}`}
          >
            <span className="text-lg leading-none">{t.icon}</span>
            <span className="text-[10px] font-medium leading-none">
              {t.label}
            </span>
            {t.id === 'agendamentos' && activeBookings.length > 0 && (
              <span className="absolute top-1.5 right-2 w-4 h-4 bg-[#1E3A8A] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {activeBookings.length}
              </span>
            )}
            {t.id === 'notificacoes' && unreadCount > 0 && (
              <span className="absolute top-1.5 right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {certBooking && (
        <CertificateModal
          booking={certBooking}
          studentName={displayNome}
          onClose={() => setCertBooking(null)}
        />
      )}

      {rateBooking && (
        <AvaliarMentorModal
          booking={rateBooking}
          onClose={() => setRateBooking(null)}
          onSaved={(review) => {
            setMyReviews((prev) => ({ ...prev, [review.booking_id]: review }));
            setRateBooking(null);
          }}
        />
      )}

      {showEditProfile && (
        <EditStudentProfileModal
          profileId={profile?.id}
          initial={{ nome: displayNome, cidade: displayCidade }}
          studentInitial={studentProfile}
          onClose={() => setShowEditProfile(false)}
          onSaved={(form) => {
            setProfileOverride({
              nome: form.nome,
              cidade: form.cidade,
              nivel: form.nivel,
              especialidade: form.especialidade,
              crm: form.crm,
              ano_formacao: form.ano_formacao,
            });
            setStudentProfile((prev) => ({ ...prev, ...form }));
            setShowEditProfile(false);
          }}
        />
      )}
    </div>
  );
}
