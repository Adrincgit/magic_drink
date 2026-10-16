# Carpas y salida del malabarista — 13 octubre 2026

Las carpas del primer recorrido se dibujaban con la hoja estática del puesto. La llamada tampoco recibía el atlas necesario para animar su bandera. El malabarista salía usando sus dos poses de estar parado. En el campamento, se estiraba una muestra diminuta del interior original sobre un rectángulo que sobresalía por debajo de la tela.

## Cambio

- `outpost-wind-painted.webp`: tres dibujos frontales de viento por estado de cortina, con tela, borlas y bandera roja animadas. Se retiran las poses ladeadas de la fuente 3 y 7; las celdas de retorno reutilizan 1 y 5. `render/outpostCanvas.js` recorre 0–1–2–1 y 4–5–6–5. La apertura intermedia, los daños y el derrumbe conservan sus estados pintados anteriores.
- La marcha actual usa `juggler-leg-cycle.webp` y `juggler-walk-torso.webp`, con continuidad fija de las dos piernas y registro de apoyos. El ciclo anterior `juggler-walk-fluid.webp` se conserva como referencia rechazada y ya no se carga en el juego. El ciclo actual cubre 41.25 píxeles, conservando las velocidades de patrulla y salida. Detalles y análisis en [juggler-gait/README.md](../juggler-gait/README.md).
- Durante la salida, los pies de los peatones siguen la superficie real del terreno; también se elimina la elevación artificial de 12 píxeles de las salidas del campamento sobre rutas de suelo.
- `camp-wind-interior.webp`: los cuatro dibujos de carpa abierta contienen su interior oscuro. El relleno sigue los bordes de las cortinas y termina en el umbral. Se elimina del renderer el recorte estirado usado como fondo. El exterior del atlas mantiene transparencia y la fila cerrada conserva su composición.

## Arte

Generado con la habilidad imagegen y la herramienta integrada, usando como referencias las carpas y el malabarista del proyecto. Prompts y referencias en `art-prompts.json`; fuentes seleccionadas en `sources/`. Los nombres de salida son nuevos y las hojas anteriores se conservan.

Empaquetado de carpas: `node scripts/arcade/pack-tent-motion.mjs`. Marcha actual del malabarista: `node scripts/arcade/pack-juggler-parts.mjs`, con originales, guía, prompts y registro en `context/arcade/juggler-gait/`. El atlas del campamento conserva exactamente sus celdas de 512 × 384. Su RGB en zonas transparentes puede parecer marrón en algunos visores; la transparencia se verifica mediante alfa y composición real en Canvas.

## Evidencia

`tests/hexy-tent-motion.spec.js` comprueba cambios de tela y bandera sin las poses ladeadas, conservación de estados de daño, doce poses al salir en ambos sentidos en pradera y campamento, apoyo en pendientes, inmovilización y la descarga original de tres pelotas. La revisión posterior añade cuatro pruebas de pies apoyados sin desplazamiento respecto al mundo. La prueba de composición coloca las cuatro carpas abiertas sobre un color claro: exige oscuridad dentro y fondo intacto en las esquinas y por debajo del umbral.

Grabaciones y capturas: `tests/artifacts/arcade/tent-motion/`. Son dibujos y física de producción, con una cámara fija de revisión y Hexy protegida para mostrar el recorrido. `node scripts/arcade/review-tent-motion.mjs` decodifica las cuatro grabaciones. Se inspeccionaron los montajes y la composición del interior sobre fondo claro.

Validación: 22 comprobaciones de carpas, campamento y encuentros, más 29 regresiones de carrera azul, impulsor y tripulación del primer jefe, aprobadas. La primera pasada visual encontró el servidor local detenido; las dos pruebas visuales se repitieron después de restablecerlo y aprobaron. Compilación completa: 0 errores, 0 advertencias y 28 sugerencias. Regresiones en `regressions.log`; compilación en `build.log` dentro de la carpeta de evidencia.

Corrección posterior de las poses ladeadas y marcha: las 12 pruebas actuales de `hexy-tent-motion.spec.js` aprueban. Las cuatro grabaciones se regeneraron y sus fotogramas se inspeccionaron. La compilación vuelve a terminar con 0 errores, 0 advertencias y 28 sugerencias; registro en `frontal-fluid-build.log`.
