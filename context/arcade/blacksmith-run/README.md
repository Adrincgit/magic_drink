# Carrera del herrero de camisa roja

La huida de este vecino usa doce dibujos nuevos de apoyo, compresión, paso bajo las caderas, recuperación y extensión. Se conserva su diseño de camisa roja, delantal de cuero, botas, barba y martillo en el cinturón. La hoja anterior repetía casi la misma zancada en las dos mitades del ciclo.

El ciclo de este personaje avanza por la distancia realmente recorrida (`gait`), utilizando su zancada de 161,04 unidades. Se congela al detenerse. En las velocidades habituales del pueblo conserva una cadencia aproximada de 14 a 17 dibujos por segundo. Las dos pisadas de polvo coinciden con las compresiones de apoyo. Los otros siete vecinos mantienen sus ciclos y su cadencia anteriores.

La nueva fuente se dibujó hacia la derecha siguiendo una secuencia existente como guía de movimiento. El renderizador la refleja exclusivamente durante la carrera del herrero, que sigue huyendo a la izquierda. Sus estados de aviso, lanzamiento, bloqueo, transformación y rescate conservan sus hojas propias.

Arte generado con la herramienta integrada y la habilidad [imagegen](C:/Users/cabra/.codex/skills/.system/imagegen/SKILL.md). [prompts.json](prompts.json) conserva las instrucciones completas; `blacksmithPromptRetarget` produjo la fuente seleccionada `sources/run-right.png`. Las primeras propuestas se descartaron porque repetían demasiado la pierna adelantada.

- Archivo del juego: `public/arcade/sprites/enemies/village-blacksmith-run-v9.webp`, doce celdas de 256 × 256 con alfa.
- `node scripts/arcade/pack-blacksmith-run.mjs` recorta, escala y registra los dibujos, sin redibujar extremidades. `selection.json` y `registration.json` permiten reproducir el empaquetado.
- `tests.log` y `tests-final.log`: avance por distancia, parada, apoyos a 30/60/120 Hz, transparencia y regresiones del pueblo.
- `node scripts/arcade/review-blacksmith-run.mjs`: grabaciones del motor y renderizador reales, con reproducciones decodificadas del antes, después, velocidades diferentes y vista de pueblo en `review/`.
- `build.log`: comprobación y compilación del proyecto.

Validación final: 18 pruebas distintas comprobadas. La primera ejecución detectó una comparación justo en el límite numérico entre dos dibujos; la prueba ahora compara la misma distancia dentro de una fase y las cinco pruebas específicas pasan. Las trece regresiones del pueblo también pasaron. Las cinco grabaciones se decodificaron y revisaron, con los doce cuadros presentes a las tres velocidades y cero errores de ejecución. La comprobación del proyecto terminó con cero errores y cero advertencias de diagnóstico; la compilación completó con salida 0.
