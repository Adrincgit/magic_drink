# Hexy: documento vivo de diseño

Actualizado: 8 de octubre de 2026.

Aquí reunimos la idea del videojuego, su lógica y las decisiones que vayamos tomando. [CAMPANA.md](CAMPANA.md) desarrolla el recorrido y los encuentros. [README.md](README.md) enlaza la implementación y sus comprobaciones.

## Estado de las ideas

- **Decidido:** petición o elección explícita del usuario; puede estar pendiente de implementación.
- **Actual:** comportamiento comprobado en el juego; no significa que sea definitivo.
- **Propuesta:** idea para conversar, sin aprobación para construirla ni establecer canon.
- **Pendiente:** alternativa o ambigüedad todavía sin resolver.

Al cambiar una decisión, actualizar su versión vigente y anotar qué sustituye. No mantener dos estructuras incompatibles como definitivas. Las ideas del videojuego no establecen por sí solas hechos de la novela ni del portal de la marca.

## Identidad

**Decidido.** Acción lateral run and gun con Hexy, magia y enemigos de temática circense. Apariencia caricaturesca anime: personajes expresivos, poses legibles, animaciones por cuadros y máquinas que se sienten construidas y pueden romperse.

El usuario busca dificultad alta. Importan el movimiento, la puntería y aprender los ataques. El daño debe sentirse mediante sonido, destellos y reacción. Los proyectiles y sus efectos guardan coherencia con las armas que los disparan.

**Propuesta.** Seguir el rastro de una gira circense que atraviesa paisajes cada vez más extraños. Cada región tiene una especialidad del espectáculo, además de clima y geografía. El cambio de escenario también cambia enemigos, música y situaciones jugables. La causa narrativa de esa transformación queda por acordar.

## Historia en exploración: cristales elementales

**Propuesta del usuario, todavía sin fijar:** unas piedras elementales que estabilizan la Tierra han sido capturadas. Se han mencionado fuego y hielo como ejemplos, no como lista cerrada. Cada cristal contiene una pequeña estrella amarilla, semejante a la de Hexy. La idea nace también del cristal que parece sostener el arlequín al cargar su especial. El arlequín del primer acto tiene una identidad de combate ligada al fuego; su vínculo narrativo con una piedra sigue por definir.

**Propuestas para desarrollar, no canon aprobado:**

- Las estrellas serían el núcleo vivo; el cristal regula cómo su energía alimenta cada región. Al sustraerlo, el clima y la vida se desequilibran, lo que explicaría la transformación gradual de los escenarios.
- La energía del fuego puede estar cautiva en la primera carpa y alimentar los números del arlequín. Tras vencerlo se rescataría la estrella, sin obligarnos todavía a decidir si el cristal se rompe, se purifica o se devuelve.
- Cada carpa podría contener una forma distinta de prisión o explotación de esa energía, en vez de repetir el mismo altar y el mismo rescate.
- Halloween puede representar un territorio donde se desordenaron el descanso, los recuerdos o las sombras. No es obligatorio convertirlo en una piedra de «Halloween», ni incluir todos los biomas típicos.
- La estrella de la varita de Hexy podría reaccionar a las cautivas. Su parentesco o procedencia común queda abierto; no afirmar que Hexy posee una piedra elemental hasta decidirlo.

**Pendiente:** número y nombres de elementos, quién capturó las piedras, qué pretende, relación con Mr. Eclipse y la bruja, y qué ocurre al liberar cada núcleo. Esta propuesta pertenece al videojuego y no establece por sí sola canon de la novela ni de la marca.

## Estructura de campaña (plan de niveles)

**Decidido en la revisión de hoy:**

- Los primeros tres recorridos de cada bloque terminan con un minijefe.
- El jefe principal tiene un nivel propio dedicado a la batalla.
- Los cuatro primeros jefes principales son arlequines identificados por uno, dos, tres y cuatro conos, respectivamente.
- Mr. Eclipse corresponde al quinto bloque descrito; la bruja, al sexto.
- Los jefes principales tienen más resistencia que los minijefes. Los arlequines tienen **tres fases**; Mr. Eclipse y la bruja, **cuatro**.
- Las grandes carpas son destinos de fin de acto y deben distinguirse entre sí.
- **Halloween debe estar presente.** Su posición final sigue abierta.

**Pendiente de aclaración.** El mensaje menciona cinco actos o niveles, pero describe seis regiones y una batalla independiente que parece ocupar el cuarto nivel. La hipótesis es seis actos con tres recorridos y una batalla principal por acto. No dar por aprobados los 24 encuentros ni modificar la selección de niveles hasta confirmarlo.

**Vocabulario propuesto:** *acto* para la región completa, *nivel* para cada recorrido o batalla y *fase* para cada etapa del jefe. Si se confirma la hipótesis, `2-3` sería el tercer recorrido del acto 2 y `2-4` su batalla principal.

El plan anterior tenía seis escenarios con tres niveles y el jefe principal al final del tercero. Esa distribución queda sustituida como dirección de diseño por la separación del jefe. No se ha realizado una migración de niveles ni del progreso guardado.

## Combate y lectura del peligro

**Decidido y aplicado a los encuentros iniciales:**

- El dash es desplazamiento: Hexy recibe daño si un proyectil toca su cuerpo durante el dash. Rodar puede hacer que un disparo alto pase por encima físicamente.
- Los ataques se anticipan con gestos y sonidos: ruedas que giran, humo, preparación del brazo o apertura de compuertas. Sin flechas ni marcas de trayectoria en el suelo.
- **Regla vigente:** no usar aros, flechas, retículas ni carriles de aviso. **Revisión expresa del usuario del 8 de octubre:** las columnas de fuego sí deben anticiparse mediante luz roja/naranja sobre la madera, como si se estuviera calentando, antes de brotar. Esta anticipación natural sustituye la prohibición anterior de cualquier señal de posición; el gesto del enemigo por sí solo no resultó suficiente. El calentamiento no causa daño.
- Los efectos del duelo usan ilustraciones animadas: estrella rosa/dorada de Hexy, bola de fuego del arlequín, notas, chispas, brasas y cartas. El polvo parte de los pies, retrocede y asciende en una curva. El fuego se disipa; nunca se comprime para regresar al suelo. [Revisión de efectos pintados](grand-harlequin/painted-effects.md).
- Los proyectiles nacen de puntos visibles y coherentes: varita, trompeta, cañón, mano o compuerta. Las ondas del suelo también necesitan un origen visible.
- Golpear blindaje produce chispas y un sonido duro. No activa el parpadeo de daño del enemigo.
- Los jefes tienen llegada, transformaciones y derrota animadas. Las máquinas pierden piezas, caen o se destruyen; no quedan inmóviles como si siguieran vivas.
- La arena permite avanzar y retroceder. La cámara respeta el mundo y permite leer amenazas altas y bajas.

**Actual en el organillo:** cuerpo central vulnerable y ruedas blindadas; notas musicales, ondas bajas y embestida anticipada por ruedas y polvo. Recibe daño mientras dispara. Su segunda fase aumenta la presión y el alcance de la embestida.

**Actual en el 1-3:** La Barcaza del Redoble, un minijefe mecánico de percusión con payasos, dos fases, tambor y caldera vulnerables y casco inferior blindado. Llega navegando al embarcadero; combina redobles dirigidos, cañonazos parabólicos y oleadas bajas. Al romperse cambia de dibujo y añade una acometida. Se desarma antes de la salida de victoria. El arlequín queda reservado para su batalla principal. Detalles en [harbor-barge/README.md](harbor-barge/README.md).

**Reafirmado para el 1-3:** el usuario pide parallax muy pronunciado, dos fases y dificultad alta. La profundidad se refuerza separando montañas, feria y barcas lejanas; el terreno y los muelles conservan su registro físico. La dificultad se apoya en combinar alturas, acelerar las descargas y obligar a retroceder ante la acometida; queda sujeta a la primera partida del usuario.

**Propuesta para los jefes principales:**

1. Presentar la acción característica y sus oportunidades de castigo.
2. Cambiar una regla del enfrentamiento —posición, mecanismo o espacio— conservando gestos reconocibles.
3. Combinar lo aprendido, con transformación visible y mayor exigencia.
4. Para Eclipse y la bruja, reservar una última forma o puesta en escena con patrones propios.

La resistencia adicional debe dar tiempo a desarrollar esas fases. Ajustar vida y duración mediante partidas, considerando el daño de Hexy y sus mejoras. Los umbrales de transición están pendientes; el 50% de los minijefes actuales no se aplica automáticamente a tres o cuatro fases.

## Magia y ultimate

**Actual:** disparo básico ilimitado, magia fuerte, apuntado en varias direcciones, salto, segundo salto, planeo, dash y escudo musical. Las bebidas especiales tienen munición; al agotarla se recupera el disparo básico.

**Encore / ultimate actual:** 90 de magia, recarga base de **80 segundos**, ocho impactos y duración de 3,15 segundos. Preparación de 0,9 segundos. Hexy retrocede suavemente al disparar y el rayo sigue la varita. El retrato de cuerpo completo entra por la izquierda, gritando con la varita levantada, entre dos bandas diagonales cortas. Al comenzar el rayo deja libre el centro.

Carga, descarga y pulsos tienen sonido mágico propio. Los FX usan una mezcla reforzada con control de picos y volumen independiente de la música. Movimiento reducido elimina el nuevo temblor y destello de pantalla. Véanse [encore-cutin/README.md](encore-cutin/README.md), [encore-cutin/audio.md](encore-cutin/audio.md) y [stage-polish/README.md](stage-polish/README.md).

**Dirección del usuario:** desarrollar mejoras de tienda, incluyendo reducir la recarga y llevar una carga adicional. Consultar el código para saber cuáles ya existen y sus valores vigentes; esta nota no fija nuevos precios ni efectos.

**Decidido para los arlequines; implementado en el primero:** ultimate ocasional en la tercera fase. Oscurece el escenario, presenta al enemigo por la derecha y permite mover a Hexy en cámara lenta durante la carga. Al disparar se recupera la velocidad normal. Se puede esquivar o responder con Encore durante la preparación para provocar un choque de poderes. La respuesta consume una carga normal; las pulsaciones repetidas de ataque empujan el choque, con indicación para teclado, mando o pantalla táctil. Ganar causa daño y deja al jefe expuesto; perder causa daño a Hexy. Se conservan la identidad circense, los efectos dibujados y la opción de movimiento reducido. [Reglas y comprobaciones del primer duelo](grand-harlequin/clash.md). Los arlequines posteriores todavía no están construidos.

**Revisión vigente, 2026-10-08:** el choque exige pulsación repetida y dura hasta **20 segundos**, con oleadas de presión del arlequín según normal/suave. Al agotarse el tiempo decide la distancia ganada hacia el oponente; sólo se resuelve antes, desde el segundo 6, si un poder alcanza al rival. Hexy aprieta los dientes en equilibrio y al perder, muestra preocupación sólo al borde de la derrota y grita heroicamente al ganar. Los retratos de torso se colocan según el espacio libre, también al saltar. Hay vibración, chispas, polvo expulsado detrás de los pies y luz del oponente sobre quien pierde. El perdedor sale despedido y cae con polvo e impacto audible. Perder resta **cuatro corazones**, incluso con escudo; ganar inflige **tres ultimates completos**, actualmente 192 de daño. Se conserva la preferencia de efectos reducidos.

En el primer arlequín se reduce tamaño y colisión un **20%** inicialmente y otro **10%** en la revisión actual (escala final 0,72), se añaden secuencias de cuatro dibujos por acción y se elimina el marco de telón frontal. Al pasar a las fases II y III cae un cofre con lata garantizada, una ayuda por fase e intento, para sostener el combate más allá del ataque básico. Esta regla se aplica al encuentro construido; los futuros jefes requieren su propio ajuste.

**Corrección de actuación, 2026-10-08:** Hexy sostiene la varita con una sola mano en los retratos del choque, coherente con su sprite de disparo. Al ganar expresa esfuerzo heroico con un grito, nunca una sonrisa triunfal; el arlequín sí puede sonreír con malicia. Si perder el choque consume todos los corazones, Hexy cae y permanece tendida, sin sentarse ni levantarse, hasta dar la partida por perdida. La reincorporación sólo corresponde a quien sobrevive.

**Derrotas e impacto, 2026-10-08:** toda derrota reproduce una caída en cámara lenta antes del resultado. Los supervivientes del choque se incorporan durante 3,4 s; el arlequín queda agotado con los brazos bajos otros 3 s. Se amplían carrera, salto y lanzamientos a ocho cuadros por acción, con tres desgastes. Columnas de fuego más altas y avisos naranjas; humo animado, partículas junto a los retratos, energía enemiga acercándose y audio de impacto más sostenido. Las cajas destruidas en el aire siguen cayendo. [Reglas, recursos y revisión](grand-harlequin/impact-polish.md).

## Rescates y progreso

- **Actual:** Magic Bunnies opcionales y aliados de combate; tres en cada uno de los tres primeros niveles. Un zepelín del segundo transporta uno: si escapa, se pierde esa oportunidad de rescate durante el recorrido. En el tercero, dos jaulas requieren subir a muelles elevados opcionales.
- **Decidido para los niveles trabajados:** colocar la tienda al comienzo; la casa detrás del jefe al final fue rechazada.
- **Actual:** banderas de retorno, recompensas y mejoras persistentes. La lógica vive en `src/components/arcade/adventure/engine` y `src/components/arcade/shared`.
- **Pendiente:** rescates de niveles futuros, recompensas por acto, reintentos de los nuevos jefes y recursos recuperados al repetir una batalla exclusiva.
- El borrado de progreso solicitado durante las pruebas fue una operación de desarrollo, no una regla de campaña.

## Imagen, profundidad y sonido

**Decidido a partir de las revisiones:**

- Potenciar fondos lejanos y capas intermedias con identidad y paleta propias para cada lugar.
- Pocos elementos cercanos bien colocados. Evitar franjas repetidas que siguen a la cámara, desenfoque exagerado y recortes flotando delante del terreno.
- Los árboles se sienten plantados: ocultar bases o raíces según el encuadre, sin elevarlas artificialmente al subir pendientes o cambiar el zoom.
- Agua y apoyos de puentes comparten referencias físicas. Animar corrientes, reflejos y espuma sin que el puente parezca deslizarse.
- Variar siluetas, composición y función del decorado, además de añadir imágenes.
- Conservar la lectura de Hexy, enemigos y proyectiles en oscuridad, nieve o tormenta.
- Ataques musicales con sonido musical; ruedas, aire, impactos y destrucción audibles para las máquinas.

**Propuesta musical:** motivos recurrentes con arreglos distintos por acto para acompañar la transformación del viaje.

## Entornos y producción

**Propuesta.** Elegir regiones por su combinación de silueta, recorrido, luz, sonido y situación jugable. Río, fuego, hielo, niebla o veneno pueden ocupar un tramo sin necesitar un acto entero.

Ruta recomendada para discutir: **campo y río → sequía y desierto → espinas al atardecer → Halloween → frío y Eclipse → tormenta estelar**. El desarrollo está en [CAMPANA.md](CAMPANA.md). Los actos secos 2 y 3 necesitan especial cuidado para no repetirse.

**Prioridad vigente:** probar y pulir 1-1, 1-2, 1-3 y la nueva batalla 1-4. La quinta entrada sigue siendo un prototipo y no representa la estructura final de actos.

**Actual en 1-4:** el usuario autorizó continuar con el jefe principal tras una caminata breve, más vida y tres fases crecientes. Se implementa el Arlequín del Gran Telón, de un cono, con 720/480 de vida, transiciones al 67% y 34%, cartas, cintas, acometidas y saltos. La batalla tiene tienda exterior y reinicio junto a Missi, sin checkpoint interior; no añade una búsqueda de rescates. Véase [grand-harlequin/README.md](grand-harlequin/README.md).

**Decidido e implementado, conexión 1-3 → 1-4:** hay que ver la llegada al circo y entrar antes de encontrarse al arlequín. Tras vencer la barcaza se recorre el último muelle hasta ver su fachada. El siguiente capítulo continúa fuera, permite cruzar la entrada y caminar dentro antes de que baje el jefe. El reintento vuelve al exterior junto a Missi. Las melodías son grabaciones, no nuevas composiciones: `canopy`/`alegre` para 1-3, `ring` para la aproximación al 1-4 y el **`arlequin_fuego.mp3` entregado por el usuario** para su batalla. [Detalle vigente](grand-harlequin/entrance.md).

**Siguiente paso propuesto:** ajustar los encuentros con partidas del usuario y confirmar la estructura de actos posteriores. La migración general de niveles y guardado será una tarea posterior.

**Incendio y pista del 1-4, 2026-10-08:** la arena se amplía a 2.840 unidades y el arlequín bloquea sus extremos con muros de fuego visibles. La expulsión del perdedor del choque es más violenta, hasta 880 unidades, con espacio de aterrizaje dentro de los límites. El **background global** comienza a incendiarse en la segunda fase y arde con mayor intensidad en la tercera; telas y gradas mantienen su encuadre, con mezcla gradual y brasas pintadas. El arlequín adquiere aura de calor desde fase II, doce poses de preparación de carrera y doce del golpe al suelo por vestuario. Las columnas miden 420 unidades y dejan fuego bajo por 3,1 segundos al disiparse; conservan el calentamiento del suelo como anticipación natural. Ambos cofres contienen **Witchy Kiwii, viento**. La carga de Hexy atrae energía hasta la punta real de su varita. Un arlequín superviviente del choque queda chamuscado. Transiciones y derrota usan fuego y humo oscuro; el confeti verde se reserva para otro enemigo. La batalla usa el **`arlequin_fuego.mp3` entregado por el usuario**, mientras la aproximación conserva `ring.ogg`. [Reglas, arte y comprobaciones](grand-harlequin/inferno.md).

**Suelo definitivo e incendio, 2026-10-08:** el usuario elige el suelo oscuro del centro de la carpa para el 1-4. Es el escenario habitual al llegar desde el 1-3, elegir el capítulo o jugar en práctica desde `/arcade`, con la perspectiva y el encuadre afinados durante la prueba. Se retira el arranque experimental por `circus-floor`; los enlaces antiguos abren el título normal y no inician ni cambian una partida. La textura de madera queda conservada como recurso histórico. El incendio sigue las telas y gradas del panorama, con resplandor, convección y brasas cayendo por delante; no hay columnas decorativas sobre el fondo.

La pista oscura debe sentirse como el centro de la carpa: personajes en la parte inferior, arquitectura de mayor escala y suelo que acompañe el movimiento de la cámara. No basta con ocultar las tablas y dejar el piso del fondo con parallax lejano. El escenario definitivo conserva la perspectiva de la textura del suelo, el zoom y las sombras de contacto; se evalúa también corriendo y saltando, no solamente en una captura quieta.

**Afinación posterior del encuadre y caos:** subir ligeramente a los personajes y reducir la escala visual del circo para apreciar la sala sin necesitar tanta separación. Desde fase II, tela ardiendo cae ocasionalmente, se puede esquivar y se consume al llegar a la pista. El aura del arlequín debe deformarse al correr y la embestida más rápida debe exigir salto y planeo para aterrizar donde ya se disipó su estela. La base de cada columna arde desde su aparición y continúa unos segundos al desaparecer la columna, sin pausas ni encendido tardío. No añadir indicadores geométricos para estos desprendimientos. Con música y volumen general al 100%, la grabación debe alcanzar su volumen original; se elimina la atenuación fija de la reproducción normal. [Implementación y nuevos dibujos](grand-harlequin/inferno.md).

**Luz, estelas y empuje del choque:** el fuego real debe iluminar el piso: proyectiles, explosiones, columnas, aura y barreras. Los muros laterales necesitan una base de llamas visible sobre el suelo. Desde fase II la estela de la carrera comienza alta y va consumiéndose hasta desaparecer, con colisión que disminuye junto a su tamaño. La descarga del ultimate debe ser vistosa también cuando Hexy no puede contrarrestarla: avance visible, punta luminosa, fuego detrás, explosión y humo al impactar; la caída mortal no debe congelar ese rayo. El choque sigue siendo difícil, con oleadas y veinte segundos como máximo, pero cada pulsación gana un 7,5% de fuerza. Ambos luchadores pueden empujar el rayo hasta el rival y resolverlo antes del límite. Se conserva un mínimo de seis segundos y pulsaciones reales, sin contar el botón sostenido.

**Derrota y sonido vigentes:** el último golpe normal provoca retroceso y caída animada, impacto en el piso, humo y extinción explosiva; la música de victoria y la recompensa esperan al final de esa secuencia de 4,9 segundos. Un golpe letal del choque conserva la postura tumbada, sin una segunda caída. Si sobrevive, el arlequín queda más oscuro y emite humo de hollín durante diez segundos desde el impacto. El choque incorpora un rugido sostenido original, retumbo, turbulencia, crujidos, resonancia de cristal y acentos de descarga e impacto, con respuesta a presión/oleadas y panorámica según la posición. Los MP3 del usuario son referencias de análisis, no muestras usadas en el juego. [Detalle y comprobaciones](grand-harlequin/finale.md).

**Control sonoro del choque:** separar el sonido de salida, el primer contacto y el forcejeo. La capa continua baja brevemente para destacar disparo e impacto; durante la lucha suenan arcos eléctricos cortos e irregulares. Al romper el equilibrio baja el tono eléctrico y, cuando el rayo alcanza al perdedor, se corta. Durante vuelo y recuperación quedan los sonidos de explosión y suelo; la animación visual todavía activa no debe reiniciar el sonido de un ultimate normal. Corregido y comprobado en la simulación real, tanto al ganar como al perder.

**Separación de ajustes visuales, 2026-10-08:** los efectos del juego deben afectar sólo al arcade. Su preferencia de imagen y sus eventos de sincronización son independientes del acabado compartido por inicio, Hexy y bebidas. Se conservan los ajustes existentes de la web. La capa monocromática respeta la intensidad real para mantener las escenas a color y sus transiciones narrativas. Verificado con controles reales, recarga, navegación y varias pestañas: 32 casos diferentes aprobados de aislamiento, óptica, ajustes, tienda, mando y audio. La compilación termina con 0 errores, 0 advertencias del comprobador y 22 sugerencias existentes.

## Decisiones abiertas

1. Cantidad de actos y niveles dentro de cada acto.
2. Posición de Halloween; recomendación actual: acto 4.
3. Extensión del hielo alrededor de Eclipse y posible explicación del frío.
4. Campo estrellado de la bruja: paisaje físico bajo la tormenta o espacio parcialmente fantástico.
5. Personalidad y especialidad de cada arlequín. Los conos están definidos; los nombres y asociaciones del documento anterior no quedan ratificados por esta revisión.

## Registro

- **2026-10-07:** inicio del documento vivo. Halloween es requisito; se recoge la separación de jefes principales y sus tres/cuatro fases. Total de encuentros pendiente de aclaración. Rutas y diseños nuevos quedan como propuestas.
- **2026-10-07, 1-3:** el usuario pide construir el tercer recorrido con un jefe nuevo que no sea arlequín y permite un enemigo adecuado al lugar. Se implementan la ribera al anochecer, la Barcaza del Redoble y el payaso buzo. Se seleccionan cuatro tipos de enemigo para este nivel; no se exige incluir todas las variantes en todos los recorridos.
- **2026-10-07, pulido de 1-3:** parallax separado entre montañas, feria y barcas, con los puentes anclados al agua física. La barcaza tiene exactamente dos fases y mayor presión en la segunda. Se corrigen el contacto del casco durante su llegada y transformación, la maza y el retroceso del cañón; se añaden amarres, estelas y hundimiento de restos. Pendiente la primera partida del usuario para valorar ritmo y dificultad.

**Revisión cinematográfica, 2026-10-08:** cámara por separación real; el arlequín salta al extremo opuesto antes de su ultimate. La carga atrae partículas rojas/negras desde los bordes, vibra y tiene rumble de terremoto. Los rayos avanzan visiblemente 0,34 s antes del contacto. Los retratos de cuerpo completo animan cabello/capa, conservan energía de lanzamiento y se colocan en el lado real de cada personaje, sobre bandas diagonales propias. Hexy siempre lanza con una mano y expresa esfuerzo heroico; la sonrisa del arlequín empieza con 60% frente a 40%. Sin rótulo del choque ni cápsula de texto: botón animado y accesible. Durante el forcejeo hay viento curvo, polvo sobre el suelo y escombros a distintas profundidades; efectos reducidos respetan la preferencia de movimiento. Reinicio fuera junto a Missi.

**Revisión posterior de actuación y fuego, 2026-10-08:** los dibujos de descarga del choque pasan a ser los sprites jugables del ultimate de ambos. Hexy aprieta los dientes hasta ir ganando, aumenta el esfuerzo al perder y sólo se preocupa cerca de la derrota. Cabello y falda más activos; luz enemiga sobre quien retrocede; polvo desde los pies hacia atrás. El choque aumenta a 15 s con oleadas y los retratos de torso buscan la esquina libre para respetar también el combate aéreo. Arlequín redibujado con menos textura y nuevas brasas balísticas y llamaradas del suelo desde fase II, con desgaste coherente por fase. [Detalle, arte y comprobaciones](grand-harlequin/fire-acting.md).
