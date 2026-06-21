/* AURO — Comparador: anima barras y revela al entrar en pantalla */
(function () {
  const sec = document.querySelector('#comparador');
  if (!sec) return;
  const bars = sec.querySelectorAll('.comp__bar > i');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function play() { sec.classList.add('in'); bars.forEach((b) => { b.style.width = (b.dataset.w || 0) + '%'; }); }
  if (reduce) { play(); return; }
  new IntersectionObserver((es, ob) => es.forEach((e) => { if (e.isIntersecting) { play(); ob.disconnect(); } }), { threshold: 0.25 }).observe(sec);
})();
