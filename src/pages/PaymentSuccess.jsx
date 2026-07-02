import { useNavigate } from 'react-router-dom'

export default function PaymentSuccess() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] w-full max-w-md p-8 text-center">
        {/* Ícone de sucesso */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, #059669, #0F766E)' }}
        >
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-[#1E293B] mb-2">
          Pagamento confirmado!
        </h1>
        <p className="text-[#64748B] mb-1">
          Sua vaga está garantida.
        </p>
        <p className="text-sm text-[#94A3B8] mb-8">
          Você receberá os detalhes da mentoria por e-mail. Acompanhe o status em Agendamentos.
        </p>

        <button
          onClick={() => navigate('/home')}
          className="w-full py-3 rounded-xl bg-[#1E3A8A] text-white font-semibold hover:bg-[#1e40af] transition-colors"
        >
          Ir para meus agendamentos
        </button>
      </div>
    </div>
  )
}
