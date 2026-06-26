export default function Cabecalho({ tela }) {
  return (
    <div style={{ textAlign: 'center', padding: '18px 0 14px', borderBottom: '0.5px solid #eee', background: '#fff' }}>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, letterSpacing: 4, color: '#AA1B2F' }}>CLOSET NALU</div>
      {tela && (
        <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, letterSpacing: 2, color: '#999', textTransform: 'uppercase', marginTop: 4 }}>{tela}</div>
      )}
    </div>
  )
}
