import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSacola } from '../lib/sacola'

export default function LojaCategorias() {
  const [cats, setCats] = useState([])
  const [carregando, setCarregando] = useState(true)
  const navigate = useNavigate()
  const { qtdTotal } = useSacola()

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('subcategorias')
        .select('id, nome, slug, ordem')
        .eq('ativo', true)
        .order('ordem')
      setCats(data || [])
      setCarregando(false)
    }
    carregar()
  }, [])

  const navItens = [
    { ic: 'M3 12l9-9 9 9M5 10v10h14V10', lbl: 'Home', rota: '/' , ativo: false },
    { lbl: 'Categorias', rota: '/categorias', ativo: true },
    { lbl: 'Pesquisar', rota: '/categorias', ativo: false },
    { lbl: 'Sacola', rota: '/categorias', ativo: false },
    { lbl: 'Perfil', rota: '/categorias', ativo: false },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff', fontFamily: 'Georgia, serif' }}>

      <div style={{ textAlign: 'center', padding: '22px 0 14px', borderBottom: '0.5px solid #eee' }}>
        <div style={{ fontSize: 26, letterSpacing: 5, color: '#6B1F2A' }}>CLOSET NALU</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', maxWidth: 640, margin: '0 auto', width: '100%' }}>
        {carregando && <p style={{ padding: 22, color: '#999', fontFamily: 'Arial, sans-serif' }}>Carregando...</p>}
        {!carregando && cats.map((c) => (
          <div key={c.id} onClick={() => navigate('/categoria/' + c.slug)} style={{ padding: '15px 22px', borderBottom: '0.5px solid #f1f1f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: 16, color: '#2a2a2a' }}>{c.nome}</span>
            <span style={{ color: '#bbb', fontSize: 18, fontFamily: 'Arial, sans-serif' }}>›</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px 0 8px', borderTop: '0.5px solid #eee', background: '#fafafa', fontFamily: 'Arial, sans-serif' }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontSize: 11, color: '#aaa', cursor: 'pointer' }}><span style={{ fontSize: 18 }}>⌂</span>Home</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontSize: 11, color: '#6B1F2A' }}><span style={{ fontSize: 18 }}>☰</span>Categorias</div>
        <div onClick={() => navigate('/pesquisar')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontSize: 11, color: '#aaa', cursor: 'pointer' }}><span style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0e6e8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: -18, fontSize: 18 }}>⚲</span>Pesquisar</div>
        <div onClick={() => navigate('/sacola')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontSize: 11, color: '#aaa', cursor: 'pointer' }}><span style={{ fontSize: 18, position: 'relative' }}>🛍{qtdTotal > 0 && <span style={{ position: 'absolute', top: -4, right: -8, background: '#6B1F2A', color: '#fff', fontSize: 9, minWidth: 15, height: 15, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{qtdTotal}</span>}</span>Sacola</div>
        <div onClick={() => navigate('/perfil')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontSize: 11, color: '#aaa', cursor: 'pointer' }}><span style={{ fontSize: 18 }}>☺</span>Perfil</div>
      </div>

    </div>
  )
}
