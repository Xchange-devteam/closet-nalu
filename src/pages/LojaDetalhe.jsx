import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSacola } from '../lib/sacola'
import { useFavoritos } from '../lib/favoritos'
import { corFundo } from '../lib/cores'
import Cabecalho from '../components/Cabecalho'
import BarraNav from '../components/BarraNav'

const WHATSAPP = '5522997718930'

export default function LojaDetalhe() {
  const { id } = useParams()
  const [peca, setPeca] = useState(null)
  const [fotos, setFotos] = useState([])
  const [idx, setIdx] = useState(0)
  const [tamanho, setTamanho] = useState(null)
  const [cor, setCor] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const navigate = useNavigate()
  const { adicionar } = useSacola()
  const { ehFavorito, alternar } = useFavoritos()

  useEffect(() => { carregar() }, [id])

  async function carregar() {
    const { data } = await supabase
      .from('produtos')
      .select('id, nome, descricao, tamanhos, preco_base, percentual_desconto, preco_promocional, parcelas, produto_fotos(url, ordem), produto_variantes(tamanho, cor, estoque)')
      .eq('id', id)
      .single()
    if (data) {
      setPeca(data)
      setFotos((data.produto_fotos || []).sort((a, b) => a.ordem - b.ordem))
    }
    setCarregando(false)
  }

  const brl = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const temTamanho = peca?.tamanhos && peca.tamanhos.length > 0
  // Variantes (tamanho x cor com estoque). Peca sem variantes funciona como antes.
  const variantes = peca?.produto_variantes || []
  const temCor = variantes.length > 0
  const cores = [...new Set(variantes.map((v) => v.cor))]
  const estoqueDe = (t, c) => {
    const v = variantes.find((x) => x.tamanho === t && x.cor === c)
    return v ? v.estoque : 0
  }
  const tamDisponivel = (t) => !temCor || variantes.some((v) => v.tamanho === t && v.estoque > 0)
  const corDisponivel = (c) => variantes.some((v) => v.cor === c && v.estoque > 0 && (!tamanho || v.tamanho === tamanho))
  const semEstoque = temCor && !variantes.some((v) => v.estoque > 0)
  const podeComprar = !semEstoque && (!temTamanho || tamanho) && (!temCor || (cor && estoqueDe(tamanho, cor) > 0))

  function escolherTamanho(t) {
    if (!tamDisponivel(t)) return
    setTamanho(t)
    if (cor && estoqueDe(t, cor) <= 0) setCor(null)
  }

  const [adicionado, setAdicionado] = useState(false)

  function adicionarSacola() {
    if (!podeComprar) return
    adicionar(peca, tamanho, cor)
    setAdicionado(true)
    setTimeout(() => setAdicionado(false), 2000)
  }

  function comprarWhats() {
    const msg = `Olá! Tenho interesse na peça: ${peca.nome}${tamanho ? ' (tam ' + tamanho + ')' : ''}${cor ? ' (cor ' + cor + ')' : ''} - R$ ${brl(peca.preco_promocional)}`
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (carregando) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontFamily: 'Arial' }}>Carregando...</div>
  if (!peca) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontFamily: 'Arial' }}>Peça não encontrada.</div>

  const valorParcela = peca.parcelas > 0 ? peca.preco_promocional / peca.parcelas : peca.preco_promocional

  return (
    <>
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif', paddingBottom: 90 }}>

      <div style={{ position: 'relative' }}>
        <Cabecalho tela={peca.nome} />
        <span onClick={() => alternar(peca.id)} style={{ position: 'absolute', top: 20, right: 50, fontSize: 20, cursor: 'pointer', color: ehFavorito(peca.id) ? '#e74c3c' : '#333' }}>{ehFavorito(peca.id) ? '♥' : '♡'}</span>
        <span onClick={() => navigate('/sacola')} style={{ position: 'absolute', top: 20, right: 16, fontSize: 20, cursor: 'pointer' }}>🛍</span>
      </div>

      <div style={{ maxWidth: 460, margin: '0 auto', padding: 18 }}>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ position: 'relative', width: 240, background: '#fff', borderRadius: 8, overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate('/peca/' + peca.id)}>
            {fotos[idx]?.url && <img src={fotos[idx].url} alt={peca.nome} style={{ width: '100%', height: 'auto', display: 'block' }} />}
            <span style={{ position: 'absolute', bottom: 8, right: 8, color: '#fff', fontSize: 10, background: 'rgba(0,0,0,0.5)', padding: '3px 8px', borderRadius: 10 }}>toque para ampliar</span>
          </div>
        </div>

        {fotos.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 18 }}>
            {fotos.map((f, k) => (
              <div key={k} onClick={() => setIdx(k)} style={{ width: 44, height: 58, borderRadius: 5, overflow: 'hidden', border: k === idx ? '1.5px solid #AA1B2F' : '0.5px solid #ddd', cursor: 'pointer' }}>
                <img src={f.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
              </div>
            ))}
          </div>
        )}

        <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#222', marginBottom: 8 }}>{peca.nome}</div>

        <div style={{ marginBottom: 4 }}>
          {peca.percentual_desconto > 0 && <span style={{ textDecoration: 'line-through', color: '#aaa', fontSize: 14 }}>R$ {brl(peca.preco_base)}</span>}
          <span style={{ fontSize: 22, fontWeight: 500, color: '#AA1B2F', marginLeft: peca.percentual_desconto > 0 ? 8 : 0 }}>R$ {brl(peca.preco_promocional)}</span>
          {peca.percentual_desconto > 0 && <span style={{ background: '#AA1B2F', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 12, marginLeft: 8 }}>-{peca.percentual_desconto}%</span>}
        </div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 18 }}>{peca.parcelas}x de R$ {brl(valorParcela)} sem juros</div>

        {peca.descricao && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 6 }}>Descrição</div>
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>{peca.descricao}</div>
          </div>
        )}

        {temTamanho && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 8 }}>Tamanho</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {peca.tamanhos.map((t) => (
                <span key={t} onClick={() => escolherTamanho(t)} style={{ textDecoration: tamDisponivel(t) ? 'none' : 'line-through', opacity: tamDisponivel(t) ? 1 : 0.4, minWidth: 44, height: 44, padding: '0 8px', border: tamanho === t ? '1.5px solid #AA1B2F' : '0.5px solid #ccc', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: tamanho === t ? '#AA1B2F' : '#333', fontWeight: tamanho === t ? 500 : 400, cursor: tamDisponivel(t) ? 'pointer' : 'not-allowed' }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {temCor && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 8 }}>Cor{cor ? ': ' + cor : ''}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {cores.map((c) => {
                const ok = corDisponivel(c)
                const sel = cor === c
                return (
                  <span key={c} onClick={() => ok && setCor(c)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 12px', border: sel ? '1.5px solid #AA1B2F' : '0.5px solid #ccc', borderRadius: 18, fontSize: 13, color: ok ? (sel ? '#AA1B2F' : '#333') : '#bbb', textDecoration: ok ? 'none' : 'line-through', cursor: ok ? 'pointer' : 'not-allowed', fontWeight: sel ? 500 : 400 }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.2)', background: corFundo(c), opacity: ok ? 1 : 0.4 }} />{c}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        <button onClick={adicionarSacola} disabled={!podeComprar} style={{ width: '100%', height: 48, background: podeComprar ? '#AA1B2F' : '#ccc', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, letterSpacing: 1, marginBottom: 10, cursor: podeComprar ? 'pointer' : 'not-allowed' }}>
          {semEstoque ? 'Sem estoque' : temTamanho && !tamanho ? 'Escolha um tamanho' : temCor && !cor ? 'Escolha uma cor' : (adicionado ? '✓ Adicionado!' : 'Adicionar à sacola')}
        </button>
        <button onClick={comprarWhats} style={{ width: '100%', height: 46, background: '#fff', color: '#25D366', border: '1px solid #25D366', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>
          Comprar pelo WhatsApp
        </button>

      </div>
    </div>
      <BarraNav />
    </>
  )
}
