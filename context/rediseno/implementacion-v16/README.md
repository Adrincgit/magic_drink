# v16 · Continuidad del recorrido

## Cambios implementados

- Portada de la canción actual en el mini reproductor. Cambia con «siguiente» y con la selección de la lista. Se mantiene la reproducción al recorrer la plaza.
- Sol con núcleo suave y halo cálido. Su desplazamiento horizontal es aproximadamente una quinta parte del de la ciudad y ya no cambia de altura con la cámara.
- Arrastre nativo desactivado en las imágenes del recorrido, portadas y logotipos de navegación; los controles y enlaces siguen funcionando.
- Entrada al atrio con una sola imagen de fondo. Se eliminó la segunda copia que aparecía al desplazarse el plano y se ajustó la cámara para cubrir todo el hueco de la puerta, también al retroceder.
- Un único contador, seis puntos interactivos y una barra de progreso para todo el recorrido. Antes había un navegador de tres escenas y otro indicador distinto para los tramos posteriores.
- Posición del reproductor y directorio ajustada en el atrio para dejar libres los controles inferiores.

No se añadieron dependencias ni imágenes de producción.

## Validación

- `npm run build`: 174 archivos revisados, 0 errores, 0 advertencias, 80 hints del proyecto; nueve páginas generadas.
- 18 casos distintos de Playwright aprobados entre `atrium-experience`, `cartoon-motion`, `scroll-sections`, `journey-continuity` y `local-server`.
- Primera pasada: 16 aprobados; el caso nuevo de navegación intentaba pulsar el selector de idioma de escritorio después de cambiar al tamaño móvil. Se corrigió esa preparación del test. Segunda pasada: los tres casos nuevos y el de recarga/localización, 4 aprobados.
- Revisión visual de capturas a 1440×900, 2559×1303 y 390×844. Se revisaron el suelo al cruzar la puerta, el halo, el mini reproductor y la separación entre directorio, pie y navegador.
- Pruebas de cobertura del atrio a diez posiciones de cámara en esos tres tamaños, incluida la vuelta atrás; navegación a las seis escenas en ambos sentidos; cambio de idioma; portadas asociadas a la canción; prevención de arrastre; reproducción y controles accesibles con teclado; fallback WebGL y movimiento reducido.
- Las capturas y pruebas usan Chrome local. No equivalen a una comprobación en dispositivos físicos ni a una medición nueva de rendimiento.

`capture.cjs` permite reproducir las capturas. Los registros y las capturas están ignorados por Git.

## Continuación propuesta

Ver [CONTINUACION_WONDERPOP.md](CONTINUACION_WONDERPOP.md): paseo lineal con mapa opcional, galería, mural de visitantes, FAQ y cierre en la escena 9. Estos nuevos espacios todavía son una propuesta.

Los cinco retratos existentes se revisaron desde Git porque aparecen eliminados en el árbol de trabajo. Las eliminaciones y los demás archivos pendientes del usuario se conservaron.
