/* ============================================================
   AURO — El proceso: carrusel deslizable (estilo stories).
   Un único bloque con tarjetas que se pasan con el dedo (swipe),
   con arrastre de ratón, flechas, puntos y barras de progreso.
   Pensado mobile-first (99% de las visitas serán en móvil).
   ============================================================ */
(function () {
  var track = document.getElementById('pcarTrack');
  if (!track) return;

  var slides   = Array.prototype.slice.call(track.querySelectorAll('.pslide'));
  var dotsWrap = document.getElementById('pcarDots');
  var barsWrap = document.getElementById('pcarBars');
  var prevBtn  = document.getElementById('pcarPrev');
  var nextBtn  = document.getElementById('pcarNext');
  var n = slides.length;
  if (!n) return;

  var current = 0;
  var dots = [], bars = [];

  // Construye puntos (nav inferior) y barras (progreso superior)
  slides.forEach(function (s, i) {
    var d = document.createElement('button');
    d.type = 'button';
    d.className = 'pcar__dot';
    d.setAttribute('role', 'tab');
    d.setAttribute('aria-label', 'Ir al paso ' + (i + 1) + ' de ' + n);
    d.addEventListener('click', function () { goTo(i); });
    dotsWrap.appendChild(d);
    dots.push(d);

    var b = document.createElement('span');
    b.className = 'pcar__bar';
    b.innerHTML = '<i></i>';
    barsWrap.appendChild(b);
    bars.push(b);
  });

  function setActive(i) {
    current = i;
    dots.forEach(function (d, k) {
      var on = k === i;
      d.classList.toggle('is-active', on);
      d.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    bars.forEach(function (b, k) {
      b.classList.toggle('is-done', k < i);
      b.classList.toggle('is-active', k === i);
    });
    if (prevBtn) prevBtn.disabled = i <= 0;
    if (nextBtn) nextBtn.disabled = i >= n - 1;
  }

  function goTo(i) {
    i = Math.max(0, Math.min(n - 1, i));
    var s = slides[i];
    var target = s.offsetLeft - (track.clientWidth - s.clientWidth) / 2;
    track.scrollTo({ left: target, behavior: 'smooth' });
    setActive(i);
  }

  // Sincroniza el paso activo cuando el usuario desliza a mano
  var raf = null;
  track.addEventListener('scroll', function () {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      var center = track.scrollLeft + track.clientWidth / 2;
      var best = 0, bestD = Infinity;
      slides.forEach(function (s, i) {
        var c = s.offsetLeft + s.clientWidth / 2;
        var dist = Math.abs(c - center);
        if (dist < bestD) { bestD = dist; best = i; }
      });
      if (best !== current) setActive(best);
    });
  }, { passive: true });

  // Flechas
  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });

  // Teclado sobre el carrusel
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
  });

  // Arrastre con ratón (en móvil el swipe nativo ya funciona)
  var down = false, startX = 0, startScroll = 0, moved = false;
  track.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'touch') return;      // deja el scroll nativo en táctil
    down = true; moved = false;
    startX = e.clientX; startScroll = track.scrollLeft;
    track.classList.add('is-drag');
  });
  window.addEventListener('pointermove', function (e) {
    if (!down) return;
    var dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    track.scrollLeft = startScroll - dx;
  });
  window.addEventListener('pointerup', function () {
    if (!down) return;
    down = false;
    track.classList.remove('is-drag');
    // ajusta al más cercano tras soltar
    var center = track.scrollLeft + track.clientWidth / 2;
    var best = 0, bestD = Infinity;
    slides.forEach(function (s, i) {
      var c = s.offsetLeft + s.clientWidth / 2;
      var dist = Math.abs(c - center);
      if (dist < bestD) { bestD = dist; best = i; }
    });
    goTo(best);
  });
  // Evita que un arrastre dispare clicks accidentales dentro de la tarjeta
  track.addEventListener('click', function (e) {
    if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
  }, true);

  setActive(0);
})();
