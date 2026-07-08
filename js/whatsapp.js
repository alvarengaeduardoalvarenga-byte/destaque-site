export function buildWhatsappUrl({ number, nome, telefone, serie }) {
  const digits = String(number).replace(/\D/g, '');
  let msg = `Olá! Tenho interesse na matrícula 2027 do Colégio Destaque.\n`
    + `Nome: ${nome}\n`
    + `Telefone: ${telefone}`;
  if (serie) msg += `\nSérie/segmento de interesse: ${serie}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

// Número de destino — PENDÊNCIA do cliente. Placeholder até chegar.
export const WHATSAPP_NUMBER = '5575998007676';

// PENDÊNCIA do cliente: URL do webhook do CRM (ex.: RD Station, Zapier, Make).
// Vazio = envio ao CRM desligado; o WhatsApp continua funcionando normalmente.
export const CRM_WEBHOOK_URL = '';

function sendToCrm(data) {
  if (!CRM_WEBHOOK_URL) return;
  try {
    fetch(CRM_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, origem: 'site', campanha: 'matricula-2027' }),
      keepalive: true,
    }).catch(() => {});
  } catch (e) { /* nunca bloquear o WhatsApp */ }
}

export function initEnrollForm(root = document) {
  const form = root.querySelector('#enroll-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const url = buildWhatsappUrl({ number: WHATSAPP_NUMBER, ...data });
    sendToCrm(data);
    window.open(url, '_blank', 'noopener');
  });
}
