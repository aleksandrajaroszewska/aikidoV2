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
