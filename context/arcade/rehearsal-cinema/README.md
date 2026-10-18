# Derrota, ensayo y cine vintage

La derrota conserva los recursos agotados durante la caída y el resultado, también si Hexy pierde el choque contra el Arlequín. Reiniciar restaura vida, magia, munición y carga del súper al entrar en la cartela del nuevo intento. Se retiran las dos flechas de Reiniciar nivel y la flecha de Continuar.

Las cinco lecciones con payasos recorren intervalos de patrulla de 72 unidades. Antes tenían ambos extremos en el mismo punto. La orientación hacia objetivos usa un margen central de 24 unidades: los fantasmas y los demás enemigos que siguen a Hexy conservan el lado al estar alineados verticalmente. También se aplica a lanchas, cañones cargados y jefes que se orientan hacia la jugadora. El fantasma deja de avanzar horizontalmente dentro del margen.

El ensayo tiene once lecciones. Escudo recibe confeti cada 0,65 s y su demostración dura 8,5 s: bloquea, consume magia real hasta romperse, suelta y recupera. Un medidor muestra la energía y el estado. El ensayo general ya no enseña el posavasos; una nota dirige a las mejoras, mods y demos de Miso.

Se elimina el borde dibujado sobre el juego y se oculta la pausa circular en escritorio. Las pantallas táctiles conservan ese botón; P, Escape y Menu siguen disponibles. Los avisos aparecen como subtítulos amarillos de mayor tamaño y contorno oscuro.

En Opciones → Imagen se añaden **Vintage colors** e intensidad, **Cartelas vintage** y **Marcas de película**. Los colores vintage y Cine clásico son mutuamente excluyentes. Las marcas añaden polvo de emulsión y pequeñas rayas, sin desplazar la imagen; a cero se detienen, y con movimiento reducido quedan estáticas. Las cartelas se pueden desactivar por separado. Los controles se guardan en las preferencias del arcade y no alteran las del sitio general.

## Evidencia

- `tests/hexy-flow-cinema.spec.js`: derrota y HUD reales, reinicio, subtítulos, color medido en píxeles, exclusión y persistencia de filtros, once lecciones, escudo y orientación a 30/60/120 Hz, pausa táctil y movimiento reducido.
- Regresiones: `hexy-route-polish`, `hexy-clash-spectacle`, `hexy-options-rehearsal` y `hexy-finish`.
- `scripts/arcade/review-rehearsal-cinema.mjs` graba y decodifica las cinco demos de payasos, el ciclo completo del escudo y el fantasma alineado con Hexy por arriba y por abajo. Produce `demo-*-playback.png`, `ghost-vertical-playback.png` y `review-report.json`.
- Capturas de interfaz: `chapter-vintage.png`, `yellow-subtitles.png`, `defeat-hud.png`, `options-desktop.png`, `options-vintage.png`, `options-mobile.png` y `vintage-title.png`.

Los mandos se verifican con un dispositivo Xbox simulado; el helper mantiene cada pulsación durante fotogramas de navegador para que la compilación inicial del filtro no oculte una pulsación de prueba.

Validación: 79 pruebas distintas aprobadas entre las ejecuciones específicas de esos cinco archivos, siete videos decodificados e inspeccionados y `npm run build` completo. El análisis de 373 archivos informa 0 errores, 0 advertencias y 31 sugerencias. Los registros finales son `options-flow-final.log`, `facing-regression.log`, `ui-final.log` y `build.log`; `test-inventory.log` enumera las 79 comprobaciones. La prueba de derrota del motor también consta en `tests.log`.
