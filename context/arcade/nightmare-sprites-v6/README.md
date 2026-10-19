# Arlequín de dos conos: sprites de actuación y duelo 1 contra 1

Revisión local del 18/10/2026. Sustituye el dibujo mantenido y la deformación de [v5](../nightmare-corners-v5/README.md) por ciclos de fotogramas dibujados. Conserva las poses de Hexy con el brazo bajo, las esquinas manga, la arena abierta, el salto extremo, las tres fases y los desenlaces del choque.

## Actuación con sprites

Cada expresión tiene cuatro cels distintos, reproducidos con `drawImage` a diez cambios por segundo en una secuencia de ida y vuelta. No se deforma una imagen para simular pelo o esfuerzo. Las poses se registran por la estrella del sombrero de Hexy y por el rostro de la arlequín; no se reajusta el encuadre según el pelo que sobresale en cada fotograma.

Hexy pasa por concentración, sorpresa, apoyo con la segunda mano, presión sostenida y respuesta decidida. Apoyo y presión comparten el mismo ciclo de cuatro dibujos de esfuerzo; la respuesta tiene su propio ciclo. Hay **16 dibujos de Hexy**, no veinte dibujos únicos. Se conserva su aspecto joven y cada dibujo tiene dos brazos.

La arlequín usa cuatro ciclos de retratos: risa, locura con la mano junto al rostro durante el refuerzo, risa sádica con ojos en espiral cuando su ataque avanza, y esfuerzo ante el contraataque. Son **16 dibujos de retrato**. La figura del cielo también cambia de cel: risa inicial, nuevo ciclo aéreo de locura y esfuerzo al perder. Se reutilizan los cels aéreos dibujados de v4 para risa y esfuerzo; el nuevo ciclo de cuatro dibujos aéreos con ojos en espiral se usa en refuerzo y dominio.

El retrato de Hexy baja de 420 a 350 unidades de ancho. La estrella queda dentro de su recurso con más de 40 píxeles nativos de margen, sin resplandor recortado en el archivo. El brillo se dibuja alrededor de la posición registrada de cada cel y se desvanece en la pantalla, sin el borde rectangular de una imagen.

## Refuerzo y dificultad

El refuerzo rival tiene **1,25 segundos de preparación**: el contador y la presión del choque se mantienen, la energía se ralentiza, la cámara se acerca a la arlequín, aparece su expresión de locura y habla en un globo. Después emplea **0,85 segundos** en ampliar el ataque y empujarlo; sigue añadiendo diez segundos al límite del choque. El globo se aparta durante el acercamiento para dejar visible a la figura del cielo.

En dificultad normal, el ritmo de equilibrio sin una oleada activa pasa aproximadamente de **4,3 a 16 pulsaciones por segundo** tras el refuerzo. Las oleadas añaden presión temporal. Las pulsaciones ordinarias siguen frenando la pérdida, y el jugador dispone de su ventana de último esfuerzo para responder. El intervalo mínimo entre pulsaciones válidas baja a 0,045 segundos para permitir esfuerzos rápidos reales. El segundo ultimate elimina la resistencia extra, invierte el viento y recupera la exigencia normal; no vuelve a gastar reserva ni magia.

Estas cifras describen la ecuación del juego. La comodidad, accesibilidad y dificultad percibida requieren jugarlo; las grabaciones controladas no equivalen a una prueba humana de equilibrio.

## Combate individual

La lista de movimientos ya no incluye invocaciones ni espejos que disparan como entidades separadas. Las fases emplean abanicos y espirales de viento morado, saltos, lluvia, carriles y ráfagas cortantes. La ilusión `wind-blink` anuncia su destino, desaparece, reaparece cerca de Hexy y espera antes de disparar hacia la posición anunciada; no crea otro enemigo. Al entrar al duelo se retiran los enemigos previos y se cancelan las emboscadas pendientes. El resto de jefes conserva sus mecánicas.

No hay barras de vida enemigas. El medidor visible es la presión del choque; el HUD de salud de Hexy se conserva.

## Arte y comprobaciones

Modo de arte: **ImageGen integrado**. [Originales y referencias](sources/). Prompts: [primeros ciclos](prompts.json), [reacciones](reaction-prompts.json), [locura y actuación aérea](madness-prompts.json), [risa con la mano en el rostro](glee-prompt.json). Los archivos `*-master` son referencias de v5, y `boss-surge` sirvió de referencia intermedia; no se consumen en el juego.

Sharp separa celdas, descarta motas desconectadas de la extracción, conserva los RGB y el alfa del personaje, registra posiciones y empaqueta. No dibuja anatomía, ojos, expresiones o fotogramas intermedios. Recursos usados por el juego: [public/arcade/act-two/nightmare-sprites-v6](../../../public/arcade/act-two/nightmare-sprites-v6/).

```powershell
node scripts/arcade/pack-nightmare-sprites.mjs
node scripts/arcade/check-nightmare-sprites.mjs
node scripts/arcade/review-nightmare-sprites.mjs
node scripts/arcade/review-nightmare-sprites.mjs --videos --only=double-reversal,candy-loss,phase-two-moves,phase-three-moves
node scripts/arcade/review-nightmare-sprite-motion.mjs
npx playwright test tests/hexy-nightmare-pressure.spec.js tests/hexy-nightmare-aerial.spec.js tests/hexy-episode-two.spec.js tests/hexy-nightmare-madness.spec.js tests/hexy-clash-spectacle.spec.js tests/hexy-encore-repair.spec.js --workers=2 --reporter=line
npm run build
```

El [control de atlas](art-check.json) verifica que cada expresión contiene cuatro imágenes distintas, las esquinas transparentes y el registro de la estrella. La anatomía, las expresiones y la continuidad se comprueban en las grabaciones decodificadas del renderer real, disponibles en [la carpeta de revisión](../../../tests/artifacts/arcade/nightmare-sprites-v6/). Los resultados finales se registran en [validation.json](validation.json).

Verificación final: **58 pruebas aprobadas**, incluidas las dos orientaciones del control real de Encore doble, la pausa de preparación, el cambio de exigencia de pulsaciones y la ilusión sin enemigos adicionales. `npm run build` terminó con `[build] Complete!` y cero errores. Se revisaron los cuatro vídeos decodificados, [24 muestras cercanas de actuación](../../../tests/artifacts/arcade/nightmare-sprites-v6/sprite-motion-playback.jpg) y el [acercamiento durante el refuerzo](../../../tests/artifacts/arcade/nightmare-sprites-v6/boost-closeup-playback.jpg). No hubo errores de navegador ni recursos ausentes.

[Ver choque y Encore doble](../../../tests/artifacts/arcade/nightmare-sprites-v6/double-reversal.webm). [Ver derrota](../../../tests/artifacts/arcade/nightmare-sprites-v6/candy-loss.webm). [Ver ataques de fase 2](../../../tests/artifacts/arcade/nightmare-sprites-v6/phase-two-moves.webm). [Ver ataques de fase 3](../../../tests/artifacts/arcade/nightmare-sprites-v6/phase-three-moves.webm).

Cambios locales, sin nuevo commit ni push.
