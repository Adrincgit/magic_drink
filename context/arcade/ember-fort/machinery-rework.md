# Viento del duelo y maquinaria de los jefes — 12 de octubre de 2026

Revisión solicitada después de recuperar la sonrisa original del Arlequín. La actuación de los personajes y la pose heroica inicial de Hexy se conservan. Los aros decorativos dejan de cargarse: se reemplazan por un degradado transparente, trazos abiertos y partículas que viajan detrás de cada retrato. Los efectos reducidos detienen ese desplazamiento.

## Barcaza 1-3

El percusionista gigante se sustituye por un operario pequeño de manivela. Un cable pasa por una polea fija y eleva una maza mecánica; su caída coincide con la emisión del golpe sónico. Se reutilizan los dibujos originales de la maza, rueda y operario. El segundo operario se sitúa sobre la cubierta, junto al tanque, separado del puente. Ambos mantienen animación de trabajo y reparación; sus escapes parten de sus posiciones actuales.

El mortero y los cañones de popa emiten una ráfaga de vapor al disparar. Continúan los globos de agua, el chorro, la presión sónica, el desembarco y la destrucción por piezas. El barco no embiste ni causa daño por contacto.

## Bastión 1-4

La defensa exterior es una barricada de tablones, contrafuertes metálicos y tela rasgada, con estados de daño, rotura y escombros. Su volumen visible se acompaña de una colisión más ancha y el mismo recorrido de daño: defensa, compuerta del reactor, núcleo. Los cañones siguen siendo opcionales.

Cada cañón tiene una base fija y un tubo que pivota desde el soporte trasero. La solución balística calcula la posición de la boca y el ángulo del tubo conjuntamente; el giro se expresa alrededor de cero y no recorre una vuelta completa. Los objetivos detrás del arma se limitan al arco frontal. La descarga añade llama direccional, expansión de humo y brasas, además del retroceso. Los operarios quedan detrás del mecanismo, de pie sobre su plataforma.

Los refuerzos aparecen desde la puerta grande existente en la fachada derecha. Se sustituye solo su área por cuatro estados registrados de apertura; se elimina la puerta pequeña añadida al frente. Los payasos salen de la oscuridad, bajan el escalón y avanzan hacia la zona de combate.

## Arte y reproducción

Dos hojas generadas con **image_gen integrado**, utilizando la fortaleza y su puerta como referencias. [Prompts exactos y rutas de los originales](machinery-art.json). Fuentes seleccionadas en `sources/`; los PNG generados conservan su transparencia.

- `public/arcade/sprites/bosses/ember-fort/bulwark.webp`: cuatro estados, 2 × 2 celdas de 512 × 535, suelo registrado.
- `public/arcade/sprites/bosses/ember-fort/grand-gate.webp`: cuatro estados de apertura, 4 × 1 celdas de 384 × 384, marco y umbral fijos.

Reconstrucción: `node scripts/arcade/pack-machinery-rework.mjs`. El empaquetado recorta, registra y escala las imágenes, sin repintarlas. La animación de la barcaza y los efectos de viento y disparo reutilizan arte existente.

## Verificación

58 comprobaciones aprobadas entre `hexy-machinery-rework`, `hexy-duel-cleanup`, `hexy-duel-anime`, `hexy-barge-upgrade`, `hexy-harbor-barge`, `hexy-ember-revision`, `hexy-wildfire` y `hexy-siege-water`. La primera pasada dio 56 aprobadas; las dos restantes se actualizaron y pasaron: observar el proyectil en el instante de disparo en vez de en un tiempo arbitrario, y comprobar la apertura del núcleo tras romper sus barreras en lugar del antiguo umbral de vida. No fue necesario modificar las reglas de apertura del núcleo.

Se comprueban origen y dirección del proyectil, llegada al suelo, salida por la puerta grande, daño localizado, cancelación de ataques al romper piezas, victoria, reintento, progresión y conservación de los retratos. `npm run build` terminó correctamente.

Evidencia en `tests/artifacts/arcade/machinery-rework/`: `validation.log`, `regression-followup.log`, `build.log`; grabaciones `barge-drum.webm`, `barge-water.webm`, `fort-salvo.webm`, `fort-reinforcements.webm` y `duel-wind.webm`. Se inspeccionaron capturas y hojas de fotogramas decodificadas de las grabaciones. Las escenas visuales usan simulación real con Hexy protegida para observar la maquinaria; no equivalen a una partida manual con mando.

## Ajuste posterior: tripulación, fuego y viento

La tripulación queda en dos puestos separados: el operador hidráulico dentro de la cabina superior y el de la manivela junto al tambor, a escala pequeña. Se elimina la rueda superpuesta sobre las manos/cara y el codo de manguera suelto frente al tanque; una tubería fija conecta su salida con la boquilla inferior. Las lonas y banderas del barco se animan por regiones, conservando el casco rígido.

Las dos boquillas del núcleo ahora usan una sola celda de su atlas, a 176 unidades de ancho. Tienen despliegue de 1,05 segundos, articulación limitada, aviso de carga y 18 puntos de vida independientes. Permanecen expuestas tras abrir el núcleo; destruir una corta su llamarada y la desactiva para el resto del combate. Sus coordenadas de disparo y sus blancos usan el mismo mecanismo. No descuentan vida del núcleo ni alteran los 400 puntos de las piezas originales.

El reactor se comprime y descarga vapor antes de propagar un pulso por el suelo hacia dos erupciones separadas por 290 unidades. Sus posiciones y tiempos proceden de la misma secuencia que los proyectiles dañinos. El dibujo completo del labio inferior de los cañones se conserva, con pedestal fijo; las piezas rotas mantienen la escala y orientación del arma. La descarga dura más, con vapor y hollín, y los morteros dejan humo en posiciones del mundo.

`EXPLOSION_SCALE = .88` reduce una sola vez las explosiones de fuego y su colisión, las explosiones de bombas y sus llamas expansivas, y los impactos explosivos genéricos. No cambia el tamaño del proyectil que viaja ni la altura de los incendios persistentes. La derrota de la fortaleza añade explosiones sucesivas, humo y fragmentos pintados de madera/metal con gravedad y rebotes sobre las cuatro pinturas de colapso existentes.

`windClothCanvas` mueve tela y banderas en carpas de ruta, puestos de enemigos, campamento, fachada principal, entrada lateral y carpa de práctica. Las banderas de la fortaleza usan regiones propias y los efectos reducidos detienen este viento. Los paisajes pintados como una sola imagen conservan sus siluetas de fondo.

El modo de entrada se actualiza al usar realmente el mando, teclado o puntero. Con mando, el foco usa brillo sobre la silueta y la selección propia del menú; con teclado conserva el contorno accesible. Conectar un mando sin utilizarlo no elimina el foco del teclado.

Verificación de este ajuste: 72 pruebas distintas aprobadas en tres pasadas (45, 16 y 28 con repeticiones), incluyendo despliegue/daño de boquillas, cancelación de fuego, origen de columnas, escala de fragmentos, colisión de explosiones, progresión, controles y escenas renderizadas. Se actualizaron las expectativas anteriores de tamaño de explosión para el nuevo factor solicitado. Evidencia en `tests/artifacts/arcade/machinery-polish/`, con seis vídeos y hojas de fotogramas decodificadas mediante `node scripts/arcade/review-machinery-polish.mjs`. La comprobación del mando emplea un mando simulado mediante la API del navegador.
