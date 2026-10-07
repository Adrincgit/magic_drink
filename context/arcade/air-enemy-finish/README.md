# Tamaño de enemigos aéreos y polvo de destrucción

Revisión del 6 de octubre de 2026, posterior a [armor-rescue](../armor-rescue/README.md).

El zepelín y el payaso que usa un globo se reducen un 15% tanto en ancho como en altura. El zepelín mantiene la proporción vertical recuperada en la revisión anterior; su ancho pasa de 228 a 193,8 unidades. El tamaño de dibujo del payaso con globo pasa de 220 a 187. Sus colisiones y los orígenes de sus disparos se reducen con el mismo factor. También se ajustan la hélice y la jaula del zepelín portador. El Bunny sigue siendo uno de los tres rescates del nivel.

El zepelín conserva sus frames de rotura, desinflado, explosión y restos mientras cae. Al alcanzar el terreno, el dibujo cambia a cuatro frames de polvo: impacto, nube que se abre, remolinos separados y últimas motas. El polvo y su sombra se desvanecen durante 0,9 segundos; después se elimina el enemigo. La nube deja de deslizarse sobre el suelo. Las caídas altas siguen hasta alcanzar el terreno, en lugar de desaparecer al vencer un tiempo fijo en el aire.

El atlas se creó con la herramienta integrada `imagegen` y se guarda como `public/arcade/sprites/effects/zeppelin-dust.webp`: 1024 × 256, cuatro celdas con transparencia y un único punto de apoyo sobre el suelo. El prompt exacto está en [prompt.json](prompt.json). El PNG original queda fuera del proyecto, en la carpeta de imágenes generadas de Codex.

`hexy-air-enemy-finish` comprueba las escalas y las caídas de 170 y 700 unidades a 60, 120 y 240 fps. Verifica que el impacto se registra una sola vez, que la recompensa no se repite, que el polvo queda sobre el terreno y que el enemigo desaparece. Las capturas del renderizador real están en `tests/artifacts/arcade/air-enemy-finish/`: tamaños nuevos y polvo al impactar, abrirse, disiparse y dejar el suelo vacío. Se guardan como JPEG, excluido de Git.

Validación final: **40 pruebas aprobadas** en Chromium, incluyendo las de escala, combate, rescate del Bunny, disparo y caída del zepelín, y efectos del río. `npm run build` termina con 0 errores y 0 advertencias, 15 hints y cinco páginas generadas. Se revisaron las capturas de ambos enemigos reducidos y del polvo a 0,3, 0,6, 0,85 y 1 segundo: el vehículo y la nube desaparecen, mientras el Bunny liberado permanece disponible. Los logs están en `tests/artifacts/arcade/air-enemy-finish-tests.log` y `air-enemy-finish-build.log`.
