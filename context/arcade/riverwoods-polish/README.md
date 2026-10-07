# Bosque, circo y ataques musicales

Revisión local del 6 de octubre de 2026, posterior a [machine-and-grip](../machine-and-grip/README.md). Los ataques, arena, embestida e impactos se ajustaron después en [organ-pressure](../organ-pressure/README.md).

## Juego

- Organillo avanza y retrocede con sus ruedas; las bocinas, objetivos y salidas de proyectiles comparten posición. Los emblemas muestran un payaso de estilo anime, de ojos grandes y proporciones redondas.
- Las bocinas delanteras lanzan notas rojas grandes dirigidas a Hexy; los tubos mantienen la lluvia de notas con un corredor fijo de esquiva. Algunos ataques añaden ondas graves por el suelo y la segunda fase combina ataques bajos y altos. Las notas frontales se apagan al tocar el suelo o salir de la arena.
- Las notas tienen acordes de órgano, el vapor tiene su propio sonido y la transformación rompe la cubierta en seis piezas. La derrota rompe el cuerpo, tubos, bocinas y ruedas; añade dos explosiones posteriores y golpes metálicos al caer las piezas. La victoria empieza después de esta secuencia y la máquina desaparece.
- El zepelín pequeño aparece en tres puntos del segundo capítulo. Un payaso rojo lo conduce de izquierda a derecha. Tiene 13,8 de salud, frente a un máximo de 10,35 de los demás enemigos básicos; lanza pelotitas rojas a 285 unidades por segundo, con anticipación visible y 1,65 segundos entre disparos. Solo dispara hacia delante. La hélice es una pieza independiente del dibujo.
- El globo del primer jefe suelta aire por las roturas durante la segunda fase. Sus puertas inferiores abren antes del bombardeo; las bombas nacen debajo de la cesta y conservan el corredor de esquiva.
- El agua de los puentes tiene corriente, refracción en franjas y ondas de brillo. Las repeticiones alternan reflejadas para evitar cortes rectos. La opción de movimiento reducido mantiene el agua quieta.

## Terreno y árboles

Hay cuatro dibujos distintos de árboles: roble, sauce, abedul y espino. Se alternan en once posiciones del recorrido. Se conservan a su resolución nativa y con transparencia, sin cuadros pequeños ampliados.

`rootedSceneryPlacement` usa el pivote real de las raíces y su extensión horizontal. Consulta ambos extremos, el centro y las uniones de terreno dentro de esa extensión; hunde la base 28 unidades bajo la superficie más baja para que las hojas del suelo cubran las raíces. También funciona al reflejar el árbol y al cruzar pendientes.

El borde de hojas permanece irregular y transparente. La textura se eleva ligeramente para que los pies queden sobre las hojas; el relleno sólido sigue empezando debajo del borde opaco. Las repeticiones del terreno se reflejan para disimular sus costuras.

## Arte y reproducción

Se utilizó **ImageGen integrado**. [prompts.json](prompts.json) contiene las instrucciones seleccionadas, destinos y composición del emblema del techo. Las fuentes y sprites del proyecto son WebP; los PNG del proveedor quedan fuera del proyecto y las capturas de revisión son JPEG en `tests/artifacts`, excluido de Git.

| Recurso | Fuente / preparación |
| --- | --- |
| `public/arcade/maps/riverwoods/trees/` | Cuatro recortes nativos seleccionados. `node scripts/arcade/pack-river-trees.mjs` mide sus pivotes y genera `riverTreeArt.js`. |
| `public/arcade/sprites/bosses/organ/` | Cuerpo y kit vigente en `machine-and-grip`; cubierta seleccionada en `organ-cover-source.webp`. `node scripts/arcade/pack-organ-art.mjs` separa las piezas y sustituye la cubierta del kit antiguo. |
| `public/arcade/sprites/enemies/clown-zeppelin.webp`, `zeppelin-propeller.webp` | `clown-zeppelin-source.webp`; `node scripts/arcade/pack-zeppelin-art.mjs` separa la hélice conservando el registro del cuerpo y del lanzador. |
| `public/arcade/sprites/bosses/balloon-hatch.webp` | Puertas inferiores seleccionadas con transparencia. El renderizador separa las dos hojas y las gira sobre sus bisagras. |
| Notas rojas, pelotitas, vapor, ondas y fugas de aire | Canvas: formas y resplandores que conservan coordenadas compartidas con el combate. |
| Sonidos | Web Audio procedural en `shared/audio/sounds.js`; eventos publicados en `public/arcade/sounds/catalog.json`. |

La cara de payaso nueva sustituye la máscara realista de la cubierta; su mismo medallón se recorta y registra en el techo del cuerpo. Se conserva únicamente la fuente seleccionada, sin duplicar sprites publicados ni historiales PNG. El antiguo efecto genérico `organ-debris.webp` se retira: la destrucción ahora usa recortes de las piezas reales de esta máquina.

## Comprobación

`tests/artifacts/arcade/riverwoods-polish/` guarda las capturas del renderizador real: seis puntos del terreno, notas rojas, zepelín sobre el puente, compuerta abierta/cerrada y seis etapas de transformación y destrucción.

- `final-tests.log`: 63 pruebas aprobadas de combate, animación, recorrido, jefes, terreno, progresión e interfaz.
- `water-seams-final.log`: las 10 pruebas focalizadas aprobaron después de reflejar las repeticiones del agua.
- `audio.json`: los once efectos nuevos producen audio audible sin recorte; silencio al desactivar los efectos.
- `final-build.log`: `npm run build` completado, cero errores y cero advertencias del comprobador. `build-after-archive.log` confirma la reconstrucción posterior a retirar el efecto antiguo del directorio público.

Las pruebas comprueban ataques exclusivamente musicales, origen de proyectiles, movimiento de objetivos, ventanas de recuperación, corredores de esquiva, salud y trayectoria del zepelín, apertura previa de puertas, suelo bajo las raíces, destrucción con disparo normal y magia especial, y animación real del agua con movimiento reducido estable.

Cambios locales; sin despliegue.
