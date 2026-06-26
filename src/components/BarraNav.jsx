import { useNavigate, useLocation } from 'react-router-dom'
import { useSacola } from '../lib/sacola'

const ICONES = {
  home: (a) => <path d="M3 11.5 12 4l9 7.5M5 10v10h5v-6h4v6h5V10" stroke={a} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  categorias: (a) => <><rect x="3.5" y="3.5" width="7" height="7" rx="1.2" stroke={a} strokeWidth="1.6" fill="none" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.2" stroke={a} strokeWidth="1.6" fill="none" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.2" stroke={a} strokeWidth="1.6" fill="none" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.2" stroke={a} strokeWidth="1.6" fill="none" /></>,
  colecao: (a) => <><rect x="3.5" y="4.5" width="17" height="15" rx="1.5" stroke={a} strokeWidth="1.6" fill="none" /><path d="M3.5 9.5h17M9 4.5v15" stroke={a} strokeWidth="1.6" /></>,
  sacola: (a) => <path d="M6 8h12l-1 12H7L6 8Zm3 0V6a3 3 0 0 1 6 0v2" stroke={a} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  perfil: (a) => <><circle cx="12" cy="8" r="3.5" stroke={a} strokeWidth="1.6" fill="none" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" stroke={a} strokeWidth="1.6" fill="none" strokeLinecap="round" /></>,
}

const ITENS = [
  { key: 'home', lbl: 'Home', rota: '/' },
  { key: 'categorias', lbl: 'Categorias', rota: '/categorias' },
  { key: 'colecao', lbl: 'Coleção', rota: '/todas' },
  { key: 'sacola', lbl: 'Sacola', rota: '/sacola' },
  { key: 'perfil', lbl: 'Perfil', rota: '/perfil' },
]

export default function BarraNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { qtdTotal } = useSacola()
  const ATIVO = '#AA1B2F'
  const INATIVO = '#999'

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 0 10px', borderTop: '0.5px solid #eee', background: '#fff', fontFamily: 'Arial, sans-serif', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
      {ITENS.map(({ key, lbl, rota }) => {
        const ativo = location.pathname === rota
        const cor = ativo ? ATIVO : INATIVO
        return (
          <div key={key} onClick={() => navigate(rota)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: 10.5, color: cor, cursor: 'pointer', position: 'relative', flex: 1 }}>
            <span style={{ position: 'relative', display: 'flex' }}>
              <svg width="24" height="24" viewBox="0 0 24 24">{ICONES[key](cor)}</svg>
              {key === 'sacola' && qtdTotal > 0 && (
                <span style={{ position: 'absolute', top: -5, right: -7, background: ATIVO, color: '#fff', fontSize: 9, minWidth: 15, height: 15, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{qtdTotal}</span>
              )}
            </span>
            {lbl}
          </div>
        )
      })}
    </div>
  )
}
