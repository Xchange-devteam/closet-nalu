import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function redimensionar(file, maxLargura) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const escala = maxLargura / img.width
      const largura = img.width > maxLargura ? maxLargura : img.width
      const altura = img.width > maxLargura ? img.height * escala : img.height
      const canvas = document.createElement('canvas')
      canvas.width = largura
      canvas.height = altura
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, largura, altura)
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85)
    }
    img.src = URL.createObjectURL(file)
  })
}

export default function AdminProdutos() {
  const [pecas, setPecas] = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [carregando, setCarregando] = useState(true)

  const [nome, setNome] = useState('')
  const [subId, setSubId] = useState('')
  const [precoBase, setPrecoBase] = useState('')
  const [desconto, setDesconto] = useState('0')
  const [parcelas, setParcelas] = useState('1')
  const [tamanhos, setTamanhos] = useState('P, M, G')
  const [descricao, setDescricao] = useState('')
  const [fotos, setFotos] = useState([])

  const navigate = useNavigate()

  useEffect(() => { carregarTudo() }, [])

  async function carregarTudo() {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) { navigate('/admin/login'); return }

    const { data: prods } = await supabase
      .from('produtos')
      .select('id, nome, subcategoria_id, parcelas, tamanhos, descricao, preco_base, percentual_desconto, preco_promocional, produto_fotos(url, ordem)')
      .order('criado_em', { ascending: false })
    setPecas(prods || [])

    const { data: subs } = await supabase
      .from('subcategorias')
      .select('id, nome, categorias(nome)')
      .order('ordem')
    setSubcategorias(subs || [])

    setCarregando(false)
  }

  async function escolherFoto(e) {
    const arquivos = Array.from(e.target.files)
    if (!arquivos.length) return
    const novas = []
    for (const file of arquivos) {
      const full = await redimensionar(file, 1080)
      const mini = await redimensionar(file, 400)
      novas.push({ full, mini, previa: URL.createObjectURL(mini) })
    }
    setFotos((prev) => [...prev, ...novas])
    e.target.value = ''
  }

  function removerFoto(idx) {
    setFotos((prev) => prev.filter((_, i) => i !== idx))
  }

  const [salvando, setSalvando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)

  async function salvar() {
    if (!nome || !precoBase || !subId) {
      alert('Preencha nome, categoria e preço base.')
      return
    }
    if (!fotos.length && !editandoId) {
      alert('Escolha pelo menos uma foto da peça.')
      return
    }
    const temFotoNova = fotos.length > 0
    setSalvando(true)

    const baseUrl = 'https://nsrgacuqcrygqdwersbk.supabase.co/storage/v1/object/public/produtos/'
    const urlsFull = []
    if (temFotoNova) {
      for (let k = 0; k < fotos.length; k++) {
        const slug = Date.now() + '-' + k
        const nFull = `prod-${slug}-full.jpg`
        const nMini = `prod-${slug}-mini.jpg`
        const u1 = await supabase.storage.from('produtos').upload(nFull, fotos[k].full, { contentType: 'image/jpeg' })
        const u2 = await supabase.storage.from('produtos').upload(nMini, fotos[k].mini, { contentType: 'image/jpeg' })
        if (u1.error || u2.error) {
          alert('Erro ao subir foto: ' + (u1.error?.message || u2.error?.message))
          setSalvando(false)
          return
        }
        urlsFull.push(baseUrl + nFull)
      }
    }

    const dados = {
      nome,
      subcategoria_id: subId,
      preco_base: parseFloat(precoBase.replace(',', '.')),
      percentual_desconto: parseInt(desconto) || 0,
      parcelas: parseInt(parcelas) || 1,
      tamanhos: tamanhos.split(',').map(t => t.trim()).filter(Boolean),
      descricao,
    }

    let prodId = editandoId
    if (editandoId) {
      const { error } = await supabase.from('produtos').update(dados).eq('id', editandoId)
      if (error) { alert('Erro ao atualizar: ' + error.message); setSalvando(false); return }
    } else {
      const { data: prod, error } = await supabase.from('produtos').insert({ ...dados, ativo: true, destaque: true }).select('id').single()
      if (error) { alert('Erro ao salvar a peça: ' + error.message); setSalvando(false); return }
      prodId = prod.id
    }

    if (temFotoNova) {
      if (editandoId) await supabase.from('produto_fotos').delete().eq('produto_id', prodId)
      const registros = urlsFull.map((u, idx) => ({ produto_id: prodId, url: u, ordem: idx }))
      await supabase.from('produto_fotos').insert(registros)
    }

    setNome(''); setSubId(''); setPrecoBase(''); setDesconto('0'); setParcelas('1'); setTamanhos('P, M, G'); setDescricao('')
    setFotos([])
    setEditandoId(null)
    setSalvando(false)
    carregarTudo()
    alert('Peça salva com sucesso!')
  }

  function editar(p) {
    setEditandoId(p.id)
    setNome(p.nome)
    setSubId(p.subcategoria_id || '')
    setPrecoBase(String(p.preco_base).replace('.', ','))
    setDesconto(String(p.percentual_desconto))
    setParcelas(String(p.parcelas || 1))
    setTamanhos((p.tamanhos || []).join(', '))
    setDescricao(p.descricao || '')
    setFotos([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setNome(''); setSubId(''); setPrecoBase(''); setDesconto('0'); setParcelas('1'); setTamanhos('P, M, G'); setDescricao('')
    setFotos([])
  }

  async function excluir(id, nomePeca) {
    if (!confirm(`Excluir a peça "${nomePeca}"? Esta ação não pode ser desfeita.`)) return
    const { error } = await supabase.from('produtos').delete().eq('id', id)
    if (error) {
      alert('Erro ao excluir: ' + error.message)
      return
    }
    carregarTudo()
  }

  const brl = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const base = parseFloat(precoBase.replace(',', '.')) || 0
  const pct = parseInt(desconto) || 0
  const precoFinal = base * (1 - pct / 100)

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#6B1F2A', color: '#fff', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span onClick={() => navigate('/admin')} style={{ cursor: 'pointer', fontSize: 20 }}>←</span>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 18, letterSpacing: 1 }}>Gerenciar produtos</span>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        <div style={{ padding: 18, borderBottom: '8px solid #f4f4f2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#6B1F2A' }}>{editandoId ? '✏️ Editar peça' : '+ Nova peça'}</span>
            {editandoId && <span onClick={cancelarEdicao} style={{ fontSize: 12, color: '#999', cursor: 'pointer' }}>cancelar</span>}
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
              {fotos.map((f, idx) => (
                <div key={idx} style={{ position: 'relative', width: 60, height: 60 }}>
                  <img src={f.previa} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                  <span onClick={() => removerFoto(idx)} style={{ position: 'absolute', top: -6, right: -6, background: '#c0392b', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>×</span>
                </div>
              ))}
              <label style={{ width: 60, height: 60, border: '1px dashed #ccc', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#aaa', gap: 2, cursor: 'pointer' }}>
                <span style={{ fontSize: 20 }}>＋</span>
                <span style={{ fontSize: 9 }}>foto</span>
                <input type="file" accept="image/*" multiple onChange={escolherFoto} style={{ display: 'none' }} />
              </label>
            </div>
            <div style={{ flex: 1 }}>
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da peça" style={{ width: '100%', height: 36, border: '0.5px solid #ddd', borderRadius: 6, padding: '0 10px', fontSize: 13, marginBottom: 8, boxSizing: 'border-box' }} />
              <select value={subId} onChange={(e) => setSubId(e.target.value)} style={{ width: '100%', height: 36, border: '0.5px solid #ddd', borderRadius: 6, padding: '0 8px', fontSize: 13, color: '#666', boxSizing: 'border-box' }}>
                <option value="">Escolha a categoria...</option>
                {subcategorias.map((s) => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição da peça (opcional)" rows={3} style={{ width: '100%', border: '0.5px solid #ddd', borderRadius: 6, padding: '8px 10px', fontSize: 13, marginBottom: 12, boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', resize: 'vertical' }} />

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: '#888' }}>Preço base (R$)</label>
              <input value={precoBase} onChange={(e) => setPrecoBase(e.target.value)} placeholder="0,00" style={{ width: '100%', height: 36, border: '0.5px solid #ddd', borderRadius: 6, padding: '0 10px', fontSize: 13, boxSizing: 'border-box' }} />
            </div>
            <div style={{ width: 90 }}>
              <label style={{ fontSize: 11, color: '#888' }}>Desconto %</label>
              <input value={desconto} onChange={(e) => setDesconto(e.target.value)} style={{ width: '100%', height: 36, border: '0.5px solid #ddd', borderRadius: 6, padding: '0 10px', fontSize: 13, boxSizing: 'border-box' }} />
            </div>
            <div style={{ width: 70 }}>
              <label style={{ fontSize: 11, color: '#888' }}>Parcelas</label>
              <input value={parcelas} onChange={(e) => setParcelas(e.target.value)} style={{ width: '100%', height: 36, border: '0.5px solid #ddd', borderRadius: 6, padding: '0 10px', fontSize: 13, boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: '#888' }}>Tamanhos (separados por vírgula — deixe vazio se não tiver)</label>
            <input value={tamanhos} onChange={(e) => setTamanhos(e.target.value)} placeholder="ex: P, M, G" style={{ width: '100%', height: 36, border: '0.5px solid #ddd', borderRadius: 6, padding: '0 10px', fontSize: 13, boxSizing: 'border-box', marginTop: 2 }} />
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <button type="button" onClick={() => setTamanhos('P, M, G')} style={{ fontSize: 11, padding: '4px 10px', border: '0.5px solid #ccc', borderRadius: 14, background: '#fff', cursor: 'pointer' }}>P, M, G</button>
              <button type="button" onClick={() => setTamanhos('36, 38, 40, 42')} style={{ fontSize: 11, padding: '4px 10px', border: '0.5px solid #ccc', borderRadius: 14, background: '#fff', cursor: 'pointer' }}>36 a 42</button>
              <button type="button" onClick={() => setTamanhos('')} style={{ fontSize: 11, padding: '4px 10px', border: '0.5px solid #ccc', borderRadius: 14, background: '#fff', cursor: 'pointer' }}>limpar</button>
            </div>
          </div>

          <div style={{ background: '#f9f3f0', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 12, color: '#6B1F2A' }}>
            Preço final calculado: <b>R$ {brl(precoFinal)}</b>{pct > 0 && <> &nbsp;·&nbsp; selo <b>-{pct}%</b></>}
            {fotos.length > 0 && <div style={{ marginTop: 6, color: '#3B7A5A' }}>✓ {fotos.length} foto(s) pronta(s)</div>}
          </div>

          <button onClick={salvar} disabled={salvando} style={{ width: '100%', height: 40, background: '#6B1F2A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer', opacity: salvando ? 0.6 : 1 }}>{salvando ? 'Salvando...' : 'Salvar peça'}</button>
        </div>

        <div style={{ padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 12 }}>Peças cadastradas ({pecas.length})</div>

          {carregando && <p style={{ color: '#999' }}>Carregando...</p>}

          {!carregando && pecas.map((p) => {
            const foto = p.produto_fotos?.sort((a, b) => a.ordem - b.ordem)[0]?.url
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '0.5px solid #eee' }}>
                <div style={{ width: 44, height: 44, borderRadius: 6, background: '#eee', flexShrink: 0, overflow: 'hidden' }}>
                  {foto && <img src={foto} alt={p.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>{p.nome}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>
                    <span style={{ textDecoration: 'line-through' }}>{brl(p.preco_base)}</span> → R$ {brl(p.preco_promocional)} · -{p.percentual_desconto}%
                  </div>
                </div>
                <span onClick={() => editar(p)} style={{ cursor: 'pointer', fontSize: 17, padding: '0 4px' }} title="Editar">✏️</span>
                <span onClick={() => excluir(p.id, p.nome)} style={{ cursor: 'pointer', color: '#c0392b', fontSize: 18, padding: '0 4px' }} title="Excluir">🗑</span>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
