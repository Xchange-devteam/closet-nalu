import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { rastrear } from './pixel'

// Conta um PageView a cada troca de tela (a primeira ja e contada no index.html)
export default function RastreioPaginas() {
  const location = useLocation()
  const primeira = useRef(true)
  useEffect(() => {
    if (primeira.current) { primeira.current = false; return }
    if (location.pathname.startsWith('/admin')) return
    rastrear('PageView')
  }, [location.pathname])
  return null
}
