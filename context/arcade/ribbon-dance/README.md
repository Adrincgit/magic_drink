# Ribbon Raspberry — transformación de danza

Revisión del 11 de octubre de 2026. Sustituye el comportamiento de bebida equipable descrito en `../ribbon-action/README.md`.

Ribbon se encuentra dentro de los contenedores del recorrido. Hexy bebe la lata rosa al recogerla; los **10 segundos activos** empiezan después del sorbo. Conserva su bebida anterior, su nivel, capacidad y munición, además de la segunda lata. Al terminar vuelve a ese equipo. Cambiar de capítulo, morir o reintentar no conserva la transformación. Original y Ribbon se sustituyen entre sí.

Los ataques de cinta consumen tiempo de transformación, sin descontar munición ni magia. La guardia mantiene su consumo normal de magia. El cronómetro aparece en el HUD y en el patio de pruebas. No se puede equipar Ribbon como lata inicial ni guardarla en el segundo bolsillo.

## Controles

| Acción | Xbox | Teclado |
| --- | --- | --- |
| Latigazo, un golpe por pulsación | X | Z |
| Lanzar al enemigo | X, Y | Z, C |
| Saltar y perseguir | A | Espacio |
| Amarrar en el aire y rematar contra el suelo | Y en el aire | C en el aire |
| Giro y amarre en tierra | X, X, Y | Z, Z, C |
| Completar amarre y remate | X, X, Y, Y | Z, Z, C, C |
| Empujar / rematar abajo | dirección + Y / abajo + Y | dirección + C / abajo + C |
| Tirón cargado | mantener X 0,5 s y soltar | mantener Z y soltar |
| Pirueta cargada que aparta a ambos lados | mantener Y 0,5 s y soltar | mantener C y soltar |
| Dash giratorio | B | X |
| Girar la cinta como guardia | LT | V |

Mantener X inicia un solo golpe y prepara el tirón, nunca encadena golpes automáticamente. Y breve se ejecuta al soltar; mantenerlo prepara la pirueta. Guardia, daño o dash cancelan la carga. Una ventana breve conserva pulsaciones durante la recuperación y la pausa de impacto.

Las cadenas **XYXY**, **YXYX**, **XXYY**, **YYXX** culminan en danza ascendente, varita viajera, recogida y salida en espiral. Su historial sólo registra ataques que realmente se ejecutan, caduca al interrumpir la danza y aparece en la práctica. El botón «Combos» muestra instrucciones Xbox o teclado; elegir una fila reproduce esa secuencia con el motor real. El área conserva 16:9 al abrir la guía.

El salto empieza con una pirueta de cuatro dibujos, incluida vista de espalda, y cinta visible. Durante sus primeros 0,48 s, si no se interrumpe con otra acción, devuelve proyectiles compatibles y hace un contacto leve por enemigo. La cinta del salto no otorga inmunidad al fuego del terreno ni a caídas. Ese daño leve permite completar el remate de un payaso normal.

El dash usa ocho dibujos de giro corporal, atraviesa enemigos y aplica **un golpe de 2 puntos por enemigo y por dash**. Refleja proyectiles móviles compatibles. La protección contra daño termina con el dash; las caídas siguen siendo peligrosas. La guardia también devuelve proyectiles desde cualquier dirección alrededor de la cinta, pero no devuelve llamaradas continuas, explosiones ni fuego del terreno. Los proyectiles devueltos pueden golpear al atacante y tienen un efecto rosa.

El lanzamiento, amarre y remate afectan a payasos pequeños. La maquinaria y los jefes reciben daño convencional. El impacto contra el suelo empuja a básicos próximos sin multiplicar el daño ni encadenar nuevos impactos. Los amarres siguen contactos de la cinta, tienen duración finita y límites de objetivos.

## Mejoras

- Sólo **Ribbon · Pétalos persistentes**, categoría Habilidades: I = 13 s; II = 16 s y un enlace aéreo; III = 18 s, enlaces X,X,Y con hasta tres enemigos y segundo dash aéreo; IV = 20 s, lanzamiento de varita en YXYX y recogida con la pierna en XXYY. La recogida arrastra al objetivo hacia Hexy durante el remate y respeta paredes y bordes. Velocidades: 1 / 1,28 / 1,48 / 1,58. Los enlaces aéreos hacen 0,3 y tienen límite; no sostienen indefinidamente al enemigo.
- La bebida no está a la venta ni en Bebidas. Las partidas con `starter-12` migran al único mod `ribbon-duration`, conservando el nivel mayor y la selección sin cobrar estrellas. No se otorga una lata inicial.
- Las pulsaciones de ataque, fuerte, salto y dash durante la pausa de impacto quedan pendientes hasta que continúa la simulación.

## Arte y reproducción

Generado con **ImageGen integrado**, con fondo transparente y referencias del personaje existente. Los PNG originales conservan el alfa. El empaquetado con Sharp sólo recorta celdas, registra pies y punta de varita, cambia resolución y comprime a WebP.

- [Prompts exactos](prompts.json).
- [Prompt de las 16 poses nuevas](mastery-prompt.json) y [ajuste de espaciado](mastery-spacing-prompt.json), ambos con ImageGen integrado.
- [Atlas de maestría](../../../public/arcade/sprites/hexy/ribbon-mastery.webp): lanzamiento/recuperación de varita, recogida con pierna, giro aéreo y carga/remate. Fuente: [mastery-spaced.png](source/mastery-spaced.png). Reproducir con `node scripts/arcade/pack-ribbon-mastery.mjs`.
- [Fuente de Hexy](source/hexy.png), [fuente del payaso](source/clown.png), [fuente de efectos](source/effects.png).
- [Hexy: 20 poses](../../../public/arcade/sprites/hexy/ribbon-dance.webp): lanzamiento, voltereta, amarre aéreo, guardia y sorbo.
- [Payaso rojo: 12 reacciones](../../../public/arcade/sprites/enemies/clown-ribbon.webp): ascenso, amarre, caída e impacto. Se conservan los dibujos propios de otras familias y maquinaria.
- [Cinta y pétalos: 8 efectos](../../../public/arcade/sprites/effects/ribbon-dance.webp). La espiral se dibuja delante y detrás de Hexy; los pétalos permanecen en coordenadas del mundo cuando ella se mueve.
- Para reproducir los atlas: `node scripts/arcade/pack-ribbon-dance.mjs` desde la raíz del proyecto.

Ribbon tiene aura y pétalos persistentes incluso quieta, pétalos en los bordes de pantalla y una presentación al beber. Original comparte la celebración inicial con su paleta arcoíris. El centro se mantiene legible y se respeta movimiento reducido; no se añaden sacudidas ni destellos rápidos.

## Verificación

- 91 pruebas de lógica: transformación, reserva/restauración, migración al mod único, X sin repetición, cargas/cancelaciones, cuatro cadenas en niveles I y IV, recogida con arrastre, salto protector, combo aéreo con payaso de vida normal, límites de amarre, dash, resto de bebidas, equipamiento y mods tácticos.
- 3 pruebas de navegador: render y grabación con entradas Xbox simuladas, tienda en 1920/2560 px, compras y equipamiento independientes de la prueba gratuita.
- `npm run build`: Astro check y compilación correctos, 0 errores / 0 advertencias de Astro y 23 hints.
- [Grabación de la simulación](../../../tests/artifacts/arcade/ribbon-transformation/ribbon-dance.webm).
- [Capturas por acción](../../../tests/artifacts/arcade/ribbon-transformation/).
- Total: **94 pruebas aprobadas**. Registro en `tests/artifacts/arcade/ribbon-transformation/validation.log`; compilación en `build.log` del mismo directorio.
- Se revisaron capturas y secuencias de sorbo, lanzamiento, amarre, remate, salto giratorio, guardia, lanzamiento de varita y recogida, además de la tienda y su guía. El atlas y los puntos de varita están registrados; la escala de las reacciones mantiene la del payaso caminando.

La prueba antigua `hexy-loot-clouds.spec.js` «every level has fewer boxes…» todavía presupone cinco bebidas y exactamente tres cajas por nivel; falla contra el recorrido ya existente. Se dejó intacta. Las otras 14 pruebas de ese archivo pasaron en la revisión ampliada. No se utilizó un mando físico; las pruebas de Xbox pasan por el mapeo real del juego con botones estándar simulados.
