# Campanero: ampliación de animaciones

El jefe de 5-1 pasa de 76 a 216 celdas pintadas, repartidas en nueve láminas. La campana conserva su forma hueca y el badajo; al romperse deja salir al mismo payaso espectral, con su sombrero y guantes.

| Lámina en `public/arcade/sprites/enemies/` | Secuencias |
| --- | --- |
| `nightmare-bell-idle-v9.webp` | 12 poses de flotación y 12 de recuperación del esfuerzo |
| `nightmare-bell-ring-v9.webp` | 8 de preparación y 16 de campanadas con balanceo del badajo |
| `nightmare-bell-impact-v9.webp` | 6 de carga, 6 de embestida, 8 de preparación del golpe vertical y 4 de impacto |
| `nightmare-bell-summon-v9.webp` | 12 de preparación y 12 de invocación y retirada de manos |
| `nightmare-wraith-idle-v9.webp` | 12 de flotación y 12 de recuperación de la forma espectral |
| `nightmare-wraith-cast-v9.webp` | 8 de preparación y 16 de lanzamiento de espíritus en dos impulsos |
| `nightmare-wraith-dash-v9.webp` | 8 de preparación, 12 de embestida y 4 de frenado |
| `nightmare-break-v9.webp` | 24 de grietas, caída de placas y aparición del espectro |
| `nightmare-wraith-defeat-v9.webp` | 24 de desintegración progresiva y caída del sombrero |

Los nuevos fotogramas se distribuyen en los tiempos de ataque existentes. El frenado espectral ocupa los primeros 0.24 segundos de su recuperación vulnerable. La rotura sigue durando 2.04 segundos y la derrota 2.3 segundos. Se conservan la salud, las dos fases y los pequeños proyectiles azules de la revisión 7. No se muestran barras de salud.

## Fuentes y reproducción

Las nueve fuentes se generaron con **image_gen integrado**, con los sprites existentes como referencias. [Prompts completos](prompts.json). Para la rotura se usaron como referencias las nuevas láminas `bell-idle` y `wraith-idle`; para embestida y derrota se añadió la nueva lámina `wraith-idle` a la referencia anterior.

`node scripts/arcade/pack-bellkeeper-v9.mjs` realiza el recorte técnico, la escala común de cada secuencia y el registro de la cara. Genera nueve WebP de 1280 × 1920, con celdas de 320 px, y `actors/bosses/bellkeeperRegistration.js`. Los desplazamientos guardados compensan el margen adicional de estelas y brillos al dibujar: así el encuadre de un efecto no desplaza al personaje. La derrota conserva una escala común para que el cuerpo realmente se disuelva sin agrandar el sombrero.

La primera y última celda de la rotura reutilizan los extremos de las nuevas poses de flotación. Las fuentes anteriores permanecen disponibles como referencia, pero las tres láminas v6 ya no se cargan durante el juego.

## Verificación

Las pruebas del jefe cubren pelea completa, transición con exceso de daño, invocaciones limitadas, ondas que se pueden saltar, embestida con destino fijado, victoria y reintento. Las grabaciones usan el motor y el renderizador del juego y se guardan en `tests/artifacts/arcade/bellkeeper-v9/`.

Registros: [primera comprobación](tests.log), [comprobación final](final-tests.log), [compilación](build.log) y [verificación de archivos](verification.json).

Resultado: 15 pruebas iniciales aprobadas y 7 del jefe repetidas tras ajustar el registro, incluyendo cuatro grabaciones. Se decodificaron y revisaron las cuatro escenas y los detalles de campanadas, transformación, embestida y derrota. Las estadísticas del motor registran las 216 celdas, 24 por lámina; el tiempo de renderizado del percentil 95 estuvo entre 4.2 y 5.8 ms en estas grabaciones. `npm run build` terminó con 0 errores. Los nueve atlas coinciden por SHA-256 entre `public` y `dist`.

Se comprobó también que los sprites corregidos de zombis con huesos visibles y las extremidades vestidas de las revisiones 7/8 permanecen sin cambios.
