# v15 · Contacto, concierto y entrada a WonderPop

## Cambios

- La lata conserva su tamaño de v14. El punto de apoyo sigue el borde pintado (93,4% del lienzo): sombra estrecha de contacto superpuesta al último borde metálico y penumbra alrededor. Se retiró la sombra lateral desplazada y se usa ese mismo apoyo como pivote del hover.
- Las membranas de las bocinas pulsan con poses escalonadas; ondas y notas ascienden desde cada bocina. La caja permanece fija al suelo. La energía del audio real sigue añadiendo intensidad a conos, luces y halos.
- El dirigible ocupa el plano entre la calle y el escenario; el techo lo oculta al cruzarlo.
- La escena 6 sustituye la barra y la lata gigante por un atrio comercial: tiendas de bebidas, Magic Bunnies y discos, galerías superiores, visitantes opacos y medallón en el suelo. Pendientes, rayos de luz, motas y follaje mantienen movimiento ambiental independiente del scroll.
- La puerta exterior revela el interior mediante un recorte proyectado por la cámara de Three.js. Al avanzar, la cámara atraviesa el umbral y el arco cercano sale del encuadre. La pérdida de WebGL conserva la transición y el acceso al directorio.
- Directorio ilustrado bajo con enlaces a `/bebidas`, `/hexy` y `/wonderpop-plaza`. Guía de preguntas con diálogo nativo, cierre con Escape, retorno de foco y firma discreta DJ Sweet Hex. Español e inglés, vista móvil y lectura con movimiento reducido.

## Alcance

Implementa el atrio propuesto en `../CONTENIDO_Y_RECORRIDO_DESDE_ESCENA_6.md`. El directorio ofrece destinos para continuar. Las futuras escenas independientes de galería/testimonios no forman parte de este cambio; no se inventaron reseñas ni especificaciones de producto.

Arte nuevo: [atrio](../../../public/image/journey/wonderpop-atrium-v15.webp) y [arco con transparencia](../../../public/image/journey/wonderpop-entry-v15.webp). Herramienta integrada ImageGen; referencias y prompts exactos en [PROMPTS.md](PROMPTS.md).

## Verificación

Capturas locales en `capturas/` a 1440×900, 2559×1303 y 390×844. `capture.cjs` reproduce la inspección del producto, concierto, umbral, atrio, directorio y guía. Los PNG de QA se excluyen del repositorio.

Las pruebas cubren contacto durante hover/scroll, oclusión mediante píxeles, animación ambiental, recorrido reversible, pérdida de contexto WebGL, rutas reales, diálogo por teclado, idiomas y movimiento reducido.

Suite general: 38 pruebas pasaron; dos aserciones del arnés se corrigieron (el acordeón conserva su estado entre aperturas y una navegación Lenis debe terminar antes del salto nativo de prueba). Verificación posterior de las 9 pruebas afectadas: todas pasaron, incluida una nueva comprobación del reproductor en la plaza. Son 41 casos distintos verificados entre ambas ejecuciones. La reserva inferior evita que el reproductor tape directorio, enlaces o botón de regreso.

`npm run build`: completado, 172 archivos analizados, 0 errores, 0 advertencias del analizador y 80 sugerencias preexistentes. Se generan las 9 páginas.

Medición reproducible en `performance.json`: Chrome sin interfaz, 390×844, DPR 2, CPU limitada 4×, imágenes ya decodificadas y música reproduciéndose. Mediana 18,1 ms y percentil 95 de 36,7 ms por frame; 6 frames superaron 50 ms y dos tareas tardaron 68/60 ms al entrar al jardín. Sin desbordamiento horizontal. Es una simulación local, no una promesa de 60 fps en teléfonos físicos.
