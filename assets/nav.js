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

/* CTA fija: visible al pasar el hero y oculta cuando la lista está en pantalla */
(function () {
  var el = document.getElementById('stickyCta');
  if (!el) return;
  var lista = document.getElementById('lista');
  function update() {
    var y = window.scrollY || window.pageYOffset || 0;
    var pastHero = y > window.innerHeight * 0.7;
    var listaInView = false;
    if (lista) {
      var r = lista.getBoundingClientRect();
      listaInView = r.top < window.innerHeight * 0.9 && r.bottom > 0;
    }
    el.classList.toggle('is-visible', pastHero && !listaInView);
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
