# Magic Drink: contenido y recorrido desde la escena 6

Propuesta editorial y espacial para revisión del autor. Parte del portal en `paralax`, commit `1623f0b`. Este documento describe la siguiente iteración; la escena 6 y su continuación siguen siendo propuestas. La iteración v12 incorpora la corrección de nombre, el contenido de las escenas iniciales y los controles ilustrados; no implementa todavía el nuevo atrio.

## Qué necesita recuperar el portal

La dirección visual ya comunica un universo propio. El contenido debe explicar qué lo sostiene: Magic Drink es la bebida número uno del mundo, su consumo cambia cómo se siente lo cotidiano, Hexy es un fenómeno cultural, sus canciones y la bebida parecen potenciarse, existe una celebración mundial y WonderPop concentra todo ese universo en espacios físicos.

Los textos actuales proceden de una propuesta que priorizó el paseo visual y acortó la información hasta dejar casi solamente referencias a sorbos, ciudad y música. Hace falta devolver información concreta a cada escena. Cada título tendrá una función; su párrafo explicará un hecho o una experiencia reconocible.

## Fuentes y prioridad

1. Aclaraciones actuales del autor: bebida número uno, saludable y sin elementos dañinos dentro de la ficción, extremadamente adictiva en lo sensorial; relación con la música de Hexy; Magic Drink Day con desfiles; firma discreta; solo existe una bebida y su nombre es Magic Drink; no se usa Original como marca, variedad ni calificativo.
2. [Historia completa](../DJ_Sweet_Hex_Historia_Completa.docx): se consultaron la estructura y los pasajes pertinentes, no se declara lectura íntegra de los 48 capítulos. En 1.2 se presentan WonderPop, la sede de Tokio y otras sedes, con escenarios, tiendas y juegos. En 2.3 la lata de Ema acredita en letras diminutas a DJ Sweet Hex; Candy no comparte el entusiasmo por la bebida. En 10.2 la firma se distingue de Candy/Hexy. Las revelaciones posteriores confirman que no son nombres intercambiables.
3. [Lore público](../../.github/Magic%20Drink_lore.md): ausencia de cafeína y sustancias nocivas, bienestar, ligereza emocional, éxito global, Hexy como intérprete y DJ Sweet Hex como crédito sin identidad pública. La relación bebida/música circula entre fans como rumor no confirmado por la empresa.
4. [Lore anti-Hexy](../../.github/lore_anti_hexy_magic_drink.md): sirve para comprender el apego y las reacciones sociales. El portal comercial expresa la perspectiva pública de la marca; no explica las revelaciones de la novela.
5. Componentes antiguos: conservan contenido útil, pero también contradicciones y decisiones superadas. No se restaurarán completos por defecto.

El momento editorial propuesto sigue siendo el auge público de la marca. No se añade una fecha canónica.

## Lo que ya existía

- `IndexSeccion1.jsx`: «La bebida más popular del mundo», cero cafeína y bienestar.
- `IndexSeccion5.jsx`: Magic Drink Day como festival mundial, desfiles, globos y música.
- `IndexSeccion6.jsx`: WonderPop como centro comercial oficial, tiendas, merch y experiencias.
- `IndexSeccion7.jsx`: seis testimonios con retratos y procedencias. Recuperar su función, revisando sus voces para el universo ficticio; no presentarlos como investigación ni como opiniones verificadas de compradores reales.
- `IndexSeccion8.jsx`: ocho preguntas frecuentes. Hay que corregir la autoría musical, las menciones a varios sabores y respuestas que hablan desde fuera de la marca, como «es parte del misterio positivo de la marca».
- `IndexJourney.jsx`: ya muestra «Hexy · DJ Sweet Hex» en el reproductor, pero ese texto no distingue claramente interpretación y crédito musical.
- `/hexy`: ya contiene un bloque que explica la firma. Su protagonismo debe revisarse para que el descubrimiento siga siendo discreto.

## Voz del portal

La marca habla con seguridad y con la naturalidad de ser omnipresente. Explica su producto y sus lugares. Los visitantes aportan la experiencia cotidiana y el rumor musical. Los créditos conservan el misterio.

En el canon, saludable y extremadamente adictiva en lo sensorial conviven. La redacción no debe borrar esa particularidad ni confundirla con cafeína. Tampoco debe convertir la experiencia en una promesa idéntica para todos: la escena de Candy y Ema demuestra que existen respuestas distintas.

Las frases de fans propuestas abajo son borradores nuevos para este universo; no son citas de la novela. No se deducirán ingredientes, calorías, certificaciones, fechas ni cifras precisas de popularidad a partir de los adjetivos del lore.

## Propuesta de texto por escena

| Escena | Mensaje que debe quedar claro | Título y apoyo propuestos |
| --- | --- | --- |
| 1 · Magic Drink | Qué es y la escala de su éxito | **LA BEBIDA N.º 1 DEL MUNDO.** «Magic Drink. Sin cafeína ni ingredientes nocivos. Un sabor inconfundible y esa sensación que ha conquistado al mundo.» CTA: «Conoce Magic Drink» / «Escucha a Hexy». |
| 2 · Ciudad | Por qué se volvió parte del día a día | **ADIÓS, DÍAS ABURRIDOS.** «Más ánimo para salir, crear y disfrutar lo que te gusta. Por algo Magic Drink está en las tiendas, las mochilas y los conciertos de todo el mundo.» |
| 3 · Hexy | Quién canta y por qué música y bebida están juntas | **HEXY. LA VOZ DE MAGIC DRINK.** «Sus canciones ya se quedan en la cabeza. Los fans dicen que, con una Magic Drink, se vuelven todavía más adictivas.» Reproductor con interpretación visible y crédito musical en detalles. |
| 4 · Festival | Hay un día mundial de celebración | **MAGIC DRINK DAY.** «Desfiles, carrozas, globos gigantes y la música de Hexy. El mundo sale a celebrar su bebida favorita.» CTA: «Descubre Magic Drink Day». El concierto existente forma parte de esa celebración. |
| 5 · Jardín | Hacia dónde nos dirigimos | **EL CAMINO A WONDERPOP PLAZA.** «Estás a unos pasos del centro comercial oficial de Magic Drink.» El avance visual lleva el protagonismo. |
| 6 · Atrio | Qué hemos encontrado al entrar | **BIENVENIDO A WONDERPOP PLAZA.** «Tienda oficial, música de Hexy, juegos y colecciones de los Magic Bunnies. Todo reunido en el centro comercial de Magic Drink.» |

Estos son borradores de intención y contenido. La composición final deberá ajustar saltos de línea y versiones ES/EN sin diluir la información. El mensaje de liderazgo también debe llegar al título y descripción de `index.astro` y a las páginas de producto y Nosotros.

## Escena 6: un gran atrio con vida

Propuesta: entrar en un atrio de doble altura, coherente con la fachada y el jardín. La primera vista permite reconocer una plaza comercial con actividad, saber qué se puede hacer allí y elegir dónde seguir.

Composición:

- Fondo: galería interior profunda y acceso a otras zonas, con una claraboya y luz cálida.
- Arquitectura: columnas que prolongan la entrada, balcones superiores y locales a distintos niveles.
- Centro: medallón de estrella en el suelo y un directorio bajo; mantener una vista despejada hacia el fondo.
- Un lado: tienda oficial con Magic Drink, envases sobre estantes y expositores físicos.
- Otro lado: escaparate de Magic Bunnies, peluches, ropa, accesorios y portadas musicales.
- Visitantes: grupos opacos en varios planos, orientados hacia los locales y actividades, a escala consistente.
- Primer plano: plantas, barandillas y dos columnas próximas que permiten atravesar la entrada.
- Elementos ambientales: estandartes y estrellas colgantes con balanceo leve, reflejos suaves, pantallas con poses o campañas y pequeños gestos de algunos visitantes.

La lata flotante y el mostrador de bartender de la escena actual se sustituyen por esta composición. La identidad principal del interior será la de un complejo comercial de Magic Drink.

La transición 5→6 necesita un marco de entrada con hueco real y un interior visible al fondo. El acercamiento conserva el punto de fuga y el suelo; las columnas y jambas próximas cubren el cambio de arquitectura. Se preparará el interior completo desde el inicio para evitar una aparición tardía del fondo.

El enfoque del jardín es válido aquí: imágenes separadas en planos de Three.js, con suelo y cámara compartidos. La profundidad requiere arquitectura oculta detrás de las capas y márgenes de imagen; la cantidad de capas responderá a qué se ve y qué puede moverse. No se necesita modelar todo el edificio con geometría compleja.

## Continuación propuesta después del atrio

| Tramo | Espacio y contenido | Comportamiento |
| --- | --- | --- |
| 6 | Atrio y directorio de WonderPop | Entrada inmersiva y revelación del conjunto. |
| 7 | Galería de la tienda oficial y escaparates | Explicar Magic Drink, mostrar merch, música y actividades. Los enlaces llevan a rutas operativas; ningún escaparate simula un proceso de compra inexistente. |
| 8 | Zona de encuentro / muro de visitantes | Testimonios ligados a retratos y momentos de la plaza, con profundidad ambiental. |
| 9 | Punto de información dentro del mismo atrio | FAQ legible, enlaces de contacto y navegación para seguir explorando. |

La escena 6 abre esta segunda parte del recorrido. El cierre se decide después de que estos espacios tengan contenido suficiente; no se vuelve automáticamente a otra lata gigante.

Los testimonios y el FAQ requieren una cámara estable y tiempo de lectura. La arquitectura y las animaciones ambientales siguen presentes; los controles y textos no se desplazan con el cursor. Abrir una respuesta no hace avanzar la cámara ni descarta la lectura al siguiente pequeño movimiento de rueda. La continuidad del suelo, la iluminación y los elementos próximos debe impedir una separación rectangular entre estos tramos.

## Testimonios: experiencias concretas

Posibles voces nuevas, para revisar antes de atribuirlas a personajes:

- «La probé por curiosidad. Ahora siempre hay una en mi mochila.»
- «Con una Magic Drink, hasta el camino de vuelta se me hace menos aburrido.»
- «Puse una canción de Hexy mientras la tomaba. Acabé repitiendo el álbum.»
- «Vine por el desfile. Me quedé toda la tarde en WonderPop.»

La variedad de motivos —sabor, ánimo, música y plaza— explica el fenómeno mejor que seis versiones de «me encanta». No se atribuirán frases entusiastas a Candy: el manuscrito muestra expresamente otra relación con la bebida.

## FAQ: responder desde la voz de la marca

Preguntas prioritarias:

1. ¿Qué es Magic Drink?
2. ¿Contiene cafeína?
3. ¿Por qué se siente tan diferente?
4. ¿Por qué los fans relacionan Magic Drink con la música de Hexy?
5. ¿Quién es Hexy?
6. ¿Qué es Magic Drink Day?
7. ¿Qué puedo encontrar en WonderPop Plaza?
8. ¿Dónde encuentro Magic Drink y sus tiendas oficiales?

Las respuestas sobre producto usarán los atributos establecidos por el autor. Las respuestas sobre la música conservarán la experiencia de los fans y la falta de una explicación oficial de esa relación. La autoría musical estará en los créditos de las canciones; no se atribuye la composición a Hexy para rellenar una respuesta.

El FAQ anterior se revisará también por sus referencias a varios sabores y por las respuestas en inglés con caracteres de control. Los números precisos de sedes, reseñas y audiencia del código antiguo necesitan una decisión editorial; no se tratan como canon por el mero hecho de estar en un contador.

## DJ Sweet Hex: firma para quien mira con atención

El pasaje de la lata de Ema ofrece una referencia directa: un crédito de campaña en letras diminutas. Propuesta de dos apariciones coherentes:

- Escena 3: acceso discreto a «Créditos» del reproductor. Dentro: «Interpretación: Hexy · Música: DJ Sweet Hex».
- Galería interior: letra pequeña al pie de una portada o de un cartel musical, colocada como crédito editorial real.

El texto se compone en HTML para conservar nitidez y traducción; su descubrimiento funciona con teclado y toque, además del cursor. Puede ser pequeño y secundario sin quedar invisible ni depender exclusivamente de hover. No tendrá un gran título explicativo, una biografía inventada ni una revelación de la trama.

## Orden de la siguiente implementación

1. Reescribir el contenido de las escenas existentes y los metadatos, conservando la composición y revisando ES/EN.
2. Preparar el atrio y su entrada usando la geometría visible de la fachada como referencia.
3. Sustituir el interior actual e integrar el paso por la puerta.
4. Prolongar el recorrido con galería, testimonios y FAQ, manteniendo navegación directa y lectura tranquila.
5. Incorporar los créditos discretos y revisar el resto de páginas para que no contradigan esa autoría.
6. Comprobar continuidad visual, tamaños, scroll inverso, carga progresiva, movimiento reducido, lectura del FAQ, audio y build en cada integración relevante.

La implementación puede continuar en la misma rama `paralax`. El commit actual conserva la versión visual de referencia.
