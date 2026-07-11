# AURO — Aceite de Oliva Virgen Extra

Marca de aceite de oliva virgen extra **100% Picual** de cosecha temprana, **Sierra Mágina · Jaén**.
Estética mediterránea, artesanal, premium y editorial.

## Estructura

```
index.html            # Web principal (ES) — sistema visual / e-commerce gourmet
styles.css            # Sistema visual (variables, componentes, responsive)
assets/
  logo-auro.png         # Logotipo (AURO + rama de olivo + gota dorada)
  lata-auro.png         # Producto: lata 500 ml
favicon.svg           # Favicon (oliva + hoja)

de/                   # Landing de prelanzamiento mercado alemán (archivada)
  index.html            # Versión alemana
  index.es.html         # Versión española de esa landing
  impressum.html · datenschutz.html · kontakt.html   # Legales (DSGVO)
  *.jpg · *.svg         # Sus imágenes y marcos de laurel

.github/workflows/    # Despliegue automático a GitHub Pages
```

## Sistema visual (web principal)

- **Paleta** (variables `:root`): negro oliva `#171713`, verde oliva `#6F6B2E`, dorado `#B9983A`,
  crema `#F4EFE5`, terracota `#B64222`, blanco cálido `#FFFAF2`, gris texto `#5F5A4D`.
- **Tipografías**: Oswald (titulares), Inter (cuerpo/UI), Cormorant Garamond (editorial).
- **Componentes**: header, hero, bloque de origen, atributos (4 cards), sección producto
  (con selector de cantidad), bloque editorial y footer.
- **Botones**: principal, secundario y editorial.
- Textura papel sutil, separadores finos, formas geométricas y motivos de olivo.
- Responsive mobile-first.

## Desarrollo local

```bash
python3 -m http.server 8000   # o: npx serve .
```
Web principal → http://localhost:8000 · Landing alemana → http://localhost:8000/de/

## Despliegue — GitHub Pages (automático)

GitHub Actions (`.github/workflows/deploy.yml`) publica en cada `push` a `main`.
Configuración: **Settings → Pages → Source: GitHub Actions**.

- Web principal: `https://<usuario>.github.io/<repo>/`
- Landing alemana: `https://<usuario>.github.io/<repo>/de/`

### Dominio propio (opcional)

`CNAME.example` contiene el dominio. Renómbralo a `CNAME` cuando el DNS apunte a GitHub Pages
(ver IPs en el historial del archivo) y configúralo en **Settings → Pages → Custom domain**.

## Prelanzamiento — lista de espera (modo actual)

La web está en **modo prelanzamiento**: la CTA principal es la **lista de espera**
(`#lista`), no la compra. Registro → lead en Odoo → página de gracias.

- **Sección de lista de espera** (`#lista` en `index.html`): email + nombre + consentimiento,
  barra de escasez y el **regalo** (IA de recetas para los primeros).
- **Registro → Odoo**: en `assets/waitlist.js`, edita la constante `ODOO`:
  - `endpoint`: pega la URL que recibe el lead. Opciones:
    - **A)** Formulario web de Odoo: `https://TU-EMPRESA.odoo.com/website/form/crm.lead`
      (funciona limpio si la web y Odoo comparten dominio, o con CORS/CSRF configurados).
    - **B)** Proxy serverless (recomendado para GitHub Pages, no expone la API key):
      `https://tu-proxy.workers.dev/lead`.
  - Si `endpoint` está vacío → **modo local**: guarda los registros en el navegador
    (exportables con `window.auroExportLeads()` en la consola) y lleva a `gracias.html`.
  - **Cada registro se guarda siempre en local como copia de seguridad**, aunque Odoo falle.
- **Página de gracias** (`gracias.html`): animación (sello + confeti de marca) y el regalo de la IA.
- **Cuenta atrás real** en el footer hasta la **primera cosecha (1 nov 2026)**.
  Cambia la fecha en el atributo `data-deadline` del `#countdown` en `index.html`.
- **El proceso**: carrusel deslizable tipo *stories* (mobile-first). Fotos en
  `assets/proceso/01–06.jpg` (ver `assets/proceso/README.md`).
- **Mapa "El viaje del origen"**: teñido con la paleta de la marca (duotono oliva/oro).
- **Imagen del footer**: sube la sierra a `assets/footer-sierra.jpg`
  (ver `assets/footer-sierra.README.md`).

## Pendiente antes de producción

- **Odoo**: pega la URL del `endpoint` en `assets/waitlist.js` (ver arriba).
- **Textos legales**: rellenar `aviso-legal.html`, `politica-privacidad.html`,
  `politica-cookies.html`, `politica-redes-sociales.html` (creadas y enlazadas, vacías).
- **Imágenes**: `assets/footer-sierra.jpg` y las 6 fotos de `assets/proceso/`.
- Sustituir placeholders: email (`hola@auro.es`), teléfono, redes.
- Versión clara/transparente del logo para fondos oscuros (footer).
- Auto-alojar fuentes para RGPD estricto y optimizar imágenes a WebP.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
