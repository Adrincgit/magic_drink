# Efectos pintados del duelo · 8 de octubre de 2026

Esta revisión sustituye los efectos geométricos descritos en revisiones anteriores. La petición posterior del usuario restablece la anticipación natural de las columnas mediante calentamiento pintado de la madera; véase [revisión vigente de fuego y entrada](fire-show.md).

- **Sin indicadores geométricos:** las columnas ahora anticipan su posición mediante luz de calor pintada sobre la madera, a petición posterior del usuario. Se conserva la preparación del puño, el golpe al escenario y el sonido del arlequín. Las posiciones quedan fijadas al soltar el ataque; no persiguen a Hexy.
- Puntas de lanzamiento con ocho dibujos por combatiente: estrella de cinco puntas para Hexy, bola de fuego para el arlequín. Resplandor a partir de la propia silueta pintada. Se conserva el recorrido antes del contacto.
- Notas, estrellas y sparks de Hexy; brasas y cartas incendiadas del enemigo; astillas del escenario. Sustituyen líneas, diamantes y polígonos procedurales. Las ondas son pinceladas curvas animadas, sin aros trazados.
- Polvo con ocho cuadros: jet bajo desde el talón, estela hacia atrás, rizo ascendente y fragmentos que se desprenden. Sólo aparece en los pies si el personaje está apoyado. Hay tres emisiones escalonadas por combatiente, una con movimiento reducido.
- Las llamas que invaden el retrato de Hexy son ocho pinturas animadas; el arlequín recibe estrellas y notas cuando retrocede. Se conserva libre la zona principal del rostro.
- Columnas de 340 unidades: cuatro cuadros de erupción, ocho de combustión y cuatro de extinción. Registro vertical fijo; las últimas llamas se fragmentan a la altura que ya tenían. El daño empieza con el cuerpo formado a los 160 ms y termina antes de la disipación, a los 700 ms. Desaparecen a los 1040 ms.
- Cartas incendiadas y ondas rasantes tienen ocho cuadros a 24 cuadros/s, más brasas y una estela de posiciones reales, limitada a nueve muestras por proyectil.
- La superficie de madera se dibuja 18 unidades más arriba respecto al plano físico: los pies quedan dentro de la tabla superior. No se alteran colisiones ni la altura del combate.
- Botón arcade ilustrado con ocho cuadros de pulsación, rebote e impacto, sin mano. La etiqueta sigue mostrando la tecla, el botón del mando o TAP; la pulsación real comprime el dibujo. Marcos pintados de terciopelo y oro para vida del jefe y fuerza del duelo.

Arte creado con la herramienta integrada `image_gen.imagegen`, con transparencia nativa. [Prompts exactos, fuentes y registro de cada cuadro](painted-effects-art.json). Siete archivos finales en `public/arcade/sprites/effects/painted-duel/`: `heads.webp`, `particles.webp`, `dust.webp`, `fire.webp`, `pyres.webp`, `tap.webp`, `meter.webp`.

Empaquetado reproducible: `node scripts/arcade/pack-painted-effects.mjs`. Mide las filas reales de las hojas, conserva el pie de las llamas y la base del botón; no redibuja efectos con vectores.

Validación: 62 pruebas distintas aprobadas entre efectos pintados, choque, actuación de fuego, cinemática, impactos y movilidad/ultimate. Incluyen teclado, mando y táctil, combate aéreo y desde ambos lados, reintento, ausencia total de dibujo previo a la erupción, extinción sin daño y estelas limitadas. La compilación Astro termina con cero errores y cero advertencias (22 sugerencias existentes). Capturas y vídeo del render real en `tests/artifacts/arcade/painted-effects/`; `video-contact-sheet.jpg` permite comparar cuadros del vídeo. Los siete nuevos archivos suman aproximadamente 2,35 MB.
