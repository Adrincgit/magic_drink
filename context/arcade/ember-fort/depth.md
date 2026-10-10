# Profundidad del bosque y salida al mirador — 10 de octubre de 2026

Base aceptada conservada en `9a465f0`. Esta revisión afina la composición descrita en [vista.md](vista.md), sin cambiar el recorrido, los huecos, las ramas ni el combate.

## Composición vigente

- Dos planos intermedios de árboles, con desplazamiento relativo 0,48 y 0,72; el panorama distante conserva 0,16. Cada raíz tiene una posición fija de mundo. La cámara transforma todo el plano junto: no se recalcula el suelo bajo un árbol a partir del desplazamiento de pantalla.
- Menos árboles decorativos sobre el recorrido, separados unas 625 unidades. Alturas de 315–405, con pinos más altos. Sus bases quedan detrás del camino y las matas ocultan las puntas de las raíces.
- Tres grupos de arbustos pintados, cada uno con versión carbonizada. Sustituyen la franja continua recortada del panorama. Sus posiciones, variantes y desniveles son deterministas; el borde del suelo es irregular y opaco. Los arbustos de raíz comparten la transformación de su árbol.
- El dosel termina cerca de 10.200 y regresa cerca de 15.700. El valle está pintado debajo, completamente opaco. Dos árboles en cada lindero ocultan la unión espacial de 56 unidades; no se funde toda la pantalla de bosque con toda la pantalla del valle. Retroceder recorre la misma unión.
- Se preservan el cielo del mirador, las aves que huyen a la izquierda, el humo a distintas profundidades, la niebla y las brasas. Se mantiene libre la vista central del valle; no hay payasos decorativos ni plantas pegadas a cámara.
- Conejos y zorros atraviesan la subida hacia la izquierda, en seis puntos entre 5.100 y 9.700. Cada especie tiene ocho dibujos de carrera a escala constante. Los pies siguen el suelo local; cada grupo cruza una sola vez, se retira y se reinicia al reintentar. Son animales ambientales, sin daño ni colisión.

## Música

El 1-4 reproduce en bucle `public/arcade/music/exploration/ember-trail.mp3`, copia intacta del `nivel 1-4.mp3` entregado por el usuario. SHA-256: `0326dbdbadabb0f45f0ca3a6e9a738ff9bc4afd3f3c6be723fb7e56d4e74f419`. Se conserva el tema de combate del fuerte.

## Revisión visual y pruebas

Las capturas usan el render real a 1.440 × 810. Hay nueve encuadres del inicio, subida, lindero, valle, regreso, bajada, ramas y fuerte en `tests/artifacts/arcade/woodland-depth/`.

`woodland-depth-motion.webm` contiene 59,6 segundos de movimiento por tramos, con teclado, avance y retroceso, animales, apertura/cierre del bosque, ignición de arbustos y aproximación/retirada del jefe. `motion-review.jpg` reúne fotogramas de esa grabación; `motion-trace.json` conserva posición y cámara. Es una revisión por tramos con enemigos normales retirados para inspeccionar la composición; no es una partida completa ni una aprobación visual del usuario.

`tests/hexy-woodland-depth.spec.js` comprueba raíces fijas, unión espacial, dirección y retirada de animales, identidad del audio, reproducción y retorno del MP3, capturas y cámara estable de la fortaleza. La prueba de audio espera a `seeked` antes de verificar el bucle.

La pasada general comprobó 104 casos: 103 pasaron y la comparación de traslación encontró un cambio de filtrado en arbustos parcialmente fuera de pantalla. Se corrigió preparando las tres escalas fijas de esas matas antes de dibujarlas. La repetición de estabilidad y profundidad terminó con 10 casos correctos, incluida comparación de píxeles y nueva grabación. Son 106 casos distintos entre ambas pasadas. Registros: `woodland-depth-regressions.log` y `woodland-depth-verified.log`, bajo `tests/artifacts/arcade/`. La mezcla final de vegetación retira por completo el verde al llegar a carbonización total; `woodland-depth-color.log` comprueba nuevamente las capturas y la traslación tras ese ajuste. Compilación: `woodland-depth-build.log`.

Arte integrado: [fuentes y registro de cuadros](depth-art.json), [prompts](depth-prompts.json). Empaquetado en `scripts/arcade/pack-woodland-depth.mjs`. Los resultados publicados mantienen transparencia; el ajuste de escala de los arbustos es uniforme y los animales conservan una escala común.
