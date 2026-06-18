/* ============================================================
   AURO — Banda decorativa de olivas (three.js, sin build)
   Aceitunas + hojas de olivo cruzando de derecha a izquierda,
   con profundidad (parallax) y giro suave. Respeta reduced-motion.
   ============================================================ */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

(function () {
  const canvas = document.querySelector('.olive-band__canvas');
  if (!canvas) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 16);

  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(4, 7, 9); scene.add(key);
  const warm = new THREE.DirectionalLight(0xffe9c7, 0.45);
  warm.position.set(-7, -3, 5); scene.add(warm);

  // --- Geometrías y materiales compartidos ---
  const oliveGeo = new THREE.SphereGeometry(0.5, 18, 14);
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, -0.6);
  leafShape.quadraticCurveTo(0.22, 0, 0, 0.6);
  leafShape.quadraticCurveTo(-0.22, 0, 0, -0.6);
  const leafGeo = new THREE.ShapeGeometry(leafShape);
  const stemGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6);

  const matOliveGreen = new THREE.MeshStandardMaterial({ color: 0x8a8a32, roughness: 0.3, metalness: 0.05 });
  const matOliveDark  = new THREE.MeshStandardMaterial({ color: 0x342c1d, roughness: 0.28, metalness: 0.06 });
  const matLeafA = new THREE.MeshStandardMaterial({ color: 0x7e8a46, roughness: 0.62, side: THREE.DoubleSide });
  const matLeafB = new THREE.MeshStandardMaterial({ color: 0x9ba474, roughness: 0.62, side: THREE.DoubleSide });

  const rnd = (a, b) => a + Math.random() * (b - a);

  function makeOlive() {
    const m = new THREE.Mesh(oliveGeo, Math.random() < 0.72 ? matOliveGreen : matOliveDark);
    m.scale.set(0.6, 0.78, 0.6).multiplyScalar(rnd(0.7, 1.35));
    return m;
  }
  function makeLeaf() {
    const m = new THREE.Mesh(leafGeo, Math.random() < 0.5 ? matLeafA : matLeafB);
    m.scale.setScalar(rnd(0.85, 1.6));
    return m;
  }
  function makeSprig() {
    const g = new THREE.Group();
    const stem = new THREE.Mesh(stemGeo, matLeafA);
    g.add(stem);
    for (let i = 0; i < 4; i++) {
      const lf = new THREE.Mesh(leafGeo, Math.random() < 0.5 ? matLeafA : matLeafB);
      lf.scale.setScalar(0.78);
      lf.position.set(i % 2 ? 0.16 : -0.16, -0.55 + i * 0.34, 0);
      lf.rotation.z = (i % 2 ? -1 : 1) * 0.7;
      g.add(lf);
    }
    const ol = makeOlive(); ol.scale.setScalar(0.5); ol.position.y = 0.8; g.add(ol);
    g.scale.setScalar(rnd(0.7, 1.05));
    return g;
  }

  const bounds = { hw: 30, hh: 6 };
  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const vh = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    bounds.hh = vh / 2; bounds.hw = (vh / 2) * camera.aspect;
  }

  function reposition(o, fromRight) {
    o.position.x = fromRight ? (bounds.hw + rnd(2, 10)) : rnd(-bounds.hw, bounds.hw);
    o.position.y = rnd(-bounds.hh * 0.8, bounds.hh * 0.8);
    o.position.z = rnd(-3, 3.5);
    o.rotation.set(rnd(0, 6.28), rnd(0, 6.28), rnd(0, 6.28));
    o.userData.spd = rnd(1.5, 3.8) * (1 + (o.position.z + 3) / 11);
    o.userData.rx = rnd(-0.4, 0.4);
    o.userData.ry = rnd(-0.5, 0.5);
    o.userData.rz = rnd(-0.4, 0.4);
    o.userData.bob = rnd(0, 6.28);
    o.userData.bobA = rnd(0.15, 0.5);
  }

  resize();
  const items = [];
  const COUNT = 48;
  for (let i = 0; i < COUNT; i++) {
    const r = Math.random();
    const o = r < 0.6 ? makeOlive() : r < 0.9 ? makeLeaf() : makeSprig();
    reposition(o, false);
    scene.add(o); items.push(o);
  }

  const clock = new THREE.Clock();
  let running = false;
  function loop() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    for (const o of items) {
      o.position.x -= o.userData.spd * dt;
      o.rotation.x += o.userData.rx * dt;
      o.rotation.y += o.userData.ry * dt;
      o.rotation.z += o.userData.rz * dt;
      o.userData.bob += dt;
      o.position.y += Math.sin(o.userData.bob) * o.userData.bobA * dt;
      if (o.position.x < -bounds.hw - 2) reposition(o, true);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  function start() { if (!running && !reduce) { running = true; clock.getDelta(); requestAnimationFrame(loop); } }
  function stop() { running = false; }

  addEventListener('resize', resize);
  // Anima solo cuando la banda está en pantalla (rendimiento/batería)
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? start() : stop()));
    }, { threshold: 0.01 }).observe(canvas);
  } else {
    start();
  }

  renderer.render(scene, camera); // frame inicial (y único si reduced-motion)
})();
