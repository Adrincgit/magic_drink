# 5-2 · Villa Lumbre: evacuación y noche

Revisión del 15 de octubre de 2026. Implementa los siete puntos de la revisión del pueblo.

## Recorrido y profundidad

- Entrada a Villa Lumbre con arco, faroles, calabazas y letrero. La aproximación crece 1.800 unidades: el pueblo empieza en 7.300 y el recorrido completo mide 23.240. Se conserva la extensión urbana, las tres plazas, los cinco checkpoints, las provisiones y los identificadores de estrellas ya guardados.
- Suelo opaco y transición pintada entre tierra y adoquines. Eliminadas las máscaras de desvanecimiento de la carretera y las casas, el fundido de entrada de la calle y la franja de niebla sobre fachadas.
- Montañas, bosque, pueblo lejano, huertos, tejados, calle posterior, fachadas y cercas cercanas se desplazan a distintas velocidades. La cámara vertical del pueblo permanece en 40: las pendientes cambian dentro del encuadre sin hacer hundirse el horizonte al avanzar o retroceder.
- Cielo pintado de últimas luces con luna; la iluminación alcanza noche completa al 52 % del mapa. El progreso de la noche es irreversible durante el recorrido, también al regresar a un checkpoint.

## Habitantes

106 habitantes, ocho diseños, catorce grupos y cuatro carrozas de evacuación. Las oleadas aumentan de tamaño hacia el pueblo. Las velocidades pasan de 104–137 a 190–224 unidades por segundo. Nuevas carreras de cuerpo entero con apoyos, rodillas recogidas y miradas hacia la salida y hacia atrás; las miradas cambian por intervalos, no a cada fotograma.

Algunos advierten con la palma abierta; otros tropiezan, se apoyan en una rodilla y se levantan. Un vecino cercano se detiene, ofrece la mano y ambos continúan. Si no hay ayuda disponible, el caído se recupera por sí mismo. Las carrozas pasan por detrás de Hexy y no colisionan con ella.

## Brujas y caramelo

- Brujas un 20 % mayores, con cuerpo de colisión ajustado. Se conserva la anticipación de la varita y la dirección queda comprometida al empezar el lanzamiento; se elimina la línea de apuntado.
- Rayo con cuatro celdas pintadas. Algunas brujas vuelan en escoba a distintas alturas y disparan hacia abajo. Al derrotarlas se rompe la escoba, caen con gravedad, aterrizan en el terreno y quedan tumbadas antes de desaparecer. Esta derrota también tiene prioridad sobre la evaporación de Popcorn Panic.
- Un impacto válido contra Hexy quita exactamente un corazón e inicia su transformación. Durante la captura no camina, salta ni dispara. Siete pulsaciones nuevas o cambios de dirección rompen la envoltura; mantener pulsado un botón no cuenta repetidamente. Sigue siendo vulnerable tras la protección habitual del golpe. El escudo puede bloquear el impacto.
- Si pierde el último corazón, la derrota conserva la forma de dulce. El reintento elimina la captura. La derrota normal sigue usando su caída anterior.
- Cada víctima queda asociada a la bruja que la alcanzó. Una bruja herida puede sacar una calabaza, atraer un dulce y recuperar tres puntos de salud. El daño interrumpe esa absorción. Derrotarla libera tanto los dulces visibles como las víctimas ya absorbidas; recuperan su forma y siguen huyendo. Las víctimas nunca quedan atrapadas con una bruja retirada por un checkpoint.
- No se añaden barras de salud de enemigos. Se conserva el HUD de corazones de Hexy.

El campo de paja y su espantapájaros quedan como propuesta para otro nivel; no forman parte de esta revisión.

## Arte y reproducción

Generación mediante **ImageGen integrado**, con las hojas locales anteriores como referencias de identidad y estilo. Fuentes originales en [sources](sources/). Sharp solo recorta, registra, empaqueta y comprime; las poses, efectos y terreno están pintados en las imágenes generadas.

Prompts completos: [habitantes y acciones](prompts.json), [carrera corregida](run-prompts.json), [brujas, hechizo, carroza y cielo](magic-environment-prompts.json), [transición de terreno](road-prompt.json).

Archivos usados por el juego:

- `public/arcade/sprites/enemies/village-run-{adults,children,elders,neighbors}-v4.webp`: carreras.
- `public/arcade/sprites/enemies/village-{adults,children,elders,neighbors}-v4.webp`: advertencia, tropiezo, recuperación y ayuda. Se conservan las transformaciones anteriores para cada identidad.
- `public/arcade/sprites/enemies/village-witch-flight-v4.webp`: vuelo, disparo, rotura, caída y absorción.
- `public/arcade/sprites/enemies/village-candy-spell-v4.webp`: rayo y transformación de Hexy.
- `public/arcade/maps/village/village-journey-v4.webp`: entrada, letrero, muro cercano, tejados y carroza.
- `public/arcade/maps/village/night-sky-v4.webp` y `road-entry-v4.webp`.

Empaquetador reproducible: `node scripts/arcade/pack-village-v4.mjs`. Coordenadas y archivos finales en [registration.json](registration.json). El juego no depende de rutas de la carpeta personal de generación.

## Verificación

Resultado final: **40 pruebas pertinentes aprobadas**, once escenas grabadas y decodificadas, y compilación con **0 errores / `[build] Complete!`**. Resumen verificable en [validation.json](validation.json). Las medidas de render de esta máquina están entre 3,0 y 9,3 ms en el percentil 95 durante la grabación final; no equivalen a una medición de rendimiento en móviles.

- Modelos: `hexy-village-night.spec.js`, `hexy-village.spec.js`, `hexy-popcorn.spec.js` y `hexy-town-cannon.spec.js`. Captura real, barrido del proyectil rápido, escudo, escape, derrota normal/final, reintento, dueño de víctimas, interrupción de absorción, rescate tras daño real, vuelo, caída, ayuda y progresión nocturna.
- Selector real: Arcade → Elegir capítulo → **5-2 · El pueblo de los dulces** → Práctica. Inicio y simulación comprobados con teclado.
- `hexy-village-night-browser.spec.js` graba once escenas con el motor y renderizador de producción. Incluye entrada y reversa, calle, ocho habitantes, ayuda, carroza, ataque aéreo, escoba rota, absorción, rescate, captura con escape y último corazón.
- `node scripts/arcade/review-village-night.mjs` decodifica los vídeos y crea fotogramas completos y hojas de contacto; la revisión visual no se limita a los resultados de los tests.
- Evidencias: `tests/artifacts/arcade/village-night/`; registros de pruebas y compilación en esta carpeta. `npm run build` es la comprobación final obligatoria.

Las escenas aisladas de revisión eliminan otros enemigos y provisiones para mostrar cada animación. Los casos de captura y último corazón usan daño real, sin invulnerabilidad. Las pruebas de control usan las mismas entradas lógicas del teclado/palanca; no se ha probado un mando físico durante esta revisión.
