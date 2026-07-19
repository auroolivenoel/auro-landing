/* ============================================================
   AURO — Hero: elige el vídeo según el dispositivo.
   · Escritorio: vídeo horizontal (data-desktop).
   · Móvil: vídeo vertical (data-mobile).
   Si el vídeo de móvil todavía no existe (o falla), usa el de
   escritorio para que el hero nunca quede vacío.
   ============================================================ */
(function () {
  var v = document.querySelector('.hero__video');
  if (!v) return;

  var existing = v.querySelector('source');
  var desktop = v.getAttribute('data-desktop') || (existing && existing.getAttribute('src')) || '';
  var mobile = v.getAttribute('data-mobile') || '';
  var mq = window.matchMedia('(max-width: 760px)');
  var current = existing ? existing.getAttribute('src') : '';

  function setSource(src) {
    if (!src || current === src) return;
    current = src;
    var s = v.querySelector('source');
    if (!s) { s = document.createElement('source'); s.type = 'video/mp4'; v.appendChild(s); }
    s.setAttribute('src', src);
    v.load();
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  function choose() {
    var wantMobile = mq.matches && mobile;
    setSource(wantMobile ? mobile : desktop);
    if (wantMobile && desktop) {
      // Si el vídeo de móvil falla o no carga a tiempo, vuelve al de escritorio.
      var done = false;
      var fallback = function () { if (!done) { done = true; setSource(desktop); } };
      v.addEventListener('error', fallback, { once: true });
      var t = setTimeout(function () { if (v.readyState < 1) fallback(); }, 3000);
      v.addEventListener('loadeddata', function () { done = true; clearTimeout(t); }, { once: true });
    }
  }

  choose();
  if (mq.addEventListener) mq.addEventListener('change', choose);
  else if (mq.addListener) mq.addListener(choose);
})();
