# Revisión del bosque y el Bastión — 9 de octubre de 2026

Registro de revisiones de animaciones, terreno, Bubble Tape y fortaleza. La sección **Reconstrucción 2D estable**, al final, sustituye las descripciones anteriores de perspectiva, parallax cercano y ejército. El recorrido conserva 36.000 unidades; el núcleo es accesible directamente por petición del usuario.

El 1-4 mide **36.000 unidades**, con siete puntos de control. Empieza llano hasta 3.400, asciende hasta una meseta a 10.600, inicia el descenso después de 14.400 y llega al fondo del bosque incendiado a 21.600. Hay más de 1.100 unidades de desnivel, cinco huecos con brasas y seis árboles en llamas que crujen antes de caer. Los troncos caídos se ajustan a la pendiente y forman superficies transitables. La cámara y el límite de caída siguen la altura local del recorrido.

La quemadura del terreno aumenta suavemente entre 4.200 y 20.000. El panorama conserva la pintura original; árboles sanos y carbonizados se mezclan durante el trayecto. El bosque usa una única superficie horizontal en perspectiva; árboles y arbustos comparten su proyección y el mismo zoom. El humo usa tres profundidades, las aves huyen desde anclajes del escenario y las brasas suben con viento local. El fondo del incendio suma llamas animadas entre los árboles. Los gestos de calor de Hexy siguen siendo cosméticos y ceden a las acciones del jugador.

El **escupefuego** usa dibujos planos de caricatura 2D. Un atlas adicional aporta ocho cuadros de caminar y ocho de derrota; el ciclo avanza con la distancia recorrida, 64 unidades por ciclo. Conserva inhalación de 1,15 s, soplido de 1,65 s y recuperación de 0,85 s. El fuego tiene cuatro dibujos de arranque y doce de flujo a escala fija, alcanza 320 unidades y se apaga cuando el enemigo muere o queda atrapado. Escupefuego, antorchero e incendiario de globos tienen 5,06 HP, exactamente un 10% más que el rojo básico (4,6).

La tropa del nivel usa el payaso rojo básico, el escupefuego, el lanzador de antorchas, la pequeña máquina incendiaria y el incendiario suspendido de globos. El lanzador tiene dieciséis poses de acción y derrota más ocho de caminar, anuncia durante 0,95 s y arroja una antorcha giratoria con gravedad. La máquina tiene ocho poses, mueve la palanca durante un aviso de 1,3 s y dispara dos bolas parabólicas; resiste varios disparos normales, sin vida de minijefe. Ambos ataques dejan fuego al caer y explotan al bloquearlos. Los puestos también generan únicamente payasos rojos o de fuego.

Contexto del usuario: el ejército incendia el bosque porque el Arlequín absorbe esas llamas y se fortalece. El subtítulo de entrada presenta este motivo.

La llamarada y las bolas de fuego incendian arbustos situados en su alcance. Los arbustos pasan de vegetación a quemadura y restos carbonizados; el fuego de suelo reutiliza la animación pintada del Arlequín. Las llamas duran varios segundos, registran su contacto en el suelo local y causan daño de fuego. La defensa puede contener el chorro mientras tenga magia; no borra toda la emisión al primer contacto.

El Bastión ocupa la arena 30.000–32.300. Sus cañones giran hacia un objetivo fijado durante el aviso, retroceden y lanzan bolas grandes con gravedad. Las bolas dejan fuego al impactar. La compuerta lateral se abre antes de que los refuerzos caminen desde su interior; no usan una aparición por transparencia en el campo de batalla.

El núcleo es alcanzable desde el principio. Hexy puede entrar bajo las plataformas y dispararle horizontalmente; destruirlo termina el combate aunque los cañones sigan intactos. Estos siguen siendo objetivos opcionales con daño y destello independientes. Al perder la mitad de la vida del núcleo o ambos cañones, el horno entra en fase II tras 2,3 s de transformación. Dos lanzallamas laterales se anuncian durante 1,65 s y mantienen chorros de 380 unidades durante 1,8 s. Los cañones muestran calor en su boca, sin cartas de fuego superpuestas. El casco no causa daño por contacto; solo el mamparo posterior limita el paso.

Derrotar el fuerte libera el paso. La entrada terrestre al circo está en 33.700, los bastidores empiezan en 34.000 y la salida está en 35.720. El siguiente capítulo sigue siendo el 1-5 del Arlequín; no se renumeran los identificadores ni se borra el progreso.

## Arte y comprobación

Arte generado con **ImageGen integrado**, conservando transparencia y registrado mediante `scripts/arcade/pack-wildfire.mjs`. Los prompts, referencias, fuentes y rutas finales están en [wildfire-art.json](wildfire-art.json). El atlas de acciones usa separadores verticales medidos para no arrastrar el pelo de la fila vecina.

- `public/arcade/sprites/enemies/fire-breather.webp`: poses del escupefuego.
- `public/arcade/sprites/enemies/fire-breather-walk.webp`: ciclo de caminar.
- `public/arcade/sprites/effects/ember-flames.webp`: llamarada y bola de fuego.
- `public/arcade/maps/ember-trail/bushes.webp`: cuatro estados del arbusto.
- `public/arcade/sprites/bosses/ember-fort/mechanisms.webp`: corazón y compuerta.

`tests/hexy-wildfire.spec.js` recorre físicamente las pendientes y los huecos, comprueba ignición y extinción, origen de la llamarada, trayectoria balística, salida de refuerzos y segunda fase. Las regresiones comprueban además destrucción con disparos normales, calor, caídas, reintento, combate, menús y transición al 1-5. Capturas y secuencias: `tests/artifacts/arcade/wildfire/`. Registro final: `tests/artifacts/arcade/wildfire-final-tests.log`; compilación: `wildfire-final-build.log`.

La revisión anterior aprobó 45 pruebas, pero no cubría la caída caminando en todos los huecos. Por eso no detectó el salto de cámara: al buscar un suelo sólido dentro de un hueco, la altura caía al valor por defecto de 480, aunque la meseta estuviese a -520.

## Corrección de caídas y revisión de la tropa

La cámara consulta el recorrido continuo y limita su velocidad vertical; el pequeño seguimiento hacia el fondo del hoyo no desplaza las capas lejanas. Los laterales de los cinco huecos son sólidos y solo se cruzan al superar el borde con los pies. El fuego que cae dentro usa la altura de las brasas. Al reintentar, cámara y fondo se colocan en el punto de control y se despejan sus 220 unidades inmediatas para evitar reaparecer encima de un enemigo.

Arte actual: [fire-troops-art.json](fire-troops-art.json), generado con ImageGen integrado y registrado mediante `scripts/arcade/pack-fire-troops.mjs`. El manifiesto incluye los prompts completos, las fuentes y estas salidas transparentes:

- `public/arcade/sprites/enemies/fire-breather-flat.webp`
- `public/arcade/sprites/enemies/torch-clown.webp`
- `public/arcade/sprites/enemies/fire-wagon.webp`
- `public/arcade/sprites/effects/ember-torch.webp`

Validación ampliada: veinte combinaciones de entrada/salida en los cinco hoyos, cámara y colisiones a 30/60/120 FPS simulados, muerte y reintento, ataques en ambas direcciones, defensa y destrucción de máquinas. La prueba de navegador usa teclas para caminar, caer, saltar y volver a suelo firme; además se inspeccionan secuencias renderizadas de cada enemigo. Los combates aislados y el recorrido automático no equivalen a una partida humana completa del nivel.

Registros: `tests/artifacts/arcade/ember-final-tests.log` (75 casos), `ember-safe-retry-tests.log` (revisión final de las 23 pruebas de recuperación), `ember-recovery-build.log`. Evidencia visual y traza de teclado: `tests/artifacts/arcade/ember-recovery/` y `ember-troops/`.

## Revisión de fuego, superficie y ejército

El suelo actual usa una pintura opaca de tierra seca y una superposición carbonizada. Las plataformas elevadas son siluetas completas de roca y troncos; se retiró su recorte rectangular de suelo. Los tres árboles nuevos (roble, abedul y pino), en versiones sanas y quemadas, se empaquetan con margen transparente y comprobación de que ninguna rama cruza su celda. Los seis árboles que caen miden 430–520 unidades, avisan durante 2 s y mantienen las llamas verticales durante su rotación y después de caer.

Entre 22.100 y 24.400 hay una zona densa de arbustos. La ignición produce una llamarada inicial mayor, resplandor y daño al contacto; el primer plano añade arbustos desenfocados. Las explosiones de antorchas y globos miden 388,8 unidades de dibujo (40% menos que 648); las de cañón, 486 (25% menos). Sus primeros cinco cuadros de llama tienen daño de área; el humo posterior no. El cañón móvil conserva su tamaño con un operario pequeño.

Al fondo del tramo devastado avanza una tropa incendiaria animada a dos profundidades. Aumenta la densidad de encuentros cerca del bastión. El enemigo 13 cuelga boca abajo de globos, deriva, anuncia durante 1,3 s y dispara brasas que incendian el suelo.

Bubble Tape conserva la forma apagada de antorchas, brasas y cartas capturadas. Ninguna burbuja atrapa maquinaria, aunque esté potenciada. Las burbujas grandes (escala al menos 1,3) sí pueden capturar munición grande; un chorro continuo, una explosión o fuego de suelo nunca se captura como proyectil.

El audio suma inhalación, ignición, impacto y un rugido sostenido de ruido filtrado según la proximidad del fuego. Comparte volumen/silencio con los efectos, se detiene en pausa y desaparece al apagarse las llamas. `ember-march.wav` es una composición instrumental original local de 53,33 s en bucle; se reproduce en el 1-4. El bastión usa la pista existente `agresivo.ogg`. El 1-5 conserva su música y **no tiene tienda ni interacción de compra**; la tienda exterior del 1-4 permanece disponible.

Arte y reproducción: [inferno-art.json](inferno-art.json), [inferno-props-art.json](inferno-props-art.json), `pack-inferno-revision.mjs`, `pack-inferno-props.mjs` y `compose-ember-march.mjs` en `scripts/arcade/`. Los árboles iniciales `tree-variety-*` fueron descartados por recortes; el juego carga únicamente `tree-clean-*`.

Las pruebas nuevas de `tests/hexy-inferno-polish.spec.js` cubren derrota completa, vida, burbujas contra cuatro tipos de maquinaria, identidad de proyectiles apagados, victoria directa sobre el núcleo con disparos normales, lanzallamas, globos incendiarios y audio. Evidencia visual: `tests/artifacts/arcade/inferno-polish/`. Registros de la revisión: `inferno-final-validation.log` y `inferno-final-build.log` en `tests/artifacts/arcade/`. Se complementan con las pruebas físicas y de teclado de los cinco huecos; no equivalen a una partida humana completa de 36.000 unidades.

Registro de la revisión anterior: **89 pruebas aprobadas**, build completo con 0 errores, 0 advertencias y 23 hints preexistentes; `git diff --check` sin errores de espacios. Esa revisión no detectó el deslizamiento durante el zoom ni los problemas de anclaje que después reportó el usuario.

## Anclaje, cámara y ventanas (9 de octubre)

El suelo ahora usa las pinturas `floor-fine-0/1.webp` y una sola proyección continua. Se eliminaron los planos de suelo superpuestos. Árboles más grandes y arbustos se registran por la posición real de sus raíces, enterradas hasta el extremo inferior de su huella en pendientes. Las franjas de pintura se solapan para evitar líneas de rasterización; en los cinco huecos cubren también el descenso hacia las brasas. La cámara conserva la línea del suelo al entrar y salir del zoom del fuerte. Los arbustos del primer plano tienen posiciones fijas en el mundo.

La tropa lejana marcha hacia la izquierda y se detiene al atacar. El malabarista conserva sus ocho poses de caminata y recibe dieciséis de preparación, lanzamiento, recuperación y derrota, registradas a la misma escala anatómica. La llamarada del escupefuego alinea la punta de cada cuadro con la boca. El payaso globo tiene ocho poses de derrota: revienta los globos, cae, aterriza, queda aturdido y desaparece gradualmente.

Las cuatro ventanas del fuerte se abren, muestran un payaso y anticipan un disparo de fuego. Cada una tiene 22 puntos de resistencia y puede destruirse por separado; queda dañada y deja de disparar permanentemente. Los cañones siguen siendo opcionales para acceder al núcleo.

Arte generado con ImageGen integrado y empaquetado mediante `scripts/arcade/pack-grounding-art.mjs`: [prompts completos, referencias, fuentes y salidas](grounding-art.json). Evidencia del movimiento, apertura real desde el menú, pendientes, arbustos, ventanas y derrota en `tests/artifacts/arcade/forest-grounding/`; incluye `forest-motion.webm`, `motion-trace.json` y comparativa `torch-scale.jpg`. Las verificaciones cubren tramos representativos y combates aislados, no una partida humana completa de 36.000 unidades.

Validación de esta revisión: **109 casos distintos aprobados** entre la regresión de 107 y los dos nuevos casos de rasterización. Tras los últimos cambios de pintura se repitieron las 19 pruebas de anclaje y bosque; todas pasaron. También pasaron las 23 pruebas de recuperación de caídas. Registros: `grounding-final-tests.log`, `grounding-last-check.log` y `grounding-render-final.log` en `tests/artifacts/arcade/`. La última medición del render del bosque fue 5,26 ms por cuadro en el escenario de prueba local; no es una garantía de FPS para otros equipos. `grounding-build-final.log`: build completo, cero errores, cero advertencias y 25 hints. `git diff --check` pasó.

## Reconstrucción 2D estable

El usuario rechazó la revisión anterior por mareo, objetos que subían y bajaban, suelo deformado y sombreado excesivo en los payasos de las ventanas. Las verificaciones anteriores comprobaban las fórmulas de aquella proyección; no demostraban que su movimiento fuese adecuado.

Se retiró el suelo por filas de perspectiva. La pintura ahora tiene una escala fija de mundo y sigue cada pendiente con una transformación 2D constante. El frente y el fondo del camino recorren exactamente la misma distancia de pantalla. La transición de tierra sana a carbonizada se pinta en mosaicos fijos con degradado horizontal continuo, independiente de la cámara. Las depresiones usan una ilustración con borde irregular y las llamas se apoyan en la altura real de su fondo.

Los árboles cercanos y arbustos comparten la transformación del terreno. Su altura se calcula en su propia posición de mundo, incluyendo el extremo descendente de sus raíces; mover la cámara ya no cambia el punto de terreno consultado. Se retiraron los árboles adicionales con profundidad independiente, los arbustos rápidos desenfocados y los pequeños árboles del fondo de los hoyos. Una franja de matorral y rocas, sana o quemada, enlaza el borde posterior del camino con el panorama sin dejar hojas verdes superpuestas en el tramo carbonizado.

El panorama mantiene su altura durante pendientes, saltos y combate. Conserva desplazamiento horizontal lento, humo tenue, aves y pocas brasas. El ejército lejano se anima sobre cuatro repisas de la propia pintura, avanza hacia la izquierda y se detiene para quemar; no consulta el terreno jugable ni usa el zoom de combate. La fortaleza abre el encuadre una vez hasta 0,5 y lo mantiene al caminar hacia el núcleo o retirarse. El seguimiento vertical de las caídas se limita a 20 unidades.

Las ocho poses de las ventanas fueron redibujadas con contornos claros, colores planos y sombra mínima. Arte de esta revisión: [prompts completos, referencias, fuentes y salidas](stable-forest-art.json); empaquetado reproducible en `scripts/arcade/pack-stable-forest-art.mjs`. Se conservan los 36.000 de recorrido, las colisiones, los ataques y las reglas de Bubble Tape.

Validación de esta revisión: **72 casos distintos aprobados**: 23 de recuperación de los cinco hoyos y 49 de bosque, cámara, tropa, burbujas, fuego, núcleo y ventanas. Una aserción nueva de igualdad exacta falló por redondeo de 0,0000000000001; se corrigió a una tolerancia de siete decimales y pasó. Las nuevas comprobaciones verifican la altura de raíces en coordenadas de mundo, el zoom constante durante el combate y la traslación real de píxeles en tres filas distintas del suelo.

El navegador recorrió con teclado la apertura, subida, bajada, zona incendiada y aproximación/retirada del fuerte, incluyendo saltos e inversión de dirección. Se grabó a velocidad normal y se revisaron imágenes de la reproducción secuencial. Esta evidencia cubre tramos representativos y combate aislado; no es una partida humana completa ni demuestra por sí sola comodidad subjetiva. Evidencia: `tests/artifacts/arcade/stable-forest/`, con `stable-forest-motion.webm`, `motion-review.jpg`, `motion-trace.json`, `first-tests.log` y `final-tests.log`. `build.log`: compilación completa, 0 errores, 0 advertencias y 24 hints. `git diff --check` pasó.

El ajuste final colocó los cuatro grupos del ejército sobre las repisas visibles, en lugar de las paredes del risco, y mejoró el muestreo de sus dibujos pequeños. Se repitieron las cinco pruebas de estabilidad, incluida la grabación con teclado, y la compilación: aprobadas. Evidencia final adicional: `last-render-check.log` y `army-final.jpg` en la misma carpeta.

## Progresión del bosque y ramas (10 de octubre)

Esta revisión sustituye el panorama y elimina por completo el ejército decorativo descrito arriba. El recorrido empieza dentro de un bosque frondoso de robles y pinos. La transición seca y carbonizada avanza entre 5.000 y 28.000; dos panoramas nuevos, sano y quemado, mantienen el mismo encuadre. La vegetación del borde une el suelo y el fondo. Humo a dos profundidades, niebla baja y fuego lejano animado aumentan hacia el bosque negro. El primer plano añade una franja de matorral suavemente desenfocada, con las raíces recortadas por debajo de la pantalla; su parallax es horizontal y no cambia con la altura ni el zoom.

Los cinco hoyos se trasladaron a 11.600, 13.700, 25.100, 27.500 y 29.200, siempre con aproximaciones llanas. Se conserva el terreno 2D de escala fija: no hay agujeros en las pendientes. Los arbustos pequeños siguen la inclinación local para evitar que sus bordes queden suspendidos.

Tras terminar el descenso a 21.600, la zona 21.900–24.700 contiene matorral incendiable y seis árboles transitables, precedidos por una roca de acceso. Cada árbol tiene tres ramas; las superficies de colisión y las estrellas usan las coordenadas medidas en la ilustración. Las ramas inferiores y medias forman una ruta completa comprobada sin doble salto. Los enemigos incendiarios del tramo encienden la vegetación y su fuego daña al tocarlo.

Los árboles que caen empiezan en el tramo seco. Usan dieciséis dibujos: grieta, flexión, caída, impacto, fragmentos y asentamiento. Cada pose se registra por la raíz; el tronco ya no se representa girando un único dibujo. La detección de golpes sigue la progresión angular de las poses y el tronco asentado se apoya en la pendiente. Se mantienen el aviso sonoro, la quemadura y la superficie transitable del tronco caído.

Arte: [prompts, referencias y salidas](forest-progression-art.json). Empaquetado: `scripts/arcade/pack-forest-progression.mjs`. Los cuatro recursos finales están en `public/arcade/maps/ember-trail/`: `canopy-healthy.webp`, `canopy-burned.webp`, `branch-tree.webp`, `falling-tree-frames.webp`.

Validación: **73 casos distintos aprobados** (68 de regresión y cinco nuevos), compilación completa con cero errores, cero advertencias y 24 hints existentes; `git diff --check` sin errores. Incluye recuperación de los cinco hoyos desde ambos lados, recorrido físico completo, ramas sin doble salto, ignición real de varios arbustos por los enemigos del mapa, daño de fuego, reglas de Bubble Tape, núcleo y ventanas del fuerte.

Evidencia en `tests/artifacts/arcade/forest-progression/`: grabación de 49,7 segundos `forest-progression-motion.webm`, cuadros decodificados en `motion-review.jpg`, capturas de aterrizaje en ramas y del incendio entre arbustos, `motion-trace.json`, `motion-tests.log`, `ambush-test.log`, `regression.log` y `build.log`. La prueba de navegador usa teclado en apertura, pendientes, ramas, combate y aproximación/retirada del fuerte. También pasó la entrada desde el menú real. Son tramos representativos y verificaciones de mecánicas, no una partida humana completa ni una certificación de comodidad subjetiva.
