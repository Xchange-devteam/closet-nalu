// Cores reais para as amostras (admin e loja)
const HEX = {
  'preto': '#111111',
  'branco': '#FFFFFF',
  'off white': '#F4F0E6',
  'bege': '#D9C3A0',
  'nude': '#E3BC9A',
  'marrom': '#6B4226',
  'caramelo': '#AF6E2D',
  'terracota': '#C0603F',
  'rosa': '#F2A7C3',
  'pink': '#E5397F',
  'vermelho': '#C8102E',
  'vinho': '#6D1A2A',
  'laranja': '#F28C28',
  'amarelo': '#F5C518',
  'verde': '#3FA34D',
  'verde militar': '#4B5320',
  'verde bandeira': '#009739',
  'azul': '#2F6FD6',
  'azul marinho': '#1B2A4A',
  'azul claro': '#9CC7EF',
  'jeans': '#4A6A8C',
  'lilas': '#B69FD6',
  'roxo': '#6A3D9A',
  'cinza': '#8E8E8E',
  'dourado': '#D4AF37',
  'prata': '#C0C0C0',
}

const ESPECIAIS = {
  'estampado': 'conic-gradient(#e74c3c, #f1c40f, #2ecc71, #3498db, #9b59b6, #e74c3c)',
  'listrado': 'repeating-linear-gradient(90deg, #333 0 3px, #fff 3px 6px)',
  'listras': 'repeating-linear-gradient(90deg, #333 0 3px, #fff 3px 6px)',
}

function normalizar(nome) {
  return String(nome || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

// Devolve o "background" CSS da amostra da cor
export function corFundo(nome) {
  const n = normalizar(nome)
  if (ESPECIAIS[n]) return ESPECIAIS[n]
  if (HEX[n]) return HEX[n]
  return 'repeating-linear-gradient(45deg, #ddd 0 3px, #fff 3px 6px)'
}
