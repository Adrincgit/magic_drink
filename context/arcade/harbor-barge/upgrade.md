# Barcaza: maquinaria, daños y tripulación — 9 de octubre de 2026

> Historical implementation, superseded on 2026-10-09 by [the current boat and land approach revision](../ember-fort/README.md). The tent is now on land in 1-4; the Arlequin battle is 1-5. No barge ram or hull contact damage remains.

Implementación local autorizada por el usuario. El jefe aumenta de tamaño un 10%, con la flotación anclada a `arena.waterY=612` y el puente en `y=520`. Dibujo, zonas vulnerables y bocas de armas comparten `bargeRig.js`.

## Combate

- Dos tripulantes tienen poses propias para percusión, bombeo, apuntado, retroceso, alarma y escape. La maza pivota desde las manos del percusionista.
- El redoble lanza presión sonora pintada, perlada y violeta, con cuatro fases de expansión. Sustituye los aros dorados; no usa SVG. Produce una reacción sónica y un golpe de percusión grave.
- La toma de la manguera se registra sobre el río. La preparación del chorro llena el depósito durante 1,3 segundos; el artillero dispara 1,75 segundos desde una segunda arma y el tanque se vacía. El mortero conserva sus globos de agua.
- El tambor dispone del 25% de la salud máxima del jefe y el tanque del 30%. Cada golpe reduce la salud general y la pieza realmente alcanzada. Los dibujos pasan de intacto a dañado y roto. La segunda fase comienza al 50% de salud sin romper automáticamente las piezas.
- Al destruir el tambor se eliminan sus ataques; al destruir el tanque se interrumpe el chorro activo y se elimina esa arma de la secuencia. El núcleo bajo el depósito queda expuesto y se puede alcanzar con disparos horizontales normales. Mortero, olas y acometida mantienen el combate activo.
- Devolver un globo de agua capturado con Bubble Tape durante la preparación del chorro provoca una avería de presión de 2,2 segundos: cancela el disparo, vacía el depósito y permite un 25% más de daño directo durante esa apertura.
- La derrota retiene el premio mientras la máquina se inclina, los tripulantes saltan al río y el casco se fragmenta a los 1,55 segundos. El combate se libera a los 4,5 segundos, con un solo premio. El ultimate también respeta esta secuencia.

## Reacciones de Hexy

`adventureHitReactions.js` distingue impactos físicos, agua, fuego y sonido. Agua, fuego y sonido tienen cuatro dibujos dedicados por tipo. El impulso sigue la dirección del ataque, incluso cuando golpea desde atrás.

Las olas grandes y determinados golpes pesados usan ocho poses: caída, contacto con el suelo y recuperación progresiva. Las gotas pequeñas conservan una reacción breve. La recuperación tiene protección y no permite atacar, saltar o deslizarse a mitad de la caída. Reintentar y comenzar la victoria limpian este estado.

## Arte y audio

Se utilizó la herramienta integrada `image_gen` con los personajes y piezas existentes como referencias. [upgrade-art.json](upgrade-art.json) conserva los prompts exactos, referencias y rutas de generación, incluidas las iteraciones descartadas. [upgrade-assets.json](upgrade-assets.json) registra dimensiones y transparencia de los ocho archivos finales:

- `public/arcade/sprites/hexy/element-hits.webp`: 12 poses, celdas de 320 píxeles.
- `public/arcade/sprites/hexy/knockdown.webp`: ocho poses, celdas de 320 píxeles.
- `public/arcade/sprites/bosses/barge/crew.webp`: 16 poses, celdas de 256 píxeles.
- `public/arcade/sprites/bosses/barge/drum-states.webp`: cuatro estados del tambor.
- `public/arcade/sprites/bosses/barge/tank.webp`: vacío, lleno, dañado y roto.
- `public/arcade/sprites/bosses/barge/hose.webp`: dos cuadros de bombeo.
- `public/arcade/sprites/bosses/barge/nozzle.webp`: reposo y retroceso del arma.
- `public/arcade/sprites/effects/barge-sonic.webp`: cuatro dibujos de presión sonora.

`node scripts/arcade/pack-barge-upgrade.mjs` recorta y registra los originales mediante Sharp. No pinta ni sustituye el arte por formas geométricas. El juego sólo requiere los WebP guardados en el repositorio.

Los efectos `bargePump`, `bargeTankBreak`, `bargeDrumBreak`, `bargePressureJam`, `hitWater`, `hitFire`, `hitSound` y `hitLanding` son síntesis original integrada en la mezcla existente. La música del nivel sigue siendo la suministrada por el usuario.

## Verificación

`tests/hexy-barge-upgrade.spec.js` comprueba daño localizado, ataques desactivados, cancelación del chorro, contraataque de presión, cambio de fase, núcleo atacable después de romper ambas piezas, reacciones, retroceso, protección al levantarse y recompensa diferida. Usa el renderizador real para guardar capturas y una grabación en `tests/artifacts/arcade/barge-upgrade/` (excluido de Git). La grabación fuerza ataques y daños con invulnerabilidad para inspeccionar la animación; no representa una partida ganada por el jugador.

Las pruebas de movilidad actualizan la expectativa de premio inmediato a la nueva secuencia. Otras pruebas antiguas se ajustan a los objetivos reales del organillo, a los enemigos que llegan durante la emboscada y al inicio exterior del 1-4. Los sonidos nuevos se renderizan con `OfflineAudioContext` para verificar señal finita, audible y sin saturación digital.

Resultado final: compilación Astro completa, cero errores y cero advertencias (22 avisos informativos existentes). Los 48 casos de mejora de barcaza, combate, movilidad y especiales quedan aprobados: 47 en la última ejecución conjunta y el último caso táctil en una ejecución aislada, tras actualizar su expectativa al atlas `super-cast` vigente. Los 27 casos combinados previos de mejora, barcaza, agua y parallax también pasaron. La regresión general inicial aprobó 96 de 103; sus siete fallos quedaron resueltos en las comprobaciones posteriores: expectativas antiguas y escenarios de prueba, además de tres casos de navegador que pasaron al reducir la concurrencia. Los 17 sonidos de la ribera, incluidos todos los nuevos, pasaron la comprobación de mezcla.

Se inspeccionaron las capturas finales y 15 cuadros de `upgrade-motion.webm`: contacto de manguera, tanque lleno y vacío, origen del chorro, percusión, caída y recuperación, roturas, escape y hundimiento. No se afirma una evaluación auditiva de los sonidos a partir de la comprobación numérica.

La dificultad y la sensación de los nuevos golpes todavía requieren la partida del usuario. Esta revisión no publica cambios ni realiza commit o push.
