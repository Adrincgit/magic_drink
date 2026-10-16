# Villa Lumbre: brujas con séquito y vecinos escondidos

15 de octubre de 2026. Se conserva el diseño de la bruja existente y se añade una variante reconocible por tres calabazas orbitando. Continúa la [revisión 8](../revision-8/README.md), incluidos obstáculos, rescates por disparos y polvo de pisadas.

## Juego

- Dos brujas voladoras del recorrido, en las posiciones 11.640 y 16.845, llegan con tres calabazas. Se crean una sola vez al activarse la bruja, mantienen separaciones de 120 grados y siguen su movimiento. El semicírculo posterior se dibuja detrás del cuerpo; el anterior, delante.
- Cada calabaza es un enemigo físico independiente, de menor tamaño, con tres puntos de resistencia y sin barra de salud. Sus avisos y disparos están escalonados; la bruja sigue lanzando rayos y puede absorber dulces mientras conserva el séquito. Destruir una calabaza no hace que vuelva a aparecer. Derrotar a la bruja rompe las que quedan, que caen y liberan al aterrizar a los vecinos que hayan hechizado.
- Las calabazas invocadas al absorber vecinos conservan su rescate y animación de liberación. Ahora disparan a velocidad 290, antes 250, con una pausa de 2,2 segundos, antes 2,5. Sus dibujos de ataque nuevos tienen la boca vacía al expulsar; el proyectil es un objeto separado.
- Uno de cada tres zombis con cabeza de calabaza prepara su ataque en 0,62 segundos, frente a 0,8; sus llamas viajan a 325, frente a 245, y su recuperación baja de 1,45 a 1,05 segundos. La salida permanece registrada en la boca. Los normales se acercan hasta que su alcance real permite llegar al objetivo.
- Brujas, calabazas voladoras y zombis calabaza alternan entre Hexy y un vecino cuando ambos tipos de objetivo están a alcance. La cantidad de vecinos no cambia ese reparto. Si sólo hay un tipo disponible, atacan a ese. Se elige al vecino más cercano y se anticipa el movimiento sólo si realmente está huyendo. El aviso fija el destino: el proyectil todavía puede fallar o ser interceptado.
- Cuatro vecinos, dos herreros y dos mujeres de trenza roja, se esconden en 10.950, 14.550, 17.450 y 19.650. Se agachan, se cubren la cabeza y asoman por encima de madera y piedras. No salen por simple proximidad: requieren disparar a la cobertura. Después se levantan y huyen. Sus cuerpos agachados siguen expuestos a hechizos bajos; romper la cobertura y liberar a un habitante ya transformado son acciones distintas.
- Las coberturas rotas y rescates se conservan al reintentar. Se mantienen 106 vecinos, las familias de la entrada, la longitud, los obstáculos anteriores y el único carruaje con caballo al comienzo.

## Arte

Fuentes de ImageGen integrado, con alfa transparente, en `sources/`. Referencias, prompts completos y selección en [prompts.json](prompts.json) y [pumpkin-prompt.json](pumpkin-prompt.json). La bruja reutiliza sus dibujos de la revisión 7; su variante se distingue por el séquito.

`node scripts/arcade/pack-village-v9.mjs` realiza recorte de alfa, registro por grupos y compresión WebP. No pinta personajes ni proyectiles.

| Archivo final | Celdas |
| --- | --- |
| `public/arcade/sprites/enemies/village-hiding-v9.webp` | 8 poses de vecinos y 4 estados de cobertura |
| `public/arcade/sprites/enemies/village-orbit-pumpkin-v9.webp` | 4 de vuelo, 4 de carga en la boca, 4 de recuperación y 4 de rotura |

Medidas y recortes en [registration.json](registration.json). No hay proyectiles incorporados en los nuevos cuerpos ni liberaciones humanas dibujadas para calabazas vacías.

## Verificación

`tests/hexy-village-revision-9.spec.js` comprueba aparición única de tres objetivos, movimiento y orden de dibujo, destrucción por un disparo real, ataques simultáneos, caída del séquito al morir la bruja, liberación una sola vez, reparto de objetivos con veinte vecinos presentes, cadencia y salida de las llamas rápidas, rescate de escondites mediante disparos y vulnerabilidad del cuerpo agachado.

El selector real del capítulo se prueba en `tests/hexy-village-revision-9-browser.spec.js`: activación natural del séquito en dos resoluciones y rescate usando Z. También se repite la prueba de teclado de la revisión 8.

Resultado final: 103 pruebas de modelo y regresión y dos pruebas del juego con teclado aprobadas, 105 en total. `npm run build` terminó con `[build] Complete!`, 0 errores, 0 advertencias y 29 sugerencias.

`node scripts/arcade/review-village-v9.mjs` graba y decodifica seis escenas con el motor y renderer de producción: combate orbital, destrucción, dos rescates, riesgo de hechizo en el escondite y llamas rápidas con reparto de blancos. La escena de destrucción utiliza impactos preparados para observar la caída; la prueba del juego usa entrada real de teclado. Se revisaron montajes y fotogramas, y se repitieron escenas tras bajar la cobertura para dejar visibles las caras.

Evidencia e inventario final: [validation.json](validation.json). Vídeos: [combate con séquito](../../../../tests/artifacts/arcade/village-depth-v9/orbit-combat.webm), [destrucción y liberación](../../../../tests/artifacts/arcade/village-depth-v9/orbit-break.webm), [vecino escondido](../../../../tests/artifacts/arcade/village-depth-v9/hide-blacksmith.webm), [rescate de la vecina](../../../../tests/artifacts/arcade/village-depth-v9/hide-woman.webm), [riesgo de hechizo](../../../../tests/artifacts/arcade/village-depth-v9/hide-risk.webm) y [zombi calabaza rápido](../../../../tests/artifacts/arcade/village-depth-v9/rapid-targets.webm).
