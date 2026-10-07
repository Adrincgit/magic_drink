# Descarga musical y embestida del organillo

Revisión del 6 de octubre de 2026, posterior a [air-enemy-finish](../air-enemy-finish/README.md).

El cuerpo central del jefe 1-2 recibe daño durante toda la preparación y descarga musical, en ambas fases. Antes, la descarga lo dejaba invulnerable hasta sus últimos 0,22 segundos. Las ruedas siguen siendo armadura. La introducción, transformación y embestida conservan sus propias reglas de daño.

Todas las notas y ondas del organillo nacen al 80% de su tamaño anterior y crecen suavemente hasta el 100% durante 0,24 segundos. El tamaño visible y el radio de colisión usan la misma progresión. Los tamaños finales y la cantidad adicional de notas frontales de la segunda fase se conservan.

La onda grave nace en la boca de la trompeta inferior. Esa trompeta se inclina al preparar el lanzamiento y retrocede al disparar; un pequeño efecto de cuatro frames conecta la salida con la onda. El proyectil desciende de manera continua durante sus primeras 160 unidades de recorrido y después avanza sobre el suelo. Antes nacía junto a la rueda, sin una salida visible.

La preparación de la embestida dura un segundo más: 2,3 segundos en modo normal y 2,65 en modo suave. Las ruedas aceleran hasta completar ocho vueltas mientras la máquina sigue casi quieta y emiten más polvo, que permanece en el terreno y se disipa. La velocidad máxima aumenta un 15%: 1.035 unidades por segundo en primera fase, 1.173 en segunda y 747,5 en modo suave.

En segunda fase la máquina ya no se detiene en función de la posición de Hexy: cruza hasta 250 unidades del borde izquierdo de la arena, o 320 en modo suave. Desde su posición habitual recorre unas 1.005 unidades en modo normal. La esquina sigue siendo un refugio, pero el antiguo punto seguro a 210 unidades del borde recibe el impacto. El destino queda fijado al comenzar la preparación y la máquina vuelve a su posición tras frenar.

El cuerpo se comprime e inclina hacia atrás durante la preparación, luego se estira un 9% e inclina hacia delante al alcanzar velocidad. Tres poses alternan para darle una lectura de animación caricaturesca. Las ruedas mantienen su apoyo en el suelo; los orígenes de los proyectiles, vapor y colisiones del cuerpo siguen la misma transformación. El modo de movimiento reducido conserva una pose estable.

El payaso rojo básico se reduce un 15%, incluyendo dibujo, colisión y salida de sus disparos. Su tamaño de dibujo pasa de 148 a 125,8 unidades. Los mismos payasos que salen del globo conservan esa escala desde el asiento hasta el salto y la caminata, evitando un cambio de tamaño al aterrizar.

Las pruebas específicas están en `tests/hexy-organ-momentum.spec.js`: daño real durante preparación y descarga, crecimiento, giro y polvo, velocidad y deformación, refugio izquierdo, origen y descenso de la onda, y escala del payaso. Se prueban las simulaciones a 60, 120 y 240 fps. Las capturas del renderizador real se guardan como JPEG en `tests/artifacts/arcade/organ-momentum/`, excluido de Git.

Validación final: **62 pruebas aprobadas** en Chromium. Incluyen combate, presión del organillo, impacto contra armadura, rescates, río, zepelín, colisiones del payaso y continuidad de la tripulación del globo. `npm run build` completa la comprobación de Astro y genera las cinco páginas. Se revisaron las capturas de preparación, avance, salida y crecimiento de la música, llegada a la esquina izquierda y comparación del payaso con Hexy. Los logs están en `tests/artifacts/arcade/organ-momentum-tests.log` y `organ-momentum-build.log`.
