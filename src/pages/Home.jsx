import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSacola } from '../lib/sacola'
import { supabase } from '../lib/supabase'
import BarraNav from '../components/BarraNav'

export default function Home() {
  const navigate = useNavigate()
  const { qtdTotal } = useSacola()
  const [pecas, setPecas] = useState([])
  const [erro, setErro] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function checarLogin() {
      const { data } = await supabase.auth.getSession()
      const pulou = localStorage.getItem('closet_nalu_login_pulado')
      if (!data?.session && !pulou) {
        navigate('/entrar', { replace: true })
      }
    }
    checarLogin()
  }, [])

  useEffect(() => {
    async function buscar() {
      const { data, error } = await supabase
        .from('produtos')
        .select('id, nome, preco_base, percentual_desconto, preco_promocional, parcelas, produto_fotos(url, ordem)')
        .eq('ativo', true)
        .order('criado_em', { ascending: false })
      if (error) setErro(error.message)
      else setPecas(data)
      setCarregando(false)
    }
    buscar()
  }, [])

  const brl = (v) =>
    Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div style={{ height: '100vh', overflow: 'hidden', position: 'relative', fontFamily: 'Georgia, serif', background: '#000' }}>

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.35), transparent)' }}>
        <img src="/logo-nalu-branca.png" alt="Closet Nalu" style={{ height: 38 }} />
      </div>

      <div style={{ height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory' }}>

        <section style={{ height: '100vh', scrollSnapAlign: 'start', background: '#AA1B2F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', overflow: 'hidden', position: 'relative', paddingBottom: 120 }}>
          <style>{`
            @keyframes slideFromLeft { 0% { transform: translateX(-120%); opacity: 0; } 60% { opacity: 1; } 100% { transform: translateX(0); opacity: 1; } }
            @keyframes slideFromRight { 0% { transform: translateX(120%); opacity: 0; } 60% { opacity: 1; } 100% { transform: translateX(0); opacity: 1; } }
            .cn-closet { animation: slideFromLeft 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
            .cn-nalu { animation: slideFromRight 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.15s forwards; opacity: 0; }
          `}</style>
          <div className="cn-closet" style={{ fontSize: 64, lineHeight: 1, letterSpacing: 10, fontFamily: 'Georgia, serif' }}>CLOSET</div>
          <div style={{ width: 60, height: 1, background: '#E8C9A0', margin: '20px 0' }} />
          <div className="cn-nalu" style={{ fontSize: 64, lineHeight: 1, letterSpacing: 10, fontFamily: 'Georgia, serif' }}>NALU</div>
          <div style={{ position: 'absolute', bottom: 100, color: '#E8C9A0', fontSize: 13, fontFamily: 'Arial, sans-serif' }}>deslize para ver a coleção ↑</div>
        </section>

        {carregando && (
          <section style={{ height: '100vh', scrollSnapAlign: 'start', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Carregando...</section>
        )}

        {erro && (
          <section style={{ height: '100vh', scrollSnapAlign: 'start', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: 20, textAlign: 'center' }}>Erro: {erro}</section>
        )}

        {pecas.map((p) => {
          const foto = p.produto_fotos?.sort((a, b) => a.ordem - b.ordem)[0]?.url
          return (
            <section key={p.id} style={{ height: '100vh', scrollSnapAlign: 'start', position: 'relative', background: '#000' }}>
              {foto && <img src={foto} alt={p.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              {p.percentual_desconto > 0 && (
                <span style={{ position: 'absolute', top: 60, left: 14, background: '#AA1B2F', color: '#fff', fontSize: 12, padding: '3px 10px', borderRadius: 14, fontFamily: 'Arial, sans-serif' }}>-{p.percentual_desconto}%</span>
              )}
              <span style={{ position: 'absolute', top: 100, right: 18, color: '#fff', fontSize: 26 }}>&#9825;</span>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 70, paddingBottom: 80, paddingLeft: 20, paddingRight: 20, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.55) 50%, transparent 100%)', color: '#fff' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{p.nome}</div>
                <div style={{ fontFamily: 'Arial, sans-serif' }}>
                  <span style={{ textDecoration: 'line-through', opacity: 0.7, fontSize: 13 }}>R$ {brl(p.preco_base)}</span>
                  &nbsp;&nbsp;<span style={{ fontSize: 18 }}>R$ {brl(p.preco_promocional)}</span>
                </div>
                <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, opacity: 0.85, marginTop: 2 }}>{p.parcelas}x sem juros</div>
              </div>
            </section>
          )
        })}

      </div>

      <BarraNav />

    </div>
  )
}
