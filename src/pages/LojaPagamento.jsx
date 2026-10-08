import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BarraNav from '../components/BarraNav'
import Cabecalho from '../components/Cabecalho'

const CAMPOS = 'id, total, status, forma_pagamento, pix_qrcode, pix_copia_cola, pix_expira_em, boleto_linha, boleto_url, asaas_invoice_url'

export default function LojaPagamento() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pedido, setPedido] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [copiado, setCopiado] = useState('')

  useEffect(() => {
    let ativo = true
    let timer = null
    async function ciclo() {
      const { data } = await supabase.from('pedidos').select(CAMPOS).eq('id', id).maybeSingle()
      if (ativo === false) return
      setPedido(data || null)
      setCarregando(false)
      if (data && data.status === 'pendente') timer = setTimeout(ciclo, 5000)
    }
    ciclo()
    return () => {
      ativo = false
      if (timer) clearTimeout(timer)
    }
  }, [id])

  function copiar(texto, tipo) {
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(tipo)
      setTimeout(() => setCopiado(''), 2500)
    })
  }

  const brl = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const numero = pedido ? String(pedido.id).slice(0, 8) : ''

  const caixa = { background: '#fafafa', border: '0.5px solid #eee', borderRadius: 10, padding: 14, fontSize: 12, color: '#444', wordBreak: 'break-all', fontFamily: 'monospace', margin: '10px 0' }
  const botao = { width: '100%', height: 48, background: '#AA1B2F', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, letterSpacing: 1, cursor: 'pointer' }
  const botaoClaro = { ...botao, background: '#fff', color: '#AA1B2F', border: '1px solid #AA1B2F', marginTop: 10 }

  let conteudo = null

  if (carregando) {
    conteudo = <div style={{ textAlign: 'center', color: '#999', padding: 40, fontSize: 14 }}>Carregando...</div>
  } else if (pedido == null) {
    conteudo = (
      <div style={{ textAlign: 'center', padding: 30 }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#888', marginBottom: 16 }}>Pedido não encontrado</div>
        <button onClick={() => navigate('/')} style={botao}>Voltar para a loja</button>
      </div>
    )
  } else if (pedido.status === 'pago') {
    conteudo = (
      <div style={{ textAlign: 'center', padding: '30px 10px' }}>
        <div style={{ width: 72, height: 72, borderRadius: 36, background: '#e7f2eb', color: '#2f6249', fontSize: 38, lineHeight: '72px', margin: '0 auto 16px' }}>✓</div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#2f6249', marginBottom: 8 }}>Pagamento confirmado</div>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 6 }}>Obrigada pela sua compra.</div>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 24 }}>Pedido #{numero} · R$ {brl(pedido.total)}</div>
        <button onClick={() => navigate('/')} style={botao}>Continuar comprando</button>
      </div>
    )
  } else if (pedido.status === 'pendente') {
    const temPix = pedido.forma_pagamento === 'PIX' && pedido.pix_copia_cola
    const temBoleto = pedido.forma_pagamento === 'BOLETO' && (pedido.boleto_linha || pedido.boleto_url)
    conteudo = (
      <div style={{ padding: '10px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#999' }}>Pedido #{numero}</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: '#AA1B2F', marginTop: 4 }}>R$ {brl(pedido.total)}</div>
        </div>

        {temPix && (
          <div>
            <div style={{ fontSize: 14, color: '#333', textAlign: 'center', marginBottom: 12 }}>Pague com Pix</div>
            {pedido.pix_qrcode && (
              <img src={'data:image/png;base64,' + pedido.pix_qrcode} alt="QR Code Pix" style={{ display: 'block', width: 220, height: 220, margin: '0 auto' }} />
            )}
            <div style={{ fontSize: 12, color: '#777', textAlign: 'center', margin: '12px 0 4px' }}>Ou copie o código Pix e cole no app do seu banco:</div>
            <div style={caixa}>{pedido.pix_copia_cola}</div>
            <button onClick={() => copiar(pedido.pix_copia_cola, 'pix')} style={botao}>{copiado === 'pix' ? 'Código copiado ✓' : 'Copiar código Pix'}</button>
          </div>
        )}

        {temBoleto && (
          <div>
            <div style={{ fontSize: 14, color: '#333', textAlign: 'center', marginBottom: 12 }}>Pague com boleto</div>
            {pedido.boleto_linha && (
              <>
                <div style={{ fontSize: 12, color: '#777', textAlign: 'center' }}>Linha digitável:</div>
                <div style={caixa}>{pedido.boleto_linha}</div>
                <button onClick={() => copiar(pedido.boleto_linha, 'boleto')} style={botao}>{copiado === 'boleto' ? 'Linha copiada ✓' : 'Copiar linha digitável'}</button>
              </>
            )}
            {pedido.boleto_url && (
              <button onClick={() => window.open(pedido.boleto_url, '_blank')} style={pedido.boleto_linha ? botaoClaro : botao}>Abrir boleto (PDF)</button>
            )}
            <div style={{ fontSize: 11, color: '#999', textAlign: 'center', marginTop: 10 }}>O boleto pode levar até 3 dias úteis para ser compensado.</div>
          </div>
        )}

        {(temPix || temBoleto) ? null : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 14 }}>Finalize o pagamento na página segura do nosso parceiro:</div>
            <button onClick={() => { window.location.href = pedido.asaas_invoice_url }} style={botao}>Ir para o pagamento</button>
          </div>
        )}

        <div style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 22 }}>⏳ Aguardando pagamento. Esta página atualiza sozinha quando o pagamento for confirmado.</div>
      </div>
    )
  } else {
    const textos = { cancelado: 'Este pedido foi cancelado.', estornado: 'O pagamento deste pedido foi estornado.', falhou: 'Não foi possível gerar o pagamento deste pedido.' }
    conteudo = (
      <div style={{ textAlign: 'center', padding: 30 }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#888', marginBottom: 8 }}>{textos[pedido.status] || 'Pedido indisponível.'}</div>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 20 }}>Pedido #{numero}</div>
        <button onClick={() => navigate('/')} style={botao}>Voltar para a loja</button>
      </div>
    )
  }

  return (
    <>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff', fontFamily: 'Arial, sans-serif', paddingBottom: 90 }}>
        <Cabecalho tela="Pagamento" />
        <div style={{ maxWidth: 480, margin: '0 auto', width: '100%', padding: '14px 18px', boxSizing: 'border-box' }}>
          {conteudo}
        </div>
      </div>
      <BarraNav />
    </>
  )
}
