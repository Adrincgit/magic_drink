# Malabarista: ciclo completo de cuerpo y piernas

Esta revisión sustituye la marcha anterior con torso fijo y dos piernas compuestas. El torso tapaba las conexiones de las piernas y dejaba a los zapatos moviéndose bajo un pantalón estático. La corrección usa dibujos completos: los pantalones, rodillas, tobillos y botas pertenecen a la misma pose.

La referencia canónica conserva traje morado, manchas naranjas, piernas cortas, puños de los tobillos, cascabeles y las tres pelotas sujetas al pecho. Una [guía de apoyos](sources/walk-guide.png) distingue qué pierna pasa delante y cuál detrás. Los fotogramas de paso acercan los dos zapatos bajo la cadera; los contactos alternan la pierna adelantada.

Ocho celdas, una sola escala y suelas en y=250. La nariz queda registrada en x=100; su variación vertical es menor de cuatro píxeles de atlas. El ciclo depende de distancia recorrida y conserva las velocidades de patrulla y salida de carpas. Las poses originales de lanzar las tres pelotas, daño y derrota continúan en `juggler-actions.webp`.

Generado con `image_gen` integrado. [Prompt](prompt.txt), [fuente seleccionada](sources/walk.png), [registro](registration.json). Empaquetado: `node scripts/arcade/pack-juggler-v2.mjs`. Recurso activo: `public/arcade/sprites/enemies/juggler-walk-v2.webp`. Las partes antiguas se conservan como historial y ya no se precargan.

`node scripts/arcade/review-juggler-gait.mjs` utiliza el actualizador de enemigos y la misma función de dibujo que el juego. Graba ambos sentidos y una pasada a un cuarto de velocidad; después decodifica el video para revisar apoyos y cruces.

- [Ciclo registrado](review/registered-cycle.png).
- [Hacia la izquierda](review/left-motion.png), [video](review/left.webm).
- [Hacia la derecha](review/right-motion.png), [video](review/right.webm).
- [Cámara lenta](review/slow-motion.png), [video](review/slow.webm).

Las pruebas comprueban la escala común, contacto con el suelo, acercamiento de ambos zapatos en los dos pasos, salida en ambos sentidos, detención en burbuja y conservación de la descarga de tres pelotas. La aceptación estética final corresponde al usuario.
