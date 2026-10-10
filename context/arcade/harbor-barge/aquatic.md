# Revisión acuática de 1-3 — 9 de octubre de 2026

Solicitud del usuario: que el río participe en el combate, ampliar las animaciones del payaso buzo, poder hundir barquitos disparando hacia abajo, sustituir los tambores lanzados por globos de agua y añadir un cañón de chorro y una ola por aceleración. También corregir espuma separada de los pilares, borde verde recto, tubos de banderas móviles y teletransportación de los Bunnies entre alturas.

## Comportamiento vigente

La revisión posterior de [maquinaria, tripulación y reacciones de impacto](upgrade.md) amplía el jefe: depósito y tambor destructibles, manguera conectada al río, cañón independiente, ondas sónicas pintadas y derrota con evacuación. Sus reglas sustituyen las descripciones anteriores de aros dorados, rotura automática de equipo o premio inmediato.

- El buzo nada debajo del puente con seis poses. Cuando Hexy se aproxima a menos de 570 unidades, nada 1,65 segundos y salta físicamente hasta las tablas. Usa seis poses de salto/aterrizaje, seis de pistola de agua y seis de carrera: **24 dibujos nuevos**, además de la caída anterior. La ráfaga lleva tres disparos separados por 0,14 s; velocidad 315 normal / 250 suave, intervalo 2,65 / 3,5 s. Puede recibir daño y ser atrapado mientras nada, salta o dispara. Una derrota acaba en salpicadura.
- Cuatro barcos hostiles recorren los dos puentes largos: dos comienzan en 3440 y 3900, y dos llegan durante la emboscada del segundo puente. Navegan a 82 / 60 unidades por segundo dentro del tramo. Sus payasos disparan dos chorros pequeños dirigidos hacia arriba cada 2,25 / 3,2 s. El casco tiene 9,2 de vida, permite apuntado descendente real de Hexy y se hunde durante 2,3 s al romperse. La superficie del agua recorta el hundimiento y el reintento los restaura.
- La emboscada se activa en x=7360 y encierra el combate entre 7160 y 8280, con cámara fija tras una transición breve. Primera tanda: lancha y dos buzos. Segunda: dos buzos, otra lancha y zepelín. Sólo derrotar a todos libera el paso; los tiempos de llegada también cuentan como enemigos pendientes. El zepelín patrulla a 150 / 120 unidades por segundo, gira dibujo y boca del cañón, dispara bolas rojas y permanece hasta ser derrotado. El HUD muestra oleada, restantes y la indicación para disparar hacia abajo. El ultimate pausa las llegadas; reintentar antes del puente reinicia la emboscada y un checkpoint posterior la conserva superada.
- El mortero de la barcaza lanza **globos grandes de agua**, con cuatro dibujos de deformación y nudo reconocible. Su impacto es una salpicadura grande que desprende dos olas cortas. El tambor permanece como parte del barco y del ataque de redoble; su cubierta ya no se usa como proyectil de mortero.
- El cañón prepara la presión durante 1,3 s y dispara un **chorro continuo** durante 1,75 s, que avanza hasta 1050 / 820 unidades. El contacto sigue la altura real de la corriente inclinada. Se puede saltar; desaparece al terminar el ataque o morir el jefe. No se encierra todo el chorro sostenido en una burbuja.
- La acometida de fase II genera una ola de 178 unidades. La cresta acelera con la barcaza y permanece delante de la proa; no queda atravesando el casco al aumentar la velocidad.
- Bubble Tape conserva el arte acuático de los disparos y globos capturados. Los impactos del buzo y los barcos usan agua, sin la explosión genérica de confeti.

## Posiciones y animación compartida

La cámara del recorrido coloca el piso a 385 de las 540 unidades de pantalla para mostrar barcos y agua bajo los puentes. El encuadre del jefe conserva su apertura habitual. Cada pilar queda en el centro transparente del arco circular de espuma, medido en los cuatro cuadros. La mitad posterior se pinta detrás del soporte y la anterior delante. Se conservan las ondas pintadas existentes y se retiran los arcos geométricos añadidos.

El agua cercana usa coordenadas del mundo, compartidas con los pilares. La textura pintada conserva pequeñas ondulaciones temporales y se funde gradualmente con los reflejos lejanos; mover la cámara no la desplaza respecto al puente. El paisaje lejano mantiene su profundidad independiente. En el fondo se elimina la superposición de dos reflejos luminosos con velocidades diferentes: una zona azul de la pintura original y los reflejos de la feria comparten profundidad y ondulación. El río del 1-2 conserva su renderizador.

Tras la revisión visual del usuario se restaura `harbor/distant.webp` como pintura completa del cielo y las montañas, conservando su luz, colores y nubes originales. Comparten profundidad 0,022 y la feria mantiene 0,18; las nubes no derivan por separado. Se mantienen el canal suave de elevación, la escala independiente del zoom de combate y las correcciones del agua. Los orbes ambientales del 1-3 siguen desactivados.

El experimento `clear-sky.webp`, `mountains.webp` y `clouds.webp` queda inactivo y ya no se descarga en el juego. Se conservan sus archivos y [registro de generación](sky-layers.json) para trazabilidad. `hexy-harbor-sky.spec.js` compara el cielo dibujado con los píxeles de la pintura original al inicio, puente y final, con tiempo avanzado y movimiento reducido. Capturas e informes: `tests/artifacts/arcade/harbor-sky/`.

Los veleros decorativos amarrados bajo los puentes se retiran a petición del usuario. Permanecen los cuatro barcos enemigos navegables y los pequeños barcos del paisaje lejano. El borde irregular de la orilla se eleva hasta el plano de contacto físico (inset 0,12), para apoyar personajes, ruedas y objetos sobre la vegetación. Los postes de los muelles elevados se dibujan antes de la orilla y se prolongan bajo ella: la tierra y la hierba ocultan sus extremos enterrados.

Corrección tras la revisión del usuario: buzo un 25% más pequeño y conjunto de payaso/barco un 20% menor, con colisiones y boca del arma a la misma escala. Barcos y nadadores se dibujan delante de los apoyos del puente, sin pilares atravesando su cuerpo. El ciclo de caminata se detiene al disparar y se retoma desde la misma posición; se elimina el salto de más de 120 unidades entre cuadros al acabar una ráfaga. La colisión del nadador se alinea con la parte visible sobre el agua y las burbujas respetan la escala menor.

Al nadar y correr, la orientación sigue el desplazamiento real del buzo, incluso cuando Hexy queda al otro lado; cada inversión del recorrido gira el sprite. Al saltar o disparar vuelve a orientar su ataque hacia Hexy. Durante toda la ráfaga permanece quieto.

`harbor/ground-v2.webp` sustituye el fondo plano verde de la orilla por una silueta irregular con transparencia. El archivo anterior de bosque se conserva para los demás escenarios.

Las banderas dibujan siempre tubo, base y estrella superior del primer cuadro. Sólo la tela a la derecha de la coordenada 82/256 cambia de cuadro. La corrección se aplica a todos los puntos de retorno y banderas de victoria.

Los Bunnies siguen el historial breve de posición y plataforma real de Hexy. Respetan muelles elevados, pendientes y plataformas móviles; sus desplazamientos tienen límites por segundo al saltar, caer o cambiar de dirección. Dibujo y disparos consultan la misma posición del compañero. El reintento descarta el historial anterior.

Los Bunnies sólo preparan un disparo si hay un enemigo vivo, un puesto activo o un objetivo vulnerable del jefe dentro de pantalla y de las 520 unidades de alcance en la dirección apuntada. Vuelven a comprobar el objetivo al soltar la estrella; cancelan si desapareció. Se conserva la cadencia y el aumento de apoyo al rescatar más compañeros.

Las monedas de valor 10 conservan su dibujo y brillo suave, sin estrellas geométricas orbitando. Al recogerlas emiten `treasureCoin`, un arpegio de campanas con cola más larga, distinto de `coin`; respeta mezcla, silencio y pago único. Los globos de agua y el lanzamiento de olas registran la base pintada de la salpicadura sobre las tablas, medida por separado en los cuatro cuadros. El globo también deja una mancha húmeda temporal al nivel del suelo.

## Arte reproducible

Generación con la herramienta integrada `image_gen`, usando el buzo y los efectos acuáticos anteriores como referencias de identidad y estilo. Los cuatro resultados finales viven en el repositorio:

- `public/arcade/sprites/enemies/river-diver-aquatic.webp`: 1536×1024, 6×4 celdas de 256.
- `public/arcade/sprites/enemies/river-boat-actions.webp`: 1536×256, seis cuadros de remo, apuntado, disparo, retroceso y hundimiento.
- `public/arcade/sprites/effects/harbor-aquatic.webp`: 1024×1024, globos, disparos, corriente y gran ola, cuatro dibujos por fila.
- `public/arcade/maps/harbor/ground-v2.webp`: 2172×724, orilla con alfa superior.

La revisión del agua añade, también mediante `image_gen` integrado:

- `public/arcade/sprites/effects/harbor-jet.webp`: 1536×1120, cinco corrientes completas en filas de 224 píxeles, registradas en la boca del cañón. Sustituye las piezas repetidas con cortes rectangulares. Durante el crecimiento se revela el tramo próximo a la boca, evitando comprimir todo el dibujo en un chorro minúsculo.
- `public/arcade/sprites/effects/harbor-water-details.webp`: 1024×1024, cuatro secuencias de gotas, salpicadura, suelo mojado y neblina. La preparación sube gotas individuales desde el río hacia la bomba. Las olas dejan espuma húmeda que se desvanece y gotas con gravedad, que salpican al alcanzar el río. El chorro desprende gotas y rocío.

[water-sources.json](water-sources.json) registra los prompts exactos, las rutas de generación y el método. El atlas final tiene cinco filas aunque el primer prompt solicitó seis; el empaquetador respeta las cinco realmente generadas. `node scripts/arcade/pack-harbor-water.mjs` alinea y empaqueta estos dos WebP a partir de los originales. No se sustituyen los sprites anteriores.

[aquatic-prompts.json](aquatic-prompts.json) contiene los prompts exactos. [aquatic-sources.json](aquatic-sources.json) registra las rutas de los originales de `image_gen`; [aquatic-assets.json](aquatic-assets.json), el inventario final. `node scripts/arcade/pack-harbor-aquatic.mjs` extrae y normaliza los dibujos por alfa cuando están disponibles los originales. El juego sólo descarga los WebP del proyecto.

El sonido original `bargeJet` combina agua, presión grave y pulsaciones; no utiliza audio externo. Se mantienen los controles y la mezcla del juego.

## Verificación

`tests/hexy-harbor-aquatic.spec.js` reproduce barcos que disparan hacia arriba y se hunden al recibir ataques descendentes reales, captura de agua, chorro continuo dañino y saltable, ola delante de la proa, Bunnies sin saltos de posición sobre muelles y estabilidad del tubo de la bandera. Comprueba alfa y dimensiones, dibuja el recorrido y jefe reales y guarda una grabación del encuentro. Se revisan capturas y cuadros del video en `tests/artifacts/arcade/harbor-aquatic/` (excluidos de Git).

Las pruebas existentes de barcaza se actualizan a la natación y los globos. Se comprueban también parallax, colisiones del casco, pendientes, compañeros, controles, rescates, organillo, movilidad/ultimate y la conexión con 1-4. Las verificaciones técnicas no sustituyen la partida del usuario para ajustar cadencia y dificultad.

Resultado: **81 casos distintos aprobados** entre recorrido, combates, controles, renderizado y mezcla de audio. La primera pasada detectó expectativas antiguas de aro/tambor, rutas previas al circo y victoria inmediata del arlequín; se actualizaron las pruebas a los comportamientos vigentes. La prueba de premio inmediato usa ahora la barcaza y verifica además que un jefe dormido no reciba daño. Compilación Astro completa con cero errores, cero advertencias y 22 avisos informativos existentes. Se inspeccionaron capturas del río, espuma, buzo, barcos, captura de agua, ataques del jefe y Bunnies en muelle, despegue y aterrizaje, además de cuadros de la grabación. Cambios locales; no se publicó esta revisión.

La corrección anterior de escala y movimiento aprobó 37 pruebas, pero su comparación del agua lejana no detectaba el deslizamiento respecto al puente. La revisión actual sustituye esa comprobación por una comparación de los mismos píxeles del mundo al desplazar la cámara: diferencia cero; 5577 píxeles cambian al avanzar el tiempo y ninguno con movimiento reducido. Los pilares ocultan cero píxeles opacos del barco activo. Se añaden pruebas del hueco transparente del arco, separación entre casco y pilares, continuidad de los cinco fotogramas del chorro y ciclo de caída/salpicadura/desaparición de las gotas.

Verificación actual: **49 pruebas aprobadas** de agua, revisión acuática, barcaza, parallax, pulido, río del 1-2 y llegada al circo. Capturas del contacto con la orilla, cuatro fases de espuma, carga del cañón, chorro y olas húmedas en `tests/artifacts/arcade/harbor-water/`; grabación del recorrido en `tests/artifacts/arcade/harbor-aquatic/`. Compilación Astro completa sin errores. Cambios locales, sin publicación.

Revisión posterior del cielo, reflejos y detalles: **83 casos distintos aprobados** entre combate, movilidad, agua, detalle acuático, mezcla de audio, barcaza y entrada al circo. La comparación de reflejos tras mover la cámara 200 unidades da una diferencia media inferior a 0,001 niveles RGB al compensar su profundidad compartida. El cielo inicial coincide con la pintura original; más de 91000 píxeles del cielo cambian al avanzar 12 segundos. Los cuatro cuadros de espuma terminan a un píxel del contacto con el puente. La tierra bajo los postes es idéntica al render sin postes, confirmando que sus extremos quedan enterrados. Capturas e informes: `tests/artifacts/arcade/harbor-detail/`. Sonido de muestra: `tests/artifacts/arcade/effects-mix/treasure-coin.wav`.

Revisión de emboscada y selector: **64 casos distintos aprobados** entre emboscada, recorrido, barcaza, agua, detalle, controles, rescates y zepelines. Compilación Astro completa, cero errores. `hexy-harbor-ambush.spec.js` verifica bloqueo y liberación, siete derrotas mediante colisiones reales de proyectiles, reintentos, pausa durante ultimate, giro del buzo, disparos del zepelín en ambos sentidos y selector a 1440/390 px. Se ajustan pruebas antiguas que suponían suelo horizontal, paso sin combate o un origen del ultimate separado de la varita. El selector usa marcos iguales, estados escritos y ambos signos de interrogación con el mismo dibujo tipográfico; en móvil las tarjetas se deslizan horizontalmente. Capturas y grabación en `tests/artifacts/arcade/harbor-ambush/`: la grabación de revisión activa invulnerabilidad y elimina la primera tanda mediante proyectiles para observar también la segunda; no representa una victoria del jugador. Cambios locales, sin publicación.
