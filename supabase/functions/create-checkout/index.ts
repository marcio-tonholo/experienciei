import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

// Admin client (service role) — para upsert de payments e verificação de auth
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    // ── 1. Autenticação ────────────────────────────────────────────────────────
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return new Response(JSON.stringify({ error: 'Token ausente' }), {
        status: 401,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token)
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Não autenticado' }), {
        status: 401,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // ── 2. Dados da requisição ─────────────────────────────────────────────────
    const { booking_id, origin } = await req.json()
    if (!booking_id) {
      return new Response(JSON.stringify({ error: 'booking_id obrigatório' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const appOrigin = origin ?? 'http://localhost:5173'

    // ── 3. Buscar booking usando JWT do aluno (RLS: aluno vê próprios bookings) ─
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    const { data: booking, error: bookingErr } = await supabaseUser
      .from('bookings')
      .select('*, offerings(id, titulo, preco, procedures(nome))')
      .eq('id', booking_id)
      .eq('aluno_id', user.id)
      .eq('status', 'confirmado')
      .single()

    if (bookingErr || !booking) {
      return new Response(JSON.stringify({
        error: 'Booking não encontrado ou não confirmado',
        debug: { booking_id, aluno_id: user.id, bookingErr: bookingErr?.message ?? null }
      }), {
        status: 404,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // ── 4. Verificar se já há pagamento aprovado ───────────────────────────────
    const { data: existing } = await supabaseAdmin
      .from('payments')
      .select('id, status')
      .eq('booking_id', booking_id)
      .maybeSingle()

    if (existing?.status === 'pago') {
      return new Response(JSON.stringify({ already_paid: true }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // ── 5. Criar Stripe Checkout Session ──────────────────────────────────────
    const nomeProcedimento = booking.offerings?.procedures?.nome ?? booking.offerings?.titulo ?? 'Mentoria'
    const valorCentavos = Math.round(Number(booking.offerings.preco) * 100)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      currency: 'brl',
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: nomeProcedimento,
            description: `Vaga em mentoria — Experenciei`,
          },
          unit_amount: valorCentavos,
        },
        quantity: 1,
      }],
      success_url: `${appOrigin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appOrigin}/home`,
      metadata: {
        booking_id: booking.id,
        aluno_id: booking.aluno_id,
        mentor_id: booking.mentor_id,
        offering_id: booking.offering_id,
      },
    })

    // ── 6. Salvar/atualizar registro de pagamento (service role bypassa RLS) ───
    await supabaseAdmin.from('payments').upsert({
      booking_id: booking.id,
      aluno_id:   booking.aluno_id,
      mentor_id:  booking.mentor_id,
      offering_id: booking.offering_id,
      valor_bruto: booking.offerings.preco,
      stripe_session_id: session.id,
      status: 'pendente',
    }, { onConflict: 'booking_id' })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('create-checkout error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
