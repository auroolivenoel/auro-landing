# Fotos de "Ideas para tu mesa" (usos del aceite)

Galería de la sección `#recetas` de `index.html`: fotos de comida donde brilla
AURO (tostadas, ensaladas, platos, etc.).

## Cómo añadir una foto nueva

1. Sube la imagen a esta carpeta (`assets/recetas/`), preferiblemente:
   - formato **JPG** o **WebP**,
   - ~**1400 px** de ancho como máximo,
   - optimizada (las actuales pesan ~300–470 KB).
2. En `index.html`, dentro de `<div class="recetas__grid">`, **duplica una
   tarjeta** y cambia la imagen y el texto:

   ```html
   <article class="receta-card">
     <div class="receta-card__media">
       <img src="assets/recetas/TU-FOTO.jpg" alt="Descripción de la foto"
            loading="lazy" width="1400" height="1400">
     </div>
     <div class="receta-card__body">
       <h3>Título</h3>
       <p>Descripción breve de cómo usar el aceite.</p>
     </div>
   </article>
   ```
3. Para que el título/descripción salgan también en **alemán e inglés**, añade
   las traducciones en `assets/i18n.js` (bloques `de` y `en`), usando el texto
   en español como clave. Si no, ese texto se verá en español al cambiar de
   idioma.

## Fotos actuales

- `tostada.jpg` — tostada de pan (desde `de/bread-tasting.jpg`, redimensionada).
- `ensalada.jpg` — ensalada (desde `de/salad.jpg`, redimensionada).
