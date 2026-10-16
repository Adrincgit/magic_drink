# Actuación, preparación y energía del duelo

Revisión del 11 de octubre de 2026. **La sonrisa, los marcos y el primer impacto fueron sustituidos el 12 de octubre por la [revisión anime](duel-anime-impact.md).** Se conservan la preparación del Arlequín con los codos flexionados, los rayos de doce cuadros y la separación entre carga y descarga. La revisión posterior recupera la ilustración heroica de Hexy levantando la varita durante la preparación.

## Fotogramas activos

| Elemento | Antes | Ahora |
| --- | --- | --- |
| Cuerpo del ultimate de Hexy | 4 | 12 |
| Cuerpo del rayo del Arlequín | 4 | 12 |
| Punta de cada rayo | 8 | 8 |
| Sonrisa ganadora del Arlequín | 1 pose fija por intensidad | 6 por intensidad, 18 dibujos |
| Preparación del Arlequín | Retrato de lanzamiento | 6 dibujos específicos de carga |
| Marcos de cada personaje | Bandas geométricas | 4 dibujos de fuego o música |

Los rayos recorren sus doce dibujos a 24 fps, con mezcla de fotogramas adyacentes sin sumar brillo. El brillo exterior, el rayo principal y el indicador de forcejeo comparten las nuevas texturas. Los 12 dibujos de actuación de Hexy no cambian. El Arlequín usa 27 dibujos de actuación durante la descarga: los nueve anteriores de esfuerzo y los dieciocho nuevos de sonrisa.

## Comportamiento visual

- El fuego entrante recorre el perímetro del retrato y queda detrás del personaje. Una zona central transparente protege el rostro incluso con zoom; el reflejo de luz aumenta con la presión rival.
- El encuadre incluye la campana del sombrero y difumina los cuatro bordes del recorte.
- Los marcos son sprites ilustrados con llamas rojas/doradas para el Arlequín y estrellas, pentagrama y notas para Hexy.
- Se corrigió la absorción de Hexy durante el duelo: estaba dentro del fondo del ultimate independiente, que se omite durante el choque. Ahora se dibuja también al responder al Arlequín, con estrellas y estelas convergiendo hacia la varita.
- El primer contacto añade una onda pintada que se expande durante medio segundo antes de volver al vórtice sostenido.
- Se retiraron la barra de vida del Arlequín y el texto de fases. Se mantiene el indicador de forcejeo; los cambios de fase siguen comunicándose con sus transformaciones.

## Arte y reproducción

Generado con **image_gen integrado**. Prompts exactos y fuentes: [rayos y registro de empaquetado](rotation-art.json), [carga, sonrisa final y marcos](cutin-art.json). Los originales seleccionados están en `rotation-sources/` dentro de esta carpeta. Reconstrucción: `node scripts/arcade/pack-duel-rotation.mjs`.

Archivos finales utilizados por el juego:

- `public/arcade/sprites/effects/super-beam-rotation.webp`
- `public/arcade/sprites/bosses/harlequin/ultimate-beam-rotation.webp`
- `public/arcade/sprites/bosses/harlequin/clash-grin-sinister.webp`
- `public/arcade/sprites/bosses/harlequin/super-grin-sinister.webp`
- `public/arcade/sprites/bosses/harlequin/clash-charge.webp`
- `public/arcade/sprites/bosses/harlequin/super-charge.webp`
- `public/arcade/sprites/effects/painted-duel/cutin-borders.webp`

## Comprobación

37 pruebas de duelo, actuación y fuego aprobadas; las nueve de encuadre, nuevos atlas y absorción se repiten tras el último ajuste visual. Se comprueban ambos lados, las tres intensidades de sonrisa, carga y descarga distintas, alfa y fotogramas únicos, ausencia de vida/fases, y que la energía entrante no pinte el área del rostro. Compilación: cero errores y cero advertencias, con 23 avisos informativos existentes.

Capturas y grabación del renderizador real: `tests/artifacts/arcade/duel-cleanup/`, especialmente `both-charging.png`, `boss-winning.png`, `reversed-boss-winning.png` y `expression-motion.webm`. La grabación incluye absorción, lanzamiento y cambio de ventaja. Estos archivos de revisión están excluidos de Git.
