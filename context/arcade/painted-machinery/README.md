# Sprites integrados y disparo básico — 12 de octubre de 2026

Revisión del 13 de octubre: la carrera del arlequín azul se sustituye por un ciclo con pasos alternados y saltos con preparación y aterrizaje. Véase [la revisión de carrera](../blue-gait/README.md) para el arte y comportamiento actuales.

Las carpas del primer nivel, la salida caminando del malabarista y el interior de las carpas del campamento se corrigen en [la revisión de carpas](../tent-motion/README.md). El interior oscuro ya forma parte de cada dibujo; se elimina el rectángulo estirado del renderer.

Revisión solicitada de las boquillas de la fortaleza, golpe del reactor, polvo de destrucción, carpas, arlequín azul, lanchas y operarios del barco. No se modifican las actuaciones del Arlequín principal ni la pose heroica inicial de Hexy.

## Arte guardado

Imágenes generadas con **image_gen integrado**, con referencias del proyecto y transparencia real. Las fuentes completas permanecen en `sources/`; los prompts exactos, referencias y rutas originales se guardan en [art-prompts.json](art-prompts.json). Las hojas seleccionadas son:

- `public/arcade/sprites/bosses/ember-fort/deploy-painted.webp`: ocho estados de despliegue, apuntado y pistón, celdas de 384 × 384.
- `public/arcade/sprites/bosses/barge/integrated-painted.webp`: cuatro dibujos del barco completo, con dos operarios, plataformas, polea, cuerda, mallete y membrana del tambor pintados juntos; celdas de 768 × 512. Se usa la fuente refinada, conservando también el primer original.
- `public/arcade/maps/circus/camp-wind-painted.webp`: cuatro estados de viento de la carpa abierta y cuatro de la cerrada; celdas de 512 × 384.
- `public/arcade/sprites/enemies/acrobat-run-painted.webp`: dieciséis poses de carrera a escala del actor existente.
- `public/arcade/sprites/enemies/acrobat-air-painted.webp`: ocho poses de salto y voltereta correspondientes al arco físico del actor.
- `public/arcade/sprites/props/wind-flags-painted.webp`: cuatro poses de bandera roja y cuatro de bandera violeta. Las demás fachadas conservan su pintura y usan estos fotogramas en las banderas, sin deformación ondulatoria.
- `public/arcade/sprites/props/wind-tassels-painted.webp`: cuatro dibujos de borla, conservados como arte auxiliar.

`node scripts/arcade/pack-painted-machinery.mjs` registra y empaqueta la fortaleza, barco, carpas y acróbata. El empaquetado usa un mismo factor de escala por secuencia y fija la línea de apoyo. Las filas de las poses del acróbata se separan por sus márgenes de transparencia para evitar recortar botas o incorporar fragmentos de la fila anterior.

`node scripts/arcade/pack-painted-wind.mjs` empaqueta banderas y borlas. La carpa abierta conserva la oscuridad de su interior original detrás de las cortinas animadas.

## Comportamiento

Al abrir el núcleo, la carcasa frontal despliega dos armas en el lado de aproximación del jugador. Ambas bocas miran hacia delante. Cada fotograma incluye su manguera curva y su anclaje; no se añaden segmentos dibujados ni se gira una boquilla suelta. Se mantienen los identificadores anteriores `vent-left` y `vent-right` por compatibilidad, pero ahora corresponden al arma superior e inferior, ambas orientadas a la izquierda. Cada una conserva 18 puntos de vida y se cierra al destruirla.

El pistón levanta su pie y lo baja sobre el suelo a los 0,72 segundos. En ese contacto aparecen polvo, sonido de impacto y un temblor corto; las columnas ya avisadas se activan después. Se elimina el recorrido luminoso dibujado sobre el suelo. La derrota conserva las cuatro pinturas de colapso y añade nubes de polvo antes de cada cambio, además de más humo de las explosiones.

La barcaza utiliza sus operarios pintados sobre plataformas reales, con sombras y herramientas conectadas. Los puntos de referencia del tanque, tambor y escape se ajustan a esas posiciones. Los operarios abandonan el barco después de que desaparezca su pintura, evitando duplicarlos durante el escape. Los cañones y sus proyectiles mantienen las reglas del encuentro.

Las lanchas de tres payasos aumentan un 15% en dibujo y colisión. Su vida pasa de 9,2 a 10,93: normalmente resisten un disparo básico adicional. Los disparos hacia el agua atraviesan el tablero del puente; se corrigen rebotes de cerezas, prismas y burbujas, choque de estrellas/miel, corte de rayos y altura de aterrizaje de Aqua.

**Q / R3** y el botón del HUD alternan el modo de ataque. Una bebida alterna con el disparo básico; dos bebidas recorren bebida A, bebida B, básico, bebida A. La bebida equipada conserva munición, capacidad y nivel mientras se usa el básico. El especial también vuelve a la chispa básica y no gasta bebida. No se interrumpen acciones protegidas ni la transformación temporal de Ribbon. El modo se conserva al reintentar o cambiar de capítulo.

## Verificación

Pruebas de munición, seis armas disparadas a través de puentes contra lanchas reales, teclado, mando R3 simulado y botón del HUD; vida/tamaño de barcos, orientación de boquillas, poses de carrera/salto, progresión y daño localizado. Evidencia en `tests/artifacts/arcade/painted-machinery/`: registros de validación, nueve grabaciones, capturas y hojas de fotogramas decodificadas. La primera regresión aprobó 67 pruebas; la pasada final aprobó 20, incluyendo el nuevo arco de ocho poses. No equivalen a una partida manual con un mando físico.

Revisión de vídeo: `node scripts/arcade/review-painted-machinery.mjs`. Se verifican montajes decodificados de las grabaciones del renderer real; las escenas protegidas permiten observar los mecanismos completos.

La revisión final de las carpas corrige el borde del fondo interior y vuelve a comprobar sus fotogramas. Otras 14 pruebas verifican que la selección de básico no sustituye los ataques de la transformación temporal de Ribbon y vuelve al modo anterior al terminarla. La compilación termina correctamente.
