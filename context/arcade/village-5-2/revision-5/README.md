# Villa Lumbre · revisión 5

15 de octubre de 2026. Corrección de los cortes del parallax y de la entrada frontal señalados por el usuario; ampliación de brujas, calabazas voladoras y rescates. Se conserva el recorrido de 23.240 unidades. Ningún enemigo muestra barra de salud.

## Escenario corregido

El huerto anterior incluía paisaje violeta pintado dentro de su propia imagen: al mover esa capa sobre otras, aparecía cielo por debajo de las colinas. También se prolongaba una textura rectangular bajo las capas, y la primera panorámica urbana entraba con un borde vertical. La revisión anterior no había detectado estos defectos visuales.

Se sustituyen esas piezas por un terraplén de tierra sin cielo incorporado, un camino campestre nuevo y una transición pintada hacia los adoquines. Bajo el camino hay una base de tierra opaca con borde irregular; los texeles parcialmente transparentes del arte ya no revelan el fondo. Las casas intermedias entran individualmente, con densidad creciente. Montañas, bosque, pueblo distante, terraplén, tejados intermedios y primer plano mantienen velocidades distintas y alturas estables al cambiar de dirección o atravesar pendientes.

La nueva puerta está dibujada en perspectiva oblicua: poste cercano grande, poste lejano pequeño y hojas abiertas a distintas profundidades. El poste cercano pasa delante de los personajes. La cerca continúa hacia el primer plano y hacia el fondo, reutilizando el trazado de la reja del cementerio. El letrero queda en una placa pequeña lateral.

Capturas del juego real:

- [Afueras y continuidad del suelo](../../../../tests/artifacts/arcade/village-depth-v5/real-1440-1800.png).
- [Llegada gradual al pueblo](../../../../tests/artifacts/arcade/village-depth-v5/real-1440-6250.png).
- [Puerta lateral y profundidad](../../../../tests/artifacts/arcade/village-depth-v5/real-1920-6850.png).
- [Ida y vuelta por el campo](../../../../tests/artifacts/arcade/village-depth-v5/country-motion.png) y [por la entrada](../../../../tests/artifacts/arcade/village-depth-v5/entrance-motion.png).

## Brujas, calabazas y habitantes

- Bruja: escala 180 → 198 (+10 %); resistencia 10 → 11,5 (+15 %). Cuarenta celdas nuevas: doce de absorción y ocho de lanzamiento por modalidad, terrestre y voladora. La punta de la varita está registrada con el origen real del proyectil. La recuperación terrestre conserva la postura del nuevo hechizo.
- Absorción: preparar el recipiente, atraer el dulce, consumirlo, recuperar hasta tres puntos de vida una sola vez y liberar una calabaza. Dura 3,05 segundos. El daño previo al consumo devuelve el dulce al suelo; una interrupción posterior no pierde al cautivo ni duplica la calabaza. La bruja puede crearla aun con la salud completa. Máximo tres calabazas vivas por bruja.
- Calabaza voladora: conserva la identidad del habitante que la originó. Tiene vuelo, preparación, disparo de fuego fantasmal, caída, apertura y liberación. Sus proyectiles convierten a otros vecinos en dulces mediante colisión real; también pueden capturar a Hexy con las reglas existentes. Los proyectiles fallidos se extinguen contra el terreno.
- Derrota de calabaza: cae por gravedad, toca el suelo y se abre. Libera al cautivo y a los demás habitantes hechizados por ella; se levantan y siguen huyendo. Matar a la bruja libera a las víctimas que aún posee; las ya transferidas requieren destruir su calabaza. Los reintentos también liberan víctimas cuyo propietario ya no existe.
- Tres vecinos atrapados entre escombros. Hexy puede romperlos disparando o acercarse durante 0,9 segundos para ayudar. Dos apariencias de adultos defensores arrojan piedras con trayectoria y daño reales mientras retroceden, y después se incorporan a la huida. Los disparos del jugador no dañan a los vecinos.

[Absorción terrestre](../../../../tests/artifacts/arcade/village-depth-v5/absorb-ground-motion.png), [fuego fantasmal](../../../../tests/artifacts/arcade/village-depth-v5/pumpkin-fire-motion.png), [caída y rescate](../../../../tests/artifacts/arcade/village-depth-v5/pumpkin-fall-motion.png), [escombros](../../../../tests/artifacts/arcade/village-depth-v5/rubble-motion.png), [defensores](../../../../tests/artifacts/arcade/village-depth-v5/defenders-motion.png).

## Arte guardado

Generado con **ImageGen integrado**, sin CLI. Prompts completos en [prompts.json](prompts.json), fuentes originales copiadas al proyecto en [sources](sources/). Sharp sólo recorta, registra, empaqueta y comprime mediante `scripts/arcade/pack-village-v5.mjs`; coordenadas en [registration.json](registration.json). Los archivos del juego no dependen de rutas de la carpeta personal de generación.

| Archivo final | Uso |
| --- | --- |
| `public/arcade/maps/village/berm-v5.webp` | Terraplén sin cielo incorporado |
| `public/arcade/maps/village/country-road-v5.webp` | Camino de las afueras |
| `public/arcade/maps/village/road-entry-v5.webp` | Transición tierra–adoquines |
| `public/arcade/maps/village/gate-v5.webp` | Entrada oblicua |
| `public/arcade/sprites/enemies/village-witch-absorb-v5.webp` | 24 celdas |
| `public/arcade/sprites/enemies/village-witch-cast-v5.webp` | 16 celdas |
| `public/arcade/sprites/enemies/village-soul-pumpkin-v5.webp` | 24 celdas |
| `public/arcade/sprites/enemies/village-resistance-v5.webp` | 24 celdas |
| `public/arcade/sprites/enemies/village-soul-effects-v5.webp` | 16 celdas |

Total: cuatro piezas de escenario y 104 celdas de sprites nuevas.

## Verificación

52 pruebas aprobadas en [regression.log](regression.log): mecánicas nuevas, captura de Hexy, dueño de cada cautivo, interrupciones, caída, liberación, escombros, defensores, reintentos, progresión del pueblo, Popcorn Panic y disparos. Incluye una prueba de píxeles que cambia el fondo entre magenta y cian: no cambia ningún píxel del interior del suelo, tanto en las pendientes como durante la transición al pueblo.

El navegador real abrió `/arcade`, seleccionó 5-2 y recorrió el juego: 24 capturas repartidas entre ventanas de 1440×900 y 1920×1080, más grabaciones de ida y vuelta con teclado. Registro: [route-final.log](route-final.log). Prueba: `tests/hexy-village-revision-5-browser.spec.js`.

Ocho escenas de animación y combate usan el motor y el renderizador de producción: lanzamiento y absorción en suelo/escoba, caída y fuego de calabaza, escombros y defensores. Registros: [motion-final.log](motion-final.log) y [air-final.log](air-final.log). Los vídeos se decodifican con `scripts/arcade/review-village-v5.mjs`; se revisaron hojas de contacto y fotogramas completos. Artefactos en `tests/artifacts/arcade/village-depth-v5/`. La invulnerabilidad temporal sólo pertenece a la preparación de estas pruebas; explica el parpadeo de Hexy en algunas capturas del recorrido.

Las primeras pruebas detectaron una referencia de propietario inestable, dos expectativas antiguas y un disparo de prueba incompleto que impedía acabar una grabación. Se corrigieron; los registros iniciales quedan como antecedente, no como validación final. La revisión visual también corrigió el registro de una fila del atlas de absorción y el cambio de postura al terminar el hechizo.

`npm run build` terminó con `[build] Complete!`: 0 errores, 0 advertencias de Astro y 30 sugerencias. Vite conserva avisos de tamaño de paquetes y antigüedad de Browserslist. Registro: [build.log](build.log). Resultados, estadísticas de las grabaciones y hashes de los archivos comprobados en [validation.json](validation.json).

Para jugar: **Arcade → Elegir capítulo → 5-2 · El pueblo de los dulces → Práctica**.
