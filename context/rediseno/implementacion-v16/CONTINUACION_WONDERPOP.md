# WonderPop: continuación y cierre de la landing

Propuesta del 20 de septiembre de 2026, sobre la rama `paralax`. Las correcciones de v16 están implementadas; las escenas 7–9 y el mapa de este documento son la siguiente etapa propuesta. Continúa y concreta `../CONTENIDO_Y_RECORRIDO_DESDE_ESCENA_6.md`.

## Dirección recomendada

Un paseo continuo hacia delante, con pequeños cambios de dirección que permitan mirar escaparates. Un mapa ilustrado opcional, abierto desde un pequeño directorio de la plaza, sirve para ir directamente a una parada. No hace falta elegir un camino para continuar con el scroll.

El mapa debe enseñar «Estás aquí», los nombres de las zonas y un botón de cierre; se maneja con ratón, toque y teclado. Sus destinos del recorrido desplazan la misma cámara y actualizan el mismo contador. Los enlaces a páginas independientes se distinguen con su nombre y una flecha. Solo mostrará destinos construidos, sin prometer locales interactivos todavía inexistentes.

## Recorrido de nueve escenas

Las escenas 1–5 presentan Magic Drink, la ciudad, Hexy, Magic Drink Day y el acceso a WonderPop. Desde la entrada:

| Escena | Lugar y función | Cámara e interacción |
| --- | --- | --- |
| 6 · Atrio | Reconocer el centro comercial y orientarse. Mantener el gran suelo de estrella, las galerías y la bienvenida. | Cruzar la puerta; acercamiento suave al directorio bajo. Acceso opcional al mapa. |
| 7 · Galería de escaparates | Dar motivos concretos para visitar la plaza: bebida, música, colecciones de Magic Bunnies y actividades. | Avanzar entre columnas y girar ligeramente hacia los escaparates. Una vitrina por tema, con pocos objetos y un enlace a su página. |
| 8 · Muro de visitantes | Mostrar cómo viven este universo sus habitantes: sabor, canciones, festival y encuentros. | Llegar a una zona de descanso o fotomatón. Cámara estable durante la lectura; cuatro historias breves en marcos integrados en la pared. |
| 9 · Punto de información y despedida | Resolver las preguntas que quedan y señalar que el paseo ha terminado. | Mostrador de información; FAQ accesible. Última vista abierta del atrio y directorio final hacia las páginas dedicadas. El contador llega a 09 / 09. |

La escena 9 tiene dos momentos dentro del mismo espacio: consultar y elegir dónde seguir. La FAQ no debe ocupar el último encuadre por completo. Al final, la cámara se detiene, desaparece la indicación de seguir bajando y aparece **«¿Dónde seguimos?»**, con tres destinos principales: **Magic Drink**, **Hexy** y **Nosotros**. WonderPop Plaza, contacto y volver al inicio quedan como accesos secundarios.

Así, el directorio que actualmente cierra la escena 6 podrá convertirse en orientación de entrada. La despedida definitiva se trasladará al punto de información cuando estén listas las tres escenas restantes.

## Profundidad y movimiento del interior

Preparar los escenarios como conjuntos de capas del mismo lugar, con punto de fuga e iluminación compartidos:

- Fondo reconstruido completo: galería lejana, claraboya y locales al fondo.
- Arquitectura intermedia: balcones, columnas, escaparates y suelo continuo.
- Visitantes en grupos separados, con pies anclados al suelo y sombras de contacto.
- Primer plano: plantas, marcos y columnas que pasan cerca de la cámara, con desenfoque moderado.
- Elementos ambientales: hojas, carteles, reflejos y pequeños ciclos de personajes. Los ciclos continúan al detener el scroll; las poses dibujadas pueden cambiar a una cadencia más baja sin entrecortar la cámara.

El objetivo inicial es disponer de unos 6–8 planos útiles por zona, no multiplicar imágenes sin efecto visible. Separar personajes y arquitectura requiere reconstruir lo que queda detrás para que no aparezcan duplicados ni huecos al mover la cámara. Conservar una sola superficie visible de suelo por cada transición.

Se puede prolongar el sistema de planos de Three.js ya utilizado en el jardín. HTML sigue llevando los textos, enlaces, mapa y FAQ. Preparar las imágenes de la siguiente zona antes de mostrarla y detener los efectos fuera de pantalla; no mantener todos los mundos renderizando a la vez.

## Testimonios: valoración de las imágenes existentes

Se revisaron visualmente las cinco imágenes `Carlos.webp`, `Jenny.webp`, `Jose.webp`, `Maria.webp` y `Oliver.webp` desde el historial de Git. En el árbol de trabajo actual están eliminadas; se dejaron así. Las copias de revisión están únicamente en `capturas/referencias/`, ignoradas por Git.

Son retratos fotográficos con ropa formal y fondo neutro. No los pondría grandes ni recortados como personajes dentro del escenario: su estilo y vestuario recuerdan a una página corporativa.

Dos usos posibles:

1. **Aprovechar las imágenes actuales:** fotos pequeñas, impresas dentro de un mural ilustrado o un fotomatón. Marcos, notas manuscritas, entradas del festival y pegatinas de Hexy conectan el conjunto con la plaza. La fotografía se entiende como un objeto de la escena.
2. **Opción recomendada para la estética actual:** versiones ilustradas coherentes con los visitantes de WonderPop, en contextos cotidianos y con ropa apropiada para la plaza. Conservar las identidades que interese mantener; no basta con aplicar un filtro al retrato corporativo.

Antes de publicarlas como testimonios hay que decidir las voces y sus frases. Si pertenecen a personajes del universo, presentarlas como **«Voces de WonderPop»** o historias de visitantes. No reutilizar el contenido heredado de agencias y resultados de marketing que todavía existe en `translationsIndex.js`, ni presentar retratos de IA como compradores verificados.

## FAQ propuesta

Ocho preguntas cortas, con una respuesta abierta a la vez y enlaces cuando la explicación pertenece a otra página:

1. ¿Qué es Magic Drink?
2. ¿Contiene cafeína?
3. ¿Por qué los fans dicen que cambia cómo se siente lo cotidiano?
4. ¿Qué relación tiene con la música de Hexy?
5. ¿Quién es Hexy?
6. ¿Qué es Magic Drink Day?
7. ¿Qué puedo encontrar en WonderPop Plaza?
8. ¿Dónde puedo conocer más sobre Magic Drink y sus tiendas?

Usar únicamente atributos del producto y hechos establecidos por el autor. Mantener la relación bebida/música como experiencia de los fans. La firma discreta sigue siendo **DJ Sweet Hex**, sin el rótulo «firma musical».

Al abrir una respuesta, el texto conserva espacio de lectura sin hacer avanzar la cámara. En móvil, el panel debe poder leerse y cerrarse sin quedar bajo el reproductor. Con movimiento reducido, los espacios se presentan como secciones normales.

## Páginas dedicadas

Mantendría la calidad del arte y los componentes del portal, con una entrada animada propia en cada página y contenido más directo después:

- **Magic Drink (`/bebidas`):** la lata como protagonista, atributos concretos y respuestas del producto.
- **Hexy (`/hexy`):** canciones, portadas, reproducción y su historia. La música determina las interacciones.
- **Nosotros (`/nosotros`):** historia de la marca, su mundo y los hitos que sí estén establecidos.
- **WonderPop (`/wonderpop-plaza`):** mapa ampliado, locales, colecciones y actividades.

No es necesario repetir el recorrido completo al abrir cada destino. Uno o dos momentos de profundidad bien construidos permiten conservar la identidad y dar protagonismo a la información.

## Siguiente entrega concreta

Construir primero la galería de la escena 7 y separar las capas del interior. Después, preparar cuatro historias con sus retratos y construir el mural. Por último, integrar la FAQ y trasladar el cierre a la escena 9. El mapa se conecta conforme existan esas zonas; el contador se amplía con ellas.
