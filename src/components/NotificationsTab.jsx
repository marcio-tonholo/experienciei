import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const TIPO = {
  mensagem_privada: { icon: '💬', bg: 'bg-blue-50',   text: 'text-blue-600'   },
  mensagem_turma:   { icon: '👥', bg: 'bg-purple-50', text: 'text-purple-600' },
  booking_status:   { icon: '📋', bg: 'bg-green-50',  text: 'text-green-600'  },
  offering_editado: { icon: '✏️', bg: 'bg-amber-50',  text: 'text-amber-600'  },
}

function fmtRel(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'agora'
  if (m < 60) return `${m}min`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

export default function NotificationsTab({ profileId, onOpen }) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profileId) return
    load()
  }, [profileId])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profileId)
      .order('created_at', { ascending: false })
      .limit(60)
    setNotifications((data || []).map(n => ({ ...n, lida: true })))
    setLoading(false)
    onOpen?.()
    await supabase.from('notifications').update({ lida: true })
      .eq('user_id', profileId).eq('lida', false)
  }

  function handleClick(n) {
    if (n.offering_id) navigate(`/offering/${n.offering_id}`)
  }

  const unread = notifications.filter(n => !n.lida).length

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Notificações</h2>
          {unread > 0 && (
            <p className="text-sm text-[#64748B]">{unread} não lida{unread !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-4 border-[#1E3A8A] border-t-transparent animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#CBD5E1]">
          <p className="text-4xl mb-3">🔔</p>
          <p className="font-semibold text-[#1E293B] mb-1">Nenhuma notificação</p>
          <p className="text-sm text-[#64748B]">Avisos sobre mentorias e mensagens aparecerão aqui</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const cfg = TIPO[n.tipo] || { icon: '🔔', bg: 'bg-gray-50', text: 'text-gray-600' }
            return (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-colors ${
                  n.lida
                    ? 'bg-white border-[#E2E8F0] hover:border-[#93C5FD]'
                    : 'bg-[#EFF6FF] border-[#BFDBFE] hover:border-[#60A5FA]'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold leading-snug ${n.lida ? 'text-[#374151]' : 'text-[#1E293B]'}`}>
                      {n.titulo}
                    </p>
                    <span className="text-[10px] text-[#94A3B8] flex-shrink-0 mt-0.5">{fmtRel(n.created_at)}</span>
                  </div>
                  {n.corpo && (
                    <p className="text-xs text-[#64748B] mt-0.5 line-clamp-2">{n.corpo}</p>
                  )}
                </div>
                {!n.lida && (
                  <div className="w-2 h-2 rounded-full bg-[#2563EB] mt-1.5 flex-shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
