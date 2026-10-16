# Retratos anime e impacto del duelo

Revisión del 12 de octubre de 2026, con corrección posterior de la sonrisa. Se recupera la postura original del Arlequín empujando el rayo; se retiran los primeros planos que balanceaban la cabeza. No cambia daño, duración, presión, fases ni controles del combate.

## Actuación y marcos

- El Arlequín recupera los tres cuadros de lanzamiento sonriente originales, reproducidos como `0, 1, 2, 1` a 12 fps. Solo se integra la corrección de boca generada en el cuadro intermedio: dientes juntos y sonrisa malvada sostenida. Cabeza, manos, cuerpo, capa y sombrero conservan exactamente los píxeles y el movimiento original fuera de esa región. Retrato y personaje del escenario comparten el mismo ciclo.
- La preparación de Hexy vuelve a usar `ui/hexy-encore-full.webp`, con la varita levantada heroicamente. La ilustración de lanzamiento aparece al comenzar el viaje de los rayos.
- Se retiran los marcos circulares pintados. El entorno de cada retrato es ahora una transparencia suave, trazos curvos abiertos y partículas que salen hacia atrás: brasas para el Arlequín, estrellas y notas para Hexy. La pasada frontal queda limitada a la parte baja, lejos de las caras. Se mantiene la ilustración heroica inicial.
- El encuadre del Arlequín vuelve a incluir los brazos extendidos y las manos, además de la sonrisa y el sombrero. El acercamiento máximo se limita a 1,48 para conservar la acción de empujar el rayo. Ambos lados son intercambiables.

## Primer contacto

Durante los primeros 105 ms del choque aparece un tratamiento de tinta en blanco y negro; permanece completo 65 ms y se disuelve durante los últimos 40 ms. Solo ocurre al entrar en el forcejeo. No interrumpe la preparación heroica ni se repite con cada pulsación.

Una secuencia pintada de doce cuadros desarrolla el destello, la esfera de presión y los arcos de energía. La onda inicial se expande durante 720 ms y da paso a un núcleo de energía menor. El escenario recibe luz cálida, refuerzo del fondo incendiado y distorsión horizontal de calor. El breve desenfoque radial se aproxima mediante tres copias desplazadas en escala del fondo, sin deformar los actores ni los retratos.

La opción de efectos reducidos omite el golpe de tinta, el destello y la distorsión. Conserva un contacto estático legible y una iluminación más suave. La barra de vida y el texto de fases siguen ocultos; continúa visible el indicador de forcejeo.

## Arte y reproducción

Arte de impacto generado con **image_gen integrado**. [Prompts exactos, revisión de estrellas, fuentes y atlas](anime-art.json). Originales seleccionados en `anime-sources/`. Empaquetado: `node scripts/arcade/pack-duel-anime.mjs`. Los aros de ese paquete quedan como historial y ya no se cargan; el viento reutiliza las partículas pintadas y se anima mediante Canvas.

Sonrisa vigente: [prompt de corrección, región integrada, fuentes y salidas](cast-smile-art.json). Reconstrucción: `node scripts/arcade/pack-cast-smile.mjs`. Solo se usa la región de la boca de la imagen generada; el resto de los tres cuadros proviene de la fila original. Las hojas de bustos anteriores permanecen como historial y ya no se cargan.

| Archivo en `public/arcade/sprites/` | Celdas |
| --- | --- |
| `bosses/harlequin/clash-smile-cast.webp` | 3 × 1 de 384 × 448 |
| `bosses/harlequin/super-smile-cast.webp` | 4 × 1 de 512 × 512; 3 cuadros usados |
| `effects/painted-duel/contact-shock.webp` | 4 × 3 de 384 × 384 |

## Verificación

22 pruebas de actuación, encuadre, transparencia y efectos aprobadas tras recuperar la postura original. Una comparación de píxeles comprueba que la corrección solo cambia la región de boca del cuadro intermedio. También se comprueba que el ciclo ganador siga animado, no seleccione cuadros de grito, y mantenga sincronizados el retrato y el personaje. Continúan las comprobaciones de tinta, efectos reducidos y conservación del retrato heroico.

Capturas de preparación e impacto: `tests/artifacts/arcade/duel-anime/`. Ventaja de ambos personajes y lados intercambiados: `tests/artifacts/arcade/duel-cleanup/`. La grabación real del renderizador `expression-motion.webm` dura seis segundos y muestra preparación, viaje, contacto y cambio de ventaja. `cast-smile-motion.png` contiene ocho fotogramas decodificados de la animación ganadora. Esto verifica la simulación y el renderizado en Chrome; no sustituye una partida manual con mando.

La revisión posterior de viento y maquinaria se documenta en [machinery-rework.md](../ember-fort/machinery-rework.md); `duel-wind.webm` y `duel-wind-motion.png` muestran el efecto abierto actual.
