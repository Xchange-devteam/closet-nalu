import { useNavigate } from 'react-router-dom'
import { useFavoritos } from '../lib/favoritos'
import { useSacola } from '../lib/sacola'
import BarraNav from '../components/BarraNav'
import Cabecalho from '../components/Cabecalho'

const WHATSAPP = '5522997718930'

const ICONES = {
  dados: (c) => <><circle cx="12" cy="8" r="3.5" stroke={c} strokeWidth="1.6" fill="none" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" /></>,
  favoritos: (c) => <path d="M12 20s-7-4.5-7-9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7-2.5C19 6.5 12 20 12 20Z" stroke={c} strokeWidth="1.6" fill="none" strokeLinejoin="round" />,
  pedidos: (c) => <path d="M6 8h12l-1 12H7L6 8Zm3 0V6a3 3 0 0 1 6 0v2" stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  whatsapp: (c) => <path d="M12 4a8 8 0 0 0-7 12l-1 4 4-1a8 8 0 1 0 4-15Zm-3 5c.3 0 .5 0 .7.5l.7 1.6c.1.3 0 .5-.1.7l-.5.6c-.2.2-.2.4-.1.6a6 6 0 0 0 2.5 2.5c.2.1.4.1.6-.1l.6-.5c.2-.1.4-.2.7-.1l1.6.7c.5.2.5.4.5.7 0 1-.8 1.8-1.8 1.8A8 8 0 0 1 7 12c0-1 .8-1.8 1.8-1.8Z" stroke={c} strokeWidth="1.3" fill="none" strokeLinejoin="round" />,
}

export default function LojaPerfil() {
  const navigate = useNavigate()
  const { favoritos } = useFavoritos()
  const { qtdTotal } = useSacola()

  function falarLoja() {
    window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent('Ola! Tenho uma duvida sobre a loja.'), '_blank')
  }

  const Secao = ({ icone, cor, titulo, sub, onClick }) => (
    <div onClick={onClick} style={{ padding: '16px 20px', borderBottom: '0.5px solid #f1f1f1', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
      <span style={{ width: 26, display: 'flex', justifyContent: 'center' }}>
        <svg width="24" height="24" viewBox="0 0 24 24">{ICONES[icone](cor)}</svg>
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: '#333' }}>{titulo}</div>
        <div style={{ fontSize: 11, color: '#999' }}>{sub}</div>
      </div>
      <span style={{ color: '#ccc' }}>&#8250;</span>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <Cabecalho tela="Minha conta" />

      <div style={{ flex: 1, maxWidth: 560, margin: '0 auto', width: '100%' }}>
        <Secao icone="dados" cor="#AA1B2F" titulo="Meus dados" sub="Nome, telefone e endereco" onClick={() => navigate('/perfil/dados')} />
        <Secao icone="favoritos" cor="#e74c3c" titulo="Meus favoritos" sub={favoritos.length + ' peca(s) salva(s)'} onClick={() => navigate('/favoritos')} />
        <Secao icone="pedidos" cor="#AA1B2F" titulo="Meus pedidos" sub="Em breve" onClick={() => {}} />
        <Secao icone="whatsapp" cor="#25D366" titulo="Falar com a loja" sub="Tirar duvidas no WhatsApp" onClick={falarLoja} />
      </div>

      <BarraNav />
    </div>
  )
}
