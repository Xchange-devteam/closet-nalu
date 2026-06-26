import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useFavoritos } from '../lib/favoritos'
import BarraNav from '../components/BarraNav'

export default function LojaFavoritos() {
  const { favoritos, alternar } = useFavoritos()
  const [pecas, setPecas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { carregar() }, [favoritos.length])

  async function carregar() {
    if (favoritos.length === 0) { setPecas([]); setCarregando(false); return }
    const { data } = await supabase
      .from('produtos')
      .select('id, nome, preco_base, percentual_desconto, preco_promocional, produto_fotos(url, ordem)')
      .in('id', favoritos)
    setPecas(data || [])
    setCarregando(false)
  }

  const brl = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <>
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff', fontFamily: 'Arial, sans-serif', paddingBottom: 70 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '14px 0', borderBottom: '0.5px solid #eee' }}>
        <span onClick={() => navigate(-1)} style={{ position: 'absolute', left: 16, fontSize: 20, cursor: 'pointer' }}>&#8592;</span>
        <span style={{ fontFamily: 'Georgia, serif', fontWeight: 500, letterSpacing: 1, fontSize: 16 }}>MEUS FAVORITOS</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', maxWidth: 720, margin: '0 auto', width: '100%', padding: '14px 18px' }}>
        {carregando && <p style={{ color: '#999' }}>Carregando...</p>}

        {!carregando && pecas.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', padding: 40, fontFamily: 'Georgia, serif' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>&#9825;</div>
            Voce ainda nao favoritou nenhuma peca.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {pecas.map((p) => {
            const fotos = (p.produto_fotos || []).sort((a, b) => a.ordem - b.ordem)
            const capa = fotos[0]?.url
            return (
              <div key={p.id} style={{ cursor: 'pointer' }}>
                <div style={{ position: 'relative' }}>
                  <span onClick={() => alternar(p.id)} style={{ position: 'absolute', top: 8, right: 8, fontSize: 20, color: '#e74c3c', zIndex: 2, cursor: 'pointer' }}>&#9829;</span>
                  <div onClick={() => navigate('/detalhe/' + p.id)} style={{ aspectRatio: '3 / 4', background: '#f3f3f3', borderRadius: 4, overflow: 'hidden' }}>
                    {capa && <img src={capa} alt={p.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                </div>
                <div onClick={() => navigate('/detalhe/' + p.id)} style={{ fontFamily: 'Georgia, serif', fontSize: 13, marginTop: 6 }}>{p.nome}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#222' }}>R$ {brl(p.preco_promocional)}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
      <BarraNav />
    </>
  )
}
