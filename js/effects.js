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
