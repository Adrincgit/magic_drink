# Recursos de Hexy & the Lost Chorus

El soporte para mando Xbox y los volúmenes separados están documentados en [gamepad-and-audio/README.md](gamepad-and-audio/README.md): incluye todos los botones de combate, navegación de tienda/ajustes, pausa por desconexión y preferencias de audio persistentes.

La revisión vigente es [shop-illustrated/README.md](shop-illustrated/README.md): salida propia de Hexy, diálogo variable de Miso, globo y controles pintados, etiquetas de precio y fichas de artículos; las mejoras están dentro de Mis amuletos. Conserva el marco 16:9 y las expresiones estables de [shop-contained/README.md](shop-contained/README.md). La Original dura diez segundos con estrellas y colores por la pantalla; el terreno ya no mezcla copias translúcidas. Continúan las funciones de [shop-stage-and-storm/README.md](shop-stage-and-storm/README.md): entrada animada, Mods mejorables y visibles en el HUD, reserva ilimitada temporal y estela arcoíris, escudos de una a tres cargas, amuleto de escudo completo y bombardeo aéreo del globo en segunda fase. También permanecen activas las tres nuevas versiones MP3 aportadas por el usuario. Las reglas descritas abajo corresponden a la base, salvo estas ampliaciones.

El juego consume recursos con nombres estables desde `public/arcade/`:

| Carpeta | Contenido |
| --- | --- |
| `sprites/hexy` | Carrera, disparos, marometa, dash aéreo, rodar, planeo, magia fuerte, súper, festejo y reacciones. |
| `sprites/bunnies` | Movimiento, lanzamiento y atlas compartido con la búsqueda. |
| `sprites/enemies` y `sprites/bosses` | Dibujos de enemigos, payaso lanzado y animaciones de los jefes. |
| `sprites/effects` | Proyectiles, impactos, escudos y Encore estelar. |
| `sprites/props` y `sprites/pickups` | Jaulas, máquina, decorado y latas ilustradas. |
| `maps/<capítulo>` | Fondo, plano intermedio y suelo. |
| `music/exploration`, `music/bosses`, `music/jingles` | Música por nivel, combate y resultado. |
| `sounds/catalog.json` | Catálogo de efectos sintetizados en tiempo real. El motor está en `src/components/arcade/audio/sounds.js`; estos sonidos no necesitan archivos de audio descargables. |
| `texts/adventure.json` | Mensajes bilingües de juego. El resto de los textos de interfaz aún pertenece a los componentes. |

## Conservar antes de reemplazar

`archive/` conserva los originales históricos, incluidas las hojas V54 y V55. `asset-migration.json` registra origen, destino y SHA-256 de cada uno de los 89 archivos. `archive/original-folders/` contiene además las carpetas originales completas retiradas de `public`, para poder recuperar también su estructura. No se borraron dibujos descartados.

Las siguientes iteraciones deben mantener estos nombres públicos. Guardar las fuentes, alternativas y registros de generación en `context/arcade/<nombre-del-trabajo>/`, no crear más carpetas `vNN` dentro de los recursos publicados.

Los frames de Hexy usan celdas de 320 px, cuatro columnas, pivote de suelo `(160,300)` y puntas de varita medidas. La marometa está centrada en el torso. Los efectos y bunnies usan celdas de 256 px. Una hoja nueva requiere actualizar las medidas de su varita y comprobar el origen del proyectil.

## Movimiento y súper

- Doble salto desde el comienzo. El segundo activa la marometa. Mantener salto durante el descenso abre el sombrero; soltarlo devuelve la gravedad normal. Apuntar verticalmente o realizar otra acción interrumpe el planeo.
- `C`: magia fuerte inmediata. Sin bebida, Chispa cercana cuesta 15 de magia, alcanza unos 62 puntos desde la varita y hace 5 de daño. Con bebida cuesta 30 de magia y cinco disparos de su reserva. Funciona de pie, agachada y en el aire. Cada pulsación dispara una vez.
- `R`: pulsar una vez para Encore estelar, un súper común a todas las bebidas. Paga 90 de magia al activarse. Incluye 0,9 segundos de preparación automática y un torrente de estrellas sostenido; toda la secuencia dura 3,15 segundos. Hexy es invencible y el mundo queda congelado. Ocho pulsos causan hasta 64 de daño; respetan la presentación y transformación del jefe, pero atraviesan su armadura de ataque. Soltar R o cancelar el toque no cancela un súper ya activado. La pausa detiene también la secuencia y permite reanudarla sin pagar otra vez.
- Al terminar el súper comienza una recuperación de ocho segundos a 3 de magia/s, frente a 12/s normalmente. La magia fuerte permanece bloqueada durante ese descanso. Su carga base se recupera por separado durante 40 segundos de juego activo y sigue necesitando 90 de magia. El Mod Encore de bolsillo añade una reserva con su propio reloj, sin eliminar magia ni agotamiento. Pausa, cinemática y hitstop detienen esos relojes. Las cargas y el agotamiento se conservan al cambiar de nivel.
- Cada estrella recogida vale una unidad de dinero. Recogerla directamente o con Banana Drama aplica el mismo valor; no recarga magia ni el súper. El HUD muestra la cartera más las estrellas aún no depositadas de la partida actual. Entrar a la tienda deposita las recogidas hasta ese momento; terminar o pasar de capítulo abona solo las restantes. Los puntos internos de combate no se convierten en dinero. La práctica no genera dinero.
- Carrera, carrera disparando horizontal y carrera apuntando en diagonal ascendente comparten fase de zancada y ocho dibujos por hoja. La diagonal tiene brazo y mirada elevados. `registration.json` conserva la alineación de los tres ciclos; el pelo o la varita no determinan la posición del cuerpo.
- Disparo quieta: `stand-fire` y `crouch-fire` tienen cuatro dibujos propios por postura, un ojo cerrado al apuntar y retroceso de brazo/varita. Los pies permanecen anclados. El retroceso sigue cada disparo real; entre disparos lentos conserva la pose de apuntar, en vez de alternar con reposo. Soltar disparo permite terminar la recuperación antes de descansar.
- Flecha abajo en el aire apunta abajo; abajo con izquierda o derecha apunta en diagonal. En el suelo, abajo agacha a Hexy.
- Los bunnies son opcionales. Conservan sus recompensas y cada compañero aumenta los lanzamientos del coro.

El súper por bebida queda deliberadamente para una siguiente decisión: esta entrega usa únicamente la variante general solicitada.

## Revisión de esta entrega

Fuentes, prompts exactos y capturas: `movement-and-super/`. Las ilustraciones se generaron con la herramienta imagegen integrada; Sharp prepara los atlas y mide sus coordenadas. `movement-and-super/preview.html` permite revisar las secuencias y las referencias antiguas.

El torrente del súper usa cuatro tiras de 1024 × 256 px en `sprites/effects/super-beam.webp`; no usa la cuadrícula habitual de efectos. `register-art.mjs` conserva cada figura conectada completa al recortar: una punta de varita puede cruzar el rectángulo vecino sin pertenecer al siguiente dibujo.

La corrección posterior de brazos y la ruta de campo/bosque están en `hand-consistency/`. La varita pertenece al brazo del fondo en los dibujos orientados a la derecha; el juego voltea la figura completa al girar. `hexyHandAtlas.js` tiene prioridad sobre los atlas anteriores. Para reconstruir estas hojas usar `hand-consistency/prepare-art.mjs`, ya que los scripts anteriores conservan sus fuentes históricas. `hand-consistency/review.html` permite comprobar los disparos en ambas direcciones.

El primer nivel tiene pendientes continuas definidas en `adventureTerrain.js`. Toda geometría y elemento apoyado en el suelo consulta la misma altura; los árboles cercanos no usan un factor independiente de parallax. El fondo de campo abierto y el bosque distante se mezclan al avanzar.

La base anterior está en [loot-and-clouds/README.md](loot-and-clouds/README.md): nubes móviles, tres cajas por capítulo alejadas de la salida, recompensas aleatorias, caramelos de recarga, estrellas como dinero, Original temporal, sabores potenciados, mejores ataques Banana Drama y Bubble Tape y payaso malabarista coherente con sus proyectiles. Sus escudos y profundidad se amplían en [market-and-depth/README.md](market-and-depth/README.md). Se mantienen el primer plano ocasional, los aros verdes curvos, la lata que se oscurece, el ataque fuerte básico y la recarga independiente de 40 segundos del súper.
