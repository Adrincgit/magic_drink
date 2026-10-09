# Caídas, actuación e impacto · 8 de octubre de 2026

> Los avisos del suelo y los efectos geométricos de esta revisión fueron sustituidos por [efectos pintados sin indicadores](painted-effects.md).

## Derrota general

El golpe mortal inicia una caída física a 0,42 de velocidad, desde la posición real de Hexy. Conserva la gravedad y detecta las superficies del nivel, incluidos desniveles. El resultado espera al aterrizaje, su impacto, el humo y 1,25 segundos tendida. No admite entradas de combate ni permite curarse durante esta secuencia. Los cuatro niveles comparten este comportamiento, en tierra y en el aire. Si se cae por un abismo, la caída continúa fuera de plano antes del resultado, sin teletransportar a Hexy a un suelo ficticio. El reintento limpia la secuencia.

El choque ya tiene su propia expulsión: no encadena una segunda caída al morir. Con cuatro corazones o menos, Hexy permanece tendida y nunca usa cuadros de reincorporación.

## Después del choque

- Vuelo de expulsión: 1,45 segundos.
- Superviviente: 0,85 segundos tendido; luego se sienta, se apoya para levantarse y termina encorvado. La recuperación completa dura 3,4 segundos desde que aterriza.
- Arlequín superviviente: conserva los brazos bajos y una respiración leve durante otros tres segundos, vulnerable, antes de volver al combate.
- El daño sigue siendo cuatro corazones al perder o 192 puntos al ganar. El forcejeo sigue limitado a 15 segundos, con oleadas y decisión por avance del rayo.

La explosión de salida y el aterrizaje emiten grupos de humo con desplazamiento y disipación independientes. El nuevo humo no incluye una base de suelo dibujada que parezca flotar al elevarse. Las ráfagas detrás de cada lanzador nacen de sus pies y sólo aparecen si está plantado.

## Actuación y fuego

32 dibujos adicionales: ocho para carrera, ocho para salto, ocho para abanico y ocho para cinta. Tres versiones de desgaste dan **96 celdas**, no 96 acciones diferentes. Se conservan las hojas de reposo, lluvia, brasas, golpe al suelo y caída. La escala física del jefe sigue siendo 0,72. Los pies se registran por las botas; las manos y llamas extendidas no cambian el origen del personaje. Los puntos de emisión de los tres lanzamientos se miden sobre los nuevos dibujos.

Las columnas de fuego tienen ocho cuadros a 24 fps, una altura de daño de 255 unidades y un ancho de 46. Los centros están separados por 160 unidades: quedan 114 de paso entre zonas de daño. El aviso muestra un aro que se llena, puntas ascendentes, brasas y un resplandor naranja; no causa daño. El golpe de una columna no borra su dibujo antes de terminar la erupción.

## Choque y sonido

Los retratos conservan su colocación adaptada al combate aéreo. Añaden brasas o estrellas; al perder terreno, llamas naranjas o trazos rosa/dorados del rival se acercan a la silueta sin tapar el rostro. Los rayos interpolan sus dibujos a la cadencia de render y llevan filamentos que viajan al punto de choque. Los acentos blancos duran 75 ms al inicio de una oleada; no hay parpadeo continuo. Movimiento reducido desactiva esos destellos y los filamentos rápidos y reduce partículas y polvo.

Web Audio añade ruido estéreo filtrado, turbulencia, retumbo grave, resonancia y cola de impacto. La derrota usa golpe inicial, aterrizaje y una cola apagada; se retira el antiguo pitido descendente. Se mantienen compresor, volumen y silencio compartidos.

## Cajas

Los restos conservan la gravedad aunque la caja tenga cero vida. La lata tiene su propia trayectoria y altura final; no se duplica al volver a golpear los restos. La caída también continúa durante un choque o una derrota.

## Arte y revisión

Herramienta: `image_gen.imagegen`. Las tres hojas del jefe son ediciones con referencia; fuego y humo son generaciones nuevas. Todas usan transparencia nativa. [Prompts exactos, originales, rutas finales y registro de celdas](impact-art.json).

Archivos de juego:

- `public/arcade/sprites/bosses/harlequin/motion-fluid.webp`, `motion-fluid-mid.webp`, `motion-fluid-final.webp`.
- `public/arcade/sprites/bosses/harlequin/pyres.webp`.
- `public/arcade/sprites/effects/impact-smoke.webp`.

Empaquetadores reproducibles: `scripts/arcade/pack-impact-acting.mjs`, `pack-pyres.mjs` y `pack-impact-smoke.mjs`. No requieren regenerar las ilustraciones si se conservan los originales indicados en el manifiesto.

Pruebas específicas en `tests/hexy-impact-polish.spec.js`: derrotas de los cuatro niveles en suelo/aire, abismo, reintento, cajas rotas a distintas alturas, recuperación, celdas transparentes y puntos reales de lanzamiento. Capturas y vídeo del render real en `tests/artifacts/arcade/impact-polish/`; mezcla WAV y medición de picos en `tests/artifacts/arcade/effects-mix/`. La percepción final de dificultad y energía queda para la prueba de juego del usuario.

Verificación: 81 casos distintos aprobados entre ocho archivos de pruebas, incluyendo interfaz real con teclado, mando y móvil; los fallos iniciales de expectativas antiguas se corrigieron y volvieron a ejecutar. Compilación Astro: cero errores, cero advertencias y 23 sugerencias existentes. Pico de la mezcla densa del choque: 0,659, por debajo del recorte digital. Se revisaron capturas reales de avisos, erupción, emisión, derrota, impacto y recuperación, y se grabó `motion-review.webm`.
