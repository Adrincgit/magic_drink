# Energía de fuego durante la carga del Arlequín

El Arlequín comparte con Hexy el renderizador de estelas y luz móvil. Su paleta usa rojo, naranja y un centro incandescente; las cabezas de llama y las brasas proceden del arte existente. El resplandor de las manos crece mientras se acumula el fuego.

Las 48 partículas hacen un recorrido continuo desde el contorno de la vista hasta las manos reales. Llegan unos 0,2 s antes del disparo, sin reaparecer en otro punto. Al responder con el Encore, la carga visual continúa desde la posición actual y termina antes de la descarga conjunta. El ataque del Arlequín conserva sus 2,8 s de preparación. Movimiento reducido usa diez partículas, estelas más cortas y luz sin desenfoque de sombra.

El cambio de Hexy consiste en extraer su función de estela a `chargeEnergyCanvas.js`; conserva sus colores y parámetros anteriores.

Validación: cinco pruebas propias de trayectorias, convergencia, sincronía del contraataque, duración real y luz roja medida en píxeles; dieciocho regresiones de Encore y choque aprobadas. Los registros son `charge-final.log` y `tests.log` (la primera ejecución detectó que las dos pruebas de orientación necesitaban colocar la cámara junto al jefe; el archivo final contiene las cinco aprobadas).

`scripts/arcade/review-harlequin-charge-light.mjs` graba y decodifica cuatro casos: jefe a la derecha, a la izquierda, contraataque y movimiento reducido. Los videos y sus hojas `*-playback.png`, las capturas `*-charge.png` y `review-report.json` están aquí. Los cuatro casos se inspeccionaron visualmente y no registraron errores de ejecución.

`npm run build` completo: 374 archivos analizados, 0 errores y 0 advertencias. Registro en `build.log`.
