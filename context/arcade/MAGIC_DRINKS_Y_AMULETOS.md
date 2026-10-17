# Guía de Magic Drinks y amuletos

Inventario contrastado con el código el **16 de octubre de 2026**. Describe lo que existe en el juego, como referencia para diseñar encuentros y continuar el balance. La [campaña acordada](CAMPANA.md) tiene seis actos de cinco niveles. Las nuevas asignaciones de recompensas por acto todavía deben diseñarse; esta guía no cambia precios, desbloqueos ni habilidades.

## Qué equipa Hexy

- **Disparo de varita básico:** siempre disponible, ilimitado; no es una lata. Tiene una chispa fuerte cercana que consume 17,25 de magia.
- **14 sabores de combate:** trece pueden equiparse como bebida inicial; Ribbon Raspberry se encuentra durante la aventura y activa una transformación temporal.
- **La Original:** potenciador temporal adicional, separado del catálogo de armas.
- **Amuletos y mejoras de Miso:** modifican movilidad, defensa, ataques, reserva y duración. Comprar y equipar son acciones distintas.
- La munición de las latas y la barra de magia son recursos diferentes. El disparo fuerte normalmente consume ambos.

Controles de referencia: **Z / X del mando** para ataque normal, **C / Y** para fuerte; **Q / R3** alterna modos y bebidas disponibles. R3 significa pulsar el stick derecho. **B / L3** despliega el Posavasos encantado cuando se equipa. Consultar la configuración de controles si se han reasignado botones.

## Sabores actuales

Reservas base de una lata recogida, antes de amuletos. «Fuerte» indica gasto de munición y magia por lanzamiento, no daño. Las evoluciones funcionales se explican después.

| ID | Magic Drink | Ataque normal | Ataque fuerte o habilidad | Reserva base | Gasto fuerte |
| --- | --- | --- | --- | ---: | --- |
| 0 | **Dragon Grape** | Fuego que atraviesa enemigos. | Gran llamarada penetrante. | 54 | 5 unidades + 34,5 de magia |
| 1 | **Banna Drama** | Búmeran de ida y vuelta; recoge estrellas. | Búmeran grande con golpes de salida y regreso. | 42 | 5 + 34,5 |
| 2 | **Witchy Kiwii** | Hojas mágicas. | Remolino que frena y golpea repetidamente. | 60 | 5 + 34,5 |
| 3 | **Bubble Tape** | Burbujas que capturan proyectiles. | Burbujas grandes que también atrapan enemigos básicos; grandes, maquinaria, minijefes y jefes resisten la captura, pero reciben el daño permitido. | 32 | 5 + 34,5 |
| 4 | **Sparkle Soda** | Estrellas mágicas. | Abanico de cinco estrellas que buscan blancos en la dirección de apuntado. | 45 | 5 + 34,5 |
| 5 | **Aqua Berry** | Disparos de agua para atacar y apagar fuego. | Chorro orientable de 1,85 s, conectado a la varita; cae en arco y apaga por contacto sostenido. | 84 | 5 + 34,5 |
| 6 | **Jelly Cherry** | Cerezas de gelatina que rebotan. | Trampolín real de 6 s y tres impulsos; levanta básicos, incluidos zombis, y respeta a fuertes y jefes. Mantener fuerte permite colocarlo. | 48 | 5 + 34,5 |
| 7 | **Prism Peach** | Agujas rápidas que reflejan en terreno. | Prisma colocado según la mira; divide tiros que lo atraviesan en tres ramas. | 56 | 5 + 28 |
| 8 | **Echo Melon** | Onda que atraviesa enemigos y pierde fuerza con la distancia. | Activa ecos que siguen y copian ataques de Hexy. Otra pulsación los retira. | 48 | Activación: 5 + 34,5; cada eco consume además munición de Echo al copiar |
| 9 | **Volt Lychee** | Rayo sostenido con consumo al iniciar y cada 0,22 s. | Descarga instantánea larga con ramificaciones. | 42 | 7 + 42 |
| 10 | **Honey Mango** | Gotas que dejan zonas de miel para ralentizar enemigos básicos, incluidos zombis. | Panal con lluvia de gotas; mantener fuerte permite colocarlo y ajustar altura. Fuertes y jefes resisten la ralentización. | 48 | 5 + 34,5 |
| 11 | **Orbit Orange** | Proyectiles con movimiento orbital. | Satélites que protegen y se consumen al golpear o bloquear; desde II pueden lanzarse. | 40 | 5 + 34,5 al invocarlos |
| 12 | **Ribbon Raspberry** | Danza de cinta con combos, agarres, levantamientos y remates. | Acciones de cinta según secuencia y dirección. | Transformación de 10 s; no se gestiona como una lata de 44 tiros | Fuerte: 34,5 de magia; no gasta munición |
| 13 | **Popcorn Panic** | Descarga de siete dulces a corta distancia: alcance 240. | Los mismos siete dulces, mismo daño, alcance 480. | 24 | 1 + 45 |

Aunque algunos objetos de `SPECIALS` conservan costes antiguos en sus declaraciones, la función que construye el catálogo los normaliza. Los costes vigentes son los de la tabla, obtenidos del catálogo final; no copiar valores de revisiones anteriores.

### Reglas de munición y maestría

Los controles de enemigos se consultan en la [clasificación común de básicos, fuertes, minijefes y jefes](global-combat-polish/README.md). La absorción ya iniciada de una bruja mantiene su protección hasta que termina o se derrota a la bruja. Miel, agua, fuego y Jelly tienen respuestas visuales y sonoras de contacto propias.

- Una lata del mismo sabor, o una lata potenciada, activa el nivel de recogida II. Las compras de maestría se aplican también al sabor recogido, aunque no se lleve como bebida inicial.
- Los sabores iniciales 0–5 comienzan con **2× / 2,5× / 3×** reserva en I / II / III.
- Los iniciales 6–11 mantienen **2×** reserva en sus tres niveles; las mejoras se concentran en sus funciones. Popcorn tiene un nivel inicial de **48 descargas**, el doble de su lata base.
- **Funda de reserva** añade 15 / 25 / 35 % a la capacidad; equiparla no rellena la munición gastada. Los valores se redondean al calcular la capacidad.
- Al vaciarse una lata se recupera el disparo básico. La recarga de munición repone hasta el 55 % de la capacidad, sin superar el máximo.
- Dos espacios de Bebidas permiten llevar dos latas, con reservas independientes. Una tercera bebida recogida sustituye la activa si ambos bolsillos están ocupados; recoger el mismo sabor puede potenciarlo.

### Evoluciones funcionales

| Sabor | I | II | III |
| --- | --- | --- | --- |
| Jelly Cherry | Un trampolín de 6 s, tres saltos; las cerezas ya rebotan sobre sus lados y parte superior. | Dos trampolines simultáneos. | Mantiene dos; las cerezas salen un 25 % más rápido hacia arriba. |
| Prism Peach | Un prisma, 5,5 s. | Dos prismas, 7 s. | Tres prismas, 7 s. |
| Echo Melon | Un eco al 50 % del daño copiado. | Dos ecos al 32 % cada uno. | Tres ecos al 25 % cada uno, con retrasos escalonados. |
| Volt Lychee | Daño sostenido desde 0,34 s; alcance normal 315 y fuerte 850. | Comienza a dañar desde 0,28 s. | Alcances 650 / 1150; encadena todo el grupo cercano conectado, con límites de distancia y paredes. |
| Honey Mango | Seis gotas durante 2,65 s. | Ocho gotas durante 3,3 s. | Diez gotas menores, panal un 12 % más ancho y daño total parecido a II. |
| Orbit Orange | Tres satélites durante 4,2 s. | Duran 5 s; otro fuerte lanza los supervivientes según la mira. | Cuatro satélites menores, manteniendo el daño total de 12. |

Prism conserva el **55 % de daño por rama**, admite como máximo tres visitas a prismas distintos y evita ciclos. Echo no es una repetición fija gratuita de los últimos seis tiros: los ecos actuales siguen a Hexy, copian sus nuevas descargas y gastan munición de Echo, también si la lata está en el bolsillo de reserva. Su permanencia depende de disponer de ese combustible.

Volt III no tiene el antiguo límite de tres/cinco enemigos: propaga por el grupo local conectado, respetando paredes. Los enemigos básicos reaccionan a la electrocución y su derrota puede quedar carbonizada. La maestría no convierte el rayo en un ataque de alcance global.

### Ribbon Raspberry

Se encuentra en la aventura; no se vende ni equipa como sabor inicial. La mejora **Pétalos persistentes** pertenece a Habilidades. La bebida anterior queda guardada durante la danza y se restaura al terminar.

- Sin mejora: **10 s** de transformación.
- Mejora I: **13 s**; danza y remates básicos.
- II: **16 s**; giros más rápidos y un enlace aéreo.
- III: **18 s**; dos enlaces aéreos, amarre de grupo y dos dash aéreos.
- IV: **20 s**; remates con lanzamiento de varita y recogida con la pierna, coreografía más rápida.

Las combinaciones concretas se consultan en la guía de combos del taller. No tratar el ID histórico `starter-12` como una lata inicial: se convierte a `ribbon-duration` al leer equipo antiguo.

### Popcorn Panic

Normal y fuerte conservan siete perdigones físicos con el mismo daño; el fuerte duplica alcance, intercepta proyectiles hostiles y añade retroceso. Hay flash de **0,12 / 0,17 s** según normal/fuerte. En el aire aplica un impulso calculado para que Hexy descienda después de que desaparezca su propia ráfaga. El remate fuerte puede desmembrar al zombi calabaza sin generar fantasma.

### La Original

Potenciador encontrado como botín. Dura **8 s** sin mejora; **Sorbo de eternidad** permite 10 / 12 / 14 / 15 s. Aumenta la cadencia por un factor 1,7, el movimiento por 1,15 y permite disparar sin gastar munición durante el efecto. Protege frente al daño normal; las caídas y reglas especiales de derrota conservan su tratamiento. Se identifica por la actuación de beber y la estela de arcoíris. No es un sabor inicial de tienda.

## Equipamiento y espacios

| Familia | Espacios iniciales | Máximo | Contenido |
| --- | ---: | ---: | --- |
| Bebidas | 1 | 3 | Sabores iniciales y Funda de reserva; como máximo dos sabores iniciales a la vez. |
| Botas | 1 | 3 | Movilidad, saltos, picados y señuelo. |
| Sombrero | 1 | 3 | Escudo, protección superior y réplica. |
| Habilidades | 1 | 5 | Varita, Encore, Original y duración de Ribbon. |

Las ampliaciones son independientes. Añadir el segundo espacio de una familia cuesta 60 estrellas; el tercero 140. Habilidades permite un cuarto por 220 y un quinto por 300. Los rangos técnicos mínimos para esas ampliaciones son 0 / 2 / 3 / 4, respectivamente.

El rango técnico (`adventureUnlocked`) cuenta tramos desbloqueados, **no el número de acto**. Por ejemplo, el rango 2 del juego actual corresponde a 1-3. El plan de treinta niveles todavía requiere diseñar el reparto futuro de desbloqueos; renumerar Halloween no cambia los requisitos existentes.

El antiguo amuleto **Doble fondo** ya no se ofrece en el taller: las partidas que lo poseen se convierten a un segundo espacio de Bebidas y Funda de reserva. Se conserva su ID sólo por compatibilidad. Tampoco se aplica un límite global de cinco amuletos; los límites vigentes son los de cada familia.

## Amuletos y mejoras que tenemos

Los porcentajes siguientes son los efectos actuales por nivel. La tabla posterior recoge los precios y requisitos exactos de todo el catálogo visible.

| Amuleto / mejora | Familia | Efecto por nivel |
| --- | --- | --- |
| **Alas de chispa** | Habilidades | Cadencia +20 / 30 / 40 %. |
| **Estrella expansiva** | Habilidades | Tamaño del proyectil normal +30 / 40 / 50 %. |
| **Gran floritura** | Habilidades | Tamaño del proyectil fuerte +30 / 40 / 50 %. |
| **Encore de bolsillo** | Habilidades | Segunda carga de súper; recarga de reserva 40 / 36 / 32 s. Cada lanzamiento necesita 90 de magia. |
| **Burbuja de gala** | Sombrero | Cada objeto de burbuja llena los tres espacios de escudo; protección posterior al impacto de 0,6 / 0,9 / 1,2 s. |
| **Picado de cometa** | Botas | I: abajo + dash en el aire permite picado vertical. II: también diagonales abajo. No da invulnerabilidad. |
| **Doble impulso** | Botas | Dos dash por vuelo, separados por 0,4 / 0,34 s; se recuperan en suelo real. |
| **Ala protectora** | Sombrero | I: arriba + escudo protege por encima. II: admite diagonales. Mantiene coste y lados expuestos. |
| **Funda de reserva** | Bebidas | Capacidad +15 / 25 / 35 % sin rellenar lo gastado al equiparla. |
| **Paso ligero** | Botas | Velocidad de desplazamiento +6 / 10 / 14 %. |
| **Botitas de resorte** | Botas | Un nivel: pisar enemigos pequeños impulsa a Hexy y recupera saltos aéreos; pinchos y maquinaria siguen siendo peligrosos. |
| **Posavasos encantado** | Botas | Un nivel: plataforma aérea de 1,6 s bajo Hexy; se agrieta antes de desaparecer. Requiere suelo real para volver a usarse. |
| **Sorbo de eternidad** | Habilidades | Original dura 10 / 12 / 14 / 15 s. |
| **Compás sereno** | Sombrero | Gasto del escudo sostenido y de impactos bloqueados −5 / 10 / 15 / 20 %. |
| **Paso de confeti** | Botas | Señuelo al rodar de 1,6 / 1,9 / 2,2 s; recarga 4,8 / 4,2 / 3,6 s. Se rompe al recibir un impacto. |
| **Campanilla de réplica** | Sombrero | Levantar escudo 130 / 160 / 190 ms antes del impacto devuelve un proyectil móvil compatible; recarga 0,65 s. No refleja llamas persistentes ni explosiones. |
| **Ribbon · Pétalos persistentes** | Habilidades | Duración y acciones de Ribbon en cuatro niveles; ver su apartado. |

### Combinaciones útiles como guía de diseño

- **Defensa y rescates:** Bubble Tape, Ala protectora y Campanilla de réplica.
- **Grupos de enemigos:** Volt III y una segunda bebida de control, como Honey Mango.
- **Plataformas y rutas altas:** Jelly Cherry, Botitas de resorte o Posavasos encantado. Los niveles deben conservar una ruta viable sin exigir una compra opcional no anunciada.
- **Destrucción cercana:** Popcorn Panic con Funda de reserva; sus impulsos aéreos pueden abrir rutas de movimiento.
- **Preparar una posición:** Prism Peach con otra bebida para aprovechar sus divisiones.
- **Más proyectiles a cambio de combustible:** Echo Melon en el bolsillo secundario, vigilando su munición.

Son orientaciones para diseñar encuentros y probar combinaciones, no una garantía de balance ni cambios aprobados de las reglas de cada arma.

## Fuentes y mantenimiento

El catálogo vivo está en `src/components/arcade/adventure/engine/adventureMods.js`; las reservas en `adventureAmmo.js`; los costes finales en `adventureMagic.js`. `adventureCreativeDrinks.js`, `adventureExtraDrinks.js`, `adventureEcho.js`, `adventureVolt.js`, `adventureRibbonState.js`, `adventurePopcorn.js` y `adventureLoot.js` gobiernan las funciones descritas. Las transacciones y migraciones viven en `src/components/arcade/shared/arcadeStore.js`.

Al cambiar una bebida o amuleto, actualizar esta guía y verificar la acción real. Las notas de `drink-roster/` y `workshop-evolution/` son antecedentes: sus antiguos valores de Echo, Jelly y Volt no sustituyen al motor actual. Las reglas permanentes de emisiones desde la varita, efectos dibujados, sonido por acción e intercepción de proyectiles fuertes siguen vigentes.

## Precios y desbloqueos del catálogo visible

Instantánea del catálogo final de Miso, obtenida de las funciones de precio y nivel. Precios en estrellas para comprar I y subir a II / III / IV, respectivamente. La mejora posterior también exige el rango de progreso correspondiente. El requisito de compra se expresa como rango técnico inicial, no como acto.

| Nombre | ID | Familia | Precios I / II / III / IV | Rango de compra |
| --- | --- | --- | --- | ---: |
| Alas de chispa | `quick-cast` | Habilidades | 60 / 150 / 240 | 0 |
| Encore de bolsillo | `encore-pocket` | Habilidades | 100 / 250 / 400 | 2 |
| Estrella expansiva | `bright-spark` | Habilidades | 80 / 200 / 320 | 0 |
| Gran floritura | `grand-flourish` | Habilidades | 95 / 238 / 380 | 1 |
| Burbuja de gala | `full-bubble` | Sombrero | 100 / 250 / 400 | 2 |
| Dragon Grape | `starter-0` | Bebidas | 80 / 200 / 320 | 0 |
| Banna Drama | `starter-1` | Bebidas | 85 / 213 / 340 | 1 |
| Witchy Kiwii | `starter-2` | Bebidas | 90 / 225 / 360 | 2 |
| Bubble Tape | `starter-3` | Bebidas | 100 / 250 / 400 | 3 |
| Sparkle Soda | `starter-4` | Bebidas | 105 / 263 / 420 | 4 |
| Aqua Berry | `starter-5` | Bebidas | 90 / 225 / 360 | 3 |
| Jelly Cherry | `starter-6` | Bebidas | 90 / 225 / 360 | 1 |
| Prism Peach | `starter-7` | Bebidas | 100 / 250 / 400 | 2 |
| Echo Melon | `starter-8` | Bebidas | 110 / 275 / 440 | 3 |
| Volt Lychee | `starter-9` | Bebidas | 110 / 275 / 440 | 2 |
| Honey Mango | `starter-10` | Bebidas | 95 / 238 / 380 | 1 |
| Orbit Orange | `starter-11` | Bebidas | 120 / 300 / 480 | 3 |
| Popcorn Panic | `starter-13` | Bebidas | 125 | 1 |
| Ribbon · Pétalos persistentes | `ribbon-duration` | Habilidades | 95 / 238 / 380 / 570 | 2 |
| Picado de cometa | `comet-dive` | Botas | 110 / 275 | 1 |
| Doble impulso | `double-dash` | Botas | 135 / 338 | 2 |
| Ala protectora | `sky-guard` | Sombrero | 95 / 238 | 1 |
| Funda de reserva | `reserve-sleeve` | Bebidas | 85 / 213 / 340 | 0 |
| Paso ligero | `swift-step` | Botas | 70 / 175 / 280 | 0 |
| Botitas de resorte | `spring-boots` | Botas | 100 | 1 |
| Posavasos encantado | `enchanted-coaster` | Botas | 135 | 2 |
| Sorbo de eternidad | `lasting-magic` | Habilidades | 50 / 125 / 200 / 300 | 0 |
| Compás sereno | `gentle-guard` | Sombrero | 50 / 125 / 200 / 300 | 1 |
| Paso de confeti | `confetti-step` | Botas | 105 / 263 / 420 | 1 |
| Campanilla de réplica | `reply-bell` | Sombrero | 120 / 300 / 480 | 2 |
