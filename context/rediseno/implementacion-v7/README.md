# Landing integrada: recorrido continuo v7

Implementación en `G:\TRABAJO\ASTRO\ADRINC_WEBS\magicdrink`, rama local `paralax`.
Servidor de desarrollo: http://localhost:4321/ . No se ha publicado ni hecho push.

## Cambio principal

Las seis escenas comparten un único viewport sticky y una única distancia de scroll. Ya no hay un segundo bloque fijado que entre desde abajo al terminar las primeras tres escenas. El cielo, la ciudad y el edificio de WonderPop permanecen en el mismo escenario. Una capa cercana de vegetación acompaña el paso de la calle al festival; después la cámara se acerca al edificio y la luz de la entrada enlaza con el interior.

El recorrido usa scroll nativo para la cámara y transformaciones GSAP. Las nubes, luces y partículas mantienen animación ambiental independiente. La navegación recupera el componente original Liquid Capsule; los titulares vuelven a BakeSoda.

Esta es una versión de trabajo del portal real. Las capturas son evidencia de revisión, no una página HTML alternativa ni una aprobación definitiva de diseño.

## Código activo

- `src/pages/index.astro`: monta el navbar original y `IndexExperience`.
- `src/components/index/IndexExperience.jsx`: idioma e isla React compartida.
- `src/components/index/Secciones/IndexJourney.jsx`: escenario persistente y tres primeras escenas.
- `src/components/index/Secciones/IndexWorldTail.jsx`: festival, exterior/interior de WonderPop, Original y footer dentro del mismo escenario.
- `src/components/index/animations/journeyMotion.js`: geometría, cámara inicial, navegación y ciclo de vida.
- `src/components/index/animations/worldMotion.js`: continuidad y profundidad del resto del recorrido.
- `src/components/index/css/indexJourney.module.css` y `indexWorldTail.module.css`: composición, responsive y movimiento reducido.

Los antiguos IndexSeccion1–8 no están montados en la landing. El vídeo ligado al scroll y sus bloques independientes tampoco forman parte del nuevo recorrido. La longitud de la página no depende de que una imagen cargue o falle.

## Arte incorporado

Ocho WebP nuevos en esta revisión: `festival-courtyard`, `hexy-dj`, `festival-crowd`, `plaza-pavement`, `wonderpop-atrium`, `atrium-distance`, `atrium-garden`, `atrium-bar`.

El interior animado usa las tres últimas capas separadas y vegetación cercana; la ilustración completa queda para la composición con movimiento reducido. Hexy tiene una nueva pose de DJ y proporciones juveniles.

Prompts y procedencia: `assets.json`, `interior-assets.json`. Originales PNG: `arte-fuente/`. Exportación WebP con alpha: `export-assets.cjs`; dimensiones y pesos en los correspondientes informes `*-sizes.json`.

El edificio independiente y la calle sin el edificio incrustado proceden de la revisión v6. Los arcos decorativos de v6 y los vídeos antiguos ya no están referenciados por la nueva landing.

## Validación de esta revisión

- `npm run build`: 9 páginas, 0 errores, 0 warnings; 79 hints en la comprobación del proyecto.
- `npx playwright test --workers=2 --reporter=line`: 9 pruebas aprobadas.
- Navegación y audio manual, idiomas, enlaces profundos, regreso al inicio, navbar móvil, movimiento reducido y resize.
- El mismo escenario conserva su posición y longitud durante todas las transiciones, también al retroceder.
- Imágenes retrasadas o fallidas no saltan capítulos ni modifican la geometría.
- Capturas Chrome 153: escritorio 1440×900 y móvil 390×844; pruebas adicionales a 360×740. Sin errores de página ni desbordamiento horizontal en el recorrido capturado.
- `capturas/`, `capture-report.json`, `tests.log` y `build.log` contienen la evidencia.
- Rendimiento: Chrome headless, 390×844, DPR 2, CPU 4×, imágenes ya decodificadas, servidor local. Mediana de intervalo RAF 6.1 ms, percentil 95 12.2 ms, sin intervalos mayores de 50 ms ni long tasks durante la muestra. No representa una prueba en teléfono físico ni una medición de descarga en red móvil.

## Preservación

La migración inicial al directorio original quedó registrada en `../implementacion-v6/migration.json`. Copia previa de fuente, configuración y cambios locales:
`G:\TRABAJO\ASTRO\ADRINC_WEBS\_magicdrink_backups\2026-09-19T23-06-00-462Z-before-paralax`.

Los cambios permanecen locales y sin commit para su revisión.
