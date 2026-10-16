# Villa Lumbre · revisión 6

15 de octubre de 2026. Ajuste de la profundidad y la captura por las brujas según las referencias del usuario. El recorrido conserva las 23.240 unidades y los rescates anteriores. No hay barras de salud enemigas.

## Capas y entrada

La «capa 2» del usuario —terreno con piedras, calabazas y árboles— ahora se dibuja en el mismo espacio que el camino: comparte cámara, desplazamiento horizontal y pendiente. Su tierra se solapa con el borde del suelo. La base que impedía transparencias usaba un color plano; ahora usa una textura de tierra del propio terraplén, por lo que desaparece la franja sólida que se veía entre ambas capas.

En la antigua profundidad de esa capa queda otra franja de árboles y terreno. Desde la capa 3 hacia el fondo, las montañas, bosque y pueblo distante avanzan aproximadamente un 15 % más despacio; el terraplén intermedio pasa a 0,43 y los tejados intermedios a 0,55. Las nubes son recortes pintados que se desplazan aun con Hexy quieta. Luna y estrellas conservan su posición. Las casas principales bajan 32 unidades, aproximadamente el 8 % de su altura habitual; los tejados de la llegada también se asientan más abajo.

Se retiraron las hojas y prolongaciones de la verja. Quedan dos pilares independientes: el cercano es mayor, tiene desenfoque y pasa por delante de los personajes; el lejano queda apoyado en la terraza. El pilar cercano se dibuja después de todos los efectos del mundo, de modo que también oculta el fogonazo de Popcorn Panic y los impactos. La entrada no crea una cerca antes de llegar al pueblo.

[Capas del camino](../../../../tests/artifacts/arcade/village-depth-v6/real-1440-1800.png), [aproximación y casas asentadas](../../../../tests/artifacts/arcade/village-depth-v6/real-1440-6250.png), [pilares](../../../../tests/artifacts/arcade/village-depth-v6/real-1920-6850.png), [movimiento de ida y vuelta](../../../../tests/artifacts/arcade/village-depth-v6/entrance-motion.png), [disparo detrás del pilar](../../../../tests/artifacts/arcade/village-depth-v6/occlusion-motion.png).

## Magia y dulce

- La intercepción de proyectiles es compartida por todos los capítulos. Popcorn fuerte ahora participa aunque sus perdigones no usen `heavy`; el chorro fuerte de agua, la lluvia de miel y la descarga fuerte de Volt también despejan proyectiles por contacto. Se comprueba el cruce relativo de ambos disparos, incluso después de moverse el enemigo, antes de que pueda dañar a Hexy. Las burbujas fuertes capturan y destruyen el excedente al llenarse. Los peligros persistentes y los choques de rayos conservan sus reglas específicas.
- El payaso con cabeza de calabaza conserva su traje y sus poses; ojos, boca y aliento tienen luz azul/cian con núcleo amarillo. Dispara tres llamas fantasmales. Una colisión real convierte a un vecino en dulce. Las brujas cercanas pueden absorber también estos dulces, aunque no hayan sido creados por su propio rayo.
- Liberarse requiere **21 pulsaciones nuevas o cambios de dirección**, tres veces las siete anteriores. Mantener un botón no cuenta repetidamente. El aviso «¡LIBÉRATE!» reutiliza la ilustración animada del botón del choque con el arlequín y muestra el avance. Funciona con teclado, mando y toque.
- Una bruja disponible puede atraer a Hexy convertida en dulce desde un radio de 620 unidades. Se ve el viaje por el aire hacia sus manos; dura 4,8 segundos desde que comienza la absorción. Hexy puede liberarse durante ese trayecto. Si completa la absorción, Hexy pasa por ocho celdas de transformación en una calabaza con su propio sombrero y la partida termina, aun si quedaban corazones. Dañar o derrotar a la bruja interrumpe el arrastre; el estado de dulce aún exige liberarse.
- Los rayos de las brujas tienen una cola pintada unas 2,3 veces más larga. Se revela conforme avanza para que no nazca detrás de la varita. Una caída suave conduce el disparo hacia el terreno. La colisión comprueba el primer contacto con la calle y deja un remolino de impacto; el rayo no sigue viajando debajo del suelo.

[Fuego azul y transformación del vecino](../../../../tests/artifacts/arcade/village-depth-v6/clown-fire-motion.png), [aviso real de liberación](../../../../tests/artifacts/arcade/village-depth-v6/real-candy-prompt.png), [absorción y derrota](../../../../tests/artifacts/arcade/village-depth-v6/hexy-pull-motion.png), [liberación durante el arrastre](../../../../tests/artifacts/arcade/village-depth-v6/hexy-escape-motion.png), [rayo largo e impacto](../../../../tests/artifacts/arcade/village-depth-v6/long-ray-motion.png).

## Arte guardado

Generación y edición mediante **ImageGen integrado**, sin CLI. Los [prompts completos](prompts.json) y [fuentes originales](sources/) están copiados al proyecto. Sharp sólo recorta los dos pilares, registra las celdas de Hexy y comprime los archivos con `scripts/arcade/pack-village-v6.mjs`. Coordenadas en [registration.json](registration.json).

| Archivo final | Contenido |
| --- | --- |
| `public/arcade/maps/village/pillar-near-v6.webp` | Pilar cercano sin reja |
| `public/arcade/maps/village/pillar-far-v6.webp` | Pilar lejano sin reja |
| `public/arcade/maps/village/clouds-v6.webp` | Nubes móviles transparentes |
| `public/arcade/sprites/enemies/village-pumpkin-v6.webp` | 24 celdas del payaso actualizadas con luz y aliento azul |
| `public/arcade/sprites/enemies/village-hexy-pumpkin-v6.webp` | Ocho celdas de transformación de Hexy en calabaza |

## Verificación

- [75 pruebas de regresión aprobadas](regression.log): combate compartido, Popcorn, agua, brujas, absorción, huida, rescates, progresión y controles reales del HUD. Diez casos nuevos están en `tests/hexy-village-revision-6.spec.js`.
- [Prueba de profundidad aprobada](depth.log): al desplazar la cámara 100 píxeles, camino y terraplén conservan la misma imagen trasladada, con tolerancia de dos niveles de color en bordes rasterizados. Con cámara quieta, cambian las nubes y permanece estable el paisaje inferior. La prueba de opacidad sigue comprobando pendientes y transición del camino con dos colores de fondo distintos.
- [Juego real e interfaz aprobados](route-final.log): 24 capturas a 1440×900 y 1920×1080, grabaciones con teclado por el campo y la entrada, aviso de liberación y salida del dulce mediante 21 pulsaciones reales de Z.
- [Seis escenas grabadas con motor y renderizador de producción](motion-first.log): absorción fallida, liberación durante el vuelo, payaso con fuego azul, rayo contra el suelo, ocultación del fogonazo y nubes con cámara inmóvil. Se decodificaron las ocho grabaciones y se revisaron sus hojas de contacto y fotogramas completos. Artefactos: `tests/artifacts/arcade/village-depth-v6/`.
- `npm run build` termina con `[build] Complete!`: 0 errores, 0 advertencias de Astro y 30 sugerencias. Vite conserva los avisos previos de tamaño de paquetes y antigüedad de Browserslist. [Registro](build.log).

Los primeros registros conservan expectativas anteriores de siete pulsaciones/fuego naranja/agua que no interceptaba notas, una carga inicial de recursos que superó la espera de la interfaz y un montaje de prueba con el payaso fuera de su alcance. Se corrigieron antes de la validación final. La invulnerabilidad usada para recorrer el mapa explica el parpadeo de Hexy en algunas capturas; no es transparencia de los edificios.

Resultados y archivos comprobados en [validation.json](validation.json). Para jugar: **Arcade → Elegir capítulo → 5-2 · El pueblo de los dulces → Práctica**.
