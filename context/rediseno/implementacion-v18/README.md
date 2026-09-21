# WonderPop: recorrido arquitectónico v18

Corrección de la composición plana de v17: los Bunnies superpuestos se retiraron de las escenas 6 y 7. El atrio tiene ahora suelo horizontal, fachadas laterales perpendiculares, tres arcos transversales, árboles, luminarias y un atril en coordenadas de Three.js. La cámara avanza entre ellos con el scroll; los dos primeros arcos quedan detrás de la cámara. El tercer arco enmarca la llegada a los locales.

## Revisión local

- [Entrar por el jardín y recorrer la plaza](http://localhost:4321/#wonderpop)
- [Llegar al directorio del atrio](http://localhost:4321/#directorio-wonderpop)
- [Abrir los escaparates](http://localhost:4321/#galeria-wonderpop)
- [Grabación del avance y retroceso](capturas/recorrido-v18.webm)

Los letreros de Magic Drink, Colecciones y Hexy se proyectan desde sus fachadas sobre controles HTML accesibles. El mapa y las preguntas se imprimen sobre el panel del atril. El plano abierto representa los tres arcos, los árboles laterales y los escaparates del fondo; sus destinos seleccionan la categoría correspondiente en la escena 7.

El escaparate 7 utiliza un expositor y una ficha apoyada en el mostrador, con rótulos suspendidos de un travesaño. Conserva las fotografías de colección, el cambio de pieza con shader, el detalle ampliable, el teclado y la reproducción de Hexy.

## Movimiento y alternativas

La cámara sólo depende del recorrido y de un pequeño desplazamiento lateral del puntero. Plantas y luminarias tienen un reloj ambiental independiente, cuantizado a 10 poses por segundo. El render ambiental se limita a unos 20 fps; la cámara se actualiza durante el scroll. El motor deja de dibujar fuera del atrio y con la pestaña oculta. El DPR está limitado a 1.5.

Sin WebGL, con una textura ausente o con pérdida del contexto se conserva la ilustración completa y el directorio utilizable. Con movimiento reducido, las secciones y enlaces se presentan en el flujo del documento.

## Arte

Tres piezas nuevas mediante la herramienta integrada ImageGen: material de mármol, fachada frontal modular y atril transparente. [Prompts exactos y referencia](PROMPTS.md), [archivos y tamaños](assets.json). Los PNG originales están en `arte-fuente/`; las copias WebP suman 1.15 MB aproximadamente. La conversión sólo cambia el formato.

El resto utiliza ilustraciones existentes. El techo acristalado y las incrustaciones del suelo son gráficos geométricos del motor. Es una escenografía 2.5D: las paredes y el suelo ocupan planos perpendiculares; plantas, arcos y atril son ilustraciones recortadas. No son modelos volumétricos de cada objeto ni una simulación física de iluminación.

## Verificación

Los scripts `capture.cjs`, `visual-review.cjs` y `performance.cjs` reproducen las capturas, el recorrido y una medición con CPU limitada. La medición en Chrome con emulación táctil no sustituye una prueba en un teléfono físico.

- Build: 192 archivos comprobados, 0 errores, 0 advertencias de Astro, 80 sugerencias ya existentes; 9 páginas generadas.
- 51 pruebas distintas verificadas. La primera regresión pasó 50 y detectó una aserción que buscaba las antiguas luminarias HTML. Tras adaptarla a las luminarias del motor, los 6 casos de profundidad afectados pasaron.
- La inspección visual detectó además que bloquear `body` al abrir un diálogo desplazaba el escenario sticky. Se corrigió el bloqueo al nivel del documento. Mapa, guía y detalle ahora comprueban que el escenario permanece en la pantalla durante la apertura. La última batería de galería pasó 4/4, incluyendo 2559×1303 y móviles de 390×640.
- Capturas revisadas en 1440×900, 2559×1303 y 390×844/640; recorrido grabado hacia delante y hacia atrás. Alternativas sin WebGL, textura fallida, movimiento reducido, teclado, ES/EN y música continua cubiertas por pruebas.
- [Medición local](performance.json): con CPU 4×, el percentil 95 del intervalo entre cuadros fue 36.3 ms al avanzar y 30.9 ms al retroceder. La medición registró también una tarea inicial de 812 ms. No es una garantía de 60 fps ni una prueba de carga en un teléfono físico.

La integración se mantiene local; esta revisión no publica el sitio.
