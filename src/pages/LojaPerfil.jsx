import { useNavigate } from 'react-router-dom'
import { useFavoritos } from '../lib/favoritos'
import { useSacola } from '../lib/sacola'

const WHATSAPP = '5522997718930'

export default function LojaPerfil() {
  const navigate = useNavigate()
  const { favoritos } = useFavoritos()
  const { qtdTotal } = useSacola()

  function falarLoja() {
    window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent('Ola! Tenho uma duvida sobre a loja.'), '_blank')
  }

  const Secao = ({ icone, cor, titulo, sub, onClick }) => (
    <div onClick={onClick} style={{ padding: '16px 20px', borderBottom: '0.5px solid #f1f1f1', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
      <span style={{ fontSize: 22, color: cor, width: 26, textAlign: 'center' }}>{icone}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: '#333' }}>{titulo}</div>
        <div style={{ fontSize: 11, color: '#999' }}>{sub}</div>
      </div>
      <span style={{ color: '#ccc' }}>&#8250;</span>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', padding: '24px 0 18px', borderBottom: '0.5px solid #eee' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#f0e6e8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 28, color: '#AA1B2F' }}>&#9786;</div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#222' }}>Minha conta</div>
      </div>

      <div style={{ flex: 1, maxWidth: 560, margin: '0 auto', width: '100%' }}>
        <Secao icone={'☺'} cor="#AA1B2F" titulo="Meus dados" sub="Nome, telefone e endereco" onClick={() => navigate('/perfil/dados')} />
        <Secao icone={'♥'} cor="#e74c3c" titulo="Meus favoritos" sub={favoritos.length + ' peca(s) salva(s)'} onClick={() => navigate('/favoritos')} />
        <Secao icone={'⛉'} cor="#AA1B2F" titulo="Meus pedidos" sub="Em breve" onClick={() => {}} />
        <Secao icone={'☎'} cor="#25D366" titulo="Falar com a loja" sub="Tirar duvidas no WhatsApp" onClick={falarLoja} />
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
      {item('\u26B2', 'Coleção', '/todas', false, 0)}
      {item('🛍', 'Sacola', '/sacola', false, qtdTotal)}
      {item('\u263A', 'Perfil', null, true, 0)}
    </div>
  )
}
