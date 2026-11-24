import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { corFundo } from '../lib/cores'

const BORDO = '#AA1B2F'
const WHATSAPP = '5522997718930'
const LINK_CATALOGO = 'https://closetnalu.com.br/catalogo'

const CSS = `
.cat-grade { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 26px 14px; }
@media (min-width: 760px) { .cat-grade { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 40px 26px; } }
.cat-card { cursor: pointer; break-inside: avoid; page-break-inside: avoid; }
.cat-foto img { transition: transform .6s ease; }
.cat-card:hover .cat-foto img { transform: scale(1.03); }
@page { size: A4; margin: 0; }
@media print {
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { background: #FBF8F5 !important; }
  .cat-nao-imprimir { display: none !important; }
  .cat-capa { height: 297mm; min-height: 0 !important; box-sizing: border-box; padding: 0 !important; break-after: page; page-break-after: always; }
  .cat-corpo { max-width: none !important; padding: 14mm 14mm 4mm !important; }
  .cat-secao { margin-bottom: 9mm !important; }
  .cat-titulo { margin: 0 0 6mm !important; break-after: avoid; page-break-after: avoid; }
  .cat-grade { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 8mm 6mm !important; }
  .cat-card { break-inside: avoid; page-break-inside: avoid; }
  .cat-rodape { break-inside: avoid; page-break-inside: avoid; padding: 10mm 14mm 14mm !important; }
}
`

const botao = { height: 32, padding: '0 14px', border: '0.5px solid ' + BORDO, borderRadius: 16, background: '#fff', color: BORDO, fontSize: 12, cursor: 'pointer' }

export default function LojaCatalogo() {
  const navigate = useNavigate()
  const [grupos, setGrupos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [copiado, setCopiado] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const { data, error } = await supabase
      .from('produtos')
      .select('id, nome, tamanhos, preco_base, percentual_desconto, preco_promocional, criado_em, subcategorias(nome, ordem), produto_fotos(url, ordem), produto_variantes(cor, estoque)')
      .eq('ativo', true)
    if (error) {
      setErro('Não foi possível carregar o catálogo agora.')
      setCarregando(false)
      return
    }
    const mapa = new Map()
    for (const p of data || []) {
      const nome = p.subcategorias?.nome || 'Outras peças'
      const ordem = p.subcategorias?.ordem ?? 999
      if (!mapa.has(nome)) mapa.set(nome, { nome, ordem, pecas: [] })
      mapa.get(nome).pecas.push(p)
    }
    const lista = [...mapa.values()].sort((a, b) => a.ordem - b.ordem)
    lista.forEach((g) => g.pecas.sort((a, b) => String(b.criado_em).localeCompare(String(a.criado_em))))
    setGrupos(lista)
    setCarregando(false)
  }

  const brl = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const total = grupos.reduce((s, g) => s + g.pecas.length, 0)
  const mesTxt = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const mes = mesTxt.charAt(0).toUpperCase() + mesTxt.slice(1)

  async function compartilhar() {
    const url = LINK_CATALOGO
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Catálogo Closet Nalu', text: 'Confira a coleção da Closet Nalu', url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (e) { /* compartilhamento cancelado */ }
  }

  function cartao(p) {
    const capa = [...(p.produto_fotos || [])].sort((a, b) => a.ordem - b.ordem)[0]?.url
    const vars = p.produto_variantes || []
    const cores = [...new Set(vars.filter((v) => v.estoque > 0).map((v) => v.cor))]
    const esgotado = vars.length > 0 && cores.length === 0
    const temDesconto = p.percentual_desconto > 0
    return (
      <div key={p.id} className="cat-card" onClick={() => navigate('/detalhe/' + p.id)}>
        <div className="cat-foto" style={{ position: 'relative', aspectRatio: '3 / 4', background: '#eee', overflow: 'hidden', borderRadius: 2 }}>
          {capa && <img src={capa} alt={p.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block', filter: esgotado ? 'grayscale(0.6)' : 'none' }} />}
          {temDesconto && !esgotado && <span style={{ position: 'absolute', top: 10, left: 10, background: BORDO, color: '#fff', fontSize: 11, padding: '3px 9px', letterSpacing: 1 }}>-{p.percentual_desconto}%</span>}
          {esgotado && <span style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.92)', color: '#555', fontSize: 10, padding: '3px 9px', letterSpacing: 2, textTransform: 'uppercase' }}>Esgotado</span>}
        </div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 15, marginTop: 10, lineHeight: 1.3, color: '#222' }}>{p.nome}</div>
        <div style={{ marginTop: 4, fontSize: 14 }}>
          {temDesconto && <span style={{ textDecoration: 'line-through', color: '#aaa', fontSize: 12, marginRight: 6 }}>R$ {brl(p.preco_base)}</span>}
          <span style={{ color: BORDO }}>R$ {brl(p.preco_promocional)}</span>
        </div>
        {cores.length > 0 && (
          <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
            {cores.map((c) => <span key={c} title={c} style={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.15)', background: corFundo(c) }} />)}
          </div>
        )}
        {p.tamanhos?.length > 0 && <div style={{ fontSize: 11, color: '#999', marginTop: 6, letterSpacing: 1 }}>{p.tamanhos.join(' · ')}</div>}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FBF8F5', color: '#222', fontFamily: 'Arial, sans-serif' }}>
      <style>{CSS}</style>

      <div className="cat-nao-imprimir" style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'rgba(251,248,245,0.94)', borderBottom: '0.5px solid #eee' }}>
        <span onClick={() => navigate('/')} style={{ fontSize: 13, color: BORDO, cursor: 'pointer' }}>← Loja</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <a href={'https://wa.me/?text=' + encodeURIComponent('Confira o catálogo da Closet Nalu: ' + LINK_CATALOGO)} target="_blank" rel="noreferrer" style={{ ...botao, display: 'inline-flex', alignItems: 'center', textDecoration: 'none', borderColor: '#25D366', background: '#25D366', color: '#fff' }}>WhatsApp</a>
          <button onClick={compartilhar} style={botao}>{copiado ? 'Copiado ✓' : 'Compartilhar'}</button>
          <button onClick={() => window.print()} style={botao}>PDF</button>
        </div>
      </div>

      <div className="cat-capa" style={{ minHeight: '78vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: 11, letterSpacing: 5, color: '#999', textTransform: 'uppercase', marginBottom: 20 }}>Catálogo</div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(34px, 9vw, 66px)', letterSpacing: '0.18em', color: BORDO }}>CLOSET NALU</div>
        <div style={{ width: 48, height: 1, background: BORDO, margin: '24px auto' }} />
        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 18, color: '#555' }}>Coleção {mes}</div>
        {!carregando && !erro && <div style={{ fontSize: 12, color: '#999', marginTop: 12, letterSpacing: 1 }}>{total} {total === 1 ? 'peça' : 'peças'} · {grupos.length} {grupos.length === 1 ? 'categoria' : 'categorias'}</div>}
      </div>

      <div className="cat-corpo" style={{ maxWidth: 980, margin: '0 auto', padding: '0 16px 40px' }}>
        {carregando && <p style={{ textAlign: 'center', color: '#999' }}>Carregando catálogo...</p>}
        {erro && <p style={{ textAlign: 'center', color: '#999' }}>{erro}</p>}
        {grupos.map((g) => (
          <section key={g.nome} className="cat-secao" style={{ marginBottom: 64 }}>
            <div className="cat-titulo" style={{ textAlign: 'center', margin: '8px 0 28px' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 24, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#222' }}>{g.nome}</div>
              <div style={{ width: 32, height: 1, background: BORDO, margin: '14px auto 0' }} />
            </div>
            <div className="cat-grade">{g.pecas.map((p) => cartao(p))}</div>
          </section>
        ))}
      </div>

      <div className="cat-rodape" style={{ textAlign: 'center', padding: '44px 24px 64px', borderTop: '0.5px solid #e6e0da' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, letterSpacing: '0.18em', color: BORDO }}>CLOSET NALU</div>
        <div style={{ fontSize: 12, color: '#777', marginTop: 14, lineHeight: 1.9 }}>
          Pix com 5% de desconto · cartão em até 3x<br />
          Retirada grátis na loja em São Pedro da Aldeia ou envio pelos Correios e transportadoras
        </div>
        <div style={{ fontSize: 13, marginTop: 14, letterSpacing: 1 }}>closetnalu.com.br</div>
        <a className="cat-nao-imprimir" href={'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent('Olá! Vi o catálogo da Closet Nalu e quero saber mais.')} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 20, padding: '10px 24px', border: '1px solid #25D366', color: '#25D366', borderRadius: 24, fontSize: 13, textDecoration: 'none' }}>Falar no WhatsApp</a>
      </div>
    </div>
  )
}
