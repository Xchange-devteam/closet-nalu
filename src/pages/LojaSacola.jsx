import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSacola } from '../lib/sacola'
import BarraNav from '../components/BarraNav'
import Cabecalho from '../components/Cabecalho'

export default function LojaSacola() {
  const { itens, mudarQtd, remover, limpar, total, qtdTotal } = useSacola()
  const navigate = useNavigate()

  const [cpf, setCpf] = useState('')
  const [pedirCpf, setPedirCpf] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const mascaraCpf = (v) => String(v).replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')

  const MENSAGENS = {
    cpf_obrigatorio: 'Informe seu CPF para gerar o pagamento.',
    cpf_invalido: 'CPF inválido. Confira os números.',
    produto_indisponivel: 'Um dos produtos da sacola não está mais disponível.',
    tamanho_invalido: 'Um dos tamanhos escolhidos não está mais disponível.',
    valor_minimo: 'O valor mínimo para pagamento é R$ 5,00.',
    nao_autenticado: 'Sua sessão expirou. Entre novamente.',
  }

  async function finalizar() {
    if (enviando) return
    setErro('')
    const { data } = await supabase.auth.getSession()
    const sessao = data && data.session
    if (sessao == null) {
      navigate('/entrar')
      return
    }

    const cpfDigitos = cpf.replace(/\D/g, '')
    if (pedirCpf === false) {
      const { data: perfil } = await supabase.from('profiles').select('cpf').eq('id', sessao.user.id).maybeSingle()
      const temCpf = Boolean(perfil && perfil.cpf)
      if (temCpf === false) {
        setPedirCpf(true)
        return
      }
    } else if (cpfDigitos.length < 11) {
      setErro('Informe os 11 dígitos do CPF.')
      return
    }

    setEnviando(true)
    try {
      const { data: res, error } = await supabase.functions.invoke('swift-responder', {
        body: {
          itens: itens.map((i) => ({ produto_id: i.id, quantidade: i.quantidade, tamanho: i.tamanho })),
          cpf: pedirCpf ? cpfDigitos : undefined,
        },
      })
      if (error) {
        let codigo = ''
        try { const corpo = await error.context.json(); codigo = corpo.error } catch (e) { /* ignora */ }
        if (codigo === 'cpf_obrigatorio' || codigo === 'cpf_invalido') setPedirCpf(true)
        setErro(MENSAGENS[codigo] || 'Não foi possível gerar o pagamento. Tente novamente.')
        setEnviando(false)
        return
      }
      limpar()
      window.location.href = res.invoice_url
    } catch (e) {
      setErro('Não foi possível gerar o pagamento. Tente novamente.')
      setEnviando(false)
    }
  }

  const brl = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <>
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff', fontFamily: 'Arial, sans-serif', paddingBottom: 90 }}>

      <Cabecalho tela="Sacola" />

      {itens.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 30 }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#888' }}>Sua sacola está vazia</div>
          <button onClick={() => navigate('/todas')} style={{ padding: '12px 24px', background: '#AA1B2F', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>Ver a coleção</button>
        </div>
      ) : (
        <>
          <div style={{ flex: 1, overflowY: 'auto', maxWidth: 560, margin: '0 auto', width: '100%', padding: '14px 18px' }}>
            {itens.map((i) => (
              <div key={i.chave} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '0.5px solid #f1f1f1' }}>
                <div style={{ width: 64, height: 80, borderRadius: 6, background: '#eee', flexShrink: 0, overflow: 'hidden' }}>
                  {i.foto && <img src={i.foto} alt={i.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 14 }}>{i.nome}</div>
                  {i.tamanho && <div style={{ fontSize: 11, color: '#999', margin: '2px 0' }}>Tamanho: {i.tamanho}</div>}
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#AA1B2F' }}>R$ {brl(i.preco)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                    <span onClick={() => mudarQtd(i.chave, -1)} style={{ width: 26, height: 26, border: '0.5px solid #ccc', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>−</span>
                    <span style={{ fontSize: 14, minWidth: 16, textAlign: 'center' }}>{i.quantidade}</span>
                    <span onClick={() => mudarQtd(i.chave, 1)} style={{ width: 26, height: 26, border: '0.5px solid #ccc', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</span>
                    <span onClick={() => remover(i.chave)} style={{ marginLeft: 'auto', color: '#c0392b', fontSize: 12, cursor: 'pointer' }}>remover</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '0.5px solid #eee', padding: '16px 18px', background: '#fafafa', maxWidth: 560, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13, color: '#666' }}>
              <span>Subtotal ({qtdTotal} {qtdTotal === 1 ? 'item' : 'itens'})</span>
              <span>R$ {brl(total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontSize: 16, fontWeight: 500, color: '#222' }}>
              <span>Total</span>
              <span style={{ color: '#AA1B2F' }}>R$ {brl(total)}</span>
            </div>
            {pedirCpf && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>CPF (necessário para o pagamento)</label>
                <input value={cpf} onChange={(e) => setCpf(mascaraCpf(e.target.value))} inputMode="numeric" placeholder="000.000.000-00" style={{ width: '100%', height: 44, padding: '0 12px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 16, boxSizing: 'border-box' }} />
              </div>
            )}
            {erro && <div style={{ color: '#c0392b', fontSize: 13, marginBottom: 10 }}>{erro}</div>}
            <button onClick={finalizar} disabled={enviando} style={{ width: '100%', height: 48, background: '#AA1B2F', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, letterSpacing: 1, cursor: enviando ? 'default' : 'pointer', opacity: enviando ? 0.7 : 1 }}>{enviando ? 'Gerando pagamento...' : 'Finalizar pedido'}</button>
          </div>
        </>
      )}
    </div>
      <BarraNav />
    </>
  )
}
