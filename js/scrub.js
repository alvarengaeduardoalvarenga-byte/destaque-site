// Scrub de matrícula — frames da fachada avançam com o scroll;
// o formulário nasce sobre o frame final (amanhecer frontal).
const FRAME_COUNT = 160;
const framePath = (i) => `assets/frames/matricula/frame_${String(i + 1).padStart(4, '0')}.jpg`;

export function initScrub() {
  const section = document.querySelector('.scrub-section');
  const canvas = document.querySelector('.scrub-canvas');
  if (!section || !canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  const imgs = new Array(FRAME_COUNT);
  for (let i = 0; i < FRAME_COUNT; i++) {
    const im = new Image();
    im.src = framePath(i);
    if (i === 0) im.onload = () => { lastFrame = -1; };
    imgs[i] = im;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let lastFrame = -1;
  const resize = () => {
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    lastFrame = -1;
  };
  window.addEventListener('resize', resize, { passive: true });

  const draw = (idx) => {
    const im = imgs[idx];
    if (!im || !im.complete || !im.naturalWidth) return false;
    const cw = canvas.width, ch = canvas.height;
    const s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
    const w = im.naturalWidth * s, h = im.naturalHeight * s;
    const ox = (cw - w) / 2;
    // corte vertical enviesado: preserva o texto no céu (15% do excesso sai do topo, o resto do chão)
    const oy = h > ch ? (ch - h) * 0.15 : (ch - h) / 2;
    ctx.drawImage(im, ox, oy, w, h);
    return true;
  };

  const form = section.querySelector('.scrub-form');
  const hint = section.querySelector('.scrub-hint');
  const caption = section.querySelector('.scrub-caption');
  const tick = () => {
    const rect = section.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 1;
    const idx = Math.min(FRAME_COUNT - 1, Math.floor(p * (FRAME_COUNT - 1)));
    if (idx !== lastFrame && draw(idx)) lastFrame = idx;
    // entrada sem costura: a fachada se materializa ENQUANTO a seção se aproxima
    // (antes de colar na tela), completando pouco antes do pin — sem tela vazia, sem pop
    const entry = Math.min(Math.max(1 - rect.top / window.innerHeight, 0), 1);
    const e = Math.min(1, entry / 0.85);
    canvas.style.opacity = e * e * (3 - 2 * e);
    const fp = Math.min(Math.max((p - 0.78) / 0.17, 0), 1);
    form.style.opacity = fp;
    form.style.transform = `translateY(${(1 - fp) * 40}px)`;
    form.style.pointerEvents = fp > 0.5 ? 'auto' : 'none';
    if (caption) {
      // legenda nasce junto com o amanhecer, no centro, acima do portal azul
      const cp = Math.min(Math.max((p - 0.5) / 0.15, 0), 1);
      caption.style.opacity = cp;
      caption.style.transform = `translateX(-50%) translateY(${(1 - cp) * 20}px)`;
    }
    if (hint) hint.style.opacity = p < 0.05 ? '1' : '0';
    requestAnimationFrame(tick);
  };

  document.body.classList.add('has-scrub');
  resize();
  requestAnimationFrame(tick);
}
