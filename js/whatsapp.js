export function buildWhatsappUrl({ number, nome, telefone, serie }) {
  const digits = String(number).replace(/\D/g, '');
  const msg = `Olá! Tenho interesse em matrícula no Colégio Destaque.\n`
    + `Nome do responsável: ${nome}\n`
    + `Telefone: ${telefone}\n`
    + `Série/segmento de interesse: ${serie}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

// Número de destino — PENDÊNCIA do cliente. Placeholder até chegar.
export const WHATSAPP_NUMBER = '5575000000000';

export function initEnrollForm(root = document) {
  const form = root.querySelector('#enroll-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const url = buildWhatsappUrl({ number: WHATSAPP_NUMBER, ...data });
    window.open(url, '_blank', 'noopener');
  });
}
