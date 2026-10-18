# Acto 2: maizal, mansión y carpa de los malos sueños

Prototipos jugables del 16/10/2026. Continúa la [guía de campaña](../CAMPANA.md) después del cementerio y Villa Lumbre. Los cinco niveles de Halloween se identifican como 2-1 a 2-5.

**Estado actual:** el [2-3 recibió un recorrido, arte, parallax y combate nuevos el 17/10/2026](../cornfield-v2/README.md). Los niveles 2-4 y 2-5 conservan su condición de prototipos pendientes de desarrollo. El resto de este documento describe la entrega original del 16/10.

| Nivel | Recorrido y acciones | Encuentro final |
| --- | --- | --- |
| 2-3 | 9.800 unidades de maizal al atardecer, cuatro graneros con rutas superiores, carretas y pacas destructibles que también sirven de plataformas, tres rescates, tres emboscadas anunciadas, suministros y puntos de control. | Rey de Paja: abanicos de dardos, embestida anticipada, lluvia y refuerzos. A media vida se desarma y trata de reconstruirse con tres montones de paja. Romperlos durante la absorción evita que recupere vida. |
| 2-4 | 8.800 unidades: jardín exterior, entrada lateral, galerías, salones y balcones. Recorrido a diferentes alturas con vampiros, armaduras, murciélagos, estatuas destructibles y tres rescates. | Conde de Medianoche: magia, lluvia de proyectiles, refuerzos y transformación en bandada para cruzar la arena. Regresa a su cuerpo y ofrece una apertura antes del siguiente ataque. |
| 2-5 | Entrada breve y combate dedicado; dos suministros antes de entrar. La cámara mantiene a ambos personajes en pantalla. | Arlequín de dos conos, con tres fases: máscaras, espejos destructibles que disparan, embestidas, lluvia y criaturas. El suelo avisa con antelación y conserva una zona segura; desde la segunda fase aparecen tres plataformas persistentes. |

El maizal mantiene el banco de plantas cerca del suelo y prácticamente a su velocidad. Las nubes se desplazan por separado; el fondo lejano se mueve lentamente. La mansión cambia de exterior a interior mediante un límite situado en el mundo y una columna lateral: el panorama no se sustituye de golpe al cruzar una coordenada. La textura del suelo cubre las juntas y continúa debajo de las plataformas.

Los obstáculos usan la misma posición para dibujar, detener a Hexy y recibir disparos. La varita, bebidas, ataques fuertes y Encore pueden romperlos; Volt incluye obstáculos y objetos del encuentro en sus objetivos. El polvo aparece al correr. Los enemigos anuncian los ataques y fijan su puntería antes de lanzar. Los proyectiles son entidades independientes, con sprites, luz e impactos, y admiten la intercepción por magia fuerte.

Los jefes tienen poses de daño y derrota. Las transiciones detienen el daño en su umbral para impedir que un ataque muy potente omita una fase. La victoria espera a la animación de derrota; no hay barras de vida enemigas. Se conserva el HUD de Hexy.

## Arte guardado

Generado con **ImageGen integrado**, con transparencia real en los recortables. No se usó la API/CLI de generación. Las originales están en [sources](sources/), los prompts finales en [prompts.json](prompts.json) y los recortes/puntos de registro en [registration.json](registration.json).

Recursos finales en [`public/arcade/act-two`](../../../public/arcade/act-two/):

- `corn-v1.webp`, `garden-v1.webp`, `mansion-v1.webp`, `ring-v1.webp`: cuatro panoramas.
- `straw-v1.webp`, `count-v1.webp`, `harlequin-v1.webp`: dieciséis poses por jefe, incluyendo movimiento, ataque, transformación, daño y derrota.
- `enemies-v1.webp`: veinticuatro poses para espantapájaros, vampiros y armaduras.
- `effects-v1.webp`: dardos de paja, magia azul, aleteo de murciélagos y máscaras de pesadilla.
- `prop-0-v1.webp` a `prop-11-v1.webp`: maíz, pacas, carreta volcada, restos de madera, granero, balcón, estatua, armadura rota, terrenos y espejo.

Empaquetado reproducible: `node scripts/arcade/pack-act-two.mjs`. Los cuerpos se extraen completos por componentes alfa, incluidos bastones o capas que cruzan la cuadrícula original. Se conserva una escala común por atlas y un mismo apoyo de pies. Las puntas se miden en las celdas finales y se comparten entre dibujo y lanzamiento en `actTwoAtlas.js`; el ataque no contiene un proyectil pintado.

Se reutilizan las grabaciones musicales y los FX existentes del juego; esta ampliación no genera música o voces nuevas. Los eventos de magia, creación, golpes y destrucción conservan el mezclador y las opciones de volumen actuales.

## Partidas y progresión

IDs nuevos **8, 9 y 10**, sin reutilizar los anteriores. Orden vigente: `0, 1, 2, 5, 3, 6, 7, 8, 9, 10, 4`. La campaña pasa a versión **5**. La migración de versiones 2, 3 y 4 conserva capítulo activo, estrellas, compras, recibos y desbloqueo del prototipo heredado 6-1. No se resetea el almacenamiento del jugador.

## Verificación

[101 pruebas aprobadas](final-tests.log) y [compilación sin errores](build.log). Las comprobaciones específicas incluyen navegación completa por las galerías con física y saltos normales, destrucción con disparos reales, bloqueo y aterrizaje sobre obstáculos, avisos de emboscada, puntería y ataques de los cuatro enemigos, intercepción, cambios de fase, reconstrucción, derrota de los tres jefes usando la varita básica, finalización y migraciones. El selector real abre los tres capítulos y sus recursos, música y controles sin errores del navegador. La ejecución exploratoria más amplia y las incidencias antiguas se documentan en [CIERRE.md](CIERRE.md).

Grabaciones del motor y renderizador de producción, decodificadas para inspección:

- [Rey de Paja](boss-8-playback.png).
- [Conde de Medianoche](boss-9-playback.png).
- [Arlequín de dos conos](boss-10-playback.png).

Vídeos en `tests/artifacts/arcade/act-two/boss-{8,9,10}.webm`, escenas y eventos en [validation.json](validation.json). Regenerar con el servidor local activo: `node scripts/arcade/review-act-two.mjs`. Las grabaciones fuerzan los umbrales de vida para revisar todas las fases en poco tiempo; las pruebas de combate verifican además la derrota con disparos reales. La revisión visual no equivale a una sesión humana completa de ajuste de dificultad. No se ha realizado escucha humana de los FX.

Los archivos están guardados localmente. El estado final de pruebas y apagado queda registrado en [CIERRE.md](CIERRE.md).
