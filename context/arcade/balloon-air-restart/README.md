# Aire del globo y recorridos sin checkpoints

Decisión del 16 de octubre de 2026. No hay checkpoints ni banderas de reaparición. La derrota ofrece **Reiniciar nivel**, desde el punto inicial del mapa, también después de entrar al Gran Telón. La bandera de victoria al terminar sigue siendo una celebración del final.

Cada nivel con recorrido tiene una sola caja marcada con corazón cerca de la mitad del trayecto, contando los exteriores con coordenadas negativas. Debe romperse y recogerse el corazón para recuperar **un corazón de salud**. Los niveles dedicados exclusivamente al jefe no añaden esta caja. Las demás cajas de bebidas y munición siguen funcionando.

Al reintentar se reconstruyen enemigos, obstáculos, civiles y fases del jefe. Se conservan estrellas cobradas, recibos de banco, rescates ya premiados, equipo y botín normal ya reclamado; la caja de recuperación vuelve una sola vez por intento. Las antiguas coordenadas `level.checkpoint(s)` permanecen como anclas históricas de construcción/fixtures: no curan, no se dibujan y no intervienen en la reaparición. Un `checkpointAt` antiguo se descarta al reiniciar.

El globo del primer nivel expulsa aire mediante ocho dibujos con transparencia, registrados por la punta de salida y reflejados para las dos roturas. Se activan al entrar en fase 2 y acompañan al globo, sin las curvas y gradientes anteriores. Movimiento reducido fija un dibujo por salida.

- Generación: herramienta integrada de ImageGen; referencia de estilo `balloon-damaged-hd.webp`.
- Prompt final: [air-prompt.txt](air-prompt.txt).
- Fuente: [air-source.png](air-source.png).
- Asset integrado: [balloon-air-v1.webp](../../../public/arcade/sprites/effects/balloon-air-v1.webp).
- Empaquetado y medición: `scripts/arcade/pack-balloon-air.mjs`, [air-registration.json](air-registration.json).
- Revisión real: [transición grabada](phase-two.webm), [frames decodificados](phase-two-playback.png), capturas `midpoint-0.png` a `midpoint-9.png`, [corazón liberado](heart-released.png), [errores y posiciones](runtime.json).
- Pruebas: `tests/hexy-no-checkpoints.spec.js`, regresiones de globo, campamento, entrada al circo, pueblo, economía y pantalla real de derrota.

Validación: 106 casos distintos aprobados entre la ejecución principal y sus revisiones dirigidas (`tests-final.log`: 91 aprobados; `tests-recheck.log`: cuatro casos corregidos aprobados; `test-menu-final.log`: el flujo restante aprobado; `test-retry-regressions.log`: diez casos adicionales aprobados). Se actualizaron expectativas antiguas de checkpoints y dos fixtures desfasados de escala global de explosiones y navegación del menú. Revisión gráfica sin errores de ejecución; la bandera de victoria conserva sus dos pasadas de dibujo y las de recorrido tienen cero.

`npm run build` terminó correctamente a las 16:56:41: 0 errores, 0 advertencias del chequeo de Astro y `[build] Complete!`. Registro: [build.log](build.log).
