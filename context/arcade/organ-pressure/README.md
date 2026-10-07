# Peligro musical, embestida e impactos

Revisión local del 6 de octubre de 2026. Continúa [riverwoods-polish](../riverwoods-polish/README.md), conservando su arte nativo y la destrucción de la máquina. Los ajustes posteriores están en [circus-rush](../circus-rush/README.md): eliminan los indicadores del recorrido, aceleran la embestida y añaden los frames ilustrados y la música del jefe.

## Ataques

Las notas rojas frontales dejan el arco que pasaba sobre Hexy. Apuntan a su posición al disparar, a la altura del cuerpo y sin gravedad: aciertan si se queda quieta. La trayectoria queda fijada y se puede esquivar. El acorde frontal baja a un registro de órgano más grave.

En las fanfarrias alternas, el fuelle emite ondas de sonido desde la rejilla inferior. También acompañan las lluvias de `organ-bellows` y `organ-finale`. Las ondas bajan desde su salida hasta quedar a 18 unidades del suelo y avanzan a 315 unidades por segundo, 355 en la segunda fase. Golpean estando de pie o agachada; un salto corto permite pasarlas por arriba. En la segunda fase, algunas de esas ráfagas añaden una nota roja a mayor altura para que el salto también deba evitar el ataque superior. Se conservan los corredores fijos de la lluvia.

`organ-charge` prepara una embestida. Fija el destino antes de un aviso de 1,3 segundos (1,65 en modo suave), ilumina el recorrido sobre el suelo y acelera hacia ese punto. Su velocidad máxima llega a 620 unidades por segundo, 690 en la segunda fase; el modo suave limita la aceleración a 480. La máquina se detiene antes del extremo izquierdo para conservar espacio de retirada. Durante el aviso y la recuperación se le puede hacer daño; el avance es resistente. Al frenar retrocede y deja una ventana de ataque. La segunda fase intercala embestidas con más frecuencia.

El contacto con el cuerpo causa daño y empuja a Hexy fuera del vehículo, para que atravesarlo y quedarse detrás no anule todos sus ataques.

## Arena y cámara

El tramo de combate aumenta de 1.220 a 1.600 unidades, con suelo continuo hasta la nueva salida. Los límites permiten 1.552 unidades de movimiento horizontal; el límite anterior hacia el frente se sustituye por el contacto real con el cuerpo. El carro de salida se desplaza al extremo nuevo.

La cámara encuadra a Hexy y la máquina. Se aleja cuando están separadas o empieza la embestida y recupera el encuadre más cercano al volver a luchar. No limita la retirada a una cámara fija ni modifica el tamaño individual de los sprites.

## Impactos en los jefes

`bossHitFeedback` comparte el efecto entre disparos normales, magia fuerte, burbujas y súper. Un impacto normal produce 0,3 segundos de pulsos claros; uno fuerte, 0,4. Las piezas del Organillo, el globo y los demás jefes usan el mismo filtro. Conservan su posición y escala. Movimiento reducido usa un brillo estable.

`bossHit` y `bossHeavyHit` ahora son golpes metálicos breves y agudos, con armónicos de aproximadamente 1–3 kHz. Los bloqueos mantienen su efecto diferenciado. La pausa breve, chispas y vibración existentes siguen acompañando el daño.

## Archivos

| Archivo | Función |
| --- | --- |
| `actors/bosses/adventureOrganFortress.js` | Fanfarrias dirigidas, lluvia y ondas graves. |
| `actors/bosses/organCharge.js` | Aviso, destino comprometido, aceleración, frenado y retorno. |
| `actors/bosses/organMechanism.js` | Salida inferior, anclajes y ruedas. |
| `actors/bosses/bossFeedback.js` | Registro de impactos y pulsos visuales compartidos. |
| `render/organEffectsCanvas.js`, `render/organCanvas.js` | Ondas, recorrido anunciado, polvo, vapor y dibujo de la máquina. |
| `render/adventureCamera.js`, `world/adventureRiverRoute.js` | Arena más extensa y encuadre de ambos actores. |
| `shared/audio/sounds.js` | Registro grave del órgano y golpes metálicos. |

## Comprobación

`tests/hexy-organ-pressure.spec.js` verifica daño real a distintas distancias y en ambos modos, ondas contra posturas de pie/agachada, saltos cortos y retirada a 60/120/240 fps, lluvia combinada con ondas, encuadre de los extremos de la arena, recuperación y resistencia de la embestida, daño y bloqueos en ambos jefes.

La prueba de audio renderiza los sonidos con Web Audio: volumen no nulo, ausencia de recorte, mayor energía aguda en los impactos y registro más grave en el acorde frontal. Guarda las muestras de escucha como WAV en la salida de pruebas, excluida de Git.

Las capturas de notas/ondas, aviso/avance de la embestida y tres estados de brillo de ambos jefes quedan en `tests/artifacts/arcade/organ-pressure/`. Se usa el renderizador del juego, con sus recursos reales. El aviso lleva flechas doradas con contorno, elevadas sobre las hojas; una comparación de los píxeles con/sin aviso comprueba su contraste también con movimiento reducido. No se añaden historiales de arte PNG.

La suite de combate, movimiento, especiales, progresión, capítulo uno y revisiones del Organillo aprobó **83 pruebas** (`validation.log`). Tras reforzar el contraste del aviso, las **8 pruebas específicas** se volvieron a aprobar (`final-pressure-tests.log`). `npm run build` termina correctamente y genera las cinco páginas conservadas del proyecto (`build.log`).

Cambios locales, sin despliegue.
