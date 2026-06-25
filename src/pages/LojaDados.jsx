import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const CHAVE = 'closet_nalu_dados'

export default function LojaDados() {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [salvo, setSalvo] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const d = localStorage.getItem(CHAVE)
      if (d) {
        const o = JSON.parse(d)
        setNome(o.nome || ''); setTelefone(o.telefone || ''); setEndereco(o.endereco || '')
      }
    } catch (e) {}
  }, [])

  function salvar() {
    localStorage.setItem(CHAVE, JSON.stringify({ nome, telefone, endereco }))
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
  }

  const campo = { width: '100%', height: 40, border: '0.5px solid #ddd', borderRadius: 8, padding: '0 12px', fontSize: 14, marginBottom: 14, boxSizing: 'border-box' }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '14px 0', borderBottom: '0.5px solid #eee' }}>
        <span onClick={() => navigate(-1)} style={{ position: 'absolute', left: 16, fontSize: 20, cursor: 'pointer' }}>&#8592;</span>
        <span style={{ fontFamily: 'Georgia, serif', fontWeight: 500, letterSpacing: 1, fontSize: 16 }}>MEUS DADOS</span>
      </div>

      <div style={{ maxWidth: 460, margin: '0 auto', padding: 20 }}>
        <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Nome completo</label>
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" style={campo} />

        <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Telefone / WhatsApp</label>
        <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(22) 99999-9999" style={campo} />

        <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Endereco de entrega</label>
        <textarea value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, numero, bairro, cidade" rows={3} style={{ ...campo, height: 'auto', paddingTop: 10, resize: 'vertical' }} />

        <button onClick={salvar} style={{ width: '100%', height: 46, background: '#AA1B2F', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer' }}>
          {salvo ? 'Salvo!' : 'Salvar dados'}
        </button>
        <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: 12 }}>Seus dados ficam salvos apenas neste aparelho.</div>
      </div>
    </div>
  )
}
