# Raya junto al cañón del zeppelín

Los fotogramas 1 y 2 de `zeppelin-actions.webp` contienen fragmentos estrechos separados del dibujo principal. El renderer excluye esas dos zonas al dibujar la celda, conservando su escala, registro y reflejo horizontal. La llamarada del disparo, el humo de retroceso y los fotogramas de destrucción conservan su recorte completo.

`scripts/arcade/review-zeppelin-strip.mjs` comprueba píxeles del render real: donde el atlas tenía alfa 221 y 104, el recorte devuelve alfa 0 en ambas orientaciones. La llamarada y el humo siguen opacos. También graba y decodifica los ciclos de disparo hacia ambos lados y con movimiento reducido; los tres videos se inspeccionaron y no registraron errores de ejecución. Evidencia en `*-playback.png`, `after-fire.png` y `review-report.json`.

Cinco regresiones de los archivos `hexy-circus-rush`, `hexy-air-enemy-finish` y `hexy-harbor-ambush` aprobadas; registro en `tests.log`.

`npm run build` completo con 0 errores y 0 advertencias del análisis; registro en `build.log`.
