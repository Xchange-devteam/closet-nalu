import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSacola } from '../lib/sacola'
import BarraNav from '../components/BarraNav'
import Cabecalho from '../components/Cabecalho'

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
    { lbl: 'Coleção', rota: '/todas', ativo: false },
    { lbl: 'Sacola', rota: '/categorias', ativo: false },
    { lbl: 'Perfil', rota: '/categorias', ativo: false },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff', fontFamily: 'Georgia, serif' }}>

      <Cabecalho tela="Categorias" />

      <div style={{ flex: 1, overflowY: 'auto', maxWidth: 640, margin: '0 auto', width: '100%' }}>
        {carregando && <p style={{ padding: 22, color: '#999', fontFamily: 'Arial, sans-serif' }}>Carregando...</p>}
        {!carregando && cats.map((c) => (
          <div key={c.id} onClick={() => navigate('/categoria/' + c.slug)} style={{ padding: '15px 22px', borderBottom: '0.5px solid #f1f1f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: 16, color: '#2a2a2a' }}>{c.nome}</span>
            <span style={{ color: '#bbb', fontSize: 18, fontFamily: 'Arial, sans-serif' }}>›</span>
          </div>
        ))}
      </div>

      <BarraNav />

    </div>
  )
}
