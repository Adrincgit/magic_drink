# Electrocución: energía llena sobre las poses de impacto

Revisión del 16/10/2026. Sustituye el aro hueco de `aura-v1.webp`, rechazado por mostrar el escenario dentro de la energía.

La energía azul tiene el interior opaco. Se registra a la celda exacta que dibuja cada enemigo, incluida su orientación, tamaño, desplazamiento y temblor. Los espacios entre brazos y piernas también se rellenan. El renderer conserva el dibujo del personaje delante y enciende y apaga la masa eléctrica; no sustituye al enemigo por un esqueleto.

El acróbata, malabarista y demás actores con una celda Hit registrada la mantienen durante la reacción eléctrica completa, aunque su destello normal ya haya terminado. El payaso rojo conserva sus cuatro celdas elementales. Los actores sin una celda Hit específica conservan su propio dibujo. La absorción de las brujas mantiene su animación y no se cancela al recibir electricidad. La ralentización y las derrotas carbonizadas siguen funcionando.

## Arte y reproducción

- Generación: herramienta integrada `image_gen`, sin CLI/API alternativos.
- [Prompt exacto](prompt.txt), [fuente elegida](source.png), [registro del atlas](registration.json).
- Atlas activo: `public/arcade/sprites/feedback/electric-fill-v2.webp`, cuatro celdas de 256 × 256. El atlas anterior queda fuera del cargador del juego.
- Empaquetado: `node scripts/arcade/pack-electric-fill.mjs`.
- Registro a cada pose: `render/electricPoseSprite.js`. La masa se calcula una vez por dibujo y pulso y se guarda en caché. El centro se rellena con alfa 255; únicamente el borde exterior conserva suavizado.
- En efectos reducidos, la masa permanece estable y se reduce la luz difusa; el interior continúa opaco.

## Comprobación

`node scripts/arcade/review-electric-filled.mjs` captura el renderer real y graba el combate con Volt. Las grabaciones se decodifican para revisar la pose y el parpadeo en ambos sentidos.

- Izquierda: [encendido](left-on.png), [apagado](left-off.png), [fotogramas decodificados](left-playback.png), [grabación](left.webm).
- Derecha: [encendido](right-on.png), [apagado](right-off.png), [fotogramas decodificados](right-playback.png), [grabación](right.webm).
- [Errores de ejecución](errors.json): ninguno.
- `tests/hexy-electric-filled.spec.js`: comprueba en navegador los 16 tipos admitidos, cuatro pulsos por pose y los huecos reales entre extremidades. El relleno debe tener alfa 255 en toda la anchura interior de cada fila del personaje. También verifica la secuencia encendido/apagado/encendido.
- [Pruebas dirigidas](tests-final.log): 48 aprobadas, incluidas regresiones de combate, Volt III, derrotas, absorción, planeo y escudo. [Comprobación ampliada de los 16 tipos](tests-coverage.log).
- [Compilación](build.log).

Estas comprobaciones prueban la cobertura, sincronización y ejecución. La aceptación del estilo visual corresponde al usuario.
