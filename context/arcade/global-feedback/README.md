# Efectos globales y acciones combinadas de Hexy

Revisión del 16/10/2026, posterior al checkpoint `ec340468297fc85cd48c031883a261413f87a4b7`, enviado a `origin/paralax` antes de empezar estos cambios.

## Comportamiento vigente

- Mantener A mientras se planea conserva una mano sujetando el sombrero; la otra dispara. Hay dibujos para horizontal, diagonales y verticales. Las puntas de varita están registradas por celda. Volt mantiene su canal desde esa punta. Popcorn conserva su impulso de seguridad y el sombrero durante la transición de nuevo al planeo; soltar A termina el planeo.
- Avanzar con el escudo, incluido el amuleto de defensa superior, usa un ciclo de piernas ligado a la distancia recorrida. La defensa quieta mantiene sus poses anteriores.
- Los pasos y aterrizajes generan pequeños sprites de contacto según arena, tierra, piedra o madera. Se emiten por desplazamiento y contacto real, con mayor presencia en terrenos blandos. El sistema sustituye el polvo exclusivo de los prototipos del acto 2; no duplica el polvo existente de habitantes y carrozas.
- Dragon Grape tiene estela pintada, llama en la punta y luz cálida sobre el dibujo actual de Hexy. Los enemigos básicos alcanzados muestran llamitas temporales. Es una reacción visual: no añade daño periódico ni cambia las colisiones.
- La electrocución mantiene el cuerpo y la reacción del enemigo, acompañados por una **masa azul llena y opaca**, registrada a su dibujo y que se enciende y apaga. Rellena también los espacios entre extremidades. **No hay sustitución por calaveras o esqueletos.** Conserva la ralentización y la derrota oscurecida. El modo de efectos reducidos mantiene la masa estable. La [revisión con energía llena](electric-filled-v2/README.md) sustituye al aro hueco rechazado por el usuario.
- Hexy quieta muestra preocupación con poca salud y cansancio con un corazón. Correr, disparar, recibir un golpe y las acciones especiales conservan su prioridad.
- En la tienda, LB/RB cambian de sección; la cruceta conecta catálogo, acciones, pruebas, familias y equipo; A confirma y B sale del menú. Durante la prueba se mantienen los controles de juego y Menu vuelve al catálogo. El foco se restaura al comprar, equipar o mejorar, incluso cuando cambia el botón tras la operación.

Se conserva el sonido básico de Hexy. No se añaden barras de vida enemigas. Los niveles 2-3, 2-4 y 2-5 quedan documentados como **prototipos jugables pendientes de desarrollo**, de acuerdo con la corrección del usuario.

## Arte y fuentes

Arte generado con `image_gen` integrado, transparencia real, y empaquetado técnico mediante `node scripts/arcade/prepare-global-feedback.mjs`. Fuentes seleccionadas en [sources/](sources/), instrucciones conservadas en [prompts.json](prompts.json) y medidas en [registration.json](registration.json).

| Recurso | Atlas del juego |
| --- | --- |
| Planeo y disparo | `public/arcade/sprites/hexy/glide-fire-v1.webp` |
| Marcha con escudo | `public/arcade/sprites/hexy/guard-walk-v1.webp` |
| Reposo según salud | `public/arcade/sprites/hexy/health-idle-v1.webp` |
| Fuego, estelas y polvo | `public/arcade/sprites/feedback/elements-v1.webp` |
| Energía eléctrica llena, registrada a las poses | `public/arcade/sprites/feedback/electric-fill-v2.webp` |

El malabarista tiene una [revisión específica del ciclo completo](../juggler-gait/revision-2/README.md): se retira la composición con torso fijo y piernas recortadas.

## Revisión visual

`node scripts/arcade/review-global-feedback.mjs` graba física y renderer del juego, y decodifica las grabaciones para comprobar poses, escala, transparencia y tiempos. Se revisaron también los montajes del malabarista en ambos sentidos y a un cuarto de velocidad.

- [Planeo con disparo](review/glide-playback.png), [grabación](review/glide.webm).
- [Caminar con escudo](review/guard-playback.png), [grabación](review/guard.webm).
- [Energía llena intermitente sobre los enemigos originales](electric-filled-v2/left-playback.png), [grabación](electric-filled-v2/left.webm). Sustituye la revisión anterior con un aro hueco.
- [Fuego y reacción](review/fire-playback.png), [reposo con un corazón](review/idle-tired-playback.png).
- Prueba de Xbox mediante `navigator.getGamepads` emulado: compra, equipo, mejora, prueba, cambio de sección y retirada de equipo sin usar el mouse dentro de la tienda. No equivale a una prueba física de un mando conectado.

**51 pruebas dirigidas aprobadas:** planeo con A y cuatro armas, registro del rayo, escudo en marcha, contacto con superficies, reacciones elementales, marcha y descarga del malabarista, regresiones de combate, audio y navegación completa de Miso con mando emulado. Se corrigió además un intento de dibujar el patio sobre un canvas ya desmontado al cambiar de sección o cerrar la tienda. Resultado: [final-tests.log](final-tests.log). Compilación: [build.log](build.log). La inspección visual no implica aceptación estética por parte del usuario.
