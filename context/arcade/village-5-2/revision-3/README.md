# Pueblo 5-2 · revisión 3

15 de octubre de 2026. Revisión de la densidad urbana, el terreno y la profundidad, acompañada de nuevas derrotas y sonido para Popcorn Panic.

## Pueblo

- Ocho diseños nuevos de fachadas: posada, casas adosadas, pastelería, ayuntamiento, apotecario, arco de callejón y esquinas con ventanas iluminadas, tejados torcidos y decoración de Halloween.
- Las manzanas se distribuyen aproximadamente cada 280 unidades, frente a las 455 anteriores. Los edificios enmarcan las tres plazas y comparten una acera con la calle principal.
- Nueva franja de edificios, callejones, escaleras y muro de apoyo, con desplazamiento horizontal al 72 % de la cámara. Se ve detrás de las fachadas y continúa a través de las plazas.
- Nubes, montañas, bosque, tejados lejanos, huertos, calle secundaria, fachadas y adornos cercanos se desplazan en planos distintos. Las cercas y jardineras próximas se mueven al 112 %. Los planos decorativos tienen alturas fijas, sin muestrear el terreno según la posición horizontal de la cámara.
- La llegada al pueblo tiene un borde espacial: el extremo de la calle se integra con los huertos. El resto de los edificios mantiene su opacidad.
- Nuevo empedrado con patrones de abanico, aceras y bordillos. La transición desde el camino del cementerio ocupa x=4200–5800.
- Se conservan las 21 440 unidades de longitud, los 58 habitantes, las tres plazas, cinco checkpoints, siete cajas, dos rescates y las identidades de las estrellas recogidas. La ruta jugable sigue siendo la misma.

## Recursos

Generados con ImageGen integrado usando las fachadas existentes como referencia de estilo. Fuentes originales en `sources/`, prompts completos en [prompts.json](prompts.json), registro de recortes en [registration.json](registration.json).

| Archivo final | Uso |
| --- | --- |
| `public/arcade/maps/village/blocks-v3.webp` | Ocho fachadas en atlas de 4 × 2, celdas de 512 px |
| `public/arcade/maps/village/street-v3.webp` | Calle secundaria continua con cielo transparente |
| `public/arcade/maps/village/road-v3.webp` | Suelo empedrado opaco |
| `public/arcade/sprites/effects/popcorn-defeat-v2.webp` | Dieciséis celdas de derrota e impacto |

Empaquetado reproducible: `node scripts/arcade/pack-town-popcorn.mjs`. Sharp localiza los espacios transparentes y registra las imágenes; no redibuja los recursos.

Los detalles de la bebida están en [Popcorn Panic · revisión 2](../../popcorn-panic/revision-2/README.md).

## Verificación

- 58 pruebas de regresión aprobadas: Popcorn, nuevas derrotas, otras bebidas, cementerio y pueblo, incluida la entrada mediante el selector real de capítulos. Registro: [regression.log](regression.log).
- Dos pruebas adicionales de navegador para las escenas grabadas y el audio. Tras los últimos ajustes de entrada y evaporación se repitieron los 30 casos directamente afectados, todos aprobados: [final-validation.log](final-validation.log). Son **60 casos distintos** en total.
- Nueve posiciones del recorrido capturadas. Ocho grabaciones de cuatro segundos, decodificadas y revisadas: calle, fuente, mercado, evaporación, dispersión, lanzamiento, payaso calabaza y bruja. Incluyen avanzar y retroceder.
- Evidencia en `tests/artifacts/arcade/town-cannon/`: `.webm`, `*-motion.png`, fotogramas, estadísticas, `street-*.png` y muestra WAV. Las escenas grabadas usan un montaje controlado con el motor y renderizador reales; el selector y los controles también se comprueban en la interfaz del juego.
- El audio se renderizó mediante OfflineAudioContext y el bus de efectos real: pico 0.5894, sin recorte; silenciado produce cero muestras audibles. El entorno no permitió una revisión auditiva, por lo que la validación del sonido es técnica.
- Compilación final mediante `npm run build`; salida y resultados conservados en [build.log](build.log) y [verification.json](verification.json).

Reproducción:

```powershell
$env:MAGIC_DRINK_TEST_URL='http://127.0.0.1:4321'
npx playwright test tests/hexy-town-cannon-browser.spec.js tests/hexy-town-cannon.spec.js tests/hexy-popcorn.spec.js tests/hexy-village.spec.js --workers=1
node scripts/arcade/review-town-cannon.mjs
npm run build
```
