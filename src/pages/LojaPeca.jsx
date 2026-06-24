import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function LojaPeca() {
  const { id } = useParams()
  const [peca, setPeca] = useState(null)
  const [fotos, setFotos] = useState([])
  const [idx, setIdx] = useState(0)
  const [carregando, setCarregando] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { carregar() }, [id])

  async function carregar() {
    const { data } = await supabase
      .from('produtos')
      .select('id, nome, preco_base, percentual_desconto, preco_promocional, parcelas, produto_fotos(url, ordem)')
      .eq('id', id)
      .single()
    if (data) {
      setPeca(data)
      setFotos((data.produto_fotos || []).sort((a, b) => a.ordem - b.ordem))
    }
    setCarregando(false)
  }

  const brl = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  function prox() { setIdx((i) => (i + 1) % fotos.length) }
  function ant() { setIdx((i) => (i - 1 + fotos.length) % fotos.length) }

  if (carregando) return <div style={{ height: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial' }}>Carregando...</div>
  if (!peca) return <div style={{ height: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial' }}>Peça não encontrada.</div>

  return (
    <div style={{ height: '100vh', background: '#000', position: 'relative', fontFamily: 'Arial, sans-serif', overflow: 'hidden' }}>

      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {fotos[idx]?.url ? (
          <img src={fotos[idx].url} alt={peca.nome} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <span style={{ color: '#555' }}>Sem foto</span>
        )}
      </div>

      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 5 }}>
        <span onClick={() => navigate(-1)} style={{ color: '#fff', fontSize: 24, background: 'rgba(0,0,0,0.4)', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>×</span>
      </div>
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 5 }}>
        <span style={{ color: '#fff', fontSize: 22, background: 'rgba(0,0,0,0.4)', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>♡</span>
      </div>

      {fotos.length > 1 && (
        <>
          <div onClick={ant} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', zIndex: 5, cursor: 'pointer', color: '#fff', fontSize: 30, background: 'rgba(0,0,0,0.35)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</div>
          <div onClick={prox} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', zIndex: 5, cursor: 'pointer', color: '#fff', fontSize: 30, background: 'rgba(0,0,0,0.35)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</div>

          <div style={{ position: 'absolute', bottom: 130, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 7, zIndex: 5 }}>
            {fotos.map((_, k) => (
              <span key={k} onClick={() => setIdx(k)} style={{ width: 8, height: 8, borderRadius: '50%', background: k === idx ? '#fff' : 'rgba(255,255,255,0.45)', cursor: 'pointer' }} />
            ))}
          </div>
        </>
      )}

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '18px 20px', background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)', color: '#fff', zIndex: 4 }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 21, marginBottom: 4 }}>{peca.nome}</div>
        <div>
          {peca.percentual_desconto > 0 && <span style={{ textDecoration: 'line-through', opacity: 0.7, fontSize: 13, marginRight: 8 }}>R$ {brl(peca.preco_base)}</span>}
          <span style={{ fontSize: 19 }}>R$ {brl(peca.preco_promocional)}</span>
        </div>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>{peca.parcelas}x sem juros</div>
      </div>

    </div>
  )
}
