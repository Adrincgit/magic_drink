# 1-3: La ribera de los redobles

Implementado el 7 de octubre de 2026 y revisado el 9 de octubre. **Estado vigente:** la barcaza no embiste ni daña por contacto; sus tripulantes tienen sprites nuevos, cada arma brilla sólo al recibir su propio golpe y la popa desembarca buzos. El nuevo 1-4 lleva el recorrido a tierra y el Arlequín pasa al 1-5. [Revisión actual, recursos y guardados](../ember-fort/README.md).

## Recorrido

Una ribera al anochecer con feria iluminada al otro lado del agua. Tiene 16.680 unidades de longitud: orilla abierta, dos cruces largos, caminos elevados opcionales y un embarcadero de combate de 1.900 unidades. El puente de la arena está a `y=580`. Al vencer se termina el capítulo y se pasa al bosque terrestre del 1-4; la carpa ya no está sobre el río. Las tres jaulas incluyen dos rescates sobre muelles altos. Hay dos puntos de retorno y tienda al comienzo.

La revisión de profundidad separa el paisaje en arte independiente: montañas a velocidad de cámara **0,022**, feria y su arboleda a **0,18**, tres pequeñas barcas lejanas a **0,34–0,43**, y escenario jugable a **1**. Un avance de cámara de 200 unidades desplaza las montañas 4,4 px, la feria 36 px y las barcas entre 68 y 86 px. Los reflejos del fondo y de la feria se ondulan; las uniones de la orilla se reflejan en espejo para conservar continuidad. Su elevación depende del canal suave de horizonte, nunca de la compensación vertical del zoom de combate.

Se restaura la pintura original de `harbor/distant.webp`, con su cielo, luz del atardecer y nubes intactos. Cielo y montañas comparten profundidad **0,022**; la feria conserva **0,18**. Las nubes no tienen deriva independiente ni una imagen superpuesta. El experimento de capas reconstruidas queda inactivo porque alteraba la belleza de la composición original. [Registro del experimento](sky-layers.json).

Agua cercana, pilares, espuma, faroles, arboledas y barcas junto a los muelles comparten coordenadas del mundo. Las cuatro arboledas están plantadas en tierra, detrás del terreno, con raíces enterradas. No hay franjas borrosas de follaje siguiendo la cámara. Las tablas elevadas prolongan sus propios pilares dibujados hasta el suelo.

Las barcas cercanas llevan amarres hasta los pilares reales del puente, calculados con la misma geometría de su dibujo. Barcas lejanas y barcaza tienen reflejos cortos y estelas suaves en el contacto del casco con el agua. El vaivén de una barca mueve su extremo de la cuerda; el amarre al muelle permanece fijo.

La selección contiene payasos caminantes, malabaristas, dos zepelines de paso y enemigos acuáticos. El segundo puente añade una emboscada de siete enemigos en dos tandas: cuatro buzos, dos barcos y un zepelín que patrulla de ida y vuelta. Dos buzos y otros dos barcos recorren el primer puente. La cámara se detiene durante la emboscada y libera el avance al vencerla. [Estados y reglas de reintento](aquatic.md).

## Payaso buzo

Enemigo de la ribera con traje de baño circense, flotador, gafas y aletas. Tiene 24 poses nuevas de natación, salto al puente, pistola de agua y carrera; conserva la caída original. Nada antes de salir al puente y dispara ráfagas de tres chorros desde la pistola, a 315 unidades/s (250 en suave), cada 2,65 segundos (3,5 en suave). Bubble Tape muestra el agua capturada. Al derrotarlo cae al río y desaparece en una salpicadura. [Estados, barcos, arte y comprobaciones](aquatic.md).

## La Barcaza del Redoble

Gran barco de percusión rojo y dorado, con dos payasos, rueda de paletas, tambor, depósito de agua, mortero y cañón de agua independiente. Llega desde la derecha durante 4,8 segundos. El tambor y el depósito reciben daño y destellos localizados, incluso al preparar y ejecutar ataques; el casco inferior devuelve chispas. Las colisiones de contacto y el blindaje son independientes para que el espacio vacío delante del tambor no bloquee tiros válidos. [Revisión actual de maquinaria, tripulación y recorrido](../ember-fort/README.md).

El casco es sólido y nunca causa daño por contacto. Así no se puede atravesar la máquina con dash para refugiarse detrás. Manos, cuerpo y maza comparten cada dibujo del percusionista: anticipación, golpe y recuperación. Cuando se rompe un arma, su operario intenta repararla con varias poses. El mortero conserva su inclinación y retroceso; el chorro sostenido sale de otra boca, operada por el segundo tripulante. El barco aumenta su escala un 10% y su flotación queda separada de la altura del puente.

Salud inicial: **320 normal / 220 suave**. Dos fases; transformación al 50%. El casco inferior cambia a su dibujo dañado, pero los componentes sólo se rompen al recibir daño en su propia zona. El tambor tiene 80 / 55 de resistencia y el tanque 96 / 66. Romperlos elimina respectivamente el redoble y el chorro sostenido; queda un núcleo expuesto atacable. Los ataques y gestos se leen sin flechas ni marcas de trayectoria.

| Ataque | Lectura y comportamiento |
| --- | --- |
| Redoble | La maza se levanta; ondas pintadas de presión salen del tambor hacia alturas bajas y altas. Sonido grave de percusión y reacción sónica de Hexy. |
| Globos de agua | El cañón se prepara y retrocede; lanza globos acuáticos parabólicos a la posición anticipada de Hexy. Al caer revientan en agua y levantan dos olas cortas. |
| Chorro largo | La manguera toma agua del río y el tanque se llena durante 1,6 s. El artillero dispara por una boca independiente una corriente de 1,75 s, que crece hasta 1050 unidades y se puede saltar. |
| Oleada | El cañón bombea agua visiblemente hacia el piso y desprende una cresta que obliga a saltar. En fase dos se combina con presión sónica mientras el tambor siga intacto. |
| Desembarco | Los buzos saltan de la popa al agua, nadan bajo la superficie y emergen para disparar o subir al puente. |
| Cañones de popa | En fase dos, dos bocas distintas alternan globos de agua hacia posiciones anticipadas. El casco permanece en su zona. |

La segunda fase acelera las ondas y las oleadas un 15%, acorta los intervalos entre disparos y activa los cañones de popa. Tras la derrota, la máquina se inclina, los dos tripulantes escapan al agua y el casco se rompe a los 1,55 s; se desprenden rueda y cañón y suenan varios golpes y salpicaduras. El premio y la bandera esperan 4,5 segundos; también funciona cuando el último golpe es un ultimate en el aire. El reintento restaura la barcaza, sus componentes y retira los escombros.

Los fragmentos producen una salpicadura al entrar en el río, pierden velocidad y se hunden, recortados por la superficie. No rebotan sobre el agua. Esta física se aplica exclusivamente a los restos de la barcaza; el organillo conserva sus rebotes en tierra.

La cámara abre el encuadre sin mover el horizonte con el zoom. Abarca la esquina izquierda y la máquina completa. Las animaciones secundarias se cuantizan a 12 cuadros/s y respetan el modo de movimiento reducido.

## Arte y sonido

Arte generado con la herramienta integrada `image_gen`, convertido a WebP e incorporado al proyecto:

- `public/arcade/maps/harbor/`: panorama original de referencia/selección, fondo distante limpio, feria con alfa y reflejos, agua, farol, barca, juncos y arboleda.
- `public/arcade/sprites/bosses/barge/`: casco intacto y dañado, rueda, maza, cubierta de tambor y cañón.
- `public/arcade/sprites/enemies/river-diver.webp`: cuatro celdas de 256 px, mismo tamaño corporal y apoyo de pies.
- `public/arcade/sprites/effects/harbor-effects.webp`: tres filas de cuatro cuadros; cresta de agua, aro dorado y salpicadura.

[prompts.json](prompts.json) conserva los prompts exactos de componentes, panorama, buzo, decorado y efectos; [damaged-prompt.json](damaged-prompt.json), la edición de segunda fase. El brief del casco inicial fue una barcaza circense lateral apuntando a la izquierda, gran tambor frontal, caldera turquesa, chimeneas curvas, dos puestos de tripulación vacíos y hueco de rueda en la popa, sin personajes ni agua y con transparencia; este resumen no es una transcripción literal de su prompt.

[sources.json](sources.json) identifica los originales locales de la generación; [assets.json](assets.json) registra los archivos finales. `node scripts/arcade/pack-harbor-art.mjs` vuelve a empaquetar cuando esos originales están disponibles. Se descarta el primer kit cuya rueda estaba cortada. El empaquetado separa siluetas por alfa y conserva las manos y aletas dentro de cada celda. El juego sólo necesita los WebP del repositorio.

[parallax-prompts.json](parallax-prompts.json) guarda los dos prompts de la revisión de profundidad solicitada después de la primera entrega: fondo sin feria y capa transparente con la orilla circense. Ambos se generaron con `image_gen`; no se despegó el terreno físico para simular parallax.

Ocho efectos nuevos en `shared/audio/sounds.js`: preparación, redoble, cañón, agua, motor, rotura, destrucción y lanzamiento del buzo. Comparten compresor, controles de volumen y silencio existentes. Desde el 9 de octubre de 2026, todo el 1-3 utiliza el MP3 entregado por el usuario en `public/arcade/music/for replace/1-3.mp3`, copiado sin modificar a `public/arcade/music/exploration/harbor.mp3`. Suena en bucle durante el recorrido y la batalla contra la barcaza, sin reiniciarse al activar al jefe. Se conservan las grabaciones anteriores.

## Verificación

`tests/hexy-harbor-barge.spec.js` comprueba recorrido continuo, caminos elevados y rescates, llegada, daño en ataques y blindaje, peligro de los proyectiles, transformación, acometida, muerte física, ultimate letal, reintento, encuadre, alfa del arte y entrada al nivel mediante el menú real en móvil. Registra capturas de los tramos y del combate usando el renderizador real.

Se ejecutan además las pruebas de río/organillo, profundidad, dash/cámara, ultimate, selección de mundos y mezcla de audio. Los sonidos de la ribera se renderizan con `OfflineAudioContext` para comprobar señal audible sin saturación digital, incluidos eventos simultáneos.

`tests/hexy-harbor-parallax.spec.js` verifica la separación entre planos, pilares y espuma inmóviles en coordenadas físicas, ausencia de elevación al cambiar el zoom, continuidad al pasar una unión del fondo, reflejos animados y movimiento reducido estable. También compara las dos fases del jefe: mayor cadencia de redobles y cañonazos, oleadas combinadas con aros altos y ausencia de una tercera fase.

Capturas JPEG, audio de muestra, informes y registros de compilación quedan en `tests/artifacts/arcade/harbor-barge/` y `tests/artifacts/arcade/effects-mix/`, excluidos de Git. La validación técnica y visual no sustituye las partidas del usuario para ajustar dificultad y ritmo.

Pulido adicional: `tests/hexy-harbor-polish.spec.js` reproduce y protege las colisiones de llegada y transformación, comprueba hundimiento frente al rebote terrestre, retroceso del cañón y amarres independientes de cámara. Pasaron los **26 casos** combinados de barcaza, parallax, pulido y río/organillo. Se revisaron nuevamente las capturas del golpe de maza, mortero y segundo puente.

Resultado de esta revisión: compilación Astro completa, 45 casos distintos verificados. La primera pasada combinada dejó un fallo en el controlador de salto de la prueba de rescates (mantenía el planeo demasiado tiempo); se corrigió esa entrada y pasó la prueba aislada, seguida de los 12 casos completos del 1-3. Se inspeccionaron las capturas finales de orilla, muelles, buzo, segunda fase, cañonazo, acometida, destrucción y móvil. No se hizo publicación remota en esta revisión.
