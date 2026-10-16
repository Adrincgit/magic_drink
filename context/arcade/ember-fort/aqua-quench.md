# Aqua Berry: impacto y extinción

El impacto separa el agua que salta, las gotas físicas, las salpicaduras al aterrizar, las manchas de agua y el vapor. Las gotas siguen gravedad y consultan el suelo en su posición actual. En los huecos chocan contra las paredes y escurren hacia el fondo, sin saltar a la altura del borde. Las salpicaduras y manchas siguen la pendiente del terreno.

Las llamas de arbustos y suelo se contraen según el agua recibida. Al apagarse, el daño cesa inmediatamente; queda una extinción visual de 0.34 segundos y vapor que asciende, se expande y se desvanece durante 1.5–1.9 segundos. El arbusto y su fuego comparten el impacto para evitar efectos duplicados. Se mantienen las cantidades de agua necesarias y el tiempo de protección del terreno mojado.

## Arte

- Hoja de 16 celdas: `public/arcade/sprites/effects/aqua-quench.webp`.
- Creada con **ImageGen integrado**. Original y prompt exacto: [aqua-quench.json](./aqua-quench.json).
- Empaquetado con puntos de contacto estables: `node scripts/arcade/pack-aqua-quench.mjs`.
- Filas: salpicadura en suelo, vapor, superficie mojada, gotas. El impacto aéreo conserva la pintura radial de `aqua.webp` para que no aparezca una superficie plana flotando.

## Comprobación

`tests/hexy-aqua-quench.spec.js` comprueba la caída en pendientes y huecos, las paredes de los huecos, la eliminación de los efectos, el impacto único por arbusto y el vapor que permanece después de desactivar el fuego.

La prueba visual usa el motor, los disparos normales/especiales y el render real del nivel 1-4 en dos escenas controladas sin enemigos ni daño al jugador: un arbusto y un hueco que requiere dos descargas especiales. Guarda el video `tests/artifacts/aqua-quench/aqua-motion.webm`, capturas y la traza de las gotas. Los fotogramas del video se revisan con `scripts/arcade/review-forest-motion.mjs`.

Validación: 8 casos relevantes aprobados entre `hexy-aqua-quench`, `hexy-siege-water`, `hexy-ember-revision` y `hexy-fire-acting`. Después del ajuste final se repitieron los 3 casos de Aqua, incluidos el video de 9.5 segundos y sus fotogramas. Build: 0 errores, 0 advertencias y 24 sugerencias existentes.
