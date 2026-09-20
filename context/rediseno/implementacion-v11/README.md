# Magic Drink · jardín y concierto · v11

Trabajo sobre el portal Astro/React de la rama `paralax`, a partir de `40bd16a`.

## Cambios

- El jardín conserva su cámara y el ancho del camino. Un terreno de césped de 2048 × 2048 unidades continúa por los lados hasta el horizonte, debajo del atlas original. Filas de vegetación a ambos lados y dos planos lejanos detrás del edificio cierran los huecos entre árboles. Dos capas de nubes se desplazan con su propio reloj.
- Las lámparas y maceteros del jardín tienen sombras de contacto sobre el suelo. Las dos lámparas de la apertura incorporan sombras elípticas pegadas a su base pintada.
- El concierto usa un pabellón nuevo y frontal. Está centrado desde la entrada, mantiene su tamaño y se desplaza hacia la izquierda con el scroll. Hexy ocupa una proporción menor del escenario, con sombra debajo de la consola.
- Tres poses de Hexy forman un ciclo de cuatro tiempos: original, mezcla, original, saludo. Sólo se muestran imágenes decodificadas; la base de la consola permanece fija. El ciclo se pausa fuera del concierto, con la pestaña oculta y con movimiento reducido.
- Un canvas WebGL conserva las cuatro filas de público y sus posiciones de parallax. Una deformación suave mueve las partes superiores de las imágenes (brazos y luces), dejando ancladas las bases. Las imágenes HTML opacas permanecen como alternativa si WebGL falla. No se trata de una animación individual de cada personaje.
- Las escenas 1–3 recuperan una viñeta lateral ligera, con opacidad máxima del color de 29%. El cartel de Hexy usa una máscara curva SVG y un borde interior oscuro que sigue su marco.
- La escena 6 continúa pendiente de su rework; no forma parte de esta revisión visual.

## Arte

Se usó **ImageGen integrado**, con referencias locales. Los cinco WebP están en `public/image/journey/`:

| Archivo | Uso |
| --- | --- |
| `garden-grass-v11.webp` | Césped continuo fuera del camino |
| `garden-grove-v11.webp` | Vegetación lateral y lejana |
| `festival-stage-front-v11.webp` | Pabellón frontal |
| `hexy-dj-mix-v11.webp` | Pose mezclando |
| `hexy-dj-wave-v11.webp` | Pose saludando |

Los prompts completos, referencias, dimensiones, transparencia y rutas finales están en [assets-manifest.json](assets-manifest.json). Los JSON de cada generación conservan el resultado de la herramienta. `export-assets.cjs` copia los originales a `arte-fuente/` y convierte a WebP con alfa; las copias PNG y capturas no se versionan.

## Revisión

Las 23 pruebas de Playwright pasaron en Chrome. Cubren navegación, idiomas, audio por interacción, escala y anclaje del escenario, movimiento visible del público en reposo, poses fallidas, pérdida/restauración del contexto WebGL, movimiento reducido y cámara del jardín. Tras ajustar la composición móvil se repitieron los controles del escenario y del servidor.

`npm run build` terminó con 9 páginas, sin errores ni advertencias de Astro. `capture.cjs` produjo 54 capturas del portal real: 18 puntos en 2559 × 1304, 1440 × 900 y 390 × 844. No registró errores de página, respuestas HTTP fallidas ni desbordamiento horizontal. Se inspeccionaron las composiciones modificadas, el marco del cartel, las bases del jardín y los pasos entre escenas. Las pruebas de cobertura comprueban el cambio de escena bajo las plantas en ambas direcciones.

`performance.cjs` midió el recorrido con imágenes y renderizadores precargados, viewport 390 × 844 y CPU ralentizada 4×: mediana de 6.1 ms entre frames, percentil 95 de 30.2 ms, tres frames por encima de 50 ms y una tarea larga de 58 ms. Véase [performance.json](performance.json). Esa medición es una emulación en escritorio, no una prueba en teléfono físico ni de carga por red.

Servidor local: http://localhost:4321/. No se publicó ni desplegó el portal.
