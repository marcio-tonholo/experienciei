import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const REQUIRED_DOCS = [
  { tipo: 'identidade', label: 'Documento de Identidade', icon: '🪪' },
  { tipo: 'crm',        label: 'CRM',                     icon: '🏥' },
]

const ACCEPT_TYPES = 'application/pdf,image/jpeg,image/jpg,image/png'
const MAX_MB = 10

export default function DocumentsTab({ profileId }) {
  const [docs, setDocs]           = useState({})
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(null)
  const [error, setError]         = useState('')
  const fileRefs = useRef({})

  useEffect(() => { if (profileId) loadDocs() }, [profileId])

  async function loadDocs() {
    setLoading(true)
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('profile_id', profileId)
      .order('data', { ascending: false })
    if (data) {
      const latest = {}
      for (const row of data) {
        if (!latest[row.tipo]) latest[row.tipo] = row
      }
      setDocs(latest)
    }
    setLoading(false)
  }

  async function handleUpload(tipo, file) {
    setError('')
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(file.type)) {
      setError('Formato inválido. Use PDF ou imagem (JPG, PNG).')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Arquivo muito grande. Limite: ${MAX_MB}MB.`)
      return
    }

    setUploading(tipo)
    const ext  = file.name.split('.').pop().toLowerCase()
    const path = `${profileId}/${tipo}-${Date.now()}.${ext}`

    const { error: stErr } = await supabase.storage
      .from('documents')
      .upload(path, file)

    if (stErr) {
      setError(stErr.message)
      setUploading(null)
      return
    }

    const { error: dbErr } = await supabase
      .from('documents')
      .insert({ profile_id: profileId, tipo, arquivo: path, status: 'enviado' })

    setUploading(null)
    if (dbErr) { setError(dbErr.message); return }
    await loadDocs()
  }

  async function handleView(path) {
    const { data, error: signErr } = await supabase.storage
      .from('documents')
      .createSignedUrl(path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    if (signErr) setError('Não foi possível abrir o documento.')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-7 h-7 rounded-full border-4 border-[#1E3A8A] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {REQUIRED_DOCS.map(({ tipo, label, icon }) => {
        const doc         = docs[tipo]
        const isUploading = uploading === tipo

        return (
          <div key={tipo} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-xl flex-shrink-0">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#1E293B] text-sm">{label}</p>
              {doc?.data && (
                <p className="text-xs text-[#94A3B8]">
                  Enviado em {new Date(doc.data).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${doc ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {doc ? 'Enviado' : 'Não enviado'}
              </span>
              <div className="flex items-center gap-2">
                {doc && (
                  <button
                    onClick={() => handleView(doc.arquivo)}
                    className="text-xs text-[#64748B] font-medium hover:underline"
                  >
                    Ver
                  </button>
                )}
                {!doc && (
                  <>
                    <input
                      ref={el => { fileRefs.current[tipo] = el }}
                      type="file"
                      accept={ACCEPT_TYPES}
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0]
                        if (f) handleUpload(tipo, f)
                        e.target.value = ''
                      }}
                    />
                    <button
                      onClick={() => fileRefs.current[tipo]?.click()}
                      disabled={!!uploading}
                      className="text-xs text-[#2563EB] font-medium hover:underline disabled:opacity-50"
                    >
                      {isUploading ? 'Enviando...' : 'Enviar'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
          {error}
        </p>
      )}
    </div>
  )
}
