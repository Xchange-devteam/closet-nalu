// criar-cobranca-asaas — Closet Nalu
// Recebe { itens: [{ produto_id, quantidade, tamanho? }], forma: 'PIX'|'BOLETO', cpf?, telefone? } + JWT.
// Calcula o total com os preços do banco, cria/reusa o cliente no Asaas,
// cria a cobrança no meio escolhido, guarda QR Code Pix / linha do boleto no pedido
// e devolve { pedido_id, invoice_url } para o checkout transparente.
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

const ASAAS_URL = (Deno.env.get('ASAAS_API_URL') ?? '').replace(/\/+$/, '');
const ASAAS_KEY = Deno.env.get('ASAAS_API_KEY') ?? '';
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

async function asaas(path: string, method = 'GET', body?: unknown) {
  const r = await fetch(`${ASAAS_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'closet-nalu',
      access_token: ASAAS_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data: any = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg =
      data?.errors?.map((e: any) => e.description).join('; ') || `HTTP ${r.status}`;
    throw new Error(`Asaas: ${msg}`);
  }
  return data;
}

const soDigitos = (s: unknown) => String(s ?? '').replace(/\D/g, '');

function cpfValido(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const dv = (n: number) => {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += Number(cpf[i]) * (n + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return dv(9) === Number(cpf[9]) && dv(10) === Number(cpf[10]);
}

// Data de vencimento no fuso de Brasília (UTC-3), N dias à frente
function vencimento(dias = 3): string {
  const d = new Date(Date.now() - 3 * 3600_000 + dias * 86400_000);
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'metodo_invalido' }, 405);

  let pedidoId: string | null = null;

  try {
    // 1. Usuário logado
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    const { data: auth, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !auth?.user) return json({ error: 'nao_autenticado' }, 401);
    const user = auth.user;

    // 2. Corpo da requisição
    const body: any = await req.json().catch(() => ({}));
    // Sem forma informada (versão antiga do site) → UNDEFINED: cliente escolhe na página do Asaas
    const forma = body.forma === 'BOLETO' || body.forma === 'PIX' ? body.forma : 'UNDEFINED';
    const itens: any[] = Array.isArray(body.itens) ? body.itens : [];
    if (itens.length === 0 || itens.length > 50) return json({ error: 'sacola_vazia' }, 400);
    for (const it of itens) {
      const q = Number(it?.quantidade);
      if (typeof it?.produto_id !== 'string' || !Number.isInteger(q) || q < 1 || q > 20) {
        return json({ error: 'item_invalido' }, 400);
      }
    }

    // 3. Perfil + CPF
    const { data: perfil } = await admin
      .from('profiles')
      .select('nome, email, telefone, cpf, asaas_customer_id')
      .eq('id', user.id)
      .maybeSingle();

    const cpf = soDigitos(body.cpf) || perfil?.cpf || '';
    if (!cpf) return json({ error: 'cpf_obrigatorio' }, 400);
    if (!cpfValido(cpf)) return json({ error: 'cpf_invalido' }, 400);

    let customerId: string | null = perfil?.asaas_customer_id ?? null;
    if (cpf !== perfil?.cpf) {
      // CPF novo ou alterado → cliente novo no Asaas
      customerId = null;
      await admin.from('profiles').update({ cpf, asaas_customer_id: null }).eq('id', user.id);
    }

    const nome =
      perfil?.nome || user.user_metadata?.full_name || user.user_metadata?.name || user.email;
    const email = perfil?.email || user.email;
    const telefone = soDigitos(body.telefone) || soDigitos(perfil?.telefone);

    // 4. Preços reais do banco (nunca confia no front)
    const ids = [...new Set(itens.map((i) => i.produto_id))];
    const { data: produtos, error: prodErr } = await admin
      .from('produtos')
      .select('id, nome, preco_base, preco_promocional, em_promocao, ativo, tamanhos')
      .in('id', ids);
    if (prodErr) throw prodErr;
    const mapa = new Map<string, any>((produtos ?? []).map((p: any) => [p.id, p]));

    let totalCentavos = 0;
    const linhas: any[] = [];
    for (const it of itens) {
      const p = mapa.get(it.produto_id);
      if (!p || !p.ativo) {
        return json({ error: 'produto_indisponivel', produto_id: it.produto_id }, 400);
      }
      const tamanho = it.tamanho ? String(it.tamanho) : null;
      if (tamanho && Array.isArray(p.tamanhos) && p.tamanhos.length && !p.tamanhos.includes(tamanho)) {
        return json({ error: 'tamanho_invalido', produto_id: p.id }, 400);
      }
      const preco =
        p.em_promocao && p.preco_promocional != null
          ? Number(p.preco_promocional)
          : Number(p.preco_base);
      const centavos = Math.round(preco * 100);
      const qtd = Number(it.quantidade);
      totalCentavos += centavos * qtd;
      linhas.push({
        produto_id: p.id,
        nome_produto: p.nome,
        preco_unit: centavos / 100,
        quantidade: qtd,
        tamanho,
      });
    }
    const total = totalCentavos / 100;
    if (total < 5) return json({ error: 'valor_minimo', minimo: 5 }, 400);

    // 5. Cliente no Asaas (cria uma vez, reusa depois)
    if (!customerId) {
      const cli = await asaas('/customers', 'POST', {
        name: nome,
        cpfCnpj: cpf,
        email,
        ...(telefone.length >= 10 && telefone.length <= 11 ? { mobilePhone: telefone } : {}),
        externalReference: user.id,
      });
      customerId = cli.id;
      await admin.from('profiles').update({ asaas_customer_id: customerId }).eq('id', user.id);
    }

    // 6. Pedido + itens
    const { data: pedido, error: pedErr } = await admin
      .from('pedidos')
      .insert({
        cliente_id: user.id,
        nome_cliente: nome,
        email_cliente: email,
        telefone_cliente: telefone || null,
        total,
        status: 'pendente',
        forma_pagamento: forma === 'UNDEFINED' ? null : forma,
      })
      .select('id')
      .single();
    if (pedErr) throw pedErr;
    pedidoId = pedido.id as string;

    const { error: itErr } = await admin
      .from('pedido_itens')
      .insert(linhas.map((l) => ({ ...l, pedido_id: pedidoId })));
    if (itErr) throw itErr;

    // 7. Cobrança no Asaas, já no meio escolhido
    const cobranca = await asaas('/payments', 'POST', {
      customer: customerId,
      billingType: forma,
      value: total,
      dueDate: vencimento(3),
      description: `Pedido Closet Nalu #${pedidoId.slice(0, 8)}`,
      externalReference: pedidoId,
    });

    // 8. Dados para mostrar no próprio site (falhas aqui não derrubam o pedido)
    const extras: Record<string, unknown> = {};
    if (forma === 'PIX') {
      try {
        const pix = await asaas(`/payments/${cobranca.id}/pixQrCode`);
        extras.pix_qrcode = pix.encodedImage ?? null;
        extras.pix_copia_cola = pix.payload ?? null;
        extras.pix_expira_em = pix.expirationDate
          ? String(pix.expirationDate).replace(' ', 'T') + '-03:00'
          : null;
      } catch (e) {
        console.error('QR Code Pix indisponível:', e);
      }
    } else if (forma === 'BOLETO') {
      extras.boleto_url = cobranca.bankSlipUrl ?? null;
      try {
        const linha = await asaas(`/payments/${cobranca.id}/identificationField`);
        extras.boleto_linha = linha.identificationField ?? null;
      } catch (e) {
        console.error('Linha digitável indisponível:', e);
      }
    }

    await admin
      .from('pedidos')
      .update({
        asaas_payment_id: cobranca.id,
        asaas_invoice_url: cobranca.invoiceUrl,
        ...extras,
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', pedidoId);

    return json({ pedido_id: pedidoId, invoice_url: cobranca.invoiceUrl });
  } catch (e) {
    console.error(e);
    if (pedidoId) {
      await admin
        .from('pedidos')
        .update({ status: 'falhou', atualizado_em: new Date().toISOString() })
        .eq('id', pedidoId);
    }
    return json({ error: 'erro_interno', detalhe: String((e as Error)?.message ?? e) }, 500);
  }
});
