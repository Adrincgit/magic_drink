# Revisión 14 — absorción colectiva y balance de voces

16/10/2026. Las brujas terrestres, voladoras y la Cosechera atraen a todos los dulces situados a menos de 620 px horizontales. Hexy puede incorporarse a un ritual ya iniciado sin reiniciar el viaje de los vecinos. Los dulces recién transformados también se incorporan mientras dura el hechizo.

Los impactos reducen la vida de la bruja, pero no cancelan ni reinician la absorción. La pose conserva el recipiente en la posición usada por las trayectorias; el destello señala el daño. Derrotar a la bruja libera a sus víctimas pendientes y suelta a Hexy. Se mantienen las 21 pulsaciones de escape, sin contador visual, y la liberación automática a los 30 segundos. La liberación de una víctima no cancela el viaje de las otras.

Cada vecino consumido pasa a una calabaza distinta: nacen con una separación de 180 ms y se abren hacia ambos lados, a distintas alturas. Destruir una devuelve a su propio vecino. El máximo de calabazas generadas activas es 12, aparte de las escoltas orbitales; se reserva un lugar para Hexy cuando está siendo absorbida. Las víctimas que esperan espacio conservan su identidad, su plazo de liberación y pueden rescatarse derrotando a la bruja. La transformación completa de Hexy produce su calabaza con sombrero y termina la partida como antes.

Hay trayectorias de energía y partículas para cada dulce, incluida Hexy. El brillo del recipiente se calcula una sola vez para evitar superponer seis luces idénticas. Las trayectorias antiguas se descartan al reintentar, aunque se reconstruya una bruja con la misma identidad.

## Audio

Los 14 WAV de criaturas son mono, a 32 kHz. Las voces y los FX espaciales usan el mismo tipo de panoramización estéreo al reproducirse; la diferencia observada corresponde a ganancia y duración de la señal. Se redujo un 40 % la ganancia de las tomas vocales antes del compresor. Las grabaciones y el control «Voces» se conservan. La capa de crujido/fuego al destruir una calabaza mantiene su volumen; su componente vocal queda más bajo.

Medición sobre los buses de producción, con General 70 %, FX 100 % y Voces 60 %:

| Sonido | Cambio RMS frente a revisión 13 |
| --- | ---: |
| Risa de bruja | −4.14 dB |
| Muerte de zombi | −3.91 dB |
| Gemido de zombi | −4.44 dB |
| Muerte de calabaza, mezcla FX + voz | −2.04 dB |
| Llamas, conjuración y disparo básico de Hexy | 0 dB |

No se detectó clipping en los ejemplos renderizados ni en la mezcla de multitud. Esta comprobación mide los archivos y su reproducción; no equivale a una evaluación auditiva humana. Los WAV de comparación están en `audio/`, y los valores exactos en [validation.json](validation.json).

## Verificación

- 83 pruebas: absorción colectiva, incorporación de Hexy, golpes reales no letales y letales, capacidad, propiedad exclusiva entre brujas, rescate, escape, caducidad, reintento, regresiones de combate y Popcorn. [Log](tests.log).
- Navegador real: carga de las 14 grabaciones, lanzamiento por acciones de juego y silencio al pausar.
- Grabación con motor y renderizador de producción: cinco vecinos más Hexy, bruja terrestre y voladora. Reciben un impacto durante el viaje y producen seis calabazas. Vídeo en `tests/artifacts/arcade/group-absorption/group-absorption.webm`; fotogramas decodificados en [decoded-playback.png](decoded-playback.png).
- Reproducción y mediciones regenerables con `node scripts/arcade/review-group-absorption.mjs`.
- `npm run build`: cero errores; resultado en [build.log](build.log).

La regla de absorción ininterrumpida sustituye expresamente las expectativas de interrupción por daño de las revisiones 5 y 11; los nuevos tests comprueban esa regla en el flujo real de impactos.
