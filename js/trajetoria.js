// Trajetória de diferenciais — a trilha de luz se desenha com o scroll
// e cada ponto/card acende quando a luz o alcança (reversível).
export function initTrajetoria() {
  const section = document.querySelector('.trajetoria');
  const wrap = section?.querySelector('.traj-wrap');
  const svg = section?.querySelector('.traj-svg');
  if (!section || !wrap || !svg) return;

  const core = svg.querySelector('.traj-line-core');
  const glow = svg.querySelector('.traj-line-glow');
  const items = [...wrap.querySelectorAll('.traj-item')];
  const outro = section.querySelector('.traj-outro');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let len = 0, nodeLens = [];

  const buildPath = () => {
    const wr = wrap.getBoundingClientRect();
    const W = wrap.clientWidth, H = wrap.clientHeight;
    const cx = W / 2;
    const mobile = W < 700;
    const amp = mobile ? 0 : Math.min(W * 0.12, 150);
    const pts = [{ x: cx, y: -20 }];
    items.forEach((it) => {
      const node = it.querySelector('.traj-node');
      const nr = node.getBoundingClientRect();
      pts.push({ x: nr.left - wr.left + nr.width / 2, y: nr.top - wr.top + nr.height / 2 });
    });
    pts.push({ x: cx, y: H + 20 });

    // curva suave (catmull-rom → bezier)
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
    }
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    core.setAttribute('d', d); glow.setAttribute('d', d);

    len = core.getTotalLength();
    core.style.strokeDasharray = len; glow.style.strokeDasharray = len;

    // comprimento da trilha até cada nó (amostragem)
    nodeLens = [];
    const SAMPLES = 400;
    let si = 0;
    items.forEach((it, idx) => {
      const target = pts[idx + 1];
      let best = 0, bestDist = Infinity;
      for (let s = si; s <= SAMPLES; s++) {
        const pt = core.getPointAtLength((s / SAMPLES) * len);
        const dist = Math.hypot(pt.x - target.x, pt.y - target.y);
        if (dist < bestDist) { bestDist = dist; best = s; }
      }
      si = best;
      nodeLens.push((best / SAMPLES) * len);
    });
  };

  window.addEventListener('resize', buildPath, { passive: true });
  buildPath();

  if (reduce) {
    core.style.strokeDashoffset = 0; glow.style.strokeDashoffset = 0;
    items.forEach(it => it.classList.add('lit'));
    outro.classList.add('lit');
    document.body.classList.add('has-traj');
    return;
  }

  const tick = () => {
    const wr = wrap.getBoundingClientRect();
    // a luz alcança o ponto que está a 62% da altura da tela
    const drawn = Math.min(Math.max((window.innerHeight * 0.62 - wr.top) / wr.height, 0), 1) * len;
    core.style.strokeDashoffset = len - drawn;
    glow.style.strokeDashoffset = len - drawn;
    items.forEach((it, i) => it.classList.toggle('lit', drawn >= nodeLens[i]));
    outro.classList.toggle('lit', drawn >= len * 0.995);
    requestAnimationFrame(tick);
  };
  document.body.classList.add('has-traj');
  requestAnimationFrame(tick);
}
