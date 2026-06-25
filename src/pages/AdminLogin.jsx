import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [erro, setErro] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  async function entrar() {
    setErro(null)
    setCarregando(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro('E-mail ou senha incorretos.')
      setCarregando(false)
      return
    }

    const { data: perfil } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (perfil?.role !== 'admin') {
      setErro('Esta conta não tem acesso de administrador.')
      await supabase.auth.signOut()
      setCarregando(false)
      return
    }

    navigate('/admin')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', background: '#fff' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 28px', maxWidth: 380, margin: '0 auto', width: '100%' }}>

        <div style={{ fontFamily: 'Georgia, serif', fontSize: 30, letterSpacing: 5, color: '#AA1B2F', marginBottom: 6 }}>CLOSET NALU</div>
        <div style={{ fontSize: 12, letterSpacing: 2, color: '#aaa', textTransform: 'uppercase', marginBottom: 40 }}>Painel administrativo</div>

        <div style={{ width: '100%', marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>E-mail</label>
          <div style={{ display: 'flex', alignItems: 'center', border: '0.5px solid #ddd', borderRadius: 8, padding: '0 12px', height: 44 }}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" style={{ border: 'none', outline: 'none', flex: 1, fontSize: 14 }} />
          </div>
        </div>

        <div style={{ width: '100%', marginBottom: 28 }}>
          <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>Senha</label>
          <div style={{ display: 'flex', alignItems: 'center', border: '0.5px solid #ddd', borderRadius: 8, padding: '0 12px', height: 44 }}>
            <input type={verSenha ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" style={{ border: 'none', outline: 'none', flex: 1, fontSize: 14 }} />
            <span onClick={() => setVerSenha(!verSenha)} style={{ cursor: 'pointer', color: '#bbb', fontSize: 13 }}>{verSenha ? 'ocultar' : 'mostrar'}</span>
          </div>
        </div>

        {erro && <div style={{ width: '100%', background: '#fdecea', color: '#a32d2d', padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{erro}</div>}

        <button onClick={entrar} disabled={carregando} style={{ width: '100%', height: 46, background: '#AA1B2F', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, letterSpacing: 1, cursor: 'pointer', opacity: carregando ? 0.6 : 1 }}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>

        <div style={{ fontSize: 12, color: '#aaa', marginTop: 20, textAlign: 'center' }}>Acesso restrito à administração da loja</div>
      </div>

      <div style={{ padding: 16, textAlign: 'center', borderTop: '0.5px solid #eee' }}>
        <Link to="/" style={{ fontSize: 12, color: '#AA1B2F', textDecoration: 'none' }}>← Voltar para a loja</Link>
      </div>
    </div>
  )
}
