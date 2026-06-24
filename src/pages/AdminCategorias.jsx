import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AdminCategorias() {
  const [cats, setCats] = useState([])
  const [maeId, setMaeId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [nova, setNova] = useState('')
  const [editId, setEditId] = useState(null)
  const [editNome, setEditNome] = useState('')
  const navigate = useNavigate()

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) { navigate('/admin/login'); return }

    const { data: mae } = await supabase.from('categorias').select('id').eq('slug', 'loja').single()
    setMaeId(mae?.id)

    const { data } = await supabase.from('subcategorias').select('id, nome, ordem').order('ordem')
    setCats(data || [])
    setCarregando(false)
  }

  function slugify(txt) {
    return txt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function criar() {
    if (!nova.trim()) return
    const ordem = cats.length ? Math.max(...cats.map(c => c.ordem)) + 1 : 1
    const { error } = await supabase.from('subcategorias').insert({
      categoria_id: maeId, nome: nova.trim(), slug: slugify(nova) + '-' + Date.now(), ordem
    })
    if (error) { alert('Erro: ' + error.message); return }
    setNova('')
    carregar()
  }

  async function salvarEdicao(id) {
    if (!editNome.trim()) return
    await supabase.from('subcategorias').update({ nome: editNome.trim() }).eq('id', id)
    setEditId(null); setEditNome('')
    carregar()
  }

  async function excluir(id, nome) {
    if (!confirm(`Excluir a categoria "${nome}"? As peças vinculadas ficarão sem categoria.`)) return
    await supabase.from('subcategorias').delete().eq('id', id)
    carregar()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#6B1F2A', color: '#fff', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span onClick={() => navigate('/admin')} style={{ cursor: 'pointer', fontSize: 20 }}>←</span>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 18, letterSpacing: 1 }}>Categorias</span>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ padding: 18, borderBottom: '8px solid #f4f4f2' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#6B1F2A', marginBottom: 10 }}>+ Nova categoria</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={nova} onChange={(e) => setNova(e.target.value)} placeholder="Nome (ex: Cinto)" style={{ flex: 1, height: 36, border: '0.5px solid #ddd', borderRadius: 6, padding: '0 10px', fontSize: 13, boxSizing: 'border-box' }} />
            <button onClick={criar} style={{ height: 36, padding: '0 16px', background: '#6B1F2A', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>Criar</button>
          </div>
        </div>

        <div style={{ padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 12 }}>Categorias ({cats.length})</div>
          {carregando && <p style={{ color: '#999' }}>Carregando...</p>}
          {!carregando && cats.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '0.5px solid #eee' }}>
              {editId === c.id ? (
                <>
                  <input value={editNome} onChange={(e) => setEditNome(e.target.value)} style={{ flex: 1, height: 32, border: '0.5px solid #6B1F2A', borderRadius: 6, padding: '0 10px', fontSize: 13, boxSizing: 'border-box' }} />
                  <span onClick={() => salvarEdicao(c.id)} style={{ cursor: 'pointer', color: '#3B7A5A', fontSize: 13 }}>salvar</span>
                  <span onClick={() => { setEditId(null); setEditNome('') }} style={{ cursor: 'pointer', color: '#999', fontSize: 13 }}>cancelar</span>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, fontSize: 14, color: '#333' }}>{c.nome}</span>
                  <span onClick={() => { setEditId(c.id); setEditNome(c.nome) }} style={{ cursor: 'pointer', fontSize: 16 }} title="Editar">✏️</span>
                  <span onClick={() => excluir(c.id, c.nome)} style={{ cursor: 'pointer', color: '#c0392b', fontSize: 17 }} title="Excluir">🗑</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
