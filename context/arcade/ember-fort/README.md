# Revisión del barco y aproximación al Gran Telón — 9 de octubre de 2026

> Revisión vigente de la tripulación, maza mecánica, cañones, defensa y puerta principal: [Viento y maquinaria — 12 de octubre](machinery-rework.md). Sustituye las poses del percusionista gigante y la compuerta pequeña descritas más abajo.

Implementación autorizada por el usuario: retirar la embestida injusta, rehacer la tripulación, separar los destellos de daño y llevar la entrada al circo a tierra firme.

## 1-3: barco y enemigos acuáticos

- La barcaza nunca embiste. El casco bloquea el paso sin causar daño por contacto, también durante los ataques. En fase II dispara con dos cañones de popa y desembarca buzos.
- El puente de la arena baja de `y=520` a `y=580`; la flotación del barco permanece en `y=612`. Las otras secciones conservan sus alturas. El núcleo roto incluye los tubos expuestos, alcanzables desde la nueva altura de la varita.
- El percusionista tiene 12 dibujos propios. Manos y maza se dibujan juntos, sin un palo independiente rotando. Las cuatro poses de reparación sustituyen el saludo inmóvil cuando se rompe el tambor.
- El operario tiene 16 poses: revisión de válvulas, bombeo, disparo y reparación. El tanque carga durante 1,6 s, con superficie curva, pulsos de bombeo y amortiguación del nivel visible. Cada pieza aplica su propio destello; el casco y el otro tripulante conservan su color.
- Los buzos saltan desde la popa, caen al agua, se desplazan sumergidos hacia el canal y emergen antes de atacar. Pueden disparar desde la superficie, sumergirse ante disparos cercanos o saltar al puente. El máximo de refuerzos activos es tres, dos en suave.
- Las barquitas llevan un timonel y dos artilleros pequeños. Disparan desde dos posiciones distintas y se hunden con toda la tripulación.
- Bloquear agua produce una salpicadura pintada y seis gotas que caen y dejan espuma. Hexy usa cuatro nuevas poses de daño por fuego con llamas visibles.
- La pintura original del cielo de la ribera y su parallax se conservan. La fachada del circo se retira del muelle.

## 1-4: El bosque de las brasas

La revisión vigente de jugabilidad, Aqua Berry y campamento está en [siege.md](siege.md). El 1-4 termina al destruir el bastión; el acceso a la carpa pasa al 1-5. Se conserva el bosque frondoso, la transición seca, las ramas transitables y el final carbonizado del pulido anterior.

El 1-4 mide **33.200 unidades**, con siete puntos de control. Empieza llano hasta 3.400, asciende hasta una meseta a 10.600, inicia el descenso después de 14.400 y llega al fondo del bosque incendiado a 21.600. Hay más de 1.100 unidades de desnivel, cinco huecos con brasas y seis árboles en llamas que crujen antes de caer. Estos árboles son ahora elementos del fondo: conservan su animación, sin colisión ni daño en el camino. La cámara y el límite de caída siguen la altura local del recorrido.

La quemadura del terreno aumenta suavemente entre 5.000 y 28.000. Los cinco hoyos están en tramos llanos con aproximaciones llanas; no hay huecos en la subida ni en la bajada. Después del descenso, entre 21.900 y 24.700, hay arbustos incendiables, una roca de acceso y seis árboles con tres ramas sólidas cada uno. Se pueden cruzar las ramas inferiores y medias sin doble salto. El tramo posterior lleva al bosque negro en llamas y al fuerte.

El suelo mantiene su escala 2D de mundo. Árboles y arbustos jugables comparten su desplazamiento, con raíces apoyadas en la altura local; los arbustos siguen también la inclinación del suelo. Los panoramas distantes y la hierba inicial conservan su escala. El pulido posterior separa árboles altos en dos planos, agrupa matas sobre las raíces y mantiene despejado el camino. Al subir, los últimos troncos ocultan la unión espacial con el valle incendiado, sin fundido de paisajes completos; conejos, zorros y bandadas huyen hacia la izquierda. Al descender vuelve a cerrarse el bosque. El recorrido usa el MP3 nivel 1-4 entregado por el usuario. Humo a dos profundidades, niebla baja y brasas acompañan el avance. No se dibujan payasos al fondo. El zoom del fuerte se fija al llegar y no cambia con la distancia al núcleo. Los gestos de calor de Hexy siguen siendo cosméticos y ceden a las acciones del jugador. Detalles y evidencia actuales en [depth.md](depth.md); la revisión anterior se conserva en [vista.md](vista.md).

El escupefuego fue redibujado con colores planos y estilo 2D, acompañado de lanzadores de antorchas y pequeñas máquinas incendiarias operadas por payasos rojos. La revisión de cámara, colisiones de los huecos, reintentos, arte y pruebas se documenta en [wildfire.md](wildfire.md). El ejército quema el bosque para alimentar al Arlequín, que absorbe el fuego para hacerse más fuerte.

Todos los ataques activos de fuego comparten el contacto con arbustos: Dragon Grape, chorros, antorchas, morteros, brasas, ventanas del fuerte y explosiones durante sus cuadros de llama. El fuego de suelo se propaga con demora, sin encender todo el matorral en un solo cuadro. Los arbustos pasan de vegetación a quemadura y restos carbonizados; el fuego de suelo reutiliza la animación pintada del Arlequín. Las llamas duran varios segundos, registran su contacto en el suelo local y causan daño de fuego. La defensa puede contener el chorro mientras tenga magia; no borra toda la emisión al primer contacto. Agua, burbujas, ataques apagados y humo residual no encienden vegetación.

El Bastión ocupa la arena 30.000–32.900 y su dibujo crece un 60% en el mundo. Sus cañones giran hacia un objetivo fijado durante el aviso, retroceden y lanzan bolas grandes con gravedad. Las bolas dejan fuego al impactar. La compuerta lateral se abre antes de que los refuerzos caminen desde su interior.

Primero se rompe el muro exterior, después la compuerta del reactor y finalmente el núcleo expuesto. La compuerta dispara la segunda fase al abrirse. Los cañones y las ventanas se pueden destruir por separado y siguen siendo opcionales. El reactor conserva su volumen hasta ser destruido; sus barreras bloquean el paso sin causar daño por contacto.

Al destruir el núcleo se reproducen cuatro cuadros de derrumbe; Hexy planta la bandera, sale de escena y completa el 1-4. El siguiente capítulo sigue siendo el 1-5 del Arlequín; no se renumeran los identificadores ni se borra el progreso.

[Arte, pruebas y detalles de la revision vigente](wildfire.md).

## 1-5 y partidas guardadas

Revisión más reciente del exterior: [profundidad del campamento, escuadras y carpa principal](camp-depth.md). Sustituye el recorrido inicial de seis patrullas y una sola capa de fondo por ocho carpas y 19 enemigos, con varias capas independientes de paisaje y humo.

La batalla existente del Arlequín conserva sus tres fases, fuego, choque de poderes y pista oscura. El 1-5 comienza en un campamento corto de carpas sobre bosque consumido, sin incendios activos. La carpa principal tiene acceso lateral: entrar produce el fundido y fija un punto de reintento en los bastidores. Una caja anterior muestra y entrega el Corazón vital, que restaura toda la vida. No hay tienda dentro de la carpa.

Los identificadores internos no se renumeran: el orden es `0, 1, 2, 5, 3, 4`. Las tarjetas muestran `1-1, 1-2, 1-3, 1-4, 1-5, 2-2`. El último escenario continúa siendo el prototipo previo. `campaign: 2` migra el rango de desbloqueo, conserva capítulos completados y no cambia los identificadores de monedas ya cobradas. No se restablece el guardado del usuario.

## Recursos y comprobación

Diez recursos raster generados con la herramienta integrada ImageGen, sin gráficos SVG nuevos: percusionista, operario, buzo en superficie, barco con tripulación, daño de fuego de Hexy, malabarista de fuego, fuerte, panorama, árboles y suelo. [Prompts y fuentes](art.json), [rutas y dimensiones finales](assets.json). `scripts/arcade/pack-ember-revision.mjs` registra y empaqueta las imágenes conservando su transparencia, con separaciones medidas entre cuadros y margen para manos, herramientas y botas.

Pruebas específicas: `tests/hexy-ember-revision.spec.js`, `tests/hexy-circus-arrival.spec.js`, más las regresiones de barcaza, agua, emboscada, menú, combate, economía y reintentos. Capturas y secuencias locales en `tests/artifacts/arcade/ember-revision/` y `tests/artifacts/arcade/barge-upgrade/`.

La revisión inicial del barco y el fuerte pasó **94 pruebas**, incluyendo la destrucción del fuerte con disparos normales y saltos, paso al interior, progresión y reintento. Registros de esa revisión: `tests/artifacts/arcade/revision-validated.log`, `revision-final-visual.log` y `revision-final-build.log`.

La ampliación del bosque pasó **38 pruebas** de entorno, combate, recorrido y progresión, con capturas de las cuatro poses de calor, árboles cayendo, brasas, aves y cámara al avanzar y retroceder. Las pruebas cruzan físicamente los cuatro huecos, salen de sus brasas, reciben/esquivan el tronco y comprueban que el calor no bloquea acciones. `tests/hexy-ember-forest.spec.js` contiene los casos nuevos; los registros y capturas están en `tests/artifacts/arcade/ember-forest*`. El arte adicional se generó con ImageGen integrado; [prompts, fuentes y rutas finales](atmosphere-art.json). El atlas de calor final sustituye las variantes descartadas por el agarre incorrecto de la varita.

El humo definitivo usa cuatro columnas aisladas en una hoja 2×2, con bordes transparentes. Se repitió la prueba visual después de cambiar esa hoja: aprobada. El build final completó con cero errores; `git diff --check` también pasó. Registros: `ember-forest-final-tests.log`, `ember-forest-smoke-review.log` y `ember-forest-build.log` dentro de `tests/artifacts/arcade/`.

El alcance no incluye rediseñar los actos posteriores ni transformar este barco en un vehículo aéreo; los cañones de popa y los desembarcos sustituyen su embestida.
