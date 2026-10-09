# 1-3: La ribera de los redobles

Implementado el 7 de octubre de 2026. Dirección del usuario: desarrollar el tercer recorrido siguiendo la calidad de los dos primeros, con un minijefe circense propio, sin arlequín, y permitir un enemigo adecuado al lugar. La estructura completa de la campaña sigue pendiente; este trabajo reemplaza la entrada existente de 1-3 sin migrar los guardados.

## Recorrido

Una ribera al anochecer con feria iluminada al otro lado del agua. Tiene 16.680 unidades de longitud: orilla abierta, dos cruces largos, caminos elevados opcionales, un embarcadero de combate de 1.900 unidades y 1.530 unidades finales de acceso al Gran Telón. Tras destruir la barcaza, la cámara acompaña a Hexy por ese último muelle hasta mostrar la entrada de la gran carpa. El 1-4 continúa allí, permite cruzar y conduce a la pista del arlequín. [Conexión entre capítulos](../grand-harlequin/entrance.md). Las tres jaulas incluyen dos rescates sobre muelles altos. Hay dos puntos de retorno y tienda al comienzo.

La revisión de profundidad separa el paisaje en arte independiente: montañas a velocidad de cámara **0,022**, feria y su arboleda a **0,18**, tres pequeñas barcas lejanas a **0,34–0,43**, y escenario jugable a **1**. Un avance de cámara de 200 unidades desplaza las montañas 4,4 px, la feria 36 px y las barcas entre 68 y 86 px. Los reflejos del fondo y de la feria se ondulan; las uniones de la orilla se reflejan en espejo para conservar continuidad. Su elevación depende del canal suave de horizonte, nunca de la compensación vertical del zoom de combate.

Agua cercana, pilares, espuma, faroles, arboledas y barcas junto a los muelles comparten coordenadas del mundo. Las cuatro arboledas están plantadas en tierra, detrás del terreno, con raíces enterradas. No hay franjas borrosas de follaje siguiendo la cámara. Las tablas elevadas prolongan sus propios pilares dibujados hasta el suelo.

Las barcas cercanas llevan amarres hasta los pilares reales del puente, calculados con la misma geometría de su dibujo. Barcas lejanas y barcaza tienen reflejos cortos y estelas suaves en el contacto del casco con el agua. El vaivén de una barca mueve su extremo de la cuerda; el amarre al muelle permanece fijo.

La selección de enemigos contiene payasos caminantes, malabaristas, dos zepelines y cuatro buzos. Se conservan los demás tipos para otros recorridos.

## Payaso buzo

Nuevo enemigo de la ribera, con traje de baño circense, flotador, gafas y aletas. Sus cuatro dibujos son espera, brazo levantado, lanzamiento y caída. Prepara el aro durante 0,7 segundos y lo arroja hacia Hexy a 285 unidades/s (240 en suave), cada 2,8 segundos (3,7 en suave). El proyectil tiene sonido acuático y nace en la mano de lanzamiento. Al derrotarlo cae con su última pose y desaparece en una salpicadura.

## La Barcaza del Redoble

Gran barco de percusión rojo y dorado, con dos payasos, rueda de paletas, maza articulada, tambor, caldera y cañón. Llega desde la derecha durante 4,8 segundos. El tambor y la caldera reciben daño, incluso al preparar y ejecutar ataques; el casco inferior devuelve chispas. Las colisiones de contacto y el blindaje son independientes para que el espacio vacío delante del tambor no bloquee tiros válidos.

El casco también es sólido durante llegada y transformación: desplaza a Hexy hacia la zona de combate sin dañarla durante esas presentaciones. Así no se puede atravesar la máquina con dash para refugiarse detrás. La maza baja hasta el tambor al golpear. El cañón se inclina hacia arriba para el mortero y hacia abajo para bombear agua; boca, proyectiles y dibujo comparten el mismo anclaje, con retroceso hacia popa.

Salud inicial: **320 normal / 220 suave**. Dos fases; transformación al 50%. El tambor pierde su cubierta en fragmentos, cambia el dibujo del cuerpo, se rasgan las telas y se rompe la caldera. Los ataques y gestos se leen sin flechas ni marcas de trayectoria.

| Ataque | Lectura y comportamiento |
| --- | --- |
| Redoble | La maza se levanta; aros dorados salen del tambor hacia alturas bajas y altas. Golpe grave con resonancia metálica. |
| Cañonazo | El cañón se prepara y retrocede; lanza proyectiles parabólicos a la posición anticipada de Hexy. Al caer levantan dos olas cortas. |
| Oleada | El cañón bombea agua visiblemente hacia el piso y desprende una cresta que obliga a saltar. En fase dos se combina con aros altos. |
| Acometida | Exclusiva de fase dos. La rueda acelera 1,65 segundos con sonido de motor antes de avanzar hacia la izquierda y levantar agua. Deja una esquina de escape y después retrocede. |

La segunda fase acelera los aros y las oleadas un 15%, acorta los intervalos entre disparos y añade la acometida. Tras la derrota, el casco se rompe en quince partes, se desprenden rueda y cañón y suenan varios golpes y salpicaduras. La bandera espera 3,25 segundos; también funciona cuando el último golpe es un ultimate en el aire. El reintento restaura la barcaza y retira los escombros.

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

Ocho efectos nuevos en `shared/audio/sounds.js`: preparación, redoble, cañón, agua, motor, rotura, destrucción y lanzamiento del buzo. Comparten compresor, controles de volumen y silencio existentes. La música reutiliza los dos temas propios del tercer prototipo (`canopy.ogg` y `alegre.ogg`); sus nombres de archivo no representan a un arlequín en este encuentro.

## Verificación

`tests/hexy-harbor-barge.spec.js` comprueba recorrido continuo, caminos elevados y rescates, llegada, daño en ataques y blindaje, peligro de los proyectiles, transformación, acometida, muerte física, ultimate letal, reintento, encuadre, alfa del arte y entrada al nivel mediante el menú real en móvil. Registra capturas de los tramos y del combate usando el renderizador real.

Se ejecutan además las pruebas de río/organillo, profundidad, dash/cámara, ultimate, selección de mundos y mezcla de audio. Los sonidos de la ribera se renderizan con `OfflineAudioContext` para comprobar señal audible sin saturación digital, incluidos eventos simultáneos.

`tests/hexy-harbor-parallax.spec.js` verifica la separación entre planos, pilares y espuma inmóviles en coordenadas físicas, ausencia de elevación al cambiar el zoom, continuidad al pasar una unión del fondo, reflejos animados y movimiento reducido estable. También compara las dos fases del jefe: mayor cadencia de redobles y cañonazos, oleadas combinadas con aros altos y ausencia de una tercera fase.

Capturas JPEG, audio de muestra, informes y registros de compilación quedan en `tests/artifacts/arcade/harbor-barge/` y `tests/artifacts/arcade/effects-mix/`, excluidos de Git. La validación técnica y visual no sustituye las partidas del usuario para ajustar dificultad y ritmo.

Pulido adicional: `tests/hexy-harbor-polish.spec.js` reproduce y protege las colisiones de llegada y transformación, comprueba hundimiento frente al rebote terrestre, retroceso del cañón y amarres independientes de cámara. Pasaron los **26 casos** combinados de barcaza, parallax, pulido y río/organillo. Se revisaron nuevamente las capturas del golpe de maza, mortero y segundo puente.

Resultado de esta revisión: compilación Astro completa, 45 casos distintos verificados. La primera pasada combinada dejó un fallo en el controlador de salto de la prueba de rescates (mantenía el planeo demasiado tiempo); se corrigió esa entrada y pasó la prueba aislada, seguida de los 12 casos completos del 1-3. Se inspeccionaron las capturas finales de orilla, muelles, buzo, segunda fase, cañonazo, acometida, destrucción y móvil. No se hizo publicación remota en esta revisión.
