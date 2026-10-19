# Actuación y presión del choque de pesadillas

> Revisión archivada. La presentación actual y su empaquetador están en [v5: esquinas manga y actuación continua](../nightmare-corners-v5/README.md). El empaquetador de v4 sustituye registros que ya no corresponden al arte activo.

Revisión local del 18/10/2026 sobre la [arena y choque aéreo v3](../nightmare-aerial-v3/README.md). Atiende la anatomía ambigua de Hexy, la reacción al refuerzo rival, la animación de ambos retratos, sus posiciones, el medidor y el viento. Conserva la arena abierta, el salto extremo, las tres fases y las reglas del choque. No modifica la asignación de piedras del canon ni añade barras de salud enemigas.

## Actuación

Hexy comienza resistiendo con una mano. Al potenciar la arlequín, abre los ojos y reacciona durante 0,28 s; después la segunda mano se incorpora al mango de la misma varita y ambas sostienen el esfuerzo. Se mantienen los dientes apretados, el sudor y el movimiento de cabello, mangas y cuerpo mientras la presión sigue alta. Encore doble conserva el apoyo con ambas manos durante el choque. La anticipación inicial de pie mantiene la pose heroica original.

La corrección de anatomía parte de [una sola pose maestra](sources/hexy-anatomy-master.png): las manos sostienen el mango cerca del pecho y los dos codos quedan separados a los lados. Esta postura sustituye el apoyo, esfuerzo y refuerzo anteriores tanto en el juego como en los retratos grandes. La sorpresa del retrato incorpora la segunda mano antes de apretar el mango. Se revisan los dibujos y su reproducción real; el recuento de componentes o una prueba automática no acredita anatomía correcta.

La arlequín tiene una carcajada animada después del lanzamiento y cuando domina; su potenciación usa otra secuencia de empuje alegre. Al devolverle la fuerza, cambia a resistencia y después a ojos en espiral. El movimiento se elige mediante dibujos reales, sin fundidos entre fotogramas que produzcan imágenes fantasma.

Hexy toca el borde inferior de su lado y la arlequín el borde superior contrario (`y=0`). Ambas posiciones se reflejan al intercambiar lados. Una línea negra diagonal continua conecta los bordes izquierdo y derecho de la pantalla. El sombreado radial y las máscaras de alfa en cintura y laterales integran los retratos sin tarjetas ni cortes rectangulares. Las frases de la arlequín usan 24 px, o 30 px al potenciar, con contorno oscuro; la indicación de control queda en otra línea. El encuadre reserva espacio para el cuerpo real de Hexy y la varita, incluso si contesta desde el aire. El botón de Encore doble se coloca al lado contrario de Hexy para dejar visible su retrato. En el choque invertido, la salud y energía de Hexy pasan a la esquina superior derecha y sus herramientas bajan debajo: así dejan libre la cara de la arlequín en la esquina superior izquierda, también en una ventana de 780 px.

## Medidor y ambiente

El nuevo marco pintado combina la estrella rosada con los dos conos y la luna. El interior usa energía rosada frente a violeta y cian. El medidor no toma la textura de fuego, sus colores naranjas ni su llama. La abertura se registra desde el alfa del propio marco.

El escenario recibe luz rosada del lado de Hexy y violeta desde la pesadilla. El viento incluye remolinos pintados, partículas a distintas profundidades y polvo anclado al suelo. Su desplazamiento integra la dirección a través del tiempo: al responder con Encore doble, frena y se invierte sin reiniciar cada trayectoria. El manga conserva el instante compartido con el choque de fuego y el radial blur continúa tomando la escena completa.

## Arte y reproducción

Se utilizó **ImageGen integrado**, con referencias locales de las ilustraciones aprobadas y salida alfa. Los originales, variantes y correcciones están en [sources](sources/). La revisión final está registrada en [anatomy-selection.json](anatomy-selection.json), con sus prompts en [anatomy-master-prompt.json](anatomy-master-prompt.json), [anatomy-portrait-prompts.json](anatomy-portrait-prompts.json), [anatomy-body-prompts.json](anatomy-body-prompts.json), [anatomy-padding-prompts.json](anatomy-padding-prompts.json) y [anatomy-portrait-padding-prompts.json](anatomy-portrait-padding-prompts.json). Los otros archivos de prompts y [art-sources.json](art-sources.json) conservan el historial previo.

Los recursos de ejecución están en [public/arcade/act-two/nightmare-pressure-v4](../../../public/arcade/act-two/nightmare-pressure-v4/):

| Atlas | Celdas | Uso |
| --- | ---: | --- |
| hexy-ground.webp | 20 | Una mano, sorpresa, apoyo, esfuerzo y refuerzo de pie |
| hexy-air.webp | 20 | La misma actuación suspendida en el aire |
| boss-air.webp | 16 | Carcajada, potenciación y dos grados de resistencia |
| hexy-portraits.webp | 20 | Ilustraciones grandes para los cinco momentos |
| boss-portraits.webp | 16 | Retratos grandes de risa, refuerzo y esfuerzo |
| meter.webp | 1 marco | Medidor exclusivo de este choque |

Son 92 celdas de animación y un marco. El apoyo y el esfuerzo de Hexy ahora tienen sus propias cuatro ilustraciones; el ciclo sostenido usa las cuatro con los dientes apretados. Los retratos se generan aparte y nunca se amplían desde los sprites de juego. Sharp conserva el alfa, selecciona celdas, recorta el plano superior y empaqueta los atlas; no repinta la anatomía. El muestreo de estrellas y palmas mantiene los poderes unidos a los dibujos. Cuando el cabello o la magia cruzan una separación, el empaquetado divide primero las cuatro celdas antes de identificar figuras.

```powershell
node scripts/arcade/pack-nightmare-pressure.mjs
node scripts/arcade/check-nightmare-pressure.mjs
node scripts/arcade/review-nightmare-pressure.mjs
node scripts/arcade/review-nightmare-pressure.mjs --videos
npx playwright test tests/hexy-nightmare-pressure.spec.js tests/hexy-nightmare-aerial.spec.js tests/hexy-episode-two.spec.js tests/hexy-nightmare-madness.spec.js tests/hexy-clash-spectacle.spec.js tests/hexy-encore-repair.spec.js --workers=2 --reporter=line
npx playwright test tests/hexy-nightmare-pressure.spec.js --workers=2 --reporter=line
npm run build
```

Las grabaciones y capturas del renderer real están en [tests/artifacts/arcade/nightmare-pressure-v4](../../../tests/artifacts/arcade/nightmare-pressure-v4/). `double-reversal.webm` muestra el choque completo, `candy-loss.webm` su derrota y `phase-two-moves.webm` / `phase-three-moves.webm` los movimientos y ataques ordinarios. Cada vídeo se decodifica a una hoja `*-playback.jpg`. Las capturas `actual-boost-*.jpg` provienen de los controles reales del juego, en escritorio y en una ventana estrecha.

La revisión usa invulnerabilidad y arranques controlados en las fases para inspeccionar animación y encuadre; no equivale a una evaluación humana de dificultad o diversión. El detalle de arte y comprobaciones se guarda en [art-check.json](art-check.json) y [validation.json](validation.json). Los cambios siguen locales; no se ha hecho otro commit ni push.
