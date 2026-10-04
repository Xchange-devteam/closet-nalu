// webhook-asaas — Closet Nalu
// Recebe eventos do Asaas e atualiza o status do pedido.
// Segurança: só aceita chamadas com o header asaas-access-token = ASAAS_WEBHOOK_TOKEN.
import { createClient } from 'npm:@supabase/supabase-js@2';

const TOKEN = Deno.env.get('ASAAS_WEBHOOK_TOKEN') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';

function serviceKey(): string {
  const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (legacy) return legacy;
  try {
    const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}');
    return keys.default ?? (Object.values(keys)[0] as string) ?? '';
  } catch {
    return '';
  }
}

const admin = createClient(SUPABASE_URL, serviceKey(), {
  auth: { persistSession: false },
});

// Evento do Asaas → novo status, e de quais status o pedido pode vir
const REGRAS: Record<string, { novo: string; de: string[] }> = {
  PAYMENT_CONFIRMED: { novo: 'pago', de: ['pendente', 'falhou'] },
  PAYMENT_RECEIVED: { novo: 'pago', de: ['pendente', 'falhou'] },
  PAYMENT_RECEIVED_IN_CASH: { novo: 'pago', de: ['pendente', 'falhou'] },
  PAYMENT_REFUNDED: { novo: 'estornado', de: ['pago'] },
  PAYMENT_PARTIALLY_REFUNDED: { novo: 'estornado', de: ['pago'] },
  PAYMENT_DELETED: { novo: 'cancelado', de: ['pendente'] },
};

const ok = () =>
  new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method !== 'POST') return ok();

  // 1. Confere o token secreto
  const recebido = req.headers.get('asaas-access-token') ?? '';
  if (TOKEN === '' || recebido !== TOKEN) {
    return new Response('unauthorized', { status: 401 });
  }

  // 2. Processa o evento (sempre responde 200 para não travar a fila do Asaas)
  try {
    const evento: any = await req.json();
    const regra = REGRAS[evento?.event];
    const pagamento = evento?.payment;
    if (regra === undefined || typeof pagamento?.id !== 'string') return ok();

    const { data, error } = await admin
      .from('pedidos')
      .update({ status: regra.novo, atualizado_em: new Date().toISOString() })
      .eq('asaas_payment_id', pagamento.id)
      .in('status', regra.de)
      .select('id, status');

    if (error) console.error('Erro ao atualizar pedido:', error);
    else console.log(`${evento.event} → ${pagamento.id}:`, JSON.stringify(data));
  } catch (e) {
    console.error('Webhook inválido:', e);
  }

  return ok();
});
