/* AURO — La lata: explorador interactivo (puntos + chips). Sin dependencias. */
(function () {
  var section = document.getElementById('lata');
  if (!section) return;

  var dots = Array.prototype.slice.call(section.querySelectorAll('.lata__dot'));
  var chips = Array.prototype.slice.call(section.querySelectorAll('.lata__chip'));
  var infos = Array.prototype.slice.call(section.querySelectorAll('.lata__info'));

  function activate(key) {
    dots.forEach(function (d) { d.classList.toggle('is-active', d.getAttribute('data-k') === key); });
    chips.forEach(function (c) {
      var on = c.getAttribute('data-k') === key;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    infos.forEach(function (i) { i.classList.toggle('is-active', i.getAttribute('data-k') === key); });
  }

  dots.concat(chips).forEach(function (el) {
    el.addEventListener('click', function () { activate(el.getAttribute('data-k')); });
  });

  /* Flechas anterior / siguiente: recorren los aspectos en bucle */
  var arrows = Array.prototype.slice.call(section.querySelectorAll('.lata__arrow'));
  if (arrows.length && chips.length) {
    arrows.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = 0;
        chips.forEach(function (c, n) { if (c.classList.contains('is-active')) i = n; });
        var step = btn.getAttribute('data-nav') === 'prev' ? -1 : 1;
        var next = (i + step + chips.length) % chips.length;
        activate(chips[next].getAttribute('data-k'));
      });
    });
  }
})();
