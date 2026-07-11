/* AURO — menú móvil (hamburguesa). Compartido por todas las páginas. */
(function () {
  var t = document.getElementById('navToggle');
  var n = document.getElementById('nav');
  if (!t || !n) return;
  t.addEventListener('click', function () {
    var open = n.classList.toggle('is-open');
    t.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  n.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      n.classList.remove('is-open');
      t.setAttribute('aria-expanded', 'false');
    });
  });
})();
