# Villa Lumbre: el derrumbe y la multitud

15 de octubre de 2026. Continúa la [revisión 9](../revision-9/README.md). Esta entrega añade la escena del derrumbe, la liberación automática de los dulces y las advertencias dirigidas a Hexy.

## Juego

- Un muro de mampostería y vigas derrumbadas corta la calle en la posición 14.880. Tiene 96 puntos de resistencia, ocho veces los de una carreta volcada. Recibe impactos reales, muestra cuatro grados de daño, se desmorona y deja restos bajos. Conserva la colisión y los apoyos físicos del sistema de obstáculos. No muestra barra de salud.
- Catorce vecinos de los ocho diseños existentes se acumulan a su derecha. Los de delante apoyan las manos, intentan trepar, levantan una rodilla, resbalan y vuelven a intentarlo. Los de atrás miran, levantan los brazos y buscan una salida. Las poses se desfasan entre personajes. Romper el muro abre el paso; el resultado se conserva al reintentar. Se mantienen 106 habitantes en todo el nivel.
- La cámara se aleja suavemente hasta el 78 % para mostrar a la multitud y los atacantes. El suelo y el horizonte conservan su altura en pantalla. Al romper el muro o abandonar la zona recupera el encuadre habitual.
- Si el muro sigue en pie, llegan refuerzos a los 1,5, 8,5 y 16 segundos: dos brujas voladoras, cuatro calabazas y dos zombis calabaza rápidos, ocho atacantes en total. Llegan desde la derecha y continúan con su inteligencia habitual. Las absorciones reales pueden crear más calabazas portadoras de víctimas. Romper el muro cancela las oleadas pendientes.
- Los intentos de trepar y buscar paso también aparecen ante los obstáculos anteriores; no permiten atravesarlos. Los vecinos que se convierten dejan la pose de trepar y vuelven a apoyar su transformación en el suelo.

## Dulces y advertencias

Los habitantes se liberan automáticamente a los **30 segundos desde que reciben el hechizo**. El tiempo continúa durante la transformación, la absorción y el transporte dentro de una calabaza. Al liberarse, el vecino reaparece en tierra, se levanta y vuelve a huir; se vacía su recipiente y se interrumpe la absorción correspondiente. El rescate se contabiliza una sola vez. Siguen existiendo el rescate anticipado al derrotar a sus captores y la posibilidad de volver a ser alcanzados.

Hexy también se libera al cumplir 30 segundos si sigue viva y atrapada, además de poder hacerlo con sus pulsaciones habituales. Esto no revive una derrota por el último corazón ni una absorción que ya terminó convirtiéndola en calabaza.

Antes del pueblo, el panadero y el niño pueden detenerse para advertir a Hexy: su cuerpo mira hacia ella y el otro brazo señala el peligro detrás. La seña sólo empieza si Hexy está delante de ellos, a su izquierda. Termina cuando los rebasa. Dentro del pueblo no se activa. Se reemplazan las antiguas poses dirigidas hacia la cámara por dibujos laterales registrados a la misma escala corporal.

## Arte

Seis fuentes transparentes producidas con **ImageGen integrado**, modo generación con referencias de identidad y estilo. Las fuentes seleccionadas están en `sources/`; el juego sólo carga los WebP del repositorio. Los prompts y referencias se conservan en [adults-prompt.json](adults-prompt.json), [children-prompt.json](children-prompt.json), [elders-prompt.json](elders-prompt.json), [neighbors-prompt.json](neighbors-prompt.json), [wall-prompt.json](wall-prompt.json) y [warning-prompt.json](warning-prompt.json). El archivo de adultos contiene una reconstrucción abreviada del prompt previo a la interrupción; los otros cinco conservan el texto enviado.

| Archivo final, bajo `public/arcade/sprites/enemies/` | Celdas |
| --- | --- |
| `village-climb-adults-v10.webp` | 16, panadero y madre |
| `village-climb-children-v10.webp` | 16, niño y niña gata |
| `village-climb-elders-v10.webp` | 16, anciano y anciana |
| `village-climb-neighbors-v10.webp` | 16, herrero y mujer de trenza roja |
| `village-warning-v10.webp` | 8, advertencias laterales |
| `village-collapse-v10.webp` | 8, daño, derrumbe y fragmentos |

Total: 80 celdas nuevas. `node scripts/arcade/pack-village-v10.mjs` recorta, registra y comprime con Sharp; no dibuja arte. Las poses levantando los brazos conservan la escala de la primera pose de cada personaje, con espacio transparente adicional arriba. El contorno físico superior del muro se mide del alfa. Datos en [registration.json](registration.json).

Corrección posterior: se retiraron manos adicionales en tres poses del niño, el anciano y el panadero mediante ediciones individuales. El empaquetador aplica esos reemplazos sin alterar los demás dibujos. [Fuentes, prompts y comparación visual](anatomy-fix/README.md).

## Verificación

- **111 pruebas de modelo y regresión aprobadas**, incluidas ocho nuevas sobre multitud, trepada, cámara, resistencia con disparos reales, refuerzos, reintentos, liberación de víctimas en todos sus estados, Hexy, advertencias y agua contra obstáculos.
- **Una prueba del juego con teclado aprobada**, entrando por el selector real de 5-2. Comprueba el encuadre en 1440 × 900 y 1920 × 1080, destruye el muro manteniendo Z, prueba la liberación automática y la advertencia lateral. Sin errores de JavaScript ni recursos del arcade ausentes. Total: **112 pruebas**.
- `npm run build` terminó con `[build] Complete!`: Astro Check informa 0 errores, 0 advertencias y 29 sugerencias. Vite conserva el aviso de tamaño de paquetes y Browserslist el de base antigua; no impiden compilar.
- Se grabaron y decodificaron seis escenas del motor y renderizador de producción. Se revisaron hojas de contacto, fotogramas completos y capturas del juego. Las escenas aíslan los elementos que se inspeccionan; la prueba con teclado comprueba la integración real. En la escena de espera llegan los ocho atacantes y las absorciones llegan a producir cinco portadores. En la de disparos el muro se rompe y la cámara vuelve a acercarse. La grabación del temporizador comienza en 28,6 segundos para mostrar la transición; la prueba del modelo recorre los 30 segundos completos.

Inventario y resultados: [validation.json](validation.json). Grabaciones: [presión sobre la multitud](../../../../tests/artifacts/arcade/village-depth-v10/blockade-pressure.webm), [destrucción y paso abierto](../../../../tests/artifacts/arcade/village-depth-v10/blockade-rescue.webm), [otros obstáculos](../../../../tests/artifacts/arcade/village-depth-v10/generic-blocked.webm), [advertencia del panadero](../../../../tests/artifacts/arcade/village-depth-v10/warning-baker.webm), [advertencia del niño](../../../../tests/artifacts/arcade/village-depth-v10/warning-child.webm) y [liberación automática](../../../../tests/artifacts/arcade/village-depth-v10/candy-timeout.webm).

Para probar: Arcade → Elegir capítulo → **5-2 · El pueblo de los dulces** → Práctica. El derrumbe está en el tramo urbano, después del segundo grupo de obstáculos.
