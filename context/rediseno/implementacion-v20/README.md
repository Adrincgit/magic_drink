# WonderPop — recorrido ilustrado v20

## Dirección final

Se conserva `public/image/journey/wonderpop-atrium-v15.webp` como la plaza. Se retiran del recorrido el pasillo reconstruido, los caminantes independientes, el mapa y el catálogo. Los archivos históricos quedan disponibles, pero ya no se importan en la landing.

El scroll conecta nueve capítulos. Las primeras cinco escenas conservan sus coordenadas. El atrio conduce a una tienda ilustrada, una charla entre visitantes, una entrevista con preguntas frecuentes y una despedida dentro del capítulo nueve.

## Escenas e interacción

- **06 — El atrio:** relieve 2.5D de la pintura original, con geometría repartida en doce bandas de profundidad. La cámara responde al cursor; el scroll no reconstruye ni recorre un pasillo genérico. Las bandas comparten bordes para evitar huecos. Se limita la amplitud del movimiento para preservar la arquitectura pintada. No son doce recortes independientes ni un edificio explorable en 3D.
- **07 — Los recuerdos:** boutique ilustrada con tres puntos de interés sobre los objetos. Cada punto abre un álbum accesible con una fotografía conceptual del objeto dentro de la plaza imaginada. Sin carrito, precios, existencias ni compras. El relato se entiende sin abrir el álbum.
- **08 — Entre amigos:** tres personajes conversan sobre la bebida, la música y los Bunnies. Son diálogos ficticios del universo, no reseñas verificadas de compradores. Se elige a quién escuchar.
- **09 — Antes de irte:** entrevista con una empleada, cuatro preguntas seleccionables y respuestas a ritmo del lector. Cambia su dibujo al elegir preguntas. La despedida enlaza a `/bebidas`, `/hexy`, `/wonderpop-plaza` y `/nosotros`.

Las variantes de gestos solo se muestrean en regiones locales de las imágenes originales: el resto del entorno no cambia de dibujo. Los loops tienen su propio reloj; detener el scroll no detiene la vida de la escena. Las escenas invisibles dejan de renderizar. Se conserva una ilustración estática ante pérdida de WebGL y con movimiento reducido.

## Implementación

- `src/components/index/Secciones/WonderPopStory.jsx`: tienda, álbum, visitantes, entrevista, despedida.
- `src/components/index/Secciones/IllustrationWorld.jsx`: carga progresiva y fallback.
- `src/components/index/animations/atriumWorld.js`: relieve original, proyección, dibujos alternos y luces locales.
- `src/components/index/animations/worldMotion.js`: continuidad y transiciones reversibles con estrella dorada.
- `src/data/journeyChapters.js`: nueve capítulos, final en coordenada `2.18`.
- `usePlazaDialog.js` y `journeyMotion.js`: el álbum pausa Lenis y bloquea el fondo sin desplazar el escenario sticky.

El mini reproductor aparece desde el capítulo cuatro aunque nunca se haya pulsado play. No reproduce automáticamente; cerrar lo oculta y detiene el audio. Su portada sigue la canción y la X tiene un SVG centrado. La interacción explícita con el reproductor principal permite reabrirlo.

## Arte

Nueve assets nuevos en `public/image/journey/*-v20.webp`, generados con la herramienta integrada **imagegen**. `PROMPTS.md` contiene el conjunto completo de prompts; `assets.json` conserva la procedencia y los nombres. Los originales generados se conservaron. `prepare-assets.cjs` documenta la conversión WebP. La ilustración v15 original no se sobrescribe.

## Revisión

`capture.cjs` captura atrio, tienda, conversación, entrevista y despedida en escritorio y teléfono. Las capturas locales quedan en `capturas/` (ignoradas por Git). `visual-review.json` registra errores de navegador y coordenadas. Los tests de mapa/catálogo/pasillo antiguos se sustituyeron por pruebas de la experiencia acordada.

Los cambios ajenos existentes —eliminaciones de imágenes antiguas, imágenes de marketplace y documentación anterior— se conservan sin incluirlos en este cambio.

### Resultado de validación

- `npm run build`: correcto; Astro reportó 0 errores, 0 advertencias y 80 hints ya presentes. Nueve páginas generadas.
- Suite completa Playwright/Chrome: **52 pruebas aprobadas**.
- Revisión posterior de continuidad y nueva historia: **10 pruebas aprobadas**.
- Capturas inspeccionadas en 1440×900, 2559×1303, 390×844 y 390×640. Comportamiento de controles verificado también en 800×900, ES/EN y movimiento reducido.
- Revisados los extremos del cursor y la cobertura de las transiciones. Sin errores de JavaScript en las diez capturas principales.
- La pantalla corta usa un panel de FAQ con desplazamiento interno para mantener disponibles todas las respuestas junto al reproductor.
- No se evaluó en un dispositivo físico ni en Safari; la revisión móvil corresponde a Chrome con tamaños de pantalla de teléfono.
