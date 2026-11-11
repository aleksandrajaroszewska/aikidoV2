// The panel sits in the page flow under the sticky bar, not as a modal, so Esc
// and a click on a link are enough — no focus trap, no scroll lock.
const topbar = document.querySelector('.topbar');
const toggle = document.querySelector('.nav-toggle');

if (topbar && toggle) {
  const closeNav = () => {
    topbar.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

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

  // Same threshold the CSS switches the layout on: the button is gone above
  // 760px, so an open panel could not be closed.
  window.matchMedia('(min-width: 760px)').addEventListener('change', closeNav);
}
