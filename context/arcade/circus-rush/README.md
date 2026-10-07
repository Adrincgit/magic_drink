# Circo: embestida, ondas y zepelín

Revisión local del 6 de octubre de 2026. Continúa el combate de [organ-pressure](../organ-pressure/README.md).

La revisión posterior de [armor-rescue](../armor-rescue/README.md) ajusta la altura del zepelín, el rescate transportado y las zonas de daño y proyectiles del Organillo.

La tienda funcional de Miso permanece al comienzo del nivel 1-2, en `(370,480)`. Se retira la copia decorativa del carro que aparecía al final de la arena.

El MP3 proporcionado como `for replace/boss 1-2.mp3` se instala sin recodificar en `public/arcade/music/bosses/serio.mp3`. Su SHA-256 coincide con el original: `efb42bded7738e54bcc36e015ba1754ef2d47c5e613d3f13c05340facbbdaca2`. Conserva pausa, bucle, volumen, silencio y transición al terminar el combate.

## Embestida

La preparación se comunica mediante las ruedas que giran cada vez más rápido, el retroceso corto de la máquina, vapor, polvo y sonido de motor. Se eliminan las flechas y la franja que indicaban el recorrido. El destino se fija antes de la preparación; no persigue a Hexy después del aviso.

El avance se extiende hasta 140 unidades detrás de la posición inicial de Hexy, 200 en la segunda fase. La velocidad máxima sube de 620 a 900 unidades por segundo y de 690 a 1.020 en la segunda fase. El modo suave limita la velocidad a 650. Se conserva espacio para retroceder al extremo de la arena y una recuperación vulnerable.

Las ruedas dejan nubes de polvo en coordenadas del terreno. Siguen flotando y desaparecen aunque la máquina ya haya pasado; no se arrastran con el vehículo. La emisión depende de la distancia y tiene un máximo de 96 partículas. Trazos horizontales y una vibración breve refuerzan la velocidad. Movimiento reducido detiene el giro adicional y oculta polvo y trazos.

## Frames de circo

Los dos atlas se crearon con la herramienta integrada `imagegen`. Sus prompts finales están en [prompts.json](prompts.json). Se conserva el PNG generado fuera del proyecto; dentro del juego solamente se integran los WebP elegidos, con transparencia.

| Recurso activo | Frames |
| --- | --- |
| `public/arcade/sprites/effects/organ-sonic.webp` | Cuatro de onda baja y cuatro de notas rojas, con contornos ilustrados y remolinos. |
| `public/arcade/sprites/enemies/zeppelin-actions.webp` | Vuelo, preparación, disparo, retroceso, rotura, desinflado, explosión y restos. |

El zepelín conserva su recorrido horizontal. El piloto mueve la palanca al disparar. Las pelotas rojas pasan de 285 a 340 unidades por segundo, aproximadamente un 19% más rápidas. Al recibir el disparo mortal, la nave se rompe, pierde altura, explota y cae al terreno; después desaparecen los restos. La secuencia añade sonidos de rotura, explosión e impacto. No causa daño ni dispara después de morir y entrega su recompensa una sola vez.

Los dos primeros jefes ganan otro 20% de vida respecto de la revisión anterior. En modo normal quedan en 231,84 y 236,16, respectivamente. Se aplica también al modo suave y al reiniciar; la segunda fase continúa comenzando a media vida.

## Verificación

`hexy-organ-pressure`, `hexy-circus-rush`, `hexy-river-organ`, `hexy-worlds`, `hexy-riverwoods-polish`, `hexy-balloon-final-balance`, `hexy-animation-refinement` y `hexy-progression-polish` cubren los cambios de combate, vida, recursos, audio y tienda. Las comprobaciones de retirada, partículas y destrucción se ejecutan a 60, 120 y 240 fps.

Capturas del renderizador real en `tests/artifacts/arcade/circus-rush/` y `tests/artifacts/arcade/organ-pressure/`; las muestras y los logs quedan excluidos de Git. Las capturas nuevas se guardan como JPEG.

Resultado final: **62 pruebas aprobadas** en Chromium. `npm run build` termina correctamente: Astro comprueba 143 archivos con 0 errores, 0 advertencias y 15 hints, y genera las cinco páginas. `git diff --check` no encuentra errores de formato.

Revisión visual de las capturas finales: el disparo del piloto queda aislado sin fragmentos del frame vecino; el desinflado conserva el personaje y el polvo permanece sobre el terreno detrás de las ruedas. También se revisaron las ondas y las notas ilustradas dentro del combate.
