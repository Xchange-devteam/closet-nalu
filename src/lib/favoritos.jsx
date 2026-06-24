import { createContext, useContext, useState, useEffect } from 'react'

const FavoritosContext = createContext()
const CHAVE = 'closet_nalu_favoritos'

export function FavoritosProvider({ children }) {
  const [favoritos, setFavoritos] = useState([])

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE)
      if (salvo) setFavoritos(JSON.parse(salvo))
    } catch (e) {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(favoritos))
    } catch (e) {}
  }, [favoritos])

  function alternar(id) {
    setFavoritos((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  function ehFavorito(id) {
    return favoritos.includes(id)
  }

  return (
    <FavoritosContext.Provider value={{ favoritos, alternar, ehFavorito }}>
      {children}
    </FavoritosContext.Provider>
  )
}

export function useFavoritos() {
  return useContext(FavoritosContext)
}
