# Magic Drink: profundidad del recorrido, v8

Implementación integrada en el portal Astro/React de la rama `paralax`.
El estado anterior quedó guardado en el commit `0bf938a`.
Servidor local: http://localhost:4321/ (también http://127.0.0.1:4321/).

## Cambios

- Escena 4: calle y escenario separados; Hexy con iluminación cálida/violeta,
  menor escala y posición vinculada al escenario. Tres planos de público,
  ocho haces de luz animados en escritorio, confeti y WonderPop visible detrás.
- Escena 5: avance frontal hacia WonderPop, dos planos de jardines, paso bajo
  el arco y acercamiento a la puerta. El follaje conecta el concierto con el
  paseo dentro del mismo escenario persistente, sin otro bloque sticky.
- Escena 6: habitación, jardín y barra comparten la perspectiva de cámara.
  Lámparas y hojas cercanas, luz y partículas aportan movimiento ambiental.
  Una nueva lata inclinada reemplaza la repetición de la lata sobre el mostrador.
- Fondo: colinas, ciudad/puentes, agua y sol en planos independientes.
- Cursor: desplazamiento suave según profundidad; los textos y botones siguen
  quietos. Desactivado para interacción táctil y movimiento reducido.

## Código y recursos

Entrada: `src/pages/index.astro` → `IndexExperience.jsx` → `IndexJourney.jsx`.
Las escenas posteriores viven en `IndexWorldTail.jsx`; sus cámaras se controlan
en `journeyMotion.js`, `worldMotion.js` y `pointerDepth.js`.
Los estilos están en `indexJourney.module.css` e `indexWorldTail.module.css`.

Se generaron 12 recursos con la herramienta integrada ImageGen, conservando
las referencias de arte. Los WebP con transparencia están en
`public/image/journey/*-v2.webp`. Los prompts, referencias y rutas de salida
originales están en [assets.json](assets.json) y [crowd-extra.json](crowd-extra.json).
`export-assets.cjs` realiza únicamente la exportación a WebP con Sharp.
Los originales PNG se conservan localmente en `arte-fuente/`.

## Verificación

- `npm run build`: 9 páginas; 0 errores, 0 advertencias, 79 sugerencias existentes.
- `npx playwright test --workers=1 --reporter=line`: 12 pruebas aprobadas.
- Chrome 153: 30 capturas de escritorio (1440 × 900) y móvil (390 × 844),
  sin errores de página ni desbordamiento horizontal.
- Las pruebas cubren avance y retroceso, carga fallida de imágenes, navegación,
  movimiento reducido, posición relativa de Hexy, centro de WonderPop, distinta
  velocidad de las capas y animación ambiental con el scroll detenido.
- La prueba del cursor detectó que GSAP escribía `translate: none` inline.
  La composición CSS lo sobrescribe de forma explícita; el desplazamiento real
  de las capas se verifica en Chrome, además del valor de las variables.

## Rendimiento y límites

El director evita actualizar escenas fuera del recorrido activo y mantiene
correctos los saltos largos, el retroceso y los cambios de tamaño. Los bucles
ambientales se pausan fuera de escena. En móvil se reducen luces y partículas.
El observador de Astro excluye arte de trabajo, resultados y compilaciones
para evitar agotar los manejadores de archivos durante la validación local.

Medición en Chrome sin interfaz, emulación táctil de 390 × 844, DPR 2 y CPU 4×:
mediana de intervalo entre frames 6,1 ms; percentil 95 de 24,2 ms; dos frames
por encima de 50 ms. Servidor local e imágenes ya decodificadas.
Esto no representa una prueba en teléfono físico ni una medición de red.
La reproducción se puede repetir con `performance.cjs`; resultados en
[performance.json](performance.json). Las capturas se generan con `capture.cjs`.

Cambios guardados localmente; no se realizó push ni publicación en producción.
