# Del embarcadero al Gran Telón

Revisión del 7 de octubre de 2026. Petición: ver cómo termina 1-3, llegar a la gran carpa, entrar y avanzar brevemente antes de la aparición del arlequín.

## Secuencia implementada

1. **Final de 1-3:** la barcaza completa su destrucción; Hexy planta la bandera y continúa por el muelle. La cámara acompaña la caminata, descubre la fachada del Gran Telón y se detiene un instante frente al acceso antes del cambio de capítulo. Se añaden 1.530 unidades de muelle tras la arena; el mapa mide 16.680. La arena de combate conserva sus 1.900 unidades.
2. **Inicio de 1-4:** exterior del mismo circo, con el mismo paisaje del río y la misma fachada. Al venir de 1-3 se conserva la distancia restante a la puerta, 420 unidades; elegir 1-4 en práctica empieza algo antes, con la tienda de Miso a la vista. Se puede caminar hacia ella antes de entrar.
3. **Umbral:** acercarse a pie inicia un cruce de 2,05 segundos. Hexy camina hasta la entrada, utiliza sus cuadros de entrar, se interna en la oscuridad y se pasa al interior mediante un fundido breve. El cambio de coordenadas ocurre completamente cubierto. La barandilla tiene una abertura a la altura de la puerta; el suelo y los pilares continúan debajo.
4. **Interior:** se recupera el control en x=660. Hay unos tres segundos de caminata, suministros, sin checkpoint interior, antes de activar la presentación en x=1.380. El arlequín baja en cuerda durante 4,2 segundos y sólo después ataca. Se mantienen sus tres fases y 720/480 de salud.

Cruzar no guarda un punto de retorno. Al perder se vuelve fuera, en x=-1.140, cerca de Missi, con el jefe restablecido. Se repite la entrada; los checkpoints interiores anteriores tampoco se conservan. Saltar o hacer dash no permite pasar directamente a la arena; primero hay que aterrizar frente a la entrada. Durante el cruce no se gastan ataques ni aparecen proyectiles.

La fachada, sus faroles, las tablas y los apoyos usan coordenadas del mundo. No hay follaje cercano añadido ni deriva vertical del edificio al cambiar el zoom. Se conservan las capas lejanas del río. El zoom exterior es 0,8; el interior vuelve a 1 y la batalla ajusta el zoom según la separación de Hexy y el jefe: se acerca al reunirlos y se abre al alejarlos, desde ambos lados. El suelo conserva su altura en pantalla.

## Música: reutilizada, no compuesta para esta revisión

| Momento | Título de interfaz | Archivo activo |
| --- | --- | --- |
| Recorrido 1-3 | Faroles sobre el agua | `public/arcade/music/exploration/canopy.ogg` |
| Barcaza de 1-3 | La barcaza del redoble | `public/arcade/music/bosses/alegre.ogg` |
| Acceso de 1-4 | Entre bastidores | `public/arcade/music/exploration/ring.ogg` |
| Arlequín de 1-4 | El arlequín del Gran Telón | `public/arcade/music/bosses/arlequin_fuego.mp3`, suministrado por el usuario el 8 de octubre |

Los tres temas de exploración y barcaza ya estaban en el proyecto; el de esta batalla es el MP3 entregado por el usuario. Los encuentros tienen efectos propios de combate, sin atribuir esas grabaciones como melodías nuevas compuestas aquí. El cruce aprovecha los sonidos existentes de apertura/cierre. Se conservan los controles de volumen y la selección automática de música al comenzar la presentación del jefe.

## Arte y comprobación

Fachada creada con `image_gen` integrado, transparencia nativa: `public/arcade/maps/grand-ring/exterior.webp`. [entrance-art.json](entrance-art.json) conserva el prompt exacto y las rutas original/final. Conversión sin repintado: `node scripts/arcade/pack-circus-entrance.mjs`.

`tests/hexy-circus-arrival.spec.js` verifica victoria y llegada, continuidad entre capítulos, cruce, dash/salto, ausencia de checkpoints interiores y reintento exterior, registro de fachada/suelo, archivos musicales y el recorrido desde el menú real. Capturas del renderizador en `tests/artifacts/arcade/circus-arrival/`: final del muelle, fachada alcanzada, exterior, entrada e interior. Los registros de compilación y regresión usan el prefijo `tests/artifacts/circus-arrival-`.

Resultado de esta revisión: **59 pruebas correctas** en entrada, arlequín, barcaza, profundidad y acabado del puerto, progreso y selección de mundos/audio. `npm run build` termina con 0 errores y 19 avisos informativos. Se inspeccionaron las capturas de llegada, cruce e interior, además del recorrido con teclado desde el menú real. No se hizo commit ni publicación remota en esta revisión.
