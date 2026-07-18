  // group tabs
  document.querySelectorAll('.group-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.group-tab').forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });
      document.querySelectorAll('.group-panel').forEach(p => {
        p.classList.toggle('active', p.dataset.panel === tab);
      });
    });
  });

  // map facade — Google iframe wczytuje się dopiero po kliknięciu
  document.querySelectorAll('.map-load').forEach(btn => {
    btn.addEventListener('click', () => {
      const frame = btn.closest('.map-frame');
      const iframe = frame.querySelector('iframe[data-src]');
      if (iframe) iframe.src = iframe.dataset.src;
      frame.classList.add('map-loaded');
    });
  });

  // reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
