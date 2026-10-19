# Arlequina: identidad, escala y espejismos

La primera fase utilizaba una arlequina de cabello corto y otras proporciones. Las hojas posteriores y la pelea aérea tampoco compartían escala. Esta revisión conserva el cabello largo, vestuario, edad aparente y rostro del diseño aprobado; la expresión cambia de sonrisa tranquila a risa y ojos de espiral.

## Arte y registro

- **24 dibujos nuevos**: reposo y lanzamiento, cuatro cels por estado y fase. Se reproducen como `0,1,2,3,2,1`, sin deformar los sprites.
- Generados con **ImageGen integrado**. Los seis prompts completos, referencias y modo están en [prompts.json](./prompts.json); los originales seleccionados están en `sources/`.
- Entregables del juego: `public/arcade/act-two/nightmare-coherence-v7/phase-{1,2,3}-{idle,cast}.webp`.
- `register-nightmare-coherence.mjs` empaqueta, mide y genera `nightmareBodyRegistration.js`. [registration.json](./registration.json) conserva medidas por cel, escalas y puntos de emisión.
- Altura de referencia de Hexy, sombrero a suela, en `reactions:0`: **88.0875 unidades**. Arlequina de pie: **101.300625**, una relación **1.15**. La oscilación dibujada del reposo se conserva dentro de cada ciclo.
- Las tres poses equivalentes de reposo se registran por estatura; las de lanzamiento doblan las rodillas y miden aproximadamente el 94 % de esa estatura. Las hojas anteriores emplean el ancho anatómico de cabeza revisado; los ojos de espiral y manos que tapan la cara hacen insuficiente la segmentación automática del color de piel.
- Se mantiene una escala común dentro de cada ciclo. Los saltos, piernas recogidas, poses tumbadas y bastón elevado conservan su silueta; no se estiran hasta medir lo mismo. Los retratos de las esquinas conservan su ampliación cinematográfica.
- Caminar en fases 1 y 2 comparte los doce dibujos de cabello largo. Fase 3 tiene sus propios doce. Los saltos normales conservan pocas poses principales; esta revisión añade cuadros a reposo y lanzamiento, no una animación nueva para cada transición.

## Combate

La marcha pasa a 150 / 215 / 285 unidades por segundo según la fase; Hexy corre a 255 sin modificadores. La última fase puede alcanzarla al correr, mientras el dash, saltos y las anticipaciones conservan oportunidades de evasión. La cadencia de caminar sigue la distancia recorrida.

Se conservan abanicos, espirales, lluvia con columna segura, salto y doble salto ofensivos, cortes de viento y desaparición/reaparición. Las ráfagas tienen trazos y anchos distintos para espiral, lluvia y corte. El viento sigue siendo mágico y violeta.

La desaparición ahora incluye copias ópticas de su propio sprite y refracción local del escenario. Las copias no son enemigos, no reciben impactos ni disparan. El modo de movimiento reducido omite copias y refracción. La reaparición sigue avisada y precede al disparo. Los puntos de emisión y la caja de daño se ajustaron a la escala nueva.

El segundo Encore y la subida de resistencia del choque se conservan. La derrota después del choque continúa desde la pose tumbada; ya no vuelve a ponerse de pie para repetir la caída.

## Verificación

- Suite de seis archivos: **60 pruebas aprobadas**. Tras ampliar la prueba de coherencia, sus **4 pruebas** vuelven a pasar: proporción con Hexy, dibujos distintos/transparencia/palmas, velocidad y ventana del espejismo, continuidad de la derrota. Logs en esta carpeta.
- **92 celdas del personaje revisadas** a escala de mundo, más escenas renderizadas de cada fase. Comparativa: `tests/artifacts/arcade/nightmare-coherence-v7/standing-lineup.jpg`.
- Grabaciones de las tres fases y de la inversión doble, con hojas extraídas del vídeo: `tests/artifacts/arcade/nightmare-coherence-v7/*-playback.jpg` y `*.webm`. Los movimientos ordinarios se volvieron a grabar tras quitar las máscaras decorativas de la desaparición.
- Sin errores de navegador ni archivos del juego ausentes en las grabaciones. Las pruebas de imagen miden transparencia, dibujos y registro; la revisión visual complementa esas medidas y no demuestra por sí sola que la dificultad resulte divertida para toda persona.
- `npm run build`: `[build] Complete!`, **0 errores, 0 warnings, 35 hints** de Astro. Vite/Browserslist conservan sus avisos existentes de tamaño de chunk y antigüedad de datos.

No se añadieron barras de vida enemigas. No se publicó ni se hizo commit de esta revisión.
