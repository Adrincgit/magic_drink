# Arlequina: movimiento, báculo y choque de poderes

Esta revisión conserva el torbellino Halloween aprobado y sustituye los movimientos que mantenían una sola pose por secuencias de dibujos. La dirección visual queda registrada en [AGENTS.md](../../../src/components/arcade/adventure/AGENTS.md).

## Comportamiento

- Salto de 12 celdas: anticipación, ascenso, giro, descenso y aterrizaje. Se conservan las 12 celdas de carrera de cada fase.
- Defensa con báculo de 8 celdas ante disparos normales frontales. Tiene recuperación y tiempo de espera; los disparos pesados y por detrás conservan su abertura.
- Cuatro celdas de rebote del brazo al encontrar el escudo y cuatro para una ráfaga finita de golpes. Cada contacto consume guardia; un golpe recibido activa las reacciones físicas de Hexy y el golpe pesado su caída de ocho celdas.
- Empuje y atracción mediante una ráfaga de viento de 0.32 s, sin daño directo, proyectiles ni símbolos musicales.
- Torbellino Halloween de 16 fases, con fantasmas y calabazas integrados. El contacto sostenido y la explosión usan plasma pintado de ocho celdas, sin el antiguo confeti de lunas.
- La expresión de la mejilla aparece como un overlay grande desde la derecha, con globo pintado y cola próxima a su rostro. La mano que emite el ataque en el mundo continúa firme.
- La reacción a Encore doble comienza al descargarse, después de la carga: cuatro dibujos de transición hacia el esfuerzo y cuatro de desesperación cuando está cerca de perder. Se conserva el empuje final limitado y el flash manga de impulso/explosión.
- Escenario separado en ciudad/cielo, cuatro dibujos de tela y arquitectura rígida. La ciudad y la luna tienen parallax estable; no se aplica ondulación a la imagen completa.

## Arte y reproducción

Modo: **herramienta ImageGen integrada**, edición con referencias del diseño y del efecto aprobados. No se utilizó CLI ni API alternativa para generar las imágenes. El empaquetador registra las siluetas sin deformarlas y exporta WebP transparentes.

- Arte de ejecución: [public/arcade/act-two/nightmare-performance-v10](../../../public/arcade/act-two/nightmare-performance-v10/).
- Referencias generadas seleccionadas: [sources](sources/).
- Instrucciones de generación: [prompts.json](prompts.json), [bridge-prompt.json](bridge-prompt.json), [spacing-prompts.json](spacing-prompts.json) y [layer-prompts.json](layer-prompts.json).
- Registro de escala y anclajes: [registration.json](registration.json).
- Empaquetado: `node scripts/arcade/pack-nightmare-performance.mjs`.
- Capturas: `node scripts/arcade/review-nightmare-performance.mjs`.
- Grabación y decodificación de reproducción real: `node scripts/arcade/review-nightmare-performance.mjs --videos`.

| Atlas/capa | Dibujos utilizados |
| --- | --- |
| `jump-2.webp`, `jump-3.webp` | 12 por fase; fase inicial comparte la segunda |
| `staff-defense-2.webp`, `staff-defense-3.webp` | 16 por fase: 8 giro, 4 rebote, 4 ráfaga |
| `boss-air.webp`, `boss-portraits.webp` | 24 por atlas: 16 previos, 4 desesperación, 4 transición |
| `halloween-vortex-16.webp` | 16 |
| `clash-plasma.webp`, `fast-wind.webp` | 8 por efecto |
| `speech-tails.webp` | 4 globos pintados |
| `cloth-0.webp` a `cloth-3.webp` | 4 cambios de tela registrados sobre el escenario original |
| `city-plate.webp`, `arena-cutout.webp` | Cielo/ciudad y arquitectura rígida |

Se conservan `tent-cels.png` y las primeras hojas `staff-defense-2.png`/`staff-defense-3.png` como fuentes descartadas. No se cargan en el juego: la primera composición de la carpa tenía cortes y las hojas iniciales del báculo no separaban todas las siluetas. Las fuentes finales de defensa son las variantes `-spaced.png`; la tela final procede de `cloth-cels.png`.

## Evidencia visual

Las grabaciones fueron reproducidas y decodificadas antes de revisar sus hojas de contacto. El muestreo de los vídeos se complementa con capturas de los flashes breves y de los instantes anteriores/posteriores a la descarga.

- [Salto, giro defensivo y viento](../../../tests/artifacts/arcade/nightmare-performance-v10/jumps-and-spin.webm), [reproducción decodificada](../../../tests/artifacts/arcade/nightmare-performance-v10/jumps-and-spin-playback.jpg).
- [Golpe contra escudo, rebote y ráfaga](../../../tests/artifacts/arcade/nightmare-performance-v10/staff-guard.webm), [reproducción decodificada](../../../tests/artifacts/arcade/nightmare-performance-v10/staff-guard-playback.jpg).
- [Encore doble hasta la derrota de la arlequina](../../../tests/artifacts/arcade/nightmare-performance-v10/double-encore.webm), [reproducción decodificada](../../../tests/artifacts/arcade/nightmare-performance-v10/double-encore-playback.jpg).
- [Overlay de expresión y globo](../../../tests/artifacts/arcade/nightmare-performance-v10/large-expression.jpg), [torbellino completo y contacto](../../../tests/artifacts/arcade/nightmare-performance-v10/surge-complete-rim.jpg), [frustración final](../../../tests/artifacts/arcade/nightmare-performance-v10/frustrated-rally.jpg).
- [Estados de las capturas](../../../tests/artifacts/arcade/nightmare-performance-v10/beats.json) y [reporte del navegador](../../../tests/artifacts/arcade/nightmare-performance-v10/browser-report.json).

El arnés prepara situaciones controladas y suprime el parpadeo de invulnerabilidad únicamente al pintar las capturas. Las pruebas de combate comprueban el daño, la guardia y la recuperación mediante la simulación real.

## Validación

- Nueve pruebas nuevas en `tests/hexy-nightmare-performance.spec.js`: secuencia de salto, carrera, defensa de proyectiles, rebote/réplica, reacciones físicas de Hexy, ráfaga breve, cronología facial, estabilidad del escenario y dibujos distintos.
- Suite de 84 pruebas: 83 aprobadas inicialmente; la única expectativa antigua exigía esfuerzo en lugar de desesperación cerca de perder. Se actualizó esa expectativa y la suite de presión terminó con sus 10 pruebas aprobadas; los 84 casos quedan cubiertos entre ambas ejecuciones. Los resultados están en [test-log.txt](test-log.txt) y [pressure-recheck-log.txt](pressure-recheck-log.txt).
- Navegador: sin errores de página ni recursos de arcade ausentes en las capturas y grabaciones.
- `npm run build`: 0 errores, 0 advertencias de Astro, 40 hints; finalizó con `[build] Complete!`. El build también conserva el aviso informativo de Browserslist sobre su base local. [Registro](build-log.txt).
