import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const STATUS_INFO = {
  pendente: { rotulo: 'Pendente', cor: '#B5862B', bg: '#f7f1e4' },
  pago: { rotulo: 'Pago', cor: '#2f6249', bg: '#e7f2eb' },
  cancelado: { rotulo: 'Cancelado', cor: '#999', bg: '#f0f0f0' },
  estornado: { rotulo: 'Estornado', cor: '#7a4a7c', bg: '#f2eaf3' },
  falhou: { rotulo: 'Falhou', cor: '#a32d2d', bg: '#fbe9e9' },
}

const FILTROS = ['todos', 'pendente', 'pago', 'cancelado', 'estornado', 'falhou']

export default function AdminPedidos() {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [itensPorPedido, setItensPorPedido] = useState({})
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [aberto, setAberto] = useState(null)

  useEffect(() => { iniciar() }, [])

  async function iniciar() {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth?.user) { navigate('/admin/login'); return }
    const { data: perfil } = await supabase.from('profiles').select('role').eq('id', auth.user.id).single()
    if (perfil?.role !== 'admin') { navigate('/'); return }
    carregar()
  }

  async function carregar() {
    setCarregando(true)
    const { data } = await supabase.from('pedidos').select('*').order('criado_em', { ascending: false })
    setPedidos(data || [])
    setCarregando(false)
  }

  async function abrir(id) {
    if (aberto === id) { setAberto(null); return }
    setAberto(id)
    if (!itensPorPedido[id]) {
      const { data } = await supabase.from('pedido_itens').select('*').eq('pedido_id', id)
      setItensPorPedido((p) => ({ ...p, [id]: data || [] }))
    }
  }

  const brl = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const dataBr = (s) => { try { return new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return '' } }

  const lista = filtro === 'todos' ? pedidos : pedidos.filter((p) => p.status === filtro)

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ padding: '18px 20px', borderBottom: '0.5px solid #eee', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span onClick={() => navigate('/admin')} style={{ fontSize: 22, color: '#AA1B2F', cursor: 'pointer' }}>&larr;</span>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: '#AA1B2F' }}>Pedidos</div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '14px 16px', overflowX: 'auto', borderBottom: '0.5px solid #f2f2f2' }}>
        {FILTROS.map((f) => (
          <span key={f} onClick={() => setFiltro(f)} style={{ whiteSpace: 'nowrap', fontSize: 13, padding: '6px 14px', borderRadius: 20, cursor: 'pointer', border: '0.5px solid ' + (filtro === f ? '#AA1B2F' : '#ddd'), color: filtro === f ? '#fff' : '#666', background: filtro === f ? '#AA1B2F' : '#fff', textTransform: 'capitalize' }}>
            {f === 'todos' ? 'Todos' : (STATUS_INFO[f]?.rotulo || f)}
          </span>
        ))}
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: 16 }}>
        {carregando && <div style={{ textAlign: 'center', color: '#999', padding: 40, fontSize: 14 }}>Carregando...</div>}
        {!carregando && lista.length === 0 && <div style={{ textAlign: 'center', color: '#999', padding: 40, fontSize: 14 }}>Nenhum pedido {filtro !== 'todos' ? 'com este status' : 'ainda'}.</div>}

        {lista.map((p) => {
          const info = STATUS_INFO[p.status] || { rotulo: p.status, cor: '#666', bg: '#f0f0f0' }
          const itens = itensPorPedido[p.id] || []
          return (
            <div key={p.id} style={{ border: '0.5px solid #eee', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
              <div onClick={() => abrir(p.id)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: '#333', fontWeight: 500 }}>{p.nome_cliente || 'Cliente'}</div>
                  <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{dataBr(p.criado_em)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, color: '#333', fontWeight: 600 }}>R$ {brl(p.total)}</div>
                  <span style={{ fontSize: 10, color: info.cor, background: info.bg, padding: '2px 8px', borderRadius: 10, marginTop: 4, display: 'inline-block' }}>{info.rotulo}</span>
                </div>
              </div>

              {aberto === p.id && (
                <div style={{ borderTop: '0.5px solid #f2f2f2', padding: '12px 16px', background: '#fafafa' }}>
                  {itens.length === 0 && <div style={{ fontSize: 12, color: '#aaa' }}>Carregando itens...</div>}
                  {itens.map((it) => (
                    <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#555', padding: '4px 0' }}>
                      <span>{it.quantidade}x {it.nome_produto}</span>
                      <span>R$ {brl(it.preco_unit * it.quantidade)}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '0.5px solid #eee', marginTop: 10, paddingTop: 10, fontSize: 12, color: '#888' }}>
                    {p.email_cliente && <div>Email: {p.email_cliente}</div>}
                    {p.telefone_cliente && <div>Telefone: {p.telefone_cliente}</div>}
                    {p.asaas_invoice_url && <div style={{ marginTop: 6 }}><a href={p.asaas_invoice_url} target="_blank" rel="noreferrer" style={{ color: '#AA1B2F' }}>Ver cobranca Asaas</a></div>}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
