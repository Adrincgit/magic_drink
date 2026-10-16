# Revisión 13 · Voces, fuego y respuesta de Popcorn

14 clips editados a partir de grabaciones: dos llamas, dos roturas de muerte, aterrizaje, dos risas, invocación, tres muertes y tres gruñidos. Las calabazas combinan rotura y voz en canales independientes. Procedencia en [CREDITS.md](CREDITS.md), recetas en [edits.json](edits.json), escucha local en [audition.html](audition.html).

- Los sonidos se disparan al ejecutar la acción: emisión de llama, comienzo de absorción, creación de calabaza, derrota y contacto con el suelo. La risa se cancela al interrumpir/derrotar a su bruja y al pausar. Los zombis activos cercanos gruñen por turnos; hay límites de voces simultáneas.
- `Sonido → Voces`: volumen independiente de música y FX, 60 % por defecto, con botón de prueba y guardado. Los guardados anteriores conservan sus valores y reciben este valor inicial. Reducidas además las ganancias de risa, gruñido y muerte. El disparo básico de Hexy conserva su síntesis y nivel anteriores.
- Popcorn: flash cálido de 120 ms normal / 170 ms fuerte; se omite con efectos reducidos. El reloj visual evita que la pausa de impacto lo prolongue.
- Cada disparo aéreo eleva a Hexy. La velocidad mínima se calcula con la gravedad real para volver a la altura inicial después de la duración del efecto más 80 ms. Conserva un salto que ya sube más rápido y no restituye saltos. Soltar el botón de salto no recorta el impulso. El fuerte conserva el retroceso horizontal. Reintentar limpia flash e impulso pendientes.

## Verificación

Pruebas de simulación: muerte única de ambos tipos de zombi y calabaza terrestre; caída/impacto de calabaza voladora; turno y exclusiones de gruñidos; absorción/invocación; Popcorn normal/fuerte en cuatro direcciones; duración del flash y reintento.

Pruebas en Chrome: carga/decodificación de los 14 clips, reproducción de acciones reales del pueblo, cancelación al pausar/interrumpir, volumen y guardado de voces, silencio independiente de FX/voces, ajustes en escritorio y móvil. La prueba de audio aislado usa una página vacía para evitar el coste de la animación de la portada.

`scripts/arcade/review-creature-feedback.mjs` renderiza muestras con los buses de producción y graba/decodifica la secuencia de Popcorn. Se revisaron [fotogramas](popcorn-frames.png) y [reproducción](popcorn-playback.png), además de la captura del configurador. Valores de señal y trayectorias en [validation.json](validation.json). La mezcla de prueba no recorta muestras; estos controles técnicos no equivalen a una escucha subjetiva.

El usuario confirmó durante el trabajo que las voces le gustaban y pidió bajar su nivel; se conservaron las tomas y se añadió el control independiente.

Resultado: 39 pruebas distintas aprobadas entre audio, controles, ajustes, Popcorn y regresi?n de la revisi?n 12. Los tres fallos iniciales se resolvieron: registro de varita comprobado descontando el desplazamiento de ese fotograma; limpieza del flash al reintentar; aislamiento de la prueba Web Audio de la portada animada. La comprobaci?n final del banco y las dos partidas de navegador pas? completa.
