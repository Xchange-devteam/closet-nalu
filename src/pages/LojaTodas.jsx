import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSacola } from '../lib/sacola'

export default function LojaTodas() {
  const [pecas, setPecas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const navigate = useNavigate()
  const { qtdTotal } = useSacola()

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data } = await supabase
      .from('produtos')
      .select('id, nome, preco_base, percentual_desconto, preco_promocional, parcelas, produto_fotos(url, ordem)')
      .eq('ativo', true)
      .order('criado_em', { ascending: false })
    setPecas(data || [])
    setCarregando(false)
  }

  const brl = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff', fontFamily: 'Arial, sans-serif' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '14px 0', borderBottom: '0.5px solid #eee' }}>
        <span onClick={() => navigate(-1)} style={{ position: 'absolute', left: 16, fontSize: 20, cursor: 'pointer' }}>←</span>
        <span style={{ fontFamily: 'Georgia, serif', fontWeight: 500, letterSpacing: 1, fontSize: 16 }}>COLEÇÃO</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', maxWidth: 720, margin: '0 auto', width: '100%' }}>

        {!carregando && pecas.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', padding: 40, fontFamily: 'Georgia, serif' }}>Nenhuma peça cadastrada ainda.</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: '0 14px 16px' }}>
          {pecas.map((p) => {
            const fotos = (p.produto_fotos || []).sort((a, b) => a.ordem - b.ordem)
            const capa = fotos[0]?.url
            return (
              <div key={p.id} onClick={() => navigate('/detalhe/' + p.id)} style={{ cursor: 'pointer' }}>
                <div style={{ position: 'relative' }}>
                  {p.percentual_desconto > 0 && (
                    <span style={{ position: 'absolute', top: 8, left: 8, background: '#AA1B2F', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 12, zIndex: 2 }}>-{p.percentual_desconto}%</span>
                  )}
                  <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 20, color: '#fff', zIndex: 2 }}>♡</span>
                  <div style={{ aspectRatio: '3 / 4', background: '#f3f3f3', borderRadius: 4, overflow: 'hidden' }}>
                    {capa && <img src={capa} alt={p.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                </div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 13, marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nome}</div>
                {p.percentual_desconto > 0 && <div style={{ fontSize: 12, color: '#aaa', textDecoration: 'line-through' }}>R$ {brl(p.preco_base)}</div>}
                <div style={{ fontSize: 14, fontWeight: 500, color: '#222' }}>R$ {brl(p.preco_promocional)}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{p.parcelas}x sem juros</div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px 0 8px', borderTop: '0.5px solid #eee', background: '#fafafa' }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontSize: 11, color: '#aaa', cursor: 'pointer' }}><span style={{ fontSize: 18 }}>⌂</span>Home</div>
        <div onClick={() => navigate('/categorias')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontSize: 11, color: '#aaa', cursor: 'pointer' }}><span style={{ fontSize: 18 }}>☰</span>Categorias</div>
        <div onClick={() => navigate('/pesquisar')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontSize: 11, color: '#aaa', cursor: 'pointer' }}><span style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0e6e8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: -18, fontSize: 18 }}>⚲</span>Pesquisar</div>
        <div onClick={() => navigate('/sacola')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontSize: 11, color: '#aaa', cursor: 'pointer' }}><span style={{ fontSize: 18, position: 'relative' }}>🛍{qtdTotal > 0 && <span style={{ position: 'absolute', top: -4, right: -8, background: '#AA1B2F', color: '#fff', fontSize: 9, minWidth: 15, height: 15, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{qtdTotal}</span>}</span>Sacola</div>
        <div onClick={() => navigate('/perfil')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontSize: 11, color: '#aaa', cursor: 'pointer' }}><span style={{ fontSize: 18 }}>☺</span>Perfil</div>
      </div>

    </div>
  )
}
