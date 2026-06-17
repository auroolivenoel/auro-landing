# AEORUM — Landing Page

Landing page de **AEORUM**, aceite de oliva virgen extra de Jaén (100% Arbequina), orientada al mercado alemán. Markteinführung 2026.

Estética xilográfica en verde oscuro + crema/marfil, con tipografía Barlow Condensed / DM Sans, animaciones GSAP y un formulario de captación de leads (Vormerkung) con consentimiento RGPD.

## Estructura

Sitio estático, sin build. Se sirve tal cual.

```
index.html            # Landing principal
impressum.html        # Aviso legal (§5 DDG/TMG)
datenschutz.html      # Política de privacidad (DSGVO/RGPD)
kontakt.html          # Contacto
favicon.svg           # Favicon (oliva + hoja)
laurel.svg            # Marco decorativo (laurel) — fondos oscuros
laurel-dark.svg       # Marco decorativo (laurel) — fondos claros
*.jpg / *.png         # Imágenes (lata, cosecha, ensalada, paisaje, patrón…)
```

## Desarrollo local

Cualquier servidor estático sirve. Por ejemplo:

```bash
python3 -m http.server 8000
# o
npx serve .
```

Luego abre http://localhost:8000

## Despliegue — GitHub Pages

El sitio se publica desde la raíz de la rama `main`:

1. Sube el repositorio a GitHub.
2. En **Settings → Pages**, selecciona **Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. La URL será `https://<usuario>.github.io/<repo>/`.

El archivo `.nojekyll` evita el procesado por Jekyll.

## Pendiente antes de producción

- Rellenar los datos `[entre corchetes]` en `impressum.html`, `datenschutz.html` y `kontakt.html`.
- Auto-alojar Google Fonts y GSAP (ahora vía CDN) para cumplir RGPD de forma estricta.
- Conectar el formulario a un backend / servicio de email (ahora guarda en `localStorage` y exporta CSV en local).
- Optimizar/convertir las imágenes a WebP.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
