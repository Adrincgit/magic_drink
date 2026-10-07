# Puentes largos y profundidad del río

Revisión del 6 de octubre de 2026, posterior a [organ-momentum](../organ-momentum/README.md).

Ambos jefes reciben un 15% adicional de salud sobre sus valores anteriores. En modo normal, el globo pasa de 231,84 a 266,62 y el organillo de 236,16 a 271,58. El incremento se aplica también al modo suave y se conserva al reintentar. La transformación sigue ocurriendo al alcanzar la mitad de la vida máxima.

El organillo añade un frenazo al terminar la embestida: seis nubes de polvo nuevas junto a las ruedas y un rebote breve de la carrocería durante 0,28 segundos. En esa recuperación su cuerpo sigue recibiendo daño. La anticipación, velocidad y destino de la embestida se conservan.

Los dos puentes se duplican: el primero pasa de 740 a 1.480 unidades y el segundo de 690 a 1.380. El recorrido completo pasa de 12.000 a 13.430 unidades, frente a las 12.400 del primer nivel. La colisión, agua, enemigos, objetos, árboles, puntos de control, secciones y arena se desplazan con la ampliación. Se conservan los tres Bunnies y los dos zepelines, con un único portador. Los postes del puente mantienen su altura; la mayor longitud se dibuja con más tramos de madera.

El paisaje se separa en cielo y nubes, montañas lejanas, valle con cascada, grupos intermedios de árboles, árboles apoyados en el terreno y elementos cercanos a la cámara. Las montañas y el valle usan panoramas nuevos y únicos, sin repetirlos ni invertirlos a lo largo del recorrido. Los grupos intermedios alternan las cuatro especies existentes con distancias y alturas distintas. Los primeros planos nuevos son juncos, ramas de sauce, arbustos floridos y rocas con helechos y un pequeño hongo.

Las nubes avanzan con el tiempo. La cascada anima su flujo en cuatro pasos. El agua del puente tiene dos corrientes con movimiento y parallax distintos, además de refracción y anillos de reflejos. El modo de movimiento reducido fija las animaciones ambientales; el desplazamiento de las capas al mover la cámara se mantiene.

Los nuevos recursos se generaron con la herramienta integrada `imagegen`; los prompts exactos están en [prompts.json](prompts.json). Los PNG fuente permanecen fuera del proyecto, en la carpeta de imágenes generadas de Codex. Los recursos activos son:

- [mountains.webp](../../../public/arcade/maps/riverwoods/mountains.webp): panorama transparente de 2.172 × 724, 323.378 bytes.
- [valley.webp](../../../public/arcade/maps/riverwoods/valley.webp): panorama transparente de 2.172 × 724, 583.668 bytes.
- [near.webp](../../../public/arcade/maps/riverwoods/near.webp): atlas transparente de cuatro celdas de 512 px, 360.162 bytes.

La conversión y empaquetado se pueden repetir con `scripts/arcade/pack-river-depth.mjs`, pasando las tres fuentes PNG como argumentos. Se conserva su transparencia y sólo se publican WebP.

`tests/hexy-river-depth.spec.js` comprueba los puentes, recorrido y apoyos, posición de rescates, salud de ambos jefes y reintentos, velocidades distintas de las capas, frenazo, transparencia del arte y movimiento real de nubes, cascada y agua. Las capturas y logs se guardan en `tests/artifacts/arcade/river-depth/`, excluido de Git.

Validación final: **73 pruebas distintas comprobadas**. El conjunto inicial aprobó 72; la discrepancia restante era una expectativa histórica de notas de 68/76 unidades, sustituida por los tamaños vigentes de 102/114. Las diez pruebas de ese archivo volvieron a pasar tras actualizarla. No se cambió el tamaño del proyectil para satisfacer la prueba. `npm run build` completa la comprobación de Astro y genera las cinco páginas. Los logs completos están en `tests/artifacts/arcade/river-depth-validation.log`, `river-depth-refinement.log` y `river-depth-build.log`.

Se revisaron las capturas de entrada, tramo largo y salida del primer puente, el segundo cruce y la ribera posterior. Las pruebas del renderizador detectan cambios reales de píxeles en nubes, cascada y agua; las mismas vistas permanecen estables con movimiento reducido. Las colisiones se verificaron caminando por ambos puentes y los apoyos de árboles, rescates y puntos de control se comprobaron contra el terreno ampliado.
