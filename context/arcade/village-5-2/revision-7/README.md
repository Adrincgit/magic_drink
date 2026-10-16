# Villa Lumbre: ataques y carreras, revisión 7

15 de octubre de 2026. Correcciones del borde rural, ataques separados de los cuerpos, daño de las brujas, carreras de los ocho habitantes, profundidad de los escombros y remate con Popcorn fuerte.

## Comportamiento integrado

- El borde rural tapa las pequeñas islas de adoquines de la textura anterior con terreno del mismo terraplén. Comparte cámara, pendiente y fase horizontal con el camino. Su contorno se rasteriza una vez para conservar exactamente el mismo dibujo al invertir el movimiento. Se mantiene la acera urbana.
- El payaso calabaza tiene poses limpias de preparación, boca abierta y recuperación. Las tres llamas azules son proyectiles físicos independientes, con núcleo amarillo, cola animada y luz azul sobre el pavimento. El destello pequeño de emisión nace en el mismo punto que esos proyectiles.
- La bruja usa una sola escala y una hoja coherente para cada modalidad, terrestre o voladora. Los disparos nacen en la punta medida sobre la pose de salida: terrestre `(20,145)` y aérea `(26,179)` dentro de celdas de 256. La boca del payaso está en `(67,145)`. Los rayos tienen alfa transparente y terminan en el primer impacto contra el terreno. Ninguna pose lleva un rayo flotante incorporado.
- Cuatro dibujos de reacción al daño durante 0,36 s para cada bruja; también se interrumpe su preparación o absorción como antes. Se conserva la resistencia de 11,5 y el tamaño de dibujo de 198. No hay barras de vida enemigas.
- La bruja aérea patrulla 620 unidades a 112 unidades/s y oscila verticalmente. Prepara sus rayos en 0,62 s, recupera en 0,45 s y uno de cada tres ataques deja una gota. Esta deja un charco durante 3,8 s que convierte a Hexy o habitantes por contacto. Derrotar a su bruja elimina también sus gotas y charcos pendientes y libera sus víctimas.
- Los escombros se dibujan antes de los personajes. Las piedras lanzadas por los defensores conservan su pase independiente.
- Ocho carreras nuevas de ocho poses secuenciales. Cada ciclo dura entre 0,78 y 0,864 s; la velocidad de traslado de los habitantes sigue siendo rápida. No se reproduce un ciclo de cuatro dibujos hacia delante y hacia atrás. Las hojas finales se generaron por personaje con la guía de poses usada para el arlequín azul, después de descartar propuestas que repetían la misma pisada.
- Popcorn fuerte lanza al payaso calabaza hacia atrás con torso, brazos vestidos y botas separados, aterrizaje y desaparición. El remate fuerte de este payaso y de los zombis no libera un fantasma. Popcorn normal conserva las variantes de derrota anteriores.
- El aviso de liberación conserva el botón animado y la indicación de pulsar o mover la palanca; se retira el contador numérico. La dificultad interna sigue siendo de 21 pulsaciones nuevas.

## Arte y reproducción

ImageGen integrado, con la habilidad [imagegen](C:/Users/cabra/.codex/skills/.system/imagegen/SKILL.md). Se conservan fuentes seleccionadas en `sources/`; [prompts.json](prompts.json) contiene los cuerpos, efectos y primeras propuestas, y [gait-prompts.json](gait-prompts.json) las ocho carreras finales. Sharp sólo recorta, registra, ensambla atlas y comprime; no pinta ni deforma extremidades.

`node scripts/arcade/pack-village-v7.mjs` genera 168 celdas en nueve archivos bajo `public/arcade/sprites/enemies/`:

| Archivo final | Celdas |
| --- | ---: |
| `village-pumpkin-clean-v7.webp` | 24 |
| `village-witch-ground-v7.webp` | 24 |
| `village-witch-air-v7.webp` | 24 |
| `village-spell-fx-v7.webp` | 24 |
| `village-pumpkin-finish-v7.webp` | 8 |
| `village-run-adults-v7.webp` | 16 |
| `village-run-children-v7.webp` | 16 |
| `village-run-elders-v7.webp` | 16 |
| `village-run-neighbors-v7.webp` | 16 |

Medidas y escala de empaquetado en [registration.json](registration.json). Los archivos anteriores se conservan; las animaciones de caída de escoba, transformación, rescate y defensa siguen usando sus hojas existentes.

## Verificación

Evidencia en `tests/artifacts/arcade/village-depth-v7/`: 24 capturas de la ruta en ventanas de 1440×900 y 1920×1080, aviso de liberación sin números y liberación con teclado. Trece grabaciones decodificadas en montajes y fotogramas de tamaño completo: campo y entrada en ambos sentidos, fuego del payaso, disparo terrestre y aéreo, gotas y transformación, reacciones de daño, absorción terrestre y aérea, ocho carreras, remate fuerte y paso por escombros.

`tests/hexy-village-revision-7.spec.js` cubre las ocho fases y velocidad de la multitud, orígenes físicos en ambas orientaciones, cuatro reacciones de daño, patrulla aérea con ambos ataques, charcos y liberación por dueño, y ausencia de fantasmas en el remate fuerte. La prueba de movimiento registra también las ocho fases realmente seleccionadas, las cuatro poses de daño, la aparición de charcos, la transformación y el remate durante el combate real.

Resultado: **91 pruebas aprobadas**: [48 de combate, rescate y terreno](../../../../tests/artifacts/arcade/village-v7-validation.log), [41 regresiones de combate, Popcorn, pueblo y agua](../../../../tests/artifacts/arcade/village-v7-regressions.log), [una sesión de movimiento con siete escenas](../../../../tests/artifacts/arcade/village-v7-motion-final.log) y [una sesión del juego con teclado y dos tamaños de ventana](../../../../tests/artifacts/arcade/village-v7-browser-final.log). Las primeras grabaciones de ataques y escombros completan las trece escenas revisadas. Se corrigió una diferencia de rasterización del borde detectada por la prueba de desplazamiento antes de repetir la validación final.

`npm run build` finalizó con `[build] Complete!`: Astro Check informa 0 errores, 0 advertencias y 30 sugerencias; [registro completo](../../../../tests/artifacts/arcade/village-v7-build.log). Inventario de archivos y evidencia en [validation.json](validation.json).

Muestras revisables: [terreno rural](../../../../tests/artifacts/arcade/village-depth-v7/real-1440-2600.png), [carreras](../../../../tests/artifacts/arcade/village-depth-v7/crowd.webm), [fuego azul](../../../../tests/artifacts/arcade/village-depth-v7/clown-fire.webm), [reacción de daño](../../../../tests/artifacts/arcade/village-depth-v7/witch-hit-ground.webm), [Popcorn fuerte](../../../../tests/artifacts/arcade/village-depth-v7/pumpkin-finish.webm), [escombros](../../../../tests/artifacts/arcade/village-depth-v7/rubble-depth.webm) y [aviso sin contador](../../../../tests/artifacts/arcade/village-depth-v7/real-candy-prompt.png).
