import { createContext, useContext, useState, useEffect } from 'react'

const SacolaContext = createContext()
const CHAVE = 'closet_nalu_sacola'

export function SacolaProvider({ children }) {
  const [itens, setItens] = useState([])

  // carrega do navegador ao iniciar
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE)
      if (salvo) setItens(JSON.parse(salvo))
    } catch (e) { /* ignora */ }
  }, [])

  // salva no navegador sempre que mudar
  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(itens))
    } catch (e) { /* ignora */ }
  }, [itens])

  function adicionar(peca, tamanho) {
    setItens((prev) => {
      const chave = peca.id + '_' + (tamanho || '')
      const existe = prev.find((i) => i.chave === chave)
      if (existe) {
        return prev.map((i) => i.chave === chave ? { ...i, quantidade: i.quantidade + 1 } : i)
      }
      return [...prev, {
        chave,
        id: peca.id,
        nome: peca.nome,
        preco: peca.preco_promocional,
        foto: peca.produto_fotos?.sort((a, b) => a.ordem - b.ordem)[0]?.url || null,
        tamanho: tamanho || null,
        quantidade: 1,
      }]
    })
  }

  function mudarQtd(chave, delta) {
    setItens((prev) => prev
      .map((i) => i.chave === chave ? { ...i, quantidade: Math.max(1, i.quantidade + delta) } : i)
    )
  }

  function remover(chave) {
    setItens((prev) => prev.filter((i) => i.chave !== chave))
  }

  function limpar() {
    setItens([])
  }

  const total = itens.reduce((s, i) => s + i.preco * i.quantidade, 0)
  const qtdTotal = itens.reduce((s, i) => s + i.quantidade, 0)

  return (
    <SacolaContext.Provider value={{ itens, adicionar, mudarQtd, remover, limpar, total, qtdTotal }}>
      {children}
    </SacolaContext.Provider>
  )
}

export function useSacola() {
  return useContext(SacolaContext)
}
