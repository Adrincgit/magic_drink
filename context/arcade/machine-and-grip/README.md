# Manos, resplandor y Organillo mecánico

Revisión local del 6 de octubre de 2026. Sustituye el diseño anterior del segundo minijefe.

## Cambios

- Salto vertical y horizontal: reparación posterior de las manos sobre recortes ampliados. Se sustituyen las dos filas de dedos del agarre horizontal y los dedos deformes del vertical por cuatro dedos unidos a una palma y un pulgar natural. Los cuatro cuadros de cada dirección comparten la reparación; las fuentes se guardan sin pérdida para conservar los píxeles del cuerpo y su escala.
- Agachada: los cuatro dibujos usan el mismo brazo para sostener la varita; la otra mano queda sobre la rodilla.
- Diagonal inferior: eliminados el cambio de brazo y la mano adicional de las fuentes. En juego se seleccionan los cuadros `0,3,2,0`; el segundo dibujo se omite porque su cara varía de ancho. Se mantiene una escala uniforme, sin ensanchar el cuerpo.
- La varita conserva su estrella pintada. El disparo normal, la magia fuerte y la carga añaden un halo de luz blanco y dorado; se retiró la estrella de Canvas con contorno marrón.
- Organillo sin operadores: cuerpo, cubierta, ruedas, bocinas y tubos de alta resolución. Las piezas se animan por separado. Al transformarse se rompe la cubierta, suben los tubos y se expone el fuelle. Las bocinas retroceden al disparar notas rojas; los tubos y el fuelle responden a la lluvia de notas. El acabado de circo, los sonidos y la destrucción vigentes se documentan en [riverwoods-polish](../riverwoods-polish/README.md).
- `organMechanism.js` comparte las posiciones del dibujo con las salidas de proyectiles. Se conservan los patrones de ataque, la lluvia con corredores de esquiva, las ventanas de recuperación y la vida ya ajustada.
- El suelo del segundo capítulo tiene un borde de hojas transparente. El relleno sólido empieza bajo la parte opaca de la textura, para que tampoco dibuje una línea recta detrás de los huecos.

## Arte y reproducción

Se utilizó **ImageGen integrado**, con referencias del proyecto. [prompts.json](prompts.json) conserva las instrucciones y los intentos de corrección; únicamente las fuentes seleccionadas se guardan en el proyecto, en WebP.

La reparación específica posterior de los dos agarres aéreos está documentada en [hand-grip-prompts.json](hand-grip-prompts.json). Se editaron recortes de las manos y se integraron en las fuentes completas; el empaquetador reconstruye la hoja publicada `air-aim.webp`.

Se verificó por píxeles que las fuentes no cambian fuera de los recortes de mano y muñeca. Las medidas del cuerpo se conservan: 226,4 unidades en salto horizontal y 227 en vertical. La comparativa del renderizador ahora incluye las nueve posturas, también el salto horizontal. Las 27 pruebas de `hexy-animation-refinement` y `hexy-mobility-super` aprobaron después de esta reparación; registro y ampliaciones de los cuatro agarres por dirección en `tests/artifacts/arcade/hand-grips/`.

| Salida | Fuente o preparación |
| --- | --- |
| `public/arcade/sprites/hexy/air-aim.webp` | `animation-refinement/air-up-vertical-source.webp` y las otras direcciones conservadas. |
| `public/arcade/sprites/hexy/ground-aim.webp` | `animation-refinement/crouch-focused-source.webp`, `down-diagonal-source.webp` y las direcciones conservadas. |
| `public/arcade/sprites/bosses/organ/` | `organ-body-source.webp`, `organ-parts-source.webp` y `../riverwoods-polish/organ-cover-source.webp`. |
| `public/arcade/maps/riverwoods/ground.webp` | Borde transparente editado; alfa casi opaco (240–255) normalizado a 255, conservando el suavizado del borde. |

`node scripts/arcade/pack-hexy-directional-art.mjs` reconstruye las hojas de Hexy desde las fuentes WebP del proyecto y registra cuerpo y punta de la varita. `node scripts/arcade/pack-organ-art.mjs` separa las cinco piezas a su resolución nativa. No se amplían dibujos pequeños para simular alta resolución.

El cuerpo mide 1240 × 1091 px y se dibuja a 340 × 299 unidades del juego. Las cinco piezas se conservan a resolución nativa; la cubierta y el emblema del techo usan ahora el dibujo de payaso seleccionado en la revisión del bosque.

## Comprobación

- Comparativa de sostener/disparar/retroceder/recuperar: `tests/artifacts/arcade/animation-refinement/aim-review.jpg`.
- Seis etapas del mecanismo: `tests/artifacts/arcade/machine-and-grip/transformation.jpg`.
- Captura real con las notas saliendo de los tubos, suelo y resplandor: `tests/artifacts/arcade/machine-and-grip/gameplay.jpg`.
- Las pruebas verifican registro del cuerpo, origen de disparos, movimiento continuo de piezas, combate, transparencia y que el halo sólo agregue luz.
- Comprobación final: 26 pruebas aprobadas en `machine-grip-final-tests.log`, incluyendo los dos fallos corregidos de la ejecución amplia anterior (alfa casi opaco y una prueba que aún esperaba la hoja antigua). Las otras 66 comprobaciones de esa ejecución habían pasado.
- `npm run build` completado: 0 errores, 0 advertencias del chequeo y 15 sugerencias existentes. Registro en `tests/artifacts/arcade/machine-grip-build.log`.

Capturas y registros de pruebas están excluidos de Git. Los cuatro recursos obsoletos del Organillo se trasladaron, verificando SHA-256, a `G:/TRABAJO/ASTRO/ADRINC_WEBS/_magicdrink_archive/2026-10-06-history/replaced-organ/`. Ya no se descargan en el juego. No se añadieron historiales PNG al proyecto.
