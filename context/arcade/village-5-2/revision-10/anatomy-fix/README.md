# Corrección de manos adicionales

15 de octubre de 2026. El usuario detectó tres poses con una tercera mano: el niño al resbalar, el anciano al resbalar y el panadero durante su advertencia.

Se editaron únicamente esas tres celdas con ImageGen integrado, modo edición con alfa transparente. Se eliminó la mano que salía detrás del cabello del niño, el brazo elevado adicional del anciano y el antebrazo que colgaba sobre el delantal del panadero. Cada pose conserva dos manos unidas a dos brazos. Fuentes anteriores y corregidas en `sources/`; texto enviado y referencias en [prompts.json](prompts.json).

Los atlas finales son:

- `public/arcade/sprites/enemies/village-climb-children-v10.webp`, celda 4.
- `public/arcade/sprites/enemies/village-climb-elders-v10.webp`, celda 4.
- `public/arcade/sprites/enemies/village-warning-v10.webp`, celda 1.

Los índices empiezan en cero. [overrides.json](overrides.json) aplica las correcciones al ejecutar `node scripts/arcade/pack-village-v10.mjs`. Sharp sólo recorta, ajusta al registro original y empaqueta. Se conservan dimensiones de celda, escala del grupo y línea de apoyo de los pies. Los 37 dibujos restantes de estos tres atlas conservan exactamente sus píxeles visibles y su alfa: [comparación por celda](cell-checks.json). WebP puede modificar RGB donde alfa es cero; eso no altera la imagen visible.

[Antes y después](before-after.png), con los originales arriba y las correcciones abajo. La grabación [cycles.webm](../../../../../tests/artifacts/arcade/village-anatomy-fix/cycles.webm) y su [hoja de contacto](../../../../../tests/artifacts/arcade/village-anatomy-fix/cycles-motion.png) muestran los ocho fotogramas de trepada del niño y del anciano y los cuatro de advertencia del panadero, usando el renderizador y reloj de poses de producción en una presentación aislada. La [captura de las poses corregidas](../../../../../tests/artifacts/arcade/village-anatomy-fix/corrected-poses.png) permite inspeccionarlas sin superposición de otros vecinos.

También se repite `tests/hexy-village-revision-10-browser.spec.js`, que abre 5-2 desde su selector, prueba el derrumbe con teclado y comprueba carga de recursos. Resultados finales de esa prueba, revisión visual y compilación en [validation.json](validation.json).
