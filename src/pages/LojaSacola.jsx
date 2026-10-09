import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSacola } from '../lib/sacola'
import BarraNav from '../components/BarraNav'
import Cabecalho from '../components/Cabecalho'

// Pix fica oculto ate a chave Pix ser cadastrada no Asaas; depois mude para true
const PIX_ATIVO = true
const OPCOES_PAGAMENTO = PIX_ATIVO ? [['PIX', 'Pix'], ['BOLETO', 'Boleto'], ['CARTAO', 'Cartão']] : [['BOLETO', 'Boleto'], ['CARTAO', 'Cartão']]

const BANDEIRAS = [
  { id: 'visa', nome: 'Visa', arquivo: 'visa.webp' },
  { id: 'mastercard', nome: 'Mastercard', arquivo: 'mastercard.webp' },
  { id: 'elo', nome: 'Elo', arquivo: 'elo.svg' },
  { id: 'amex', nome: 'Amex', arquivo: 'amex.webp' },
  { id: 'hipercard', nome: 'Hipercard', arquivo: 'hipercard.webp' },
]

const CAMPO = { flex: 1, minWidth: 0, width: '100%', height: 44, padding: '0 12px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 16, boxSizing: 'border-box' }
const soNum = (v) => String(v || '').replace(/\D/g, '')
const mascaraCartao = (v) => soNum(v).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ')
const mascaraValidade = (v) => { const d = soNum(v).slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d }
const mascaraCep = (v) => { const d = soNum(v).slice(0, 8); return d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d }
const mascaraFone = (v) => {
  const d = soNum(v).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2)
  return '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(d.length - 4)
}

// Mostra o logo de public/bandeiras/<arquivo>; se a imagem falhar, mostra o nome
function Bandeira({ arquivo, nome }) {
  const [semImagem, setSemImagem] = useState(false)
  if (semImagem) return <span style={{ fontSize: 11, color: '#555', border: '0.5px solid #ddd', borderRadius: 4, padding: '3px 7px', background: '#fafafa' }}>{nome}</span>
  return <img src={'/bandeiras/' + arquivo} alt={nome} onError={() => setSemImagem(true)} style={{ height: 22, width: 'auto' }} />
}

export default function LojaSacola() {
  const { itens, mudarQtd, remover, limpar, total, qtdTotal } = useSacola()
  const navigate = useNavigate()

  const [cpf, setCpf] = useState('')
  const [pedirCpf, setPedirCpf] = useState(false)
  const [nome, setNome] = useState('')
  const [pedirNome, setPedirNome] = useState(false)
  const [verificado, setVerificado] = useState(false)
  const [forma, setForma] = useState(PIX_ATIVO ? 'PIX' : 'BOLETO')
  const [parcelas, setParcelas] = useState(1)
  const [cartao, setCartao] = useState({ numero: '', nome: '', validade: '', cvv: '', cpf: '', cep: '', numeroEnd: '', telefone: '' })
  const mudarCartao = (campo, valor) => setCartao((c) => ({ ...c, [campo]: valor }))
  function cartaoValido() {
    const partes = cartao.validade.split('/')
    const mes = Number(partes[0])
    const n = soNum(cartao.numero).length
    const fone = soNum(cartao.telefone).length
    return n >= 13 && n <= 19 && cartao.nome.trim().length >= 3 && mes >= 1 && mes <= 12 && soNum(partes[1]).length === 2 &&
      soNum(cartao.cvv).length >= 3 && soNum(cartao.cpf).length === 11 && soNum(cartao.cep).length === 8 &&
      cartao.numeroEnd.trim().length >= 1 && fone >= 10 && fone <= 11
  }
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
    cartao_incompleto: 'Confira os dados do cartão e do titular.',
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
    const nomeLimpo = nome.trim()
    if (verificado === false) {
      const { data: perfil } = await supabase.from('profiles').select('cpf, nome').eq('id', sessao.user.id).maybeSingle()
      const faltaCpf = Boolean(perfil && perfil.cpf) === false
      const faltaNome = Boolean(perfil && perfil.nome && perfil.nome.trim()) === false
      setVerificado(true)
      if (faltaCpf || faltaNome) {
        setPedirCpf(faltaCpf)
        setPedirNome(faltaNome)
        return
      }
    }
    if (pedirNome && nomeLimpo.length < 3) {
      setErro('Informe seu nome completo.')
      return
    }
    if (pedirCpf && cpfDigitos.length < 11) {
      setErro('Informe os 11 dígitos do CPF.')
      return
    }

    if (forma === 'CARTAO' && cartaoValido() === false) {
      setErro('Confira os dados do cartão: número, nome, validade, CVV, CPF do titular, CEP, número do endereço e celular.')
      return
    }

    setEnviando(true)
    try {
      if (pedirNome) {
        const { error: erroNome } = await supabase.from('profiles').update({ nome: nomeLimpo }).eq('id', sessao.user.id)
        if (erroNome) {
          setErro('Não foi possível salvar seu nome. Tente novamente.')
          setEnviando(false)
          return
        }
      }
      const { data: res, error } = await supabase.functions.invoke('swift-responder', {
        body: {
          itens: itens.map((i) => ({ produto_id: i.id, quantidade: i.quantidade, tamanho: i.tamanho })),
          cpf: pedirCpf ? cpfDigitos : undefined,
          forma,
          parcelas: forma === 'CARTAO' ? parcelas : undefined,
          cartao: forma === 'CARTAO' ? { nome: cartao.nome, numero: soNum(cartao.numero), mes: cartao.validade.split('/')[0], ano: '20' + soNum(cartao.validade.split('/')[1]), cvv: soNum(cartao.cvv) } : undefined,
          titular: forma === 'CARTAO' ? { cpf: soNum(cartao.cpf), cep: soNum(cartao.cep), numero: cartao.numeroEnd, telefone: soNum(cartao.telefone) } : undefined,
        },
      })
      if (error) {
        let codigo = ''
        let detalhe = ''
        try { const corpo = await error.context.json(); codigo = corpo.error; detalhe = corpo.detalhe || '' } catch (e) { /* ignora */ }
        if (codigo === 'cpf_obrigatorio' || codigo === 'cpf_invalido') setPedirCpf(true)
        setErro(codigo === 'cartao_recusado' ? 'Pagamento não aprovado' + (detalhe ? ': ' + detalhe : '.') + ' Confira os dados ou tente outro cartão.' : (MENSAGENS[codigo] || 'Não foi possível gerar o pagamento. Tente novamente.'))
        setEnviando(false)
        return
      }
      limpar()
      navigate('/pagamento/' + res.pedido_id)
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
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Forma de pagamento</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {OPCOES_PAGAMENTO.map(([valor, rotulo]) => (
                  <span key={valor} onClick={() => setForma(valor)} style={{ flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: 8, cursor: 'pointer', fontSize: 14, border: '1px solid ' + (forma === valor ? '#AA1B2F' : '#ddd'), color: forma === valor ? '#AA1B2F' : '#666', background: forma === valor ? '#fdf2f3' : '#fff', fontWeight: forma === valor ? 600 : 400 }}>{rotulo}</span>
                ))}
              </div>
            </div>
            {forma === 'CARTAO' && (
              <div style={{ marginBottom: 12, padding: 12, border: '0.5px solid #eee', borderRadius: 8, background: '#fff' }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Parcelas</div>
                <select value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))} style={{ width: '100%', height: 44, padding: '0 10px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 16, background: '#fff', boxSizing: 'border-box' }}>
                  {[1, 2, 3].map((n) => (
                    <option key={n} value={n}>{n === 1 ? '1x de R$ ' + brl(total) + ' à vista' : n + 'x de R$ ' + brl(total / n) + ' sem juros'}</option>
                  ))}
                </select>
                <div style={{ fontSize: 12, color: '#555', margin: '12px 0 6px', textAlign: 'center' }}>Aceitamos todos os cartões</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                  {BANDEIRAS.map((b) => <Bandeira key={b.id} arquivo={b.arquivo} nome={b.nome} />)}
                </div>
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input value={cartao.numero} onChange={(e) => mudarCartao('numero', mascaraCartao(e.target.value))} inputMode="numeric" autoComplete="cc-number" placeholder="Número do cartão" style={CAMPO} />
                  <input value={cartao.nome} onChange={(e) => mudarCartao('nome', e.target.value.toUpperCase())} autoComplete="cc-name" placeholder="Nome impresso no cartão" style={CAMPO} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={cartao.validade} onChange={(e) => mudarCartao('validade', mascaraValidade(e.target.value))} inputMode="numeric" autoComplete="cc-exp" placeholder="Validade MM/AA" style={CAMPO} />
                    <input value={cartao.cvv} onChange={(e) => mudarCartao('cvv', soNum(e.target.value).slice(0, 4))} inputMode="numeric" autoComplete="cc-csc" placeholder="CVV" style={CAMPO} />
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>Dados do titular do cartão</div>
                  <input value={cartao.cpf} onChange={(e) => mudarCartao('cpf', mascaraCpf(e.target.value))} inputMode="numeric" placeholder="CPF do titular" style={CAMPO} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={cartao.cep} onChange={(e) => mudarCartao('cep', mascaraCep(e.target.value))} inputMode="numeric" autoComplete="postal-code" placeholder="CEP" style={CAMPO} />
                    <input value={cartao.numeroEnd} onChange={(e) => mudarCartao('numeroEnd', e.target.value.slice(0, 10))} placeholder="Nº" style={{ ...CAMPO, flex: 'none', width: 90 }} />
                  </div>
                  <input value={cartao.telefone} onChange={(e) => mudarCartao('telefone', mascaraFone(e.target.value))} inputMode="tel" autoComplete="tel" placeholder="Celular com DDD" style={CAMPO} />
                </div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 10, textAlign: 'center' }}>🔒 Pagamento processado com segurança pelo Asaas. Não guardamos os dados do seu cartão.</div>
              </div>
            )}
            {pedirNome && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>Nome completo</label>
                <input value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" placeholder="Seu nome e sobrenome" style={{ width: '100%', height: 44, padding: '0 12px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 16, boxSizing: 'border-box' }} />
              </div>
            )}
            {pedirCpf && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>CPF (necessário para o pagamento)</label>
                <input value={cpf} onChange={(e) => setCpf(mascaraCpf(e.target.value))} inputMode="numeric" placeholder="000.000.000-00" style={{ width: '100%', height: 44, padding: '0 12px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 16, boxSizing: 'border-box' }} />
              </div>
            )}
            {erro && <div style={{ color: '#c0392b', fontSize: 13, marginBottom: 10 }}>{erro}</div>}
            <button onClick={finalizar} disabled={enviando} style={{ width: '100%', height: 48, background: '#AA1B2F', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, letterSpacing: 1, cursor: enviando ? 'default' : 'pointer', opacity: enviando ? 0.7 : 1 }}>{enviando ? (forma === 'CARTAO' ? 'Processando pagamento...' : 'Gerando pagamento...') : (forma === 'CARTAO' ? 'Pagar R$ ' + brl(total) : 'Finalizar pedido')}</button>
          </div>
        </>
      )}
    </div>
      <BarraNav />
    </>
  )
}
