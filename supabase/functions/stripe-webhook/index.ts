import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Assinatura ausente', { status: 400 })
  }

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
    )
  } catch (err) {
    console.error('Webhook signature error:', err)
    return new Response(`Assinatura inválida: ${err.message}`, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      await supabase
        .from('payments')
        .update({
          status: 'pago',
          stripe_payment_intent: session.payment_intent as string ?? null,
          metodo_pagamento: 'card',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_session_id', session.id)
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session

      await supabase
        .from('payments')
        .update({
          status: 'expirado',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_session_id', session.id)
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return new Response('Erro interno', { status: 500 })
  }
})
