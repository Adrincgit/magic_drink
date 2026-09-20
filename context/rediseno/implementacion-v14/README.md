# v14 — Movimiento integrado en la ilustración

La lata mide un 30% menos que en v13 en escritorio, tablet y móvil. Su pie
permanece apoyado en la mesa durante el scroll, la profundidad del puntero y el
hover. La sombra de contacto pertenece a la lata. Las gotas son más grandes y
se dibujan en ocho poses SVG, a intervalos de 180 ms; el arte y la tipografía de
la lata permanecen estables.

El vapor ocupa una columna vertical, nace detrás de la tapa y asciende más de
una altura de pantalla con notas y corazones. Cada activación reemplaza la
anterior; se limpia a los 7.2 segundos o al abandonar la entrada. Los textos y
controles mantienen su posición por encima del efecto.

El río usa su ilustración original como textura de un shader Three.js. Pequeñas
deformaciones locales, sostenidas a 12 poses por segundo, animan el agua sin
desplazar la capa entera. La amplitud se desvanece junto a la orilla. Se
eliminaron las franjas CSS y la oscilación global. Ciudad, puente, reflejos y
sol comparten movimiento de cámara y profundidad de puntero. Las lámparas
comparten transformación, escala y pivote con el pavimento que las sostiene.

Magic Drink Day incorpora dos bocinas ilustradas. Sus conos, halos, el baño de
luz del escenario y la amplitud del público responden a la energía del audio
del reproductor existente, mediante Web Audio. La canción sigue usando un
único elemento de audio. Pausar apaga la reacción; cambiar de escena conserva
la reproducción y detiene el análisis visual fuera del concierto. El dirigible
cruza horizontalmente el cielo en 68 segundos, independientemente del scroll.

El río vuelve a la imagen estática si WebGL falla o pierde el contexto y se
recupera al restaurarlo. Los bucles se detienen fuera de su escena, con la
pestaña oculta y con movimiento reducido. La condensación conserva una pose
estática cuando se solicita movimiento reducido.

El reproductor sincroniza inmediatamente la posición de su barra al buscar,
para evitar que un segundo evento restaure el tiempo anterior. Una canción
reproducida hasta el final continúa a la siguiente; llevar una canción pausada
al final conserva la pausa y la selección.

## Verificación

- Suite completa: 37 pruebas aprobadas en Chrome.
- Tras optimizar las capas de animación: 17 pruebas afectadas repetidas y
  aprobadas, incluidas las comprobaciones de píxeles del agua y audio real.
- Compilación: 9 páginas, 0 errores y 0 advertencias de Astro Check.
- Prueba de rendimiento con audio activo en el equipo local: mediana 6.1 ms,
  p95 12.1 ms, un intervalo de frame superior a 50 ms y ninguna tarea larga.
- Con CPU limitada a 4×: mediana 18.1 ms, p95 42.4 ms, cuatro intervalos
  superiores a 50 ms y una tarea de 50 ms. Esta prueba de estrés conserva
  tirones puntuales; no es una garantía de 60 fps en un teléfono de gama baja.
- Ambos recorridos sin desbordamiento horizontal. Resultados completos:
  `performance-native.json` y `performance.json`.

La reacción musical actualiza directamente escala y opacidad de las capas de
efectos, sin una variable CSS heredada por todo el portal. El escenario y el
cielo no vuelven a renderizarse en React con cada avance del reloj de audio.
El canvas del río ocupa sólo el 36% inferior del plano; el resto de la imagen
se conserva estático para evitar procesar píxeles transparentes.

Las pruebas nuevas en `tests/cartoon-motion.spec.js` cubren contacto de la lata,
escala, hover y scroll en 1440 × 900, 900 × 900 y 390 × 844; poses y vapor fuera
de pantalla; cambio real de píxeles del río con puente estable; anclajes de
cámara; pérdida y restauración de contexto; pausa del render fuera de escena;
reacción a una canción real, apagado al pausar y avance horizontal del dirigible.

`capture.cjs` documenta la entrada, el vapor y las escenas en 1440 × 900,
2559 × 1303 y 390 × 844. `performance.cjs` mide el recorrido en Chrome con
emulación táctil, DPR 2 y CPU 4× más lenta. La medición utiliza recursos
precargados; no representa un teléfono físico ni una red móvil.

## Arte

La bocina nueva y su prompt están documentados en [ARTE_Y_PROMPTS.md](ARTE_Y_PROMPTS.md).
La condensación es vectorial; el agua usa poses del shader, no fondos raster
regenerados. Referencia de la API de análisis:
[MDN — AnalyserNode.getByteFrequencyData](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData).

Rama de trabajo: `paralax`.
