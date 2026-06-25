import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AdminDashboard() {
  const [email, setEmail] = useState('')
  const [nProdutos, setNProdutos] = useState(0)
  const [nCategorias, setNCategorias] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { navigate('/admin/login'); return }
      setEmail(data.user.email)

      const { count: cp } = await supabase.from('produtos').select('*', { count: 'exact', head: true })
      const { count: cc } = await supabase.from('categorias').select('*', { count: 'exact', head: true })
      setNProdutos(cp || 0)
      setNCategorias(cc || 0)
    }
    carregar()
  }, [])

  async function sair() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const nome = email ? email.split('@')[0] : ''

  const cards = [
    { titulo: 'Produtos', sub: `${nProdutos} peças`, icone: '👗', cor: '#AA1B2F', bg: '#f9f3f0', borda: '#ecd9d3', txt: '#AA1B2F', rota: '/admin/produtos' },
    { titulo: 'Categorias', sub: `${nCategorias} categorias`, icone: '🗂', cor: '#3B6A9A', bg: '#eef2f6', borda: '#d6dfe8', txt: '#2f5680', rota: '/admin/categorias' },
    { titulo: 'Banner', sub: 'Editar abertura', icone: '🖼', cor: '#8B5A8C', bg: '#f4f0f5', borda: '#e2d6e4', txt: '#7a4a7c', rota: '/admin/banner' },
    { titulo: 'Pedidos', sub: 'Ver vendas', icone: '🛍', cor: '#3B7A5A', bg: '#eef3f0', borda: '#d6e4dc', txt: '#2f6249', rota: '/admin/pedidos' },
    { titulo: 'Catálogo', sub: 'PDF / link', icone: '📄', cor: '#B5862B', bg: '#f5f1ea', borda: '#e6dccb', txt: '#8a6620', rota: '/admin/catalogo' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#AA1B2F', color: '#fff', padding: '20px 18px' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, letterSpacing: 2 }}>CLOSET NALU</div>
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>Painel administrativo</div>
      </div>

      <div style={{ padding: 18, maxWidth: 640, margin: '0 auto' }}>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 14 }}>Olá, {nome} 👋 o que vamos gerenciar hoje?</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {cards.map((c) => (
            <div key={c.titulo} onClick={() => navigate(c.rota)} style={{ background: c.bg, borderRadius: 12, padding: '16px 14px', border: `0.5px solid ${c.borda}`, cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: c.cor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, fontSize: 20 }}>{c.icone}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: c.txt }}>{c.titulo}</div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{c.sub}</div>
            </div>
          ))}
          <div onClick={() => navigate('/')} style={{ background: '#fafafa', borderRadius: 12, padding: '16px 14px', border: '0.5px solid #eee', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>🏬</div>
            <div style={{ fontSize: 13, color: '#AA1B2F' }}>Ver a loja</div>
          </div>
        </div>

        <div style={{ marginTop: 18, paddingTop: 14, borderTop: '0.5px solid #eee', textAlign: 'right' }}>
          <span onClick={sair} style={{ fontSize: 13, color: '#999', cursor: 'pointer' }}>Sair</span>
        </div>
      </div>
    </div>
  )
}
