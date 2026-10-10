# Revisión del barco y aproximación al Gran Telón — 9 de octubre de 2026

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

El recorrido vigente mide 36.000 unidades. La revisión del 10 de octubre reorganiza el bosque frondoso, la transición seca, las ramas transitables y el final carbonizado; retira los payasos decorativos del fondo. Detalles y evidencia en [wildfire.md](wildfire.md#progresión-del-bosque-y-ramas-10-de-octubre).

El 1-4 mide **36.000 unidades**, con siete puntos de control. Empieza llano hasta 3.400, asciende hasta una meseta a 10.600, inicia el descenso después de 14.400 y llega al fondo del bosque incendiado a 21.600. Hay más de 1.100 unidades de desnivel, cinco huecos con brasas y seis árboles en llamas que crujen antes de caer. Los troncos caídos se ajustan a la pendiente y forman superficies transitables. La cámara y el límite de caída siguen la altura local del recorrido.

La quemadura del terreno aumenta suavemente entre 5.000 y 28.000. Los cinco hoyos están en tramos llanos con aproximaciones llanas; no hay huecos en la subida ni en la bajada. Después del descenso, entre 21.900 y 24.700, hay arbustos incendiables, una roca de acceso y seis árboles con tres ramas sólidas cada uno. Se pueden cruzar las ramas inferiores y medias sin doble salto. El tramo posterior lleva al bosque negro en llamas y al fuerte.

El suelo mantiene su escala 2D de mundo. Árboles y arbustos jugables comparten su desplazamiento, con raíces apoyadas en la altura local; los arbustos siguen también la inclinación del suelo. La revisión de escala y mirador reemplaza los panoramas ampliados por bosque distante, reduce los árboles decorativos a 250–294 unidades e integra hierba al inicio. Retira el matorral pegado a cámara. Al subir se abre gradualmente el dosel para revelar el valle incendiado y varias bandadas huyendo hacia la izquierda; al descender vuelve a cerrarse el bosque. Humo a dos profundidades, niebla baja y brasas acompañan el avance. No se dibujan payasos al fondo. El zoom del fuerte se fija al llegar y no cambia con la distancia al núcleo. Los gestos de calor de Hexy siguen siendo cosméticos y ceden a las acciones del jugador. Detalles y evidencia actuales en [vista.md](vista.md).

El escupefuego fue redibujado con colores planos y estilo 2D, acompañado de lanzadores de antorchas y pequeñas máquinas incendiarias operadas por payasos rojos. La revisión de cámara, colisiones de los huecos, reintentos, arte y pruebas se documenta en [wildfire.md](wildfire.md). El ejército quema el bosque para alimentar al Arlequín, que absorbe el fuego para hacerse más fuerte.

Todos los ataques activos de fuego comparten el contacto con arbustos: Dragon Grape, chorros, antorchas, morteros, brasas, ventanas del fuerte y explosiones durante sus cuadros de llama. El fuego de suelo se propaga con demora, sin encender todo el matorral en un solo cuadro. Los arbustos pasan de vegetación a quemadura y restos carbonizados; el fuego de suelo reutiliza la animación pintada del Arlequín. Las llamas duran varios segundos, registran su contacto en el suelo local y causan daño de fuego. La defensa puede contener el chorro mientras tenga magia; no borra toda la emisión al primer contacto. Agua, burbujas, ataques apagados y humo residual no encienden vegetación.

El Bastión ocupa la arena 30.000–32.300. Sus cañones giran hacia un objetivo fijado durante el aviso, retroceden y lanzan bolas grandes con gravedad. Las bolas dejan fuego al impactar. La compuerta lateral se abre antes de que los refuerzos caminen desde su interior; no usan una aparición por transparencia en el campo de batalla.

El núcleo se puede atacar desde el inicio entrando bajo los cañones. Destruirlos es opcional y reduce los ataques, con daño y destello independientes. La fase II comienza al perder la mitad de la vida del núcleo o ambos cañones. El bastión despliega lanzallamas anunciados y salvas parabólicas. Destruir el núcleo termina el combate aunque las armas sigan activas. El casco no causa daño por contacto.

Derrotar el fuerte libera el paso. La entrada terrestre al circo está en 33.700, los bastidores empiezan en 34.000 y la salida está en 35.720. El siguiente capítulo sigue siendo el 1-5 del Arlequín; no se renumeran los identificadores ni se borra el progreso.

[Arte, pruebas y detalles de la revision vigente](wildfire.md).

## 1-5 y partidas guardadas

La batalla existente del Arlequín conserva sus tres fases, fuego, choque de poderes y pista oscura. El 1-5 comienza dentro de la carpa y no incluye tienda ni interacción de compra. La tienda del 1-4 está en el exterior.

Los identificadores internos no se renumeran: el orden es `0, 1, 2, 5, 3, 4`. Las tarjetas muestran `1-1, 1-2, 1-3, 1-4, 1-5, 2-2`. El último escenario continúa siendo el prototipo previo. `campaign: 2` migra el rango de desbloqueo, conserva capítulos completados y no cambia los identificadores de monedas ya cobradas. No se restablece el guardado del usuario.

## Recursos y comprobación

Diez recursos raster generados con la herramienta integrada ImageGen, sin gráficos SVG nuevos: percusionista, operario, buzo en superficie, barco con tripulación, daño de fuego de Hexy, malabarista de fuego, fuerte, panorama, árboles y suelo. [Prompts y fuentes](art.json), [rutas y dimensiones finales](assets.json). `scripts/arcade/pack-ember-revision.mjs` registra y empaqueta las imágenes conservando su transparencia, con separaciones medidas entre cuadros y margen para manos, herramientas y botas.

Pruebas específicas: `tests/hexy-ember-revision.spec.js`, `tests/hexy-circus-arrival.spec.js`, más las regresiones de barcaza, agua, emboscada, menú, combate, economía y reintentos. Capturas y secuencias locales en `tests/artifacts/arcade/ember-revision/` y `tests/artifacts/arcade/barge-upgrade/`.

La revisión inicial del barco y el fuerte pasó **94 pruebas**, incluyendo la destrucción del fuerte con disparos normales y saltos, paso al interior, progresión y reintento. Registros de esa revisión: `tests/artifacts/arcade/revision-validated.log`, `revision-final-visual.log` y `revision-final-build.log`.

La ampliación del bosque pasó **38 pruebas** de entorno, combate, recorrido y progresión, con capturas de las cuatro poses de calor, árboles cayendo, brasas, aves y cámara al avanzar y retroceder. Las pruebas cruzan físicamente los cuatro huecos, salen de sus brasas, reciben/esquivan el tronco y comprueban que el calor no bloquea acciones. `tests/hexy-ember-forest.spec.js` contiene los casos nuevos; los registros y capturas están en `tests/artifacts/arcade/ember-forest*`. El arte adicional se generó con ImageGen integrado; [prompts, fuentes y rutas finales](atmosphere-art.json). El atlas de calor final sustituye las variantes descartadas por el agarre incorrecto de la varita.

El humo definitivo usa cuatro columnas aisladas en una hoja 2×2, con bordes transparentes. Se repitió la prueba visual después de cambiar esa hoja: aprobada. El build final completó con cero errores; `git diff --check` también pasó. Registros: `ember-forest-final-tests.log`, `ember-forest-smoke-review.log` y `ember-forest-build.log` dentro de `tests/artifacts/arcade/`.

El alcance no incluye rediseñar los actos posteriores ni transformar este barco en un vehículo aéreo; los cañones de popa y los desembarcos sustituyen su embestida.
