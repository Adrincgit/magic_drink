# Retrato de Encore

Implementado el 7 de octubre de 2026 tras la aprobación del retrato lateral.

El primer retrato de medio cuerpo y su franja transversal fueron rechazados porque cubrían demasiada pantalla. El recurso WebP rechazado se retiró del proyecto; su prompt permanece como historial en `prompt.json`.

La composición vigente es una ilustración de cuerpo completo de Hexy a la izquierda, con la varita levantada, expresión decidida y boca abierta gritando la invocación. Tiene dos bandas diagonales cortas, una arriba y otra abajo, detrás de la figura. La zona a partir de x = 370, en el lienzo lógico de 960, queda totalmente libre de esta capa. No existe panel central ni fondo opaco detrás del cuerpo.

La preparación conserva sus 0,9 segundos: entrada desde la izquierda de 0,2 s, pausa hasta 0,66 s y desvanecimiento en el mismo costado hasta 0,9 s. El retrato no atraviesa el campo de batalla al salir. Todo ocurre en coordenadas de pantalla, independiente del zoom y de la dirección de disparo. Durante el rayo ya no se dibuja la ilustración. Ambas bandas y el texto existente se dibujan aparte para conservar las traducciones al español e inglés.

Con movimiento reducido, el retrato permanece quieto y entra y sale mediante opacidad. La animación utiliza el reloj de la cinemática: pausar el juego también pausa la ilustración. El coste, los ocho impactos, la recarga de 80 segundos y la duración total no cambian.

Arte final: `public/arcade/sprites/ui/hexy-encore-full.webp` (1024 × 1536, alfa real). Se creó con el generador integrado de imágenes y se convirtió a WebP sin recortar ni deformar la ilustración. Conserva sombrero, estrella de la varita y ambos zapatos completos. [fullbody-prompt.json](fullbody-prompt.json) conserva el prompt exacto, la referencia y el PNG fuente. [asset.json](asset.json) registra tamaño y hash del archivo integrado.

Las capturas de entrada, pausa y salida, las variantes móvil/inglés/movimiento reducido y `ultimate-left.webm` están en `tests/artifacts/arcade/super-cutin`. Pasaron siete pruebas distintas y la compilación de producción. La comprobación de píxeles confirma que esta capa no dibuja nada a partir de x = 370; las pruebas de la interfaz real verifican pausa y reanudación a 390 y 1280 píxeles sin gastar magia dos veces. [verification.json](verification.json) registra las comprobaciones. Se revisaron visualmente la composición, el brazo, el agarre y la transición al rayo; la aprobación visual final corresponde al usuario.
