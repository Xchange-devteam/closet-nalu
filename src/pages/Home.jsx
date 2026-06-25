import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSacola } from '../lib/sacola'
import { supabase } from '../lib/supabase'

export default function Home() {
  const navigate = useNavigate()
  const { qtdTotal } = useSacola()
  const [pecas, setPecas] = useState([])
  const [erro, setErro] = useState(null)
  const [carregando, setCarregando] = useState(true)

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

        <section style={{ height: '100vh', scrollSnapAlign: 'start', background: '#AA1B2F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <div style={{ fontSize: 88, lineHeight: 0.9, letterSpacing: 6 }}>SALE</div>
          <div style={{ width: 60, height: 1, background: '#E8C9A0', margin: '22px 0' }} />
          <div style={{ fontSize: 13, letterSpacing: 3, color: '#E8C9A0' }}>ATÉ</div>
          <div style={{ fontSize: 62, lineHeight: 1 }}>50<span style={{ fontSize: 24 }}>%</span></div>
          <div style={{ fontSize: 11, letterSpacing: 2, color: '#E8C9A0', marginTop: 8, fontFamily: 'Arial, sans-serif' }}>EM PEÇAS SELECIONADAS</div>
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
            <section key={p.id} style={{ height: '100vh', scrollSnapAlign: 'start', position: 'relative', background: '#d8c3b0' }}>
              {foto && <img src={foto} alt={p.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              {p.percentual_desconto > 0 && (
                <span style={{ position: 'absolute', top: 60, left: 14, background: '#AA1B2F', color: '#fff', fontSize: 12, padding: '3px 10px', borderRadius: 14, fontFamily: 'Arial, sans-serif' }}>-{p.percentual_desconto}%</span>
              )}
              <span style={{ position: 'absolute', top: 100, right: 18, color: '#fff', fontSize: 26 }}>&#9825;</span>
              <div style={{ position: 'absolute', bottom: 90, left: 0, right: 0, padding: 20, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', color: '#fff' }}>
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

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 6, display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px 0 8px', borderTop: '0.5px solid #eee', background: '#fafafa', fontFamily: 'Arial, sans-serif' }}>
        {[['⌂','Home',true,'/'],['☰','Categorias',false,'/categorias'],['⚲','Coleção',false,'/todas'],['🛍','Sacola',false,'/sacola'],['☺','Perfil',false,'/categorias']].map(([ic, lbl, ativo, rota]) => (
          <div key={lbl} onClick={() => navigate(rota)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontSize: 11, color: ativo ? '#AA1B2F' : '#aaa', cursor: 'pointer', position: 'relative' }}>
            <span style={{ fontSize: 18, position: 'relative' }}>{ic}{ic === '🛍' && qtdTotal > 0 && <span style={{ position: 'absolute', top: -4, right: -8, background: '#AA1B2F', color: '#fff', fontSize: 9, minWidth: 15, height: 15, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{qtdTotal}</span>}</span>{lbl}
          </div>
        ))}
      </div>

    </div>
  )
}
