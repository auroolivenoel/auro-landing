/* ============================================================
   AURO — Generador de versiones por idioma con slug propio.

   La web se escribe UNA sola vez en la raíz (index.html / gracias.html,
   en español, que i18n.js traduce en cliente). Este script produce las
   URLs por idioma que pide el SEO:

     /            → alemán  (idioma por defecto · x-default)
     /es/         → español
     /en/         → inglés

   Cada página generada:
     · corrige las rutas relativas (assets, styles, favicon) con ../
     · enlaza las páginas legales de la raíz con ?lang= del idioma
     · fija <html lang>, canonical, og:url y og:locale del idioma
   El idioma efectivo lo detecta i18n.js por la ruta (/es/ o /en/).

   USO:  node tools/build-langs.js      (desde la raíz del repo)
   Vuelve a ejecutarlo cada vez que edites index.html o gracias.html.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const LANGS = { es: 'es_ES', en: 'en_US' };
const LEGAL = ['aviso-legal', 'politica-privacidad', 'politica-cookies', 'politica-redes-sociales'];
const ROOT = path.resolve(__dirname, '..');

function rewriteAssets(html) {
  // Cualquier atributo que apunte a assets/ (href, src, data-desktop, data-mobile…)
  html = html.replace(/="assets\//g, '="../assets/');
  html = html.replace(/="styles\.css/g, '="../styles.css');
  html = html.replace(/="favicon\.svg"/g, '="../favicon.svg"');
  return html;
}

function banner(html, src) {
  return html.replace('<head>',
    '<head>\n<!-- GENERADO por tools/build-langs.js desde /' + src +
    ' — NO editar a mano; edita la raíz y ejecuta `node tools/build-langs.js`. -->');
}

function genIndex(lang) {
  let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  html = rewriteAssets(html);
  LEGAL.forEach(function (p) {
    html = html.split('href="' + p + '.html"').join('href="../' + p + '.html?lang=' + lang + '"');
  });
  html = html.replace('<html lang="es" translate="no">', '<html lang="' + lang + '" translate="no">');
  html = html.replace('<link rel="canonical" href="https://auro.de/">',
    '<link rel="canonical" href="https://auro.de/' + lang + '/">');
  html = html.replace('<meta property="og:url" content="https://auro.de/">',
    '<meta property="og:url" content="https://auro.de/' + lang + '/">');
  html = html.replace('<meta property="og:locale" content="de_DE">',
    '<meta property="og:locale" content="' + LANGS[lang] + '">');
  html = banner(html, 'index.html');
  fs.mkdirSync(path.join(ROOT, lang), { recursive: true });
  fs.writeFileSync(path.join(ROOT, lang, 'index.html'), html);
}

function genGracias(lang) {
  let html = fs.readFileSync(path.join(ROOT, 'gracias.html'), 'utf8');
  html = rewriteAssets(html);
  html = html.replace('<html lang="es">', '<html lang="' + lang + '">');
  html = banner(html, 'gracias.html');
  fs.writeFileSync(path.join(ROOT, lang, 'gracias.html'), html);
}

Object.keys(LANGS).forEach(function (l) { genIndex(l); genGracias(l); });
console.log('OK — generadas', Object.keys(LANGS).map(function (l) { return '/' + l + '/'; }).join(', '));
