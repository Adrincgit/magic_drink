# Coherencia anime cartoon del elenco del maizal

Corrección del 17/10/2026, solicitada por el usuario: los personajes deben compartir el estilo artístico, la calidad y el nivel de detalle de los payasos existentes. Esta revisión sustituye el acabado realista de los personajes nuevos del 2-3.

La referencia directa es [`clown.webp`](../../../../public/arcade/sprites/enemies/clown.webp). Se redibujaron las dos formas del Rey de Paja, sus dos ciclos de marcha de doce poses, los espantapájaros pequeños y los cuervos. Comparten contornos oscuros definidos, formas expresivas y redondeadas, sombreado de anime cartoon y detalle agrupado en cara, ropa, plumas y paja. Las poses conservan su función y su secuencia. Los escenarios y las reglas de combate siguen siendo los de la ampliación del 2-3.

Arte creado mediante **ImageGen integrado**, con los payasos como referencia de estilo y los dibujos anteriores como referencia de acciones. [Prompts completos](prompts.json) y [originales](sources/). Los seis atlas activos están en [`public/arcade/act-two/cornfield-cartoon-v3`](../../../../public/arcade/act-two/cornfield-cartoon-v3/): 88 celdas de 512 px, conservando los píxeles de los originales y compresión WebP sin pérdida. Los archivos anteriores se conservan como historial.

Empaquetado: `node scripts/arcade/pack-cornfield-cartoon-v3.mjs`. Extrae personajes completos por componentes alfa, conserva el apoyo de pies y deja márgenes para la horca y las alas. La marcha se empaqueta a su resolución original; su escala de dibujo compensa las dimensiones de cada fuente. [Mediciones y puntos de salida](registration.json), [comprobación de las 88 celdas](atlas-check.json). Los dardos y la luz de carga usan la mano o punta de la horca de la pose visible, también al reflejar al personaje.

## Comparación dentro del juego

- [Hexy, payaso original, payaso calabaza, espantapájaros y cuervo](cast-lineup.png).
- [Primera forma junto al payaso](king-with-clown.png).
- [Segunda forma junto al payaso](harvest-with-clown.png).
- [Salida de la horca a la izquierda](king-release-left.png) y [a la derecha](king-release-right.png).
- [Carga de la segunda forma](harvest-charge.png).

Grabaciones de movimiento y combate: [entrada al maíz](entering-corn-playback.png), [hondonada](hollow-run-playback.png), [ambas formas del Rey](king-both-phases-playback.png). Los correspondientes `.webm` se guardan junto a estos montajes, que se obtienen decodificando los vídeos. Se usa invulnerabilidad para observar las acciones y se fuerzan los umbrales de fase y derrota; no sustituyen una partida humana de ajuste de dificultad.

Regenerar la revisión con el servidor local en 4322: `node scripts/arcade/review-cornfield-v2.mjs --cartoon`. Añadir `--stills` para las comparaciones estáticas.

[28 pruebas aprobadas](tests.log), incluida la campaña del acto 2, la navegación del maizal, combate con varita básica y puntos de salida por pose en ambas direcciones. [Compilación terminada en `Complete!`](build.log), sin errores de Astro. La revisión final de los vídeos decodificados no registró [errores ni recursos ausentes en el navegador](browser-errors.json). Las 88 celdas contienen dibujo y conservan sus márgenes.
