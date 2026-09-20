# V10: jardín con cámara, público sólido y apertura luminosa

Implementación en la landing Astro/React de la rama `paralax`. No es una página de preview. El servidor local sigue en http://localhost:4321/.

## Cambios

- Escena 4: retirada la multitud antigua semitransparente que quedaba detrás del escenario. Se conservan las cuatro filas independientes de asistentes delante de Hexy, sin opacidad de grupo.
- Escena 5: el montaje de imágenes escaladas por separado se sustituye por una cámara `PerspectiveCamera` de Three.js, con suelo horizontal y planos de imágenes verticales. La base pintada del edificio y los pies de los objetos se anclan a `y=0`.
- 28 farolas con estandarte, 28 jardineras y 43 árboles distribuidos a distancias fijas. El scroll mueve la cámara entre las filas y hacia la entrada; las imágenes no se desplazan hasta una posición prefijada de pantalla. El balanceo suave de los árboles tiene su propio reloj.
- Se conserva la transición con hojas entre concierto y jardín y la luz de entrada al interior.
- Escenas 1–3: eliminadas las cortinas oscuras de pantalla completa, también en móvil. La legibilidad se protege con sombras en las letras.
- Se mantiene aplazado el rediseño de la escena 6.

## Archivos principales

- `src/components/index/Secciones/GardenWorld.jsx`: carga diferida y alternativa estática.
- `src/components/index/animations/gardenWorld.js`: cámara, distribución espacial, texturas y liberación de recursos.
- `src/components/index/animations/worldMotion.js`: enlace entre scroll, jardín y transiciones.
- `src/components/index/css/gardenWorld.module.css`: canvas y composición de respaldo.

Three.js ya estaba instalado en el proyecto (0.167.1). Se añade a las dependencias optimizadas explícitas de Vite para evitar una optimización nueva al entrar al jardín. Referencia oficial: https://threejs.org/docs/.

## Arte

Generado con la herramienta integrada ImageGen; sin CLI ni API key. Los prompts completos y referencias están en `assets-manifest.json` y los cuatro archivos `garden-*-v10.json` de esta carpeta.

Archivos finales en `public/image/journey/`:

- `garden-ground-atlas-v10.webp`: suelo ortográfico, 591084 bytes.
- `garden-planter-v10.webp`: jardinera con alfa, 434820 bytes.
- `garden-static-v10.webp`: ilustración completa de respaldo, 579556 bytes.
- `garden-tree-v10.webp`: árbol completo con alfa, 739790 bytes.

Total nuevo: 2345250 bytes. `export-assets.cjs` conserva los PNG originales en `arte-fuente/` y convierte a WebP sin modificar el alfa. Los PNG originales de Codex también se conservan. Los árboles recortados de la versión anterior no se reutilizan como planos interiores porque sus bordes rectos quedaban visibles.

## Comportamiento y límites

- El módulo gráfico se carga al aproximarse al jardín; no se crea un canvas en el hero.
- La cámara comparte posición y perspectiva para edificio, terreno y decoración. No se usan modelos complejos, física ni posprocesado.
- Renderizado ambiental limitado a 30 fps en reposo, DPR máximo 1.5. Se detiene fuera de la escena, con pestaña oculta o movimiento reducido.
- Movimiento reducido, fallo de una textura o pérdida de WebGL conservan una ilustración completa y la navegación HTML. La recuperación del contexto vuelve a dibujar la escena.
- El rendimiento medido en Chrome con emulación móvil no equivale a una prueba en un teléfono físico. Tampoco sustituye una medición de red móvil.

## Verificación

Los resultados de pruebas, capturas y rendimiento se registran junto a este documento. `capture.cjs` recorre la landing a 2559×1304, 1440×900 y 390×844: 54 capturas sin errores de carga ni desbordamiento. Las capturas locales están en `capturas/`.

Las pruebas cubren avance sin encogimiento, paso entre filas de farolas, encuadres anchos/verticales, parada del renderizado, fallo de textura, pérdida/recuperación de WebGL, movimiento reducido, público, transiciones, hidratación, navegación e idioma. El build conserva las advertencias previas del repositorio ajenas a estos cambios.

20 casos distintos validados. En la primera ejecución pasaron 18: se corrigió un selector del nuevo test de sombras y se repitió la prueba de hojas que una recarga HMR interrumpió mientras se editaba. Ambas pasaron después; también la hidratación tras el build. Las cuatro pruebas de cámara se repitieron y pasaron después de evitar renders redundantes y ocultos. Detalle en `validation.json`.

Build final correcto: 9 páginas, 0 errores, 0 warnings y 79 hints de Astro. El módulo de cámara se entrega diferido (116.7 kB gzip en este build).

Medición final con Chrome móvil emulado, CPU 4× y recursos precargados: mediana 6.1 ms, percentil 95 de 24.2 ms por frame; cuatro frames de más de 50 ms y dos tareas largas (53 y 57 ms) durante el recorrido de 3.6 s. Estos resultados tienen variación entre ejecuciones y no garantizan una tasa de frames en smartphones reales.
