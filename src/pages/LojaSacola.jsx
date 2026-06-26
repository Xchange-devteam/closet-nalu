import { useNavigate } from 'react-router-dom'
import { useSacola } from '../lib/sacola'
import BarraNav from '../components/BarraNav'

export default function LojaSacola() {
  const { itens, mudarQtd, remover, total, qtdTotal } = useSacola()
  const navigate = useNavigate()

  const brl = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <>
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff', fontFamily: 'Arial, sans-serif', paddingBottom: 90 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '14px 0', borderBottom: '0.5px solid #eee' }}>
        <span onClick={() => navigate(-1)} style={{ position: 'absolute', left: 16, fontSize: 20, cursor: 'pointer' }}>←</span>
        <span style={{ fontFamily: 'Georgia, serif', fontWeight: 500, letterSpacing: 1, fontSize: 16 }}>MINHA SACOLA</span>
      </div>

      {itens.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 30 }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#888' }}>Sua sacola está vazia</div>
          <button onClick={() => navigate('/todas')} style={{ padding: '12px 24px', background: '#AA1B2F', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>Ver a coleção</button>
        </div>
      ) : (
        <>
          <div style={{ flex: 1, overflowY: 'auto', maxWidth: 560, margin: '0 auto', width: '100%', padding: '14px 18px' }}>
            {itens.map((i) => (
              <div key={i.chave} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '0.5px solid #f1f1f1' }}>
                <div style={{ width: 64, height: 80, borderRadius: 6, background: '#eee', flexShrink: 0, overflow: 'hidden' }}>
                  {i.foto && <img src={i.foto} alt={i.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 14 }}>{i.nome}</div>
                  {i.tamanho && <div style={{ fontSize: 11, color: '#999', margin: '2px 0' }}>Tamanho: {i.tamanho}</div>}
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#AA1B2F' }}>R$ {brl(i.preco)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                    <span onClick={() => mudarQtd(i.chave, -1)} style={{ width: 26, height: 26, border: '0.5px solid #ccc', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>−</span>
                    <span style={{ fontSize: 14, minWidth: 16, textAlign: 'center' }}>{i.quantidade}</span>
                    <span onClick={() => mudarQtd(i.chave, 1)} style={{ width: 26, height: 26, border: '0.5px solid #ccc', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</span>
                    <span onClick={() => remover(i.chave)} style={{ marginLeft: 'auto', color: '#c0392b', fontSize: 12, cursor: 'pointer' }}>remover</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '0.5px solid #eee', padding: '16px 18px', background: '#fafafa', maxWidth: 560, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13, color: '#666' }}>
              <span>Subtotal ({qtdTotal} {qtdTotal === 1 ? 'item' : 'itens'})</span>
              <span>R$ {brl(total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontSize: 16, fontWeight: 500, color: '#222' }}>
              <span>Total</span>
              <span style={{ color: '#AA1B2F' }}>R$ {brl(total)}</span>
            </div>
            <button onClick={() => alert('Checkout Asaas em breve!')} style={{ width: '100%', height: 48, background: '#AA1B2F', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, letterSpacing: 1, cursor: 'pointer' }}>Finalizar pedido</button>
          </div>
        </>
      )}
    </div>
      <BarraNav />
    </>
  )
}
