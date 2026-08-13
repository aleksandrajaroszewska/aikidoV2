  // Ujawnianie sekcji przy scrollu. Stan początkowy (.reveal) i końcowy (.in)
  // opisuje CSS — tu jest tylko przełącznik. rootMargin -12% odpala animację,
  // gdy element wejdzie w kadr na dobre, a nie samą krawędzią.
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Jeden próg dla obu zachowań niżej — ten sam, na którym CSS przełącza układ
  // na desktopowy (css/03-base.css opisuje oba progi projektu).
  const wide = window.matchMedia('(min-width: 760px)');

  // ─── nawigacja mobilna ───
  // Panel siedzi w przepływie strony pod sticky paskiem, nie jest modalem —
  // Esc i klik w link wystarczą, pułapka focusu i blokada scrolla byłyby tu
  // nadmiarowe. Przycisk istnieje tylko pod html.js, więc jego brak nic nie psuje.
  const topbar = document.querySelector('.topbar');
  const toggle = document.querySelector('.nav-toggle');

  const closeNav = () => {
    if (!topbar || !toggle) return;
    topbar.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  if (topbar && toggle) {
    toggle.addEventListener('click', () => {
      const open = topbar.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && topbar.classList.contains('is-open')) {
        closeNav();
        toggle.focus();
      }
    });

    document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', closeNav));
  }

  // ─── zwijanie długich akapitów poniżej 760px ───
  // `open` przyjeżdża w HTML-u i tutaj je ZDEJMUJEMY na wąskim ekranie. Odwrotna
  // kolejność — dokładanie `open` na desktopie — dawałaby skok układu przy
  // pierwszym malowaniu, a przy wyłączonym JS chowała treść przed czytelnikiem
  // i wyszukiwarką. Na mobile mignięcia nie ma, bo te bloki są w .reveal.
  const syncDisclosures = () => {
    document.querySelectorAll('.more').forEach(d => { d.open = wide.matches; });
  };
  syncDisclosures();

  wide.addEventListener('change', () => {
    syncDisclosures();
    closeNav();   // przycisk znika od 760px, więc otwarty panel nie miałby czym się zamknąć
  });
