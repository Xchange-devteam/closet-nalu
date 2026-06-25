import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSacola } from '../lib/sacola'
import { useFavoritos } from '../lib/favoritos'

const WHATSAPP = '5522997718930'

export default function LojaDetalhe() {
  const { id } = useParams()
  const [peca, setPeca] = useState(null)
  const [fotos, setFotos] = useState([])
  const [idx, setIdx] = useState(0)
  const [tamanho, setTamanho] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const navigate = useNavigate()
  const { adicionar } = useSacola()
  const { ehFavorito, alternar } = useFavoritos()

  useEffect(() => { carregar() }, [id])

  async function carregar() {
    const { data } = await supabase
      .from('produtos')
      .select('id, nome, descricao, tamanhos, preco_base, percentual_desconto, preco_promocional, parcelas, produto_fotos(url, ordem)')
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
  const podeComprar = !temTamanho || tamanho

  const [adicionado, setAdicionado] = useState(false)

  function adicionarSacola() {
    if (!podeComprar) return
    adicionar(peca, tamanho)
    setAdicionado(true)
    setTimeout(() => setAdicionado(false), 2000)
  }

  function comprarWhats() {
    const msg = `Olá! Tenho interesse na peça: ${peca.nome}${tamanho ? ' (tam ' + tamanho + ')' : ''} - R$ ${brl(peca.preco_promocional)}`
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (carregando) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontFamily: 'Arial' }}>Carregando...</div>
  if (!peca) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontFamily: 'Arial' }}>Peça não encontrada.</div>

  const valorParcela = peca.parcelas > 0 ? peca.preco_promocional / peca.parcelas : peca.preco_promocional

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif' }}>

      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', padding: '14px 0', borderBottom: '0.5px solid #eee' }}>
        <span onClick={() => navigate(-1)} style={{ position: 'absolute', left: 16, fontSize: 20, cursor: 'pointer' }}>←</span>
        <span style={{ margin: '0 auto', fontFamily: 'Georgia, serif', fontWeight: 500, fontSize: 16 }}>{peca.nome}</span>
        <span onClick={() => alternar(peca.id)} style={{ position: 'absolute', right: 50, fontSize: 20, cursor: 'pointer', color: ehFavorito(peca.id) ? '#e74c3c' : '#333' }}>{ehFavorito(peca.id) ? '♥' : '♡'}</span>
        <span onClick={() => navigate('/sacola')} style={{ position: 'absolute', right: 16, fontSize: 20, cursor: 'pointer' }}>🛍</span>
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
                <img src={f.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                <span key={t} onClick={() => setTamanho(t)} style={{ minWidth: 44, height: 44, padding: '0 8px', border: tamanho === t ? '1.5px solid #AA1B2F' : '0.5px solid #ccc', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: tamanho === t ? '#AA1B2F' : '#333', fontWeight: tamanho === t ? 500 : 400, cursor: 'pointer' }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        <button onClick={adicionarSacola} disabled={!podeComprar} style={{ width: '100%', height: 48, background: podeComprar ? '#AA1B2F' : '#ccc', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, letterSpacing: 1, marginBottom: 10, cursor: podeComprar ? 'pointer' : 'not-allowed' }}>
          {temTamanho && !tamanho ? 'Escolha um tamanho' : (adicionado ? '✓ Adicionado!' : 'Adicionar à sacola')}
        </button>
        <button onClick={comprarWhats} style={{ width: '100%', height: 46, background: '#fff', color: '#25D366', border: '1px solid #25D366', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>
          Comprar pelo WhatsApp
        </button>

      </div>
    </div>
  )
}
