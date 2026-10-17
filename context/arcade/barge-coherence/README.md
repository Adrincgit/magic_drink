# 1-3: agua, percusión y rotura de la Barcaza del Redoble

Revisión del 16 de octubre de 2026. Se conserva la barcaza, sus dos fases, 320/220 de salud, armas destructibles por separado y el núcleo expuesto. No se añaden barras de salud enemiga.

## Lectura y comportamiento

- **Oleada:** el cañón de proa lanza un torrente curvo, con tangente horizontal en su boca. Su frente tarda 0,48 segundos en llegar al suelo; sólo entonces nace la cresta en ese mismo punto. El segundo torrente tarda 0,6 segundos y produce una ola mayor. Se dibuja agua pintada sobre la misma parábola que utiliza la colisión, sin el antiguo segmento descendente que aparecía después de lanzar una ola instantánea.
- **Olas:** dos descargas por ataque, separadas 1,2 segundos (1,5 en suave), y recuperación posterior. Crestas de 108 y 174 unidades de dibujo (154 para la grande en suave). La grande avanza a 245 unidades/s, deja más tiempo de lectura y derriba; se puede superar con doble salto. La pequeña se supera con un salto. Ambas apoyan la espuma en la superficie y usan cuerpos de colisión ligados a su dibujo.
- **Chorro sostenido:** mantiene el ángulo fijado al terminar la preparación y sale de su boquilla independiente. Cuando apunta hacia abajo, su longitud termina en el suelo y genera espuma allí; no atraviesa el piso. Romper el tanque sigue anulando esta arma. El torrente que genera olas corresponde al cañón de proa, por lo que sigue siendo independiente del tanque.
- **Tambor:** se vuelve visible el mecanismo de la maza y el operario de su manivela. Cada golpe coincide con un estallido dorado pintado, una onda sónica y un golpe grave con resonancia. Se alternan alturas; el intervalo es 0,64 segundos en fase 1 y 0,49 en fase 2, ampliado un 20% en suave. Romper el tambor retira estos ataques.
- **Hexy mojada:** conserva sus cuatro poses de golpe con agua y la salpicadura de contacto; añade gotas durante 1,65 segundos. Las gotas aterrizan sobre las superficies reales, también en pendientes. Las olas grandes usan derribo y recuperación protegida. El reintento limpia el estado mojado.
- **Fase 2:** una rotura de presión desprende tres paneles del casco a los 0,55 segundos y revela engranajes, pistón y costillas de hierro. Las armas superiores permanecen en sus coordenadas y sólo se rompen al dañarlas localmente. La transición conserva 2,1 segundos.
- **Derrota:** tres roturas de presión localizadas, escape de tripulantes y separación en ocho piezas de maquinaria/casco, con rueda y cañón reconocibles. Los fragmentos comienzan en sus posiciones reales y se hunden con salpicaduras. Sustituye la cuadrícula de 35 recortes. El premio espera hasta que termina la secuencia a los 4,5 segundos.

Los torrentes continuos y las grandes olas no se miniaturizan dentro de Bubble Tape. Los globos de agua siguen pudiéndose capturar para sabotear la presión y abrir una ventana de castigo.

## Arte y sonido

Generación mediante la herramienta integrada de **ImageGen**, con `pressure-barge.webp` como referencia. Sólo la región del casco inferior del dibujo nuevo sustituye a la pintura original; se preservan los puntos de disparo y las armas superiores.

- [Prompt del casco](phase-two-prompt.txt) y [fuente](phase-two-source.png).
- [Prompt de los efectos](effects-prompt.txt) y [fuente](effects-source.png).
- [Casco de fase 2 integrado](../../../public/arcade/sprites/bosses/barge/phase-two-v2.webp).
- [Ocho sprites de golpe y rotura de presión](../../../public/arcade/sprites/effects/barge-impact-v2.webp).
- Empaquetado: `scripts/arcade/pack-barge-coherence.mjs`.
- Se reutilizan las crestas de `harbor-aquatic.webp`, el agua de `harbor-jet` y las poses de Hexy de `element-hits.webp`.
- Foley del tambor, chorro sostenido, torrente corto, ola grande y rotura: `materialCombatSound.js`, por el mezclador FX existente. El chorro sostenido conserva 1,65 segundos de caudal y el torrente corto tiene su propio efecto de 0,72 segundos. [Audio de comprobación](barge-fx.wav) y [niveles medidos](audio-levels.json).

## Comprobación

`tests/hexy-barge-coherence.spec.js` comprueba emisión e impacto a 60/120/240 fps, una sola cresta por torrente, colisiones, saltos reales, golpe/onda sincronizados, agua en Hexy, armas intactas durante la transformación, fragmentación y sonido sin saturación digital. También se revisan las regresiones de barcaza, armas, blindaje, captura, derrota con ultimate y cámara.

`scripts/arcade/review-barge-coherence.mjs` graba el renderizador real y decodifica los vídeos: [oleada](tidal-playback.png), [tambor](drum-playback.png), [chorro](jet-playback.png), [transformación](phase-two-playback.png), [destrucción](defeat-playback.png) y [Hexy mojada](water-hit-playback.png). Los archivos `.webm` y trazas contiguos conservan las secuencias completas. [Errores de ejecución](runtime-errors.json).

Resultado: 38 casos distintos aprobados entre `tests-final.log` y `tests-recheck.log` (20 casos en la revisión final, incluyendo los diez nuevos); los diez casos nuevos se aprobaron nuevamente tras separar los sonidos de agua en `tests-audio-final.log`. Las dos expectativas antiguas corregidas comprobaban checkpoints retirados y la presencia de un array vacío que el reinicio completo ya no necesita crear. Se revisó el vídeo decodificado de los seis comportamientos, con cero errores de ejecución. La mezcla de los cinco FX, tanto separados como simultáneos, alcanzó un pico de 0,641; FX a cero produjo silencio exacto. Esa medición verifica niveles y funcionamiento del mezclador, no sustituye una valoración auditiva humana.

Compilación final: `npm run build` terminó a las 18:56:14, con 0 errores, 0 advertencias del chequeo de Astro y `[build] Complete!`. [Registro](build.log).
