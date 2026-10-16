# Bastión, Aqua Berry y campamento — 10 de octubre de 2026

Se conserva la composición del bosque aprobada en `3e3cd5c`. La revisión cambia el cruce injusto, el final del 1-4 y el acceso del 1-5.

## Cruces y agua

Los seis árboles animados pasan al plano de fondo de profundidad 0,72, con raíces fijas detrás de la ruta y llamas más visibles. No crean troncos sólidos ni causan daño. Cada hueco tiene aproximación y aterrizaje libres; los cañoneros se separan al menos 900 unidades antes y 1.000 después del hueco. Se retiran encuentros duplicados y arbustos incendiables de sus bordes.

**Aqua Berry**, sabor 5, usa una lata turquesa con ajolote, bayas y estrella, dibujada a partir de las bebidas existentes. Tiene 84 disparos normales y una Marea de bayas fuerte que consume cinco disparos y la magia habitual. La ráfaga normal describe una curva suave; la fuerte es más ancha y atraviesa varios fuegos. Ambas tienen cuadros pintados de agua, salpicadura y vapor, además de sonidos propios.

Cada impacto normal aporta una unidad de agua, el fuerte cuatro. Una antorcha pequeña necesita una unidad; un mortero grande tres; los arbustos tres; el fuego de suelo cuatro; un chorro cinco y las brasas de un hueco ocho. El tamaño del proyectil modifica la dosis cuando está mejorado. Una misma ráfaga no puede contar varias veces sobre el mismo incendio. Los arbustos apagados quedan carbonizados y el suelo mojado evita una reignición inmediata durante siete segundos. Apagar un proyectil evita que explote después.

El 1-4 tiene una caja de Aqua Berry garantizada y señalada al comienzo. Su botín aleatorio, cajas y puestos no entregan Dragon Grape. Elegirla en la tienda sigue permitido; no se borra una bebida que el jugador ya traía equipada.

## Final del 1-4

Fortaleza a escala 1,6, con cañones, ventanas, artilleros y blancos registrados sobre la fachada. El encuadre permanece fijo durante combate y derrumbe. El muro exterior bloquea el paso y protege la compuerta; la compuerta protege el núcleo. Los ataques especiales tampoco saltan esas condiciones. Las ventanas y los cañones siguen siendo objetivos opcionales.

El muro tiene cuatro dibujos de daño y rotura. La compuerta usa sus cuadros de apertura existentes; al abrir se activa el segundo patrón de combate. La fortaleza tiene cuatro nuevos cuadros de destrucción con un mismo apoyo en el suelo. Tras 4,4 segundos, Hexy planta la bandera y abandona el encuadre: el nivel termina ahí. Se retira el antiguo viaje posterior al interior de la carpa.

## Inicio del 1-5

Un recorrido de unas 5.160 unidades atraviesa un campamento sobre ceniza, con panorama frío, troncos consumidos y carpas próximas arraigadas al suelo. Sus seis enemigos patrullan cerca de sus propias carpas; no hay tropas incendiarias. Tiene tres jaulas, cinco tesoros y dos puntos de control.

La gran carpa tiene un extremo de entrada a la izquierda y su lateral se extiende hacia la derecha. Antes de entrar, una caja muestra **Corazón vital**, que llena todos los corazones. La entrada oscurece la pantalla, sitúa a Hexy en los bastidores existentes y guarda allí el punto de reintento. Se conservan las fases del Arlequín y la ausencia de tienda interior.

## Arte y revisión

Arte generado con la herramienta integrada `image_gen.imagegen`. Prompts exactos, referencias y rutas de originales: [siege-prompts.json](siege-prompts.json). Empaquetado reproducible: `scripts/arcade/pack-siege-art.mjs`. Los recursos finales están en `public/arcade/sprites/{pickups,effects,props,bosses/ember-fort}` y `public/arcade/maps/circus/camp-panorama.webp`.

Las pruebas específicas están en `tests/hexy-siege-water.spec.js` y `tests/hexy-siege-motion.spec.js`. Verifican agua acumulada, inmunidad temporal del suelo mojado, botín, bebida de tienda, los cinco cruces con enemigos reales y sin pérdida de vida, bloqueo de barreras, derrota por fases, curación, patrullas y transición/reintento del campamento. La prueba de `hexy-ember-revision.spec.js` vence al fuerte con sus vidas completas usando disparos ordinarios.

Las capturas y la grabación de 41,8 segundos a 1.440 × 810 están en `tests/artifacts/siege/`. El vídeo usa teclado para agua, cruce y todo el campamento con enemigos activos; la última pasada entró a la carpa con cinco corazones. Solo la sección de derrumbe reduce la vida de las piezas para acortar esa demostración; la prueba de combate usa valores completos. Esta revisión visual y funcional no sustituye la valoración del usuario sobre el equilibrio final.

Registros: `regression.log`, `final-playthrough.log` y `build.log`, dentro de esa carpeta. La regresión principal verificó 47 casos de combate, Arlequín, cámara, arte y entradas, además de la pasada anterior de terreno y propagación del fuego. La pasada final de nueve casos específicos, incluyendo vídeo y patrullas, terminó correctamente. La compilación terminó sin errores; Astro señaló 24 avisos informativos preexistentes.
