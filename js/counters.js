export function formatCount(value, suffix = '') {
  return new Intl.NumberFormat('pt-BR').format(value) + suffix;
}

export function initCounters(root = document) {
  const els = root.querySelectorAll('[data-count]');
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const run = (el) => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target)) return;
    const suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = formatCount(target, suffix); return; }
    const dur = 1400; const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatCount(Math.round(target * eased), suffix);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: .4 });
  els.forEach(el => io.observe(el));
}
