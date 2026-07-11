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

  // Sellos de origen: solo se muestran si el logo existe realmente
  (function () {
    var wrap = document.querySelector('.sellos');
    if (!wrap) return;
    var imgs = Array.prototype.slice.call(wrap.querySelectorAll('.sello'));
    function ok(img) { if (img.naturalWidth > 0) wrap.style.display = 'block'; }
    imgs.forEach(function (img) {
      if (img.complete) { img.naturalWidth > 0 ? ok(img) : img.remove(); }
      else { img.addEventListener('load', function () { ok(img); }); img.addEventListener('error', function () { img.remove(); }); }
    });
  })();
})();
