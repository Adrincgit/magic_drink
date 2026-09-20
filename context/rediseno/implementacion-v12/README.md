# v12 · Magic Drink y controles ilustrados

## Decisión de marca

Existe una sola bebida: **Magic Drink**. «Original» deja de ser nombre, variante o calificativo público. Se corrigieron ES/EN, menú, pie, textos, alternativas de imágenes y metadatos. Los nombres internos de archivos históricos y los enlaces antiguos se conservan por compatibilidad.

La portada recupera información del canon del autor: bebida número uno del mundo, saludable y sin cafeína; lo cotidiano se siente menos aburrido; los fans relacionan su consumo con lo adictiva que resulta la música de Hexy; Magic Drink Day incluye desfiles y globos gigantes. No se inventan ingredientes, certificaciones ni estadísticas. En la página de la bebida también se retiró la fórmula de «frutas púrpuras» que no estaba sustentada por las fuentes revisadas.

## Interfaz implementada

- `SceneControls.jsx`: botones y enlaces HTML con marcos SVG, relieve, estrella esmaltada y contornos de tinta. Variantes dorada, violeta y entrada de festival. Etiquetas y tarjetas de información con materiales de la plaza.
- `ScenePlayer.jsx`: reproductor con disco, controles reales, posición ajustable por teclado, tiempo transcurrido y créditos desplegables. Hexy aparece como intérprete; DJ Sweet Hex se descubre como firma musical en los detalles.
- `Button.jsx`: mantiene la API compartida de variantes, tamaños, enlaces externos, acciones, formularios y estados deshabilitados, usando el nuevo marco.
- La portada, su continuación, la página de la bebida y los CTA compartidos de las páginas interiores usan estos controles. La navegación existente conserva su composición y comportamiento.
- La interfaz permanece en HTML. La cámara y el movimiento ambiental de las escenas no se modifican. Los controles no se desplazan con el cursor.
- En pantallas anchas, el bloque de Hexy limita su ancho para dejar más espacio al cartel. En móvil, se conserva una sola acción principal sobre la lata.

## Comprobaciones

- `npm run build`: 9 páginas, 0 errores de Astro Check. Permanecen 79 avisos informativos previos.
- Suite completa: 25 pruebas pasaron; la prueba nueva de teclado necesitó tolerancia de redondeo del scroll (0.4502 frente a 0.4500). No era un fallo de navegación.
- Ejecución final de `scene-controls.spec.js` y `scroll-sections.spec.js`: 8 pruebas pasaron, incluyendo la anterior corregida. Las 26 pruebas diferentes quedan verificadas entre ambas ejecuciones.
- Se comprobaron las 7 rutas públicas tanto en ES como en EN: ningún uso público de «Original» en cuerpo, título o descripción.
- 24 capturas iniciales en 2559×1304, 1440×900 y 390×844; revisión posterior de Hexy, móvil, créditos y CTA de páginas interiores. Las capturas se guardan localmente en `capturas/` y no se incluyen en Git.
- Pruebas de composición adicionales en 360×740 y 820×1180. Emulación de navegador de escritorio; no se declara prueba en teléfono físico.

## Continuación

El nuevo atrio de la escena 6, las galerías posteriores, los testimonios y el FAQ siguen descritos en `../CONTENIDO_Y_RECORRIDO_DESDE_ESCENA_6.md`. Esta iteración corrige contenido e interfaz; no presenta el interior anterior como el rediseño completo del atrio ni como cierre definitivo del portal.

No se añadieron dependencias ni se publicó un despliegue.
