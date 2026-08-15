  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Same threshold the CSS switches the layout on.
  const wide = window.matchMedia('(min-width: 760px)');

  // The panel sits in the page flow under the sticky bar, not as a modal, so Esc
  // and a click on a link are enough — no focus trap, no scroll lock.
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

  // `open` ships in the HTML and is REMOVED here on narrow screens. The other way
  // round would shift the layout at first paint and, with JS off, hide the copy
  // from readers and crawlers. Paragraphs the reader opened themselves stay open,
  // so rotating the phone across the breakpoint does not collapse them mid-read.
  const disclosures = document.querySelectorAll('.more');

  const syncDisclosures = () => {
    disclosures.forEach(d => {
      if (wide.matches) d.open = true;
      else if (!d.dataset.userOpened) d.open = false;
    });
  };
  syncDisclosures();

  disclosures.forEach(d => d.addEventListener('toggle', () => {
    if (d.open && !wide.matches) d.dataset.userOpened = '1';
  }));

  wide.addEventListener('change', () => {
    syncDisclosures();
    closeNav();   // the button is gone above 760px, so an open panel could not be closed
  });
