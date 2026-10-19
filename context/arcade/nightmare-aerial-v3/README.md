# Arlequín de dos conos: arena abierta y choque aéreo

La [revisión de actuación y presión v4](../nightmare-pressure-v4/README.md) sustituye los dibujos de esfuerzo, los retratos del choque, su distribución y el medidor. Se conservan la arena, el salto y las reglas del enfrentamiento descritos aquí.

Revisión local del 18/10/2026. Sustituye la tarima, la pendiente y la rueda del ultimate de las revisiones anteriores. Conserva las tres fases, los juegos de Halloween, las transformaciones protegidas, la bodega y la ilustración violeta de carga elegida por el usuario. El último checkpoint publicado sigue siendo `7a89d0f`; esta revisión no se ha publicado.

## Puesta en escena

- Suelo continuo de 6700 unidades, con una arena principal de 4300 frente a las 2840 del arlequín de fuego. Se puede retroceder hasta la bodega durante el combate. El suelo pintado del salón tiene perspectiva y desplazamiento según profundidad; no se añaden tablones, postes ni plataformas sobre él.
- Salto continuo de 1450 unidades, frente a las 240 del salto de fuego. Primero se revela la altura completa; durante el choque la cámara sigue a Hexy y al frente de la tormenta y puede dejar a la lanzadora fuera de cuadro.
- La mano derecha elevada reúne una masa de pesadilla. Después la palma abierta sostiene una tormenta cónica de viento encantado, máscaras, calabazas y dulces, dirigida en diagonal hacia Hexy. Se conservan las ilusiones como poder de esta arlequín; esta representación no cambia la asignación de piedras del canon.
- Ambos personajes usan dibujos de esfuerzo y expresiones según la presión. Hay retratos grandes independientes de los sprites de juego. La arlequín sonríe cuando está ganando y muestra ojos en espiral y esfuerzo al perder terreno.
- Una potenciación de la arlequín añade diez segundos y lleva la anchura del vórtice de 520 a 1150 unidades. Exige más pulsaciones, con oleadas irregulares y una oportunidad de respuesta cerca de perder. Mantener pulsado ataque no cuenta como pulsaciones repetidas.
- Una nueva pulsación de ultimate activa Encore doble durante 0,85 s, sin otro gasto de reserva. La anchura del disparo pasa de 470 a 950, las corrientes y los fragmentos invierten su dirección, se refuerzan el polvo y el empuje, y vuelve a avanzar el punto de choque. Mantener pulsado el primer ultimate no activa este refuerzo.
- La energía de ambas cargas llega antes del lanzamiento. La preparación del choque espera a que termine también la carga de la arlequín, aunque Hexy responda temprano.
- Victoria y derrota tienen explosión, vuelo y aterrizaje. Al perder, Hexy aparece envuelta en dulce durante la caída y recibe los cuatro corazones de daño del choque después del aterrizaje; la arlequín desciende sin teletransportarse. El ataque sin respuesta causa un golpe de dos corazones y puede esquivarse al desplazarse.

El manga afecta a toda la escena durante los mismos 0,105 s compartidos con el choque de fuego. El radial blur toma muestras del fotograma completo. No se añaden barras de salud enemigas. La carga de pie de Hexy conserva su pose heroica con la varita elevada.

## Arte y fuentes

Se utilizó **ImageGen integrado**, en modo edición con referencias y fondo transparente. Los originales y las correcciones seleccionadas están en [sources](sources/); las instrucciones completas están en [prompts.json](prompts.json) y [cleanup-prompts.json](cleanup-prompts.json). [art-sources.json](art-sources.json) identifica las variantes elegidas. Ningún recurso de ejecución depende de la carpeta personal de imágenes generadas.

Los siete atlas finales están en [public/arcade/act-two/nightmare-aerial-v3](../../../public/arcade/act-two/nightmare-aerial-v3/):

| Recurso | Dibujos | Uso |
| --- | ---: | --- |
| boss-air-actions.webp | 16 | Salto, seis fases de carga elevada, liberación y vuelo de derrota |
| boss-air-effort.webp | 12 | Cuatro gestos de presión con tres dibujos de movimiento cada uno |
| hexy-ground-effort.webp | 12 | Esfuerzo de pie con la varita hacia arriba en diagonal |
| hexy-air-effort.webp | 12 | Esfuerzo aéreo con rodillas recogidas |
| boss-effort-portraits.webp | 4 | Retratos grandes originales de la arlequín |
| hexy-effort-portraits.webp | 4 | Retratos grandes originales de Hexy |
| candy-vortex.webp | 8 | Tormenta pintada animada |

Son 68 dibujos: 52 cuerpos, ocho retratos y ocho efectos. Sharp únicamente aísla figuras, conserva el alfa y empaqueta celdas; no repinta anatomía ni expresiones. Los retratos no se amplían durante el empaquetado. Los registros miden estrellas, palmas y el frente del vórtice para unir los efectos con los dibujos. El chequeo de los atlas, transparencia y bordes está en [art-check.json](art-check.json).

## Comprobación y reproducción

La revisión compara la pelea de fuego con la nueva mediante el motor y renderer reales en Chrome. Las grabaciones se decodifican a hojas de fotogramas para revisar saltos, anticipación, sonrisas, presión, ampliaciones, desenlace, suelo y encuadre.

```powershell
node scripts/arcade/pack-nightmare-aerial.mjs
node scripts/arcade/check-nightmare-aerial.mjs
node scripts/arcade/review-nightmare-aerial.mjs
node scripts/arcade/review-nightmare-aerial.mjs --videos
npx playwright test tests/hexy-nightmare-aerial.spec.js tests/hexy-episode-two.spec.js tests/hexy-act-two.spec.js tests/hexy-nightmare-madness.spec.js tests/hexy-power-clash.spec.js tests/hexy-clash-spectacle.spec.js --workers=2 --reporter=line
npm run build
```

Material de revisión en [tests/artifacts/arcade/nightmare-aerial-v3](../../../tests/artifacts/arcade/nightmare-aerial-v3/): `extreme-leap.webm`, `double-reversal.webm`, `candy-loss.webm`, `fire-reference.webm` y sus hojas `*-playback.jpg`. `near-defeat.jpg`, `reversal.jpg`, `left-air.jpg` y `manga-impact.jpg` muestran las situaciones clave. Las capturas son de ejecución real; la preparación de las grabaciones sitúa directamente la fase tres y concede invulnerabilidad para inspeccionar el espectáculo. No equivalen a una partida humana ni prueban por sí solas la dificultad o que el resultado sea subjetivamente superior al combate de fuego.

Las pruebas cubren también recorrido libre, salto sin teletransporte, carga completa, mano y varita desde ambos lados y en el aire, reserva, pulsación nueva, presión, viento inverso, derrota, reintento y las tres fases. Las pruebas de fuego conservan sus expectativas funcionales; sus fixtures se sincronizan con la duración y los atlas vigentes, en vez de los fotogramas de una carga anterior.

Resultado final: 74 pruebas distintas aprobadas (suite comparativa de 72 y dos casos adicionales del ataque a?reo; nueve casos a?reos repetidos despu?s del ?ltimo ajuste). Build completo con cero errores; navegador sin errores de ejecuci?n ni recursos faltantes. V?ase [validation.json](validation.json).
