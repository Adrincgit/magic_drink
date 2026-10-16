# Campamento del 1-5: profundidad y recorrido

El exterior conserva el bosque consumido, sin llamas activas. Se amplía de 5.160 a 11.980 unidades entre el inicio y el umbral: ocho carpas liberan 19 payasos en grupos finitos, con una apertura previa y un máximo de dos enemigos vivos por carpa. Hay claros entre encuentros, tres puntos de control y un acceso final sin enemigos junto a la curación. No cambia el combate del Arlequín.

## Composición

El panorama lejano se desplaza a 0,12; tres planos de troncos y vegetación carbonizada a 0,32, 0,56 y 0,80; las carpas cercanas y el suelo a 1; los restos bajos del primer plano a 1,06. Las alturas de los árboles son fijas y sus raíces quedan cubiertas por matorrales y por el borde irregular pintado del suelo. Saltar no modifica estas alturas. Los elementos próximos nunca se recalculan a partir del centro de cámara.

El suelo de ceniza reemplaza la unión recta del anterior panorama con la textura del bosque. Su parte posterior y la zona de paso comparten exactamente la misma traslación, sin deformación por filas. Las carpas tienen sombras de contacto suaves; el bosque distante tiene menos contraste. El primer plano se limita al borde inferior para conservar la lectura del combate.

Tres planos de humo gris derivan a 5, 9 y 6 unidades de pantalla por segundo, con cambios suaves entre cuatro dibujos; se mueven aun con la cámara detenida. Los cuadros se atan a la identidad de cada columna para evitar saltos al repetir. Con movimiento reducido se congela su animación temporal.

## Recorrido y objetos

Los payasos salen de las aberturas reales de las carpas, caminando desde el umbral oscuro; no aparecen transparentes. Las escuadras terminan después de 2 o 3 enemigos. Reintentar desde un punto de control deja atrás las carpas anteriores y conserva los objetivos ya cobrados.

El corazón deja de flotar sobre la caja. Una marca pequeña sobre su frente indica el contenido; romperla libera un único Corazón vital y recogerlo restaura toda la vida. Se elimina la estrella decorativa adicional de ese objeto.

El parpadeo de estrellas provenía de índices negativos del atlas al usar posiciones negativas del exterior. La animación ahora normaliza los cuatro cuadros. Las 28 estrellas normales existentes conservan sus recibos aunque cambie su posición; las nuevas tienen identidades propias. Los cinco tesoros mantienen sus identificadores.

La carpa principal mide 2.850 × 950 unidades, tiene una fachada lateral extensa y una abertura de más de tres alturas de Hexy. La abertura está medida al 8,3 % del dibujo. El umbral y el fundido conservan las coordenadas del interior y su punto de reintento.

## Arte

Cuatro imágenes nuevas generadas con la herramienta integrada `image_gen.imagegen`, tomando el panorama y las carpas existentes como referencias. Prompts exactos y originales: [camp-prompts.json](camp-prompts.json). El empaquetado conserva la transparencia y las dos celdas comunes de la cortina: `scripts/arcade/pack-camp-depth.mjs`.

Recursos finales en `public/arcade/maps/circus/`:

- `camp-ash-ground.webp`
- `camp-trunk.webp`
- `camp-pines.webp`
- `camp-brush.webp`
- `camp-log.webp`
- `camp-tent-closed.webp`
- `camp-tent-open.webp`
- `camp-grand-side.webp`

## Comprobación

`tests/hexy-camp-depth.spec.js` comprueba cuadros de monedas, recibos anteriores, aparición y agotamiento de escuadras, reintentos, curación, humo móvil y reducido, traslación del suelo con comparación de píxeles y ocho capturas de la escena real.

`tests/hexy-camp-motion.spec.js` recorre desde el inicio hasta los bastidores con teclado y salud normal, deteniéndose para vencer a los grupos. Incluye cámara quieta, retroceso y salto. Capturas, vídeo y registros en `tests/artifacts/camp-depth/`. La revisión visual se hace con el render real; la valoración final del acabado y ritmo corresponde al usuario.

La pasada grabada dura 91,5 segundos a 1.440 × 810: salen y se derrotan los 19 enemigos; Hexy termina con cinco corazones y el punto de control interior `[660,480]`. No se modificó la salud de los enemigos ni se activó invulnerabilidad para esa pasada. Durante todo el exterior, la altura de cámara y el zoom permanecen constantes. La secuencia de 16 capturas del vídeo se revisó junto con las imágenes completas del inicio, salida de una carpa, caja y gran entrada.

Validación: 18 casos de campamento y Arlequín en `final.log`, junto a las regresiones de agua, fortaleza y transición que pasaron en `regression.log`; recibos anteriores en `receipts.log`. Compilación correcta: cero errores, cero advertencias y 24 sugerencias informativas preexistentes en `build.log`. La comparación de píxeles confirma que fondo y frente del suelo avanzan a la misma velocidad, que el humo cambia con la cámara quieta y que movimiento reducido lo congela.
