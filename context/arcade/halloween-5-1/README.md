# 2-1: El sendero de las risas

Numeración vigente desde el **16/10/2026**: primer nivel del acto 2, Halloween. Antes se mostró como 5-1. La carpeta y los recursos conservan su ruta histórica; el ID de guardado sigue siendo 6. Véase la [campaña aprobada](../CAMPANA.md).

Revisión del 13 de octubre de 2026. La temática sigue siendo **creaciones y alucinaciones peligrosas de la arlequín de dos conos**; el ejército de marionetas queda para después. Se mantiene el anime cartoon con ambiente spooky, sin gore. La referencia retro influye en la actuación y el ambiente; no obliga a usar ojos de caricatura antigua. La inspiración de recorrido solicitada es el área de zombis de Metal Slug.

## Recorrido y profundidad

- **21 440 píxeles**, un 20% menos que la revisión anterior de 26 800. Bosque de cenizas primero, cementerio desde x=4400 y arena del minijefe al final.
- Colinas, hondonadas, un descenso de 145 píxeles con caída real y cuatro grupos de árboles con rutas por arriba o por el suelo. Hay 36 ramas que ceden tras 1.25 segundos desde la primera pisada, con temblor y caída pintada; ocho salientes permanentes permiten descansar. Las ramas se restauran al reintentar.
- Panorama lejano, tres planos independientes de árboles, vegetación del recorrido y primer plano. Las velocidades de cámara son 0.10, 0.26, 0.51, 0.78 y 1.12. La tierra reutiliza la textura pintada del comienzo de 1-5; el borde del desnivel tiene una ilustración propia y una unión suavizada.
- La entrada es una **reja oblicua vista de lado**, con poste cercano que oculta parcialmente a Hexy al atravesarla. Los objetos conservan sus proporciones y transparencia. Viento y hojas usan dibujos raster.
- Dos rescates, cinco tesoros y cinco puntos de control. Las ramas superiores añaden estrellas y una alternativa para evitar grupos del suelo.

## Enemigos y huida

- Los payasos normales huyen en grupos, a **330–390 px/s**, por encima de la carrera de Hexy. Usan carrera asustada con manos al frente, miradas atrás y actuación de cuerpo completo. Saltan al subir el desnivel en vez de cambiar de altura de golpe.
- Algunos tropiezan, caen y permanecen expuestos. Si nadie los atrapa se incorporan y continúan. Un zombi cercano provoca caída, nube de forcejeo y transformación durante 3.5 segundos. **Eliminar, atrapar o hacer caer al captor al perder una pierna rescata al fugitivo** durante esa ventana; el mismo actor se convierte si no lo ayudas. El rescate cancela un tropiezo pendiente para que el payaso no vuelva a caer inmediatamente después de levantarse.
- Zombis caminantes y rastreros: **46 HP**, diez veces los 4.6 HP del payaso normal. Aceleran al acercarse; algunos anticipan una mordida y otros se lanzan por el aire. La caminata completa mantiene visibles ambos brazos extendidos.
- Hay variantes con gorro roto y sin gorro. Unas pierden un brazo y dejan un huesito limpio; algunas manos caídas se levantan, persiguen y saltan para golpear. Otras pierden una pierna, caen y continúan arrastrándose. La separación de variantes evita que una extremidad reaparezca al cambiar de animación.
- La derrota tiene caída y disolución visible. **De cada zombi derrotado sale un fantasma**, después de comenzar la caída; aparece una sola vez y tiene un breve tiempo sin contacto dañino.
- Fantasmas más pequeños, sueltos en el aire, sin salir de tumbas. Flotan, anticipan embestidas y recuperan desde su posición real. Ocasionalmente desaparecen, se trasladan detrás de Hexy mientras están ocultos y reaparecen con un aviso y margen de reacción.
- Esqueletos: **23 HP**. Costilla, brazo y cráneo se desprenden según el daño; pueden recoger las piezas y lanzarlas. Los cráneos nuevos tienen cuencas vacías, sin ojos de estilo rubber hose.
- **23 lápidas** de una aparición y **8 criptas** que reponen zombis. Lápida: 18 HP; cripta: 54 HP. Romperlas cancela o detiene las apariciones. Conservan aviso, interior oscuro y borde pintado que pasa delante del personaje al salir. Hay límites de actividad y población por cripta.
- Tras 4.5 segundos quieta, Hexy alterna escalofrío, mano en la frente y mirada inquieta. Se interrumpen al actuar; están habilitadas en la región 5 y posteriores.

## Minijefe y final

**El Campanero Hueco** tiene un rediseño de doce poses y alterna invocación de dos fantasmas, tres campanadas a diferentes alturas y embestida. La invocación muestra primero sus posiciones mediante humo pintado. Hay anticipación y recuperación entre movimientos, y un límite de seis fantasmas para su invocación. Sus campanadas aceleran al quedar por debajo de media vida. Vida: 184 normal, 147.2 suave.

**Al derrotarlo caen los demás enemigos**, se eliminan los proyectiles y se cierran las fuentes de apariciones. Los zombis eliminados por este cierre no generan otra oleada de fantasmas. Tras la animación final se desbloquean el portón y la salida.

Zanquilargo **no es el minijefe y no aparece en 5-1**. Queda como enemigo ordinario de 138 HP, treinta veces la vida normal, reservado para más adelante, posiblemente 5-3.

5-1 conserva ID interno 6. El antiguo prototipo 2-1 permanece como 6-1, ID 4, sin trasladar sus guardados. **Witchy-Witchy Town** es copia idéntica al MP3 indicado por el usuario. El resto del acto sigue en [ACTO_5.md](ACTO_5.md).

## Arte y reproducción

Arte generado con `image_gen`; originales conservados junto a los prompts. El empaquetado con Sharp solo recorta, registra y comprime las imágenes.

1. Arte anterior: [revision/prompts.json](revision/prompts.json), [revision/extra-prompts.json](revision/extra-prompts.json) y `revision/sources/`. Empaquetador: `node scripts/arcade/pack-halloween-revision.mjs`.
2. Esta revisión: [depth-rework/prompts.json](depth-rework/prompts.json), [depth-rework/extra-prompts.json](depth-rework/extra-prompts.json) y `depth-rework/sources/`. Aplicar **después**: `node scripts/arcade/pack-nightmare-depth.mjs`.
3. El segundo empaquetador sustituye caminata zombi y Campanero, y añade caídas, variantes heridas, efectos, cráneos, ocho recortes de paisaje, reja, tronco con ramas y borde del desnivel. Los cortes medidos evitan manos truncadas y fragmentos de la celda vecina. Registro: `depth-rework/registration.json`.

## Verificación

Las pruebas de `tests/hexy-nightmare-depth.spec.js` cubren salto normal a ambas alturas, rotura y restauración de ramas, caída real, huida sobre el desnivel, aceleración y ataques, pérdida de miembros, rescate, fantasma tras derrota, reaparición y cierre del minijefe. Se mantienen las pruebas de travesía, daño, tumbas y actuación de `tests/hexy-graveyard-revision.spec.js`, y la entrada por el selector real y conservación de música/guardados de `tests/hexy-halloween-trail.spec.js`.

Grabaciones del canvas de producción: `tests/artifacts/arcade/nightmare-depth/`. Se decodifican con `node scripts/arcade/review-nightmare-depth.mjs` para revisar movimiento y fotogramas. Las tomas protegen a Hexy para observar ciclos completos: no son una evaluación de dificultad para un jugador. Resultados de esta pasada en `depth-rework/tests.log`, `depth-rework/review.log` y `depth-rework/build.log`.

Para probar: `/arcade` → **Elegir capítulo** → **5-1** → **Practicar**. Recargar la página para cargar las hojas nuevas.

### Resultado de la pasada final

- Suite completa: **33 pruebas aprobadas** (`depth-rework/tests.log`).
- Después del ajuste final de rescate: **13 pruebas aprobadas**, incluida una nueva grabación del rescate (`depth-rework/rescue-check.log`), y **28 pruebas de modelo aprobadas** de ambas revisiones (`depth-rework/final-model-check.log`).
- Ocho escenas decodificadas y revisadas: bosque y huida, reja y desnivel, ramas, contagio, rescate, combate, fantasma y Campanero. La toma final del rescate muestra al fugitivo retomando la carrera y saliendo por el lado izquierdo, mientras el fantasma del captor sigue activo. Se verificaron invocaciones, ataques, derrota del Campanero y despeje de la arena.
- `npm run build`: compilación completada. Astro: 0 errores, 0 advertencias y 29 sugerencias; Vite mantiene el aviso de tamaño de algunos paquetes. Registro en `depth-rework/build.log`.

Estas comprobaciones verifican comportamiento, integración y actuación visible; el ajuste de dificultad y ritmo todavía puede refinarse con una partida del usuario.
