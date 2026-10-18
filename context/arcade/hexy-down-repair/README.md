# Hexy: identidad, brazo e ilustraciones del Encore

Las dos familias de sprites del ultimate hacia abajo, vertical y diagonal, recuperan el rostro redondeado y las proporciones infantiles de las hojas originales: cabeza grande, torso compacto y extremidades cortas. La varita mantiene su mano habitual y el brazo sigue una cadena natural de hombro, codo y muñeca. Son 32 celdas seleccionadas entre cuatro fuentes nuevas de imagegen, con cuatro preparaciones y cuatro dibujos de viento por postura de suelo/aire. Se descartan las celdas generadas que cambian de mano o apoyan las piernas durante una preparación aérea. El tamaño del rostro se calibra por fuente con `reactions.webp`; no se estiran miembros ni se sustituye el movimiento por una pose estática.

Las imágenes grandes del Encore son nueve ilustraciones independientes de 1024 × 1536 con alfa, al mismo nivel de acabado que la ilustración clásica. No se amplían ni recortan los sprites de juego para producirlas. Se conservan los píxeles originales al empaquetarlas como WebP en `public/arcade/sprites/ui/encore/`. La pose clásica de pie y su ilustración original siguen intactas. Cada variante grande corresponde a postura y dirección, y su figura completa se centra en los dos ejes dentro del rectángulo de presentación; no se ancla al borde inferior.

El manga usa exactamente la misma ventana que el contacto con el Arlequín: **0,105 segundos**, definida una sola vez por `MANGA_IMPACT_DURATION`. El lanzamiento normal aplica blanco y negro completo durante esa ventana. Durante el duelo se conserva el disparador al contacto de los rayos. La indicación final del usuario de igualar ambos efectos reemplaza las duraciones anteriores de 0,7 y 0,4 segundos.

Fuentes y reproducción:

- `prompts.md`: prompts de los sprites, herramienta integrada imagegen.
- `portrait-prompts.md`: los nueve prompts completos de las ilustraciones, misma herramienta.
- `illustrations/`: PNG originales de las ilustraciones, conservados en el proyecto.
- `node scripts/arcade/pack-hexy-acting.mjs`: selecciona y registra las celdas de juego; ya no produce ilustraciones de interfaz.
- `node scripts/arcade/pack-encore-portraits.mjs`: conserva las nueve ilustraciones a su resolución original y registra sus recortes transparentes.
- `tests.log`, `tests-render.log` y `build.log`: verificaciones de esta revisión.
- `review/`: capturas y grabaciones del renderizador real, con reproducción decodificada.

Verificación final: 37 comprobaciones distintas pasaron entre la ejecución principal y la repetición secuencial de dos pruebas de lienzo que agotaron tiempo al cargar en paralelo. Las doce grabaciones de ultimate terminaron con cero errores y se revisaron sus reproducciones y capturas. La compilación completó con cero errores y cero advertencias de diagnóstico. Los hashes de `super-charge.webp` y `hexy-encore-full.webp` coinciden exactamente con HEAD.

La generación es asistida; las celdas se inspeccionan y seleccionan antes de incorporarlas. Las proporciones y la anatomía se comprueban también en las capturas del juego.
