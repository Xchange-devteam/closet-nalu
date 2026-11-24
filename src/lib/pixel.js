// Meta Pixel: envia eventos sem nunca quebrar o site (ex.: bloqueador de anuncios)
export function rastrear(evento, dados) {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      if (dados) window.fbq('track', evento, dados)
      else window.fbq('track', evento)
    }
  } catch (e) { /* ignora */ }
}
