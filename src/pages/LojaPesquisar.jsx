import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSacola } from '../lib/sacola'

export default function LojaPesquisar() {
  const [termo, setTermo] = useState('')
  const [resultados, setResultados] = useState([])
  const [buscou, setBuscou] = useState(false)
  const navigate = useNavigate()
  const { qtdTotal } = useSacola()

  async function buscar(valor) {
    setTermo(valor)
    if (valor.trim().length < 2) {
      setResultados([])
      setBuscou(false)
      return
    }
    const { data } = await supabase
      .from('produtos')
      .select('id, nome, preco_base, percentual_desconto, preco_promocional, parcelas, produto_fotos(url, ordem)')
      .eq('ativo', true)
      .ilike('nome', '%' + valor.trim() + '%')
      .order('criado_em', { ascending: false })
    setResultados(data || [])
    setBuscou(true)
  }

  const brl = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ padding: '16px 18px', borderBottom: '0.5px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f4f4f4', borderRadius: 24, padding: '10px 16px' }}>
          <span style={{ color: '#999', fontSize: 16 }}>&#9906;</span>
          <input autoFocus value={termo} onChange={(e) => buscar(e.target.value)} placeholder="Buscar pecas..." style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, outline: 'none' }} />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', maxWidth: 720, margin: '0 auto', width: '100%', padding: '14px 18px' }}>
        {termo.trim().length < 2 && (
          <div style={{ textAlign: 'center', color: '#bbb', padding: 40, fontFamily: 'Georgia, serif' }}>Digite o nome de uma peca</div>
        )}
        {buscou && (
          <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>{resultados.length} resultado(s)</div>
        )}
        {buscou && resultados.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', padding: 30, fontFamily: 'Georgia, serif' }}>Nenhuma peca encontrada.</div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {resultados.map((p) => {
            const fotos = (p.produto_fotos || []).sort((a, b) => a.ordem - b.ordem)
            const capa = fotos[0]?.url
            return (
              <div key={p.id} onClick={() => navigate('/detalhe/' + p.id)} style={{ cursor: 'pointer' }}>
                <div style={{ aspectRatio: '3 / 4', background: '#f3f3f3', borderRadius: 4, overflow: 'hidden' }}>
                  {capa && <img src={capa} alt={p.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 13, marginTop: 6 }}>{p.nome}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#222' }}>R$ {brl(p.preco_promocional)}</div>
              </div>
            )
          })}
        </div>
      </div>
      <BarraInferior navigate={navigate} qtdTotal={qtdTotal} />
    </div>
  )
}

function BarraInferior({ navigate, qtdTotal }) {
  const item = (icone, label, rota, ativo, badge) => (
    <div onClick={() => rota && navigate(rota)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontSize: 11, color: ativo ? '#AA1B2F' : '#aaa', cursor: 'pointer' }}>
      <span style={{ fontSize: 18, position: 'relative' }}>{icone}{badge > 0 && <span style={{ position: 'absolute', top: -4, right: -8, background: '#AA1B2F', color: '#fff', fontSize: 9, minWidth: 15, height: 15, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{badge}</span>}</span>
      {label}
    </div>
  )
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px 0 8px', borderTop: '0.5px solid #eee', background: '#fafafa' }}>
      {item('\u2302', 'Home', '/', false, 0)}
      {item('\u2630', 'Categorias', '/categorias', false, 0)}
      {item('\u26B2', 'Pesquisar', null, true, 0)}
      {item('\uD83D\uDED5', 'Sacola', '/sacola', false, qtdTotal)}
      {item('\u263A', 'Perfil', null, false, 0)}
    </div>
  )
}
