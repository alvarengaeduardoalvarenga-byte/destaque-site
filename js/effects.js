export function initHeaderCondense() {
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('condensed', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
}

export function initVideoCards() {
  document.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.video;
      if (!id || id === 'VIDEO_PLACEHOLDER') { alert('Vídeo em breve.'); return; }
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
      iframe.allow = 'autoplay; encrypted-media'; iframe.allowFullscreen = true;
      iframe.style.cssText = 'width:100%;height:100%;border:0;';
      card.replaceChildren(iframe);
    });
  });
}

export function initSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.Lenis) return;
  const lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}

export function initReveals() {
  const els = document.querySelectorAll('.reveal');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('is-visible')); return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
  }, { threshold: .15 });
  els.forEach(el => io.observe(el));
}

export function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const els = [...document.querySelectorAll('[data-parallax]')];
  const onScroll = () => els.forEach(el => {
    const speed = 0.25;
    el.style.transform = `translateY(${window.scrollY * speed}px)`;
  });
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
