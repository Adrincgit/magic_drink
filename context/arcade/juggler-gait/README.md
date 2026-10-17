# Marcha del malabarista: continuidad de las piernas

**Revisión vigente:** [ciclo completo de cuerpo y piernas, revisión 2](revision-2/README.md). La composición de torso y piernas descrita a continuación se conserva como historial; fue sustituida tras la nueva observación del usuario.

La revisión fotograma por fotograma confirmó el problema señalado por el usuario. Tener doce imágenes diferentes no bastaba: la primera y la séptima repetían el mismo patrón de pierna adelantada, y las poses intermedias volvieron a levantar principalmente el mismo zapato. Los cambios de volumen y de manchas del pantalón hacían perder la identidad de cada pierna. El empaquetado anterior alineaba cada celda por su punto más bajo; la altura del cuerpo variaba entre y=40 y y=47 según el contorno de los zapatos. Las pruebas anteriores contaban poses y comprobaban desplazamiento, pero no verificaban la continuidad anatómica.

La evidencia anterior está en [before-feet.png](before-feet.png). El atlas rechazado `juggler-walk-fluid.webp` y su fuente se conservan como referencia, pero ya no se cargan en el juego.

## Cambio aplicado

Se generaron partes pintadas con la herramienta integrada `image_gen`: un cuerpo sujetando las tres pelotas y doce dibujos de una pierna flexionándose durante un ciclo completo. El renderer conserva dos instancias de esa pierna con un desfase de medio ciclo. Dibuja siempre la lejana detrás y la cercana delante; nunca decide qué pierna es cuál por su posición horizontal. La pierna lejana lleva una sombra suave para distinguir su profundidad. Las uniones se ocultan bajo los pantalones.

Las primeras seis poses sostienen el peso mientras el zapato avanza hacia atrás respecto al cuerpo. Las siguientes flexionan la rodilla y devuelven ese mismo zapato al próximo apoyo. Un breve doble apoyo evita que ambos pies se despeguen a la vez. El cuerpo tiene una oscilación pequeña de tres píxeles de amplitud total, independiente del contorno de los zapatos.

La distancia entre apoyos determina el ciclo: 41.25 píxeles de mundo por vuelta completa con el tamaño habitual de 160. La velocidad de patrulla sigue siendo 36 píxeles/s y la salida de las carpas sigue siendo 55 píxeles/s. El desplazamiento entre dibujos compensa el avance del personaje: el pie de apoyo permanece en el mismo lugar del mundo. Las poses originales de lanzar pelotas, recibir daño y ser derrotado siguen en `juggler-actions.webp`.

## Archivos

- `public/arcade/sprites/enemies/juggler-leg-cycle.webp`: doce celdas pintadas de pierna y zapato, 1024 × 768.
- `public/arcade/sprites/enemies/juggler-walk-torso.webp`: cuerpo registrado, 256 × 256.
- `src/components/arcade/adventure/actors/enemies/adventureJugglerWalk.js`: fases, apoyos y registro de desplazamiento.
- `src/components/arcade/adventure/render/jugglerWalkCanvas.js`: composición y oclusión constante de las piernas.
- [prompts.json](prompts.json): prompts finales y herramienta utilizada. Referencia, guía y originales seleccionados en `sources/`.
- `node scripts/arcade/pack-juggler-parts.mjs`: recorte, escala y empaquetado técnico de los dibujos generados; registro en [registration.json](registration.json).

## Verificación

Las 16 pruebas de `tests/hexy-tent-motion.spec.js` aprobaron. Cuatro nuevas pruebas comprueban que los pies de apoyo permanecen en el mismo punto del mundo, tanto en patrulla como al salir y en ambos sentidos, y que siempre hay al menos un pie apoyado. También se conserva la descarga de tres pelotas y la inmovilización en burbujas.

Se comprobó además el registro de los píxeles pintados: la variación del cascabel de la punta respecto al tobillo durante las seis poses de apoyo es de 1.00 píxel de mundo al tamaño del juego. Esta pequeña variación proviene de los dibujos; la trayectoria del apoyo no tiene deriva acumulada.

`node scripts/arcade/review-juggler-gait.mjs` graba la actualización y el renderer reales sobre una cuadrícula de revisión, en ambos sentidos y a un cuarto de velocidad. Se decodificaron e inspeccionaron las grabaciones, además de los doce fotogramas registrados. Esta revisión verifica apoyos, cruces, oclusión y el retorno al inicio del ciclo; la aceptación estética final corresponde al usuario.

Evidencia en `tests/artifacts/arcade/juggler-gait/`: `left.webm`, `right.webm`, `slow.webm`, los montajes `*-motion.png`, las trazas y `registered-cycle.png`. Las cuatro escenas completas de carpas se regeneraron en `tests/artifacts/arcade/tent-motion/` y se decodificaron con `review-tent-motion.mjs`.

Compilación `npm run build` completada: 0 errores, 0 advertencias de Astro y 28 sugerencias. Registro en `tests/artifacts/arcade/juggler-gait/build.log`.
