import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AdminBanner() {
  const [id, setId] = useState(null)
  const [titulo, setTitulo] = useState('SALE')
  const [chamada, setChamada] = useState('ATÉ 50%')
  const [sub, setSub] = useState('EM PEÇAS SELECIONADAS')
  const [rodape, setRodape] = useState('*Confira o regulamento')
  const [cor, setCor] = useState('#6B1F2A')
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) { navigate('/admin/login'); return }

    const { data } = await supabase.from('banners').select('*').eq('posicao', 'home').limit(1).single()
    if (data) {
      setId(data.id)
      setTitulo(data.titulo || 'SALE')
      setChamada(data.chamada || '')
      setSub(data.subtexto || 'EM PEÇAS SELECIONADAS')
      setRodape(data.rodape || '')
      setCor(data.cor_fundo || '#6B1F2A')
    }
    setCarregando(false)
  }

  async function salvar() {
    setSalvando(true)
    const dados = { titulo, chamada, subtexto: sub, rodape, cor_fundo: cor, posicao: 'home', ativo: true }
    let error
    if (id) {
      ({ error } = await supabase.from('banners').update(dados).eq('id', id))
    } else {
      ({ error } = await supabase.from('banners').insert(dados))
    }
    setSalvando(false)
    if (error) { alert('Erro ao salvar: ' + error.message); return }
    alert('Banner salvo com sucesso!')
    carregar()
  }

  const cores = ['#6B1F2A', '#1a1a1a', '#2C3E2D', '#7a3b3b', '#4A141C']

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#6B1F2A', color: '#fff', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span onClick={() => navigate('/admin')} style={{ cursor: 'pointer', fontSize: 20 }}>←</span>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 18, letterSpacing: 1 }}>Editar banner</span>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: 18 }}>
        {carregando ? <p style={{ color: '#999' }}>Carregando...</p> : (
          <>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Preview ao vivo</div>
            <div style={{ height: 220, borderRadius: 10, background: cor, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: 18, fontFamily: 'Georgia, serif' }}>
              <div style={{ fontSize: 46, letterSpacing: 4, lineHeight: 1 }}>{titulo}</div>
              <div style={{ width: 40, height: 1, background: '#E8C9A0', margin: '12px 0' }} />
              <div style={{ fontSize: 14, letterSpacing: 2, color: '#E8C9A0' }}>{chamada}</div>
              <div style={{ fontSize: 10, letterSpacing: 1, color: '#E8C9A0', marginTop: 5, fontFamily: 'Arial, sans-serif' }}>{sub}</div>
            </div>

            {[['Texto principal', titulo, setTitulo], ['Chamada (desconto)', chamada, setChamada], ['Subtexto', sub, setSub], ['Rodapé', rodape, setRodape]].map(([label, val, set]) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>{label}</label>
                <input value={val} onChange={(e) => set(e.target.value)} style={{ width: '100%', height: 36, border: '0.5px solid #ddd', borderRadius: 6, padding: '0 10px', fontSize: 13, boxSizing: 'border-box' }} />
              </div>
            ))}

            <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>Cor de fundo</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18, alignItems: 'center' }}>
              {cores.map((cc) => (
                <div key={cc} onClick={() => setCor(cc)} style={{ width: 34, height: 34, borderRadius: 8, background: cc, cursor: 'pointer', border: cor === cc ? '2px solid #333' : '2px solid transparent' }} />
              ))}
              <input value={cor} onChange={(e) => setCor(e.target.value)} style={{ flex: 1, height: 34, border: '0.5px solid #ddd', borderRadius: 8, padding: '0 10px', fontSize: 12, boxSizing: 'border-box' }} />
            </div>

            <button onClick={salvar} disabled={salvando} style={{ width: '100%', height: 42, background: '#6B1F2A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer', opacity: salvando ? 0.6 : 1 }}>
              {salvando ? 'Salvando...' : 'Salvar banner'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
