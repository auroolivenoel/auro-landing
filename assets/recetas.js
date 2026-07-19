/* ============================================================
   AURO — En crudo: selector interactivo de usos.
   Al pasar el ratón (escritorio) o tocar (móvil) un uso, se
   muestra su foto. Compatible con teclado.
   ============================================================ */
(function () {
  var sec = document.getElementById('recetas');
  if (!sec) return;
  var opts = Array.prototype.slice.call(sec.querySelectorAll('.usos__opt'));
  var panels = Array.prototype.slice.call(sec.querySelectorAll('.usos__panel'));
  if (!opts.length || !panels.length) return;
  var canHover = window.matchMedia('(hover:hover)').matches;

  function activate(k) {
    opts.forEach(function (o) {
      var on = o.dataset.k === k;
      o.classList.toggle('is-active', on);
      o.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    panels.forEach(function (p) {
      p.classList.toggle('is-active', p.dataset.k === k);
    });
  }

  opts.forEach(function (o) {
    o.addEventListener('click', function () { activate(o.dataset.k); });
    o.addEventListener('focus', function () { activate(o.dataset.k); });
    if (canHover) o.addEventListener('mouseenter', function () { activate(o.dataset.k); });
  });
})();
