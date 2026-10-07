# Zepelín, rescate y coraza del Organillo

Revisión del 6 de octubre de 2026, posterior a [circus-rush](../circus-rush/README.md).

La revisión posterior de [air-enemy-finish](../air-enemy-finish/README.md) reduce un 15% los dos enemigos aéreos y sustituye la imagen fija tras la caída por polvo que se disipa.

El zepelín recupera la proporción vertical de las celdas originales: el dibujo había comprimido su altura al empacar el atlas. Conserva el ancho de 228 unidades y pasa de 121 a aproximadamente 159 de altura. El recorrido sube 25 unidades. Disparo, hélice y colisión acompañan la nueva altura.

El río tiene dos zepelines, en los encuentros de 3420 y 7140. Solo el primero transporta una jaula con un Magic Bunny. Ese Bunny sustituye al rescate intermedio del terreno: el total sigue siendo tres, con las otras dos jaulas en 1720 y 9220. Al derribar al portador, el Bunny cae libre, se posa en el terreno y se une a Hexy al recogerlo. Si la nave atraviesa la pantalla y escapa, se pierde ese rescate durante la partida. Reintentar conserva los Bunnies rescatados, liberados o perdidos; no genera otro Bunny en el portador.

El cuerpo central del Organillo es la zona que recibe daño, por encima de las ruedas. El cuerpo completo conserva su colisión contra Hexy, así que no puede atravesar el vehículo por debajo. Disparar horizontalmente desde el suelo rebota; los disparos en salto llegan al cuerpo. La intersección del cuerpo se usa también para explosiones de Bubble Tape y el super; las estrellas que buscan enemigos apuntan al cuerpo central.

Las notas musicales pasan de 68/76 a 102/114 unidades de dibujo, y sus radios de impacto a 26/29. Las ondas bajas pasan de 86 a 122/136, con radios de 23/26. Los valores corresponden a las fases primera y segunda. La onda mantiene su base sobre el suelo y puede saltarse; requiere sostener el salto algo más que antes. La segunda fase añade una nota alta en una de cada dos salvas frontales: tres notas por pareja, un 50% más, además de la cadencia más rápida que ya tenía.

Los impactos bloqueados usan cuatro frames nuevos de chispas doradas y pequeñas esquirlas celestes. No activan el sonido de daño ni el parpadeo del jefe; tampoco hacen aparecer el antiguo efecto de burbuja. Los impactos que alcanzan el cuerpo vulnerable conservan su respuesta de daño.

El recurso se creó con la herramienta integrada `imagegen`, con transparencia, y se integró como `public/arcade/sprites/effects/armor-ricochet.webp` (1024 × 256, cuatro celdas). El prompt exacto está en [prompt.json](prompt.json). El PNG fuente permanece fuera del proyecto, en la carpeta de imágenes generadas de Codex.

Las pruebas nuevas cubren el rescate y la pérdida del Bunny, la persistencia al reintentar, las dos ruedas, las magias especiales, el disparo durante un salto real y la cantidad de notas por salva. Los casos de movimiento y rescate se ejecutan a 60, 120 y 240 fps. Las capturas del renderizador real se guardan como JPEG en `tests/artifacts/arcade/armor-rescue/`, excluido de Git.

Validación final: **56 pruebas aprobadas** en Chromium (`hexy-armor-rescue`, `hexy-organ-pressure`, `hexy-riverwoods-polish`, `hexy-river-organ`, `hexy-combat`, `hexy-circus-rush` y `hexy-adventure`). Se revisaron las capturas del portador, el Bunny liberado, los restos del zepelín, la música ampliada y un disparo real que rebota en la rueda sin dañar ni hacer parpadear al jefe. La prueba de esta última captura también se volvió a ejecutar y pasó. `npm run build` termina con 0 errores y 0 advertencias, 15 hints y cinco páginas generadas. Los logs están en `tests/artifacts/arcade/armor-rescue-*.log`.
