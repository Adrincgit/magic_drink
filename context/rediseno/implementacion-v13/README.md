# v13 — Entrada viva y música durante el recorrido

La entrada espera a que las imágenes esenciales estén decodificadas y muestra un cartel ilustrado con progreso por recursos. No introduce un tiempo mínimo artificial. A los 4 segundos permite entrar manualmente; a los 8 libera la visita. Existe una salida adicional en Astro si falla la hidratación, y el cartel no bloquea una visita sin JavaScript.

Lenis 1.3.17 ya estaba instalado, pero no participaba en el recorrido. Ahora interpola la rueda del ratón con `lerp: .09`, actualiza la cámara en su mismo frame y conserva scroll nativo en dispositivos táctiles y movimiento reducido. El movimiento ambiental sigue independiente del scroll. La lista de canciones admite desplazamiento interno sin mover la escena.

La lata reutiliza su ilustración, vertical, sobre una mesa nueva de patas abiertas. La maceta es independiente y su copa se balancea sobre una base fija. La lata tiene gotas que recorren su superficie, respuesta al hover/foco y una emisión limitada de vapor, corazones y notas al activarla con ratón, toque o teclado. Las partículas se eliminan a los 3 segundos o al salir de la escena; activaciones repetidas reemplazan la emisión anterior.

El cielo tiene 92 estrellas con posiciones, tamaños, intensidades y tiempos distintos, generadas con semilla estable para que SSR e hidratación coincidan. El agua tiene oscilación y reflejos que se desplazan únicamente dentro de su máscara.

Un catálogo compartido conserva las seis canciones de `/hexy`. El reproductor principal y el compacto utilizan un único elemento de audio: cambiar de escena no cambia la canción ni la posición. El compacto permanece disponible al pausar; cerrarlo detiene la música. Los créditos dicen únicamente `DJ Sweet Hex`. La lista se cierra con Escape, al elegir una canción o al pulsar fuera, y devuelve el foco al control correspondiente.

## Validación

- 32 pruebas de Chrome aprobadas: las 26 existentes y 6 nuevas en `tests/living-landing.spec.js`.
- Entrada en frío reteniendo una imagen; imagen fallida; petición detenida con entrada manual; interpolación de la rueda y cambio a movimiento reducido; activación por teclado; partículas acotadas; continuidad del audio, cambio de canción y cierre del compacto.
- `npm run build`: 9 páginas, 0 errores, 0 advertencias, 79 hints preexistentes.
- Capturas revisadas en 1440 × 900, 2559 × 1303 y 390 × 844. Las pruebas de disposición también cubren 360 × 740 y 820 × 1180.
- Rendimiento en Chrome headless, emulación táctil 390 × 844, DPR 2, CPU 4× más lenta, imágenes y WebGL precargados: mediana 12.1 ms, p95 18.3 ms, 0 frames superiores a 50 ms, 0 tareas largas, sin desbordamiento horizontal. Es una medición local con caché caliente, no una prueba de teléfono físico ni de red. Resultado y script: `performance.json`, `performance.cjs`.

## Arte

Sprites integrados: `public/image/journey/cafe-table-v13.webp` (243,434 bytes) y `public/image/journey/potted-jasmine-v13.webp` (406,702 bytes). Generados con image_gen integrada y convertidos a WebP conservando alfa. Referencia y prompts completos: [ARTE_Y_PROMPTS.md](ARTE_Y_PROMPTS.md).

La rama de trabajo sigue siendo `paralax`. Esta iteración no hace merge ni publicación remota.
