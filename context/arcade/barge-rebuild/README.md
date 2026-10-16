# Barco de presión — revisión 12 octubre 2026

Se reemplaza el barco con operarios incrustados por una pintura individual de 1536 × 1024. El cañón de proa, su pedestal, la tubería curva, el tanque, el tambor y la plataforma de popa pertenecen al mismo dibujo. Se eliminan los dos cañones flotantes de popa. La ráfaga de segunda fase sale del mismo cañón frontal.

## Arte seleccionado

- `public/arcade/sprites/bosses/barge/pressure-barge.webp`: barco intacto sin operarios.
- `public/arcade/sprites/bosses/barge/pressure-damage.webp`: mismas dimensiones y anclajes, membrana y vidrio rotos. Se recorta únicamente la pieza destruida.
- `public/arcade/sprites/enemies/cannon-launcher-painted.webp`: cañón pequeño cargado, anticipación y cañón vacío; nunca incluye al personaje saliendo en el fotograma de disparo.
- `public/arcade/sprites/enemies/red-clown-air.webp`: atlas ORIGINAL del payaso del primer jefe, utilizado también por el payaso que usa el impulsor. Sin estirar su cuerpo.
- `public/arcade/sprites/enemies/acrobat-air-painted.webp`: se corrigen únicamente las dos poses de despegue y ápice con las piernas separadas. Se preservan los otros seis fotogramas.

Generación con la herramienta integrada `image_gen`. Prompts, fuentes y selección en `art-prompts.json` y `blue-prompt.json`. La propuesta `sources/clown.png` fue **rechazada por anatomía deformada** y no se carga en el juego. Las fuentes se conservan para documentar la selección.

Empaquetado: `scripts/arcade/pack-barge-rebuild.mjs` y `scripts/arcade/pack-blue-launch.mjs`. Los intervalos del atlas del cañón se cortan en sus márgenes transparentes reales.

## Comportamiento

- El destello blanco afecta al casco y a las piezas intactas cuando un disparo causa daño.
- El tambor emite presión sonora; el tanque carga agua y la tubería lanza el chorro. Romper cada pieza cancela su ataque, y el núcleo expuesto permite completar el combate.
- El chorro apunta antes de disparar y conserva esa dirección durante la descarga.
- Los refuerzos son los buzos originales del nivel. Salen de la cabina, caminan por la plataforma, saltan al agua y luego se acercan por el canal.
- Al derrotar el barco salen dos buzos, el tanque suelta vapor y las piezas caen al agua. Los fragmentos usan el nuevo dibujo.
- Revisión del 13 de octubre: el cañón pequeño funciona como impulsor. Un payaso rojo que ya camina por el mapa se aproxima, entra, se prepara y sale hacia Hexy. El mismo actor conserva su vida, aterriza en la superficie real y continúa andando. No se crea un proyectil ni otro payaso. El cañón vacío espera a otro peatón.
- La caída comprueba pendientes y plataformas después de cada desplazamiento. Se elige un punto de aterrizaje con suelo y se evita salir por un borde del mapa. La orientación de un cañón cargado sigue a Hexy hasta el lanzamiento.
- Si el cañón se destruye o un hechizo inmoviliza al pasajero, este queda libre; un pasajero derrotado no puede dispararse. Los cañones del recorrido tienen un peatón cercano desde la creación del nivel.

## Validación

Pruebas de emisión única del cañón en ambas direcciones, ráfagas desde la boca de proa, salida y salto de refuerzos, daño real y destello, alcance del chorro, destrucción de piezas, núcleo accesible y victoria.

`tests/hexy-clown-booster.spec.js` comprueba identidad y vida del pasajero, espera del cañón vacío, recorrido completo en seis combinaciones de pendiente/dirección, aterrizaje con pasos de 1/30 s, plataforma elevada al otro lado de un hueco, cambio de orientación, daño durante el vuelo y cancelación al destruir el cañón. Incluye regresión del payaso que salta desde el primer jefe.

Validación del impulsor, 13 de octubre: 25 pruebas aprobadas entre impulsor, barco y tripulación del globo. Comprobación adicional de los ocho cañones del recorrido en ambos sentidos: 16 lanzamientos con aterrizaje, sin atravesar el suelo. Ambas grabaciones se decodificaron y revisaron visualmente. Compilación completa: 0 errores, 0 advertencias y 28 sugerencias; registro en `tests/artifacts/arcade/barge-rebuild/booster-build.log`.

Capturas y grabaciones del render real: `tests/artifacts/arcade/barge-rebuild/`. Incluyen ataques, abordaje, parpadeo, derrota y lanzamiento del payaso hacia izquierda y derecha. Las dos grabaciones del impulsor usan física y dibujos de producción, con una cámara fija de revisión para incluir la entrada, el arco completo y el aterrizaje. Decodificación para revisar fotogramas: `scripts/arcade/review-barge-rebuild.mjs`.

Verificado: suites de reconstrucción y mejoras del barco, regresiones de puerto, salto sobre el chorro y grabación del arlequín azul. Compilación completa: 0 errores, 0 advertencias, 26 sugerencias. Registro en `tests/artifacts/arcade/barge-rebuild/build.log`.

Esta revisión no altera el primer jefe ni los movimientos del enfrentamiento entre Hexy y el Arlequín principal.
