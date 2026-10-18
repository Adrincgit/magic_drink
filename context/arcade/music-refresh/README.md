# Música y volumen de efectos, 17/10/2026

Las cinco grabaciones entregadas en `public/arcade/music/for replace/` se copian sin recodificar a sus rutas activas. `asset-hashes.json` confirma que los SHA-256 coinciden con los originales.

| Archivo entregado | Uso | Ruta activa en `public/arcade/music/` |
| --- | --- | --- |
| `main_title_screen.mp3` | Pantalla de título | `title.mp3` |
| `shop.mp3` | Tienda de Miso | `shop.mp3` |
| `Jefe 1-2.mp3` | Fortaleza Organillo, ID interno 1 | `bosses/organ-1-2.mp3` |
| `jefe 1-3.mp3` | Barcaza del Redoble, ID interno 2 | `bosses/barge-1-3.mp3` |
| `Jefe 1-4.mp3` | Bastión de las Antorchas, ID interno 5 | `bosses/ember-1-4.mp3` |

El recorrido del 1-3 conserva `exploration/harbor.mp3`; al activar la barcaza cambia a la nueva pista de jefe. La música del Arlequín del 1-5 conserva `bosses/arlequin_fuego.mp3`. Las rutas anteriores siguen disponibles, incluidas las que usan otros capítulos.

La salida de efectos pasa de `0.7 × general × efectos` a `0.77 × general × efectos`, después del compresor. El aumento es exactamente del 10% con los mismos ajustes. La salida de voces y el volumen de música conservan su cálculo, y cero/silencio siguen apagando su canal.

`tests/hexy-music-refresh.spec.js` verifica las copias, las cinco decodificaciones y reproducciones, la tienda y las transiciones reales a cada pista de jefe. `decoded-music.json` registra duración, canales, pico, RMS y reproducción de cada MP3. Las regresiones de mezcla miden la relación de salida y el margen frente a saturación; `tests/artifacts/arcade/effects-mix/ten-percent-output.json` registra una relación de RMS de 1.09999999 entre la salida nueva y la anterior.

Validación: 21 pruebas específicas aprobadas (`tests.log` y `controls-energy.log`), con mezclador a 1440/390 px, pausa, silencio y controles independientes de voces, música y efectos. El combate intenso alcanzó un pico de 0.738 y el choque completo de veinte segundos 0.743, por debajo de saturación digital.

Compilación `npm run build` completada; análisis con 0 errores y 0 advertencias. Registro en `build.log`.
