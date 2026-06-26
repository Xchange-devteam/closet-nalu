import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function LojaEntrar() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [erro, setErro] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  function pular() {
    localStorage.setItem('closet_nalu_login_pulado', '1')
    navigate('/')
  }

  async function entrar() {
    setErro(null)
    setCarregando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro('E-mail ou senha incorretos.')
      setCarregando(false)
      return
    }
    localStorage.setItem('closet_nalu_login_pulado', '1')
    navigate('/')
  }

  async function entrarGoogle() {
    setErro(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/' },
    })
    if (error) setErro('Nao foi possivel entrar com o Google.')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', background: '#fff' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 28px', maxWidth: 380, margin: '0 auto', width: '100%' }}>

        <div style={{ fontFamily: 'Georgia, serif', fontSize: 30, letterSpacing: 5, color: '#AA1B2F', marginBottom: 6 }}>CLOSET NALU</div>
        <div style={{ fontSize: 12, letterSpacing: 2, color: '#aaa', textTransform: 'uppercase', marginBottom: 36 }}>Entre na sua conta</div>

        <div style={{ width: '100%', marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>E-mail</label>
          <div style={{ display: 'flex', alignItems: 'center', border: '0.5px solid #ddd', borderRadius: 8, padding: '0 12px', height: 44 }}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" style={{ border: 'none', outline: 'none', flex: 1, fontSize: 14 }} />
          </div>
        </div>

        <div style={{ width: '100%', marginBottom: 24 }}>
          <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>Senha</label>
          <div style={{ display: 'flex', alignItems: 'center', border: '0.5px solid #ddd', borderRadius: 8, padding: '0 12px', height: 44 }}>
            <input type={verSenha ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="********" style={{ border: 'none', outline: 'none', flex: 1, fontSize: 14 }} />
            <span onClick={() => setVerSenha(!verSenha)} style={{ cursor: 'pointer', color: '#bbb', fontSize: 13 }}>{verSenha ? 'ocultar' : 'mostrar'}</span>
          </div>
        </div>

        {erro && <div style={{ width: '100%', background: '#fdecea', color: '#a32d2d', padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{erro}</div>}

        <button onClick={entrar} disabled={carregando} style={{ width: '100%', height: 46, background: '#AA1B2F', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, letterSpacing: 1, cursor: 'pointer', opacity: carregando ? 0.6 : 1 }}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#eee' }} />
          <span style={{ fontSize: 11, color: '#bbb', padding: '0 10px' }}>ou</span>
          <div style={{ flex: 1, height: 1, background: '#eee' }} />
        </div>

        <button onClick={entrarGoogle} style={{ width: '100%', height: 46, background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.6 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.3-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.6 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/><path fill="#4CAF50" d="M24 43.5c5.5 0 10.3-1.9 13.8-5.1l-6.4-5.4c-2 1.5-4.6 2.5-7.4 2.5-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39 16.2 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.4 5.4c-.5.4 6.8-5 6.8-15.4 0-1.2-.1-2.3-.3-3.5z"/></svg>
          Entrar com Google
        </button>

        <div style={{ fontSize: 13, color: '#666', marginTop: 22, marginBottom: 18, textAlign: 'center' }}>
          Nao tem conta? <Link to="/cadastrar" style={{ color: '#AA1B2F', textDecoration: 'none', fontWeight: 500 }}>Criar conta</Link>
        </div>

        <button onClick={pular} style={{ width: '100%', height: 44, background: 'transparent', color: '#777', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>
          Continuar sem login &rarr;
        </button>
      </div>
    </div>
  )
}
