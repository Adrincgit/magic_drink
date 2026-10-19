# Arlequina: reglas y coreografía de combate

La derrota anterior podía decidirse por el reloj aunque el contacto entre poderes todavía estuviera en el centro del escenario. Además, la entrada temprana al ultimate y las respuestas prioritarias del báculo dejaban poco espacio a los demás ataques. Esta revisión cambia esas reglas de juego además de añadir dibujos.

## Choque y ultimate

- La potenciación sorpresa comienza al alcanzar el 88 % del recorrido hacia la arlequina. Si el reloj vence mientras Hexy avanza, ella puede activar esa resistencia en ese instante. El reloj por sí mismo nunca concede una victoria ni una derrota.
- El punto de choque usa toda la distancia entre varita y palma: 0 corresponde a Hexy y 1 a la arlequina. Se eliminó el margen visual que mantenía los rayos separados de sus emisores incluso cuando la simulación daba el combate por terminado.
- Solo alcanzar uno de esos extremos resuelve el choque. El avance potenciado se frena gradualmente cerca de Hexy para dar margen a las pulsaciones, sin pausas invisibles ni una derrota por tiempo.
- Encore doble mantiene el contacto durante la carga y lo devuelve al centro al descargar. Después sigue siendo necesario pulsar: la arlequina puede recuperar terreno y ganar. En ese caso muestra una sonrisa con esfuerzo y sudor. Si va a perder, conserva la expresión de desesperación.
- El ultimate aéreo ordinario se reserva al último 15 % de vida. Un golpe grande no puede saltarse su primera oportunidad de resistencia. Se mantienen los ataques ordinarios durante el resto de la última fase.
- Sin contrarrestar, el proyectil viaja a 2450 unidades/s. La colisión recorre el segmento entre posiciones para evitar saltarse a Hexy a esa velocidad. El contacto directo es letal incluso ante guardia, escudos o el tiempo de gracia de un daño anterior.
- Un impacto en el suelo genera fuego y humo púrpura. La onda de viento se expande hasta 870 unidades y puede empujar/tumbar con las ocho celdas de caída de Hexy sin quitar corazones. El rayo directo y la onda tienen reglas de daño diferentes.
- En un impacto letal el HUD pasa a cero corazones en la explosión; las animaciones de vuelo, caída y aterrizaje terminan antes de la pantalla de derrota.

Estas reglas quedan también en [AGENTS.md](../../../src/components/arcade/adventure/AGENTS.md).

## Ataques ordinarios e ilusiones

- Selección por fase y distancia, con memoria de los dos últimos ataques para evitar repeticiones. El giro defensivo tiene diez segundos de espera y el contraataque cercano respeta el turno de la coreografía.
- Barrido doble del báculo con agarre extendido, anticipación, arrastre pintado, seguimiento y recuperación. Su alcance físico se registra desde el dibujo del arma.
- Giro acrobático con subida, inversión, barrido aéreo y aterrizaje; se conservan los saltos de doce dibujos y las carreras de doce dibujos por fase.
- Las cuatro ilusiones se desplazan. Dos lanzan proyectiles de viento desde sus propias posiciones y dos se aproximan con ataques de báculo. Cada ataque fija su objetivo antes de liberarse y muestra una advertencia. Comparten las reglas de daño y guardia del enemigo real; no son minions con vida independiente.
- Se conserva la gradación de color de la ilusión, el torbellino Halloween con fantasmas y calabazas, los globos pintados y el escenario de capas con la ciudad y la luna estables.

## Arte y reproducción

Modo de generación: **ImageGen integrado**, usando el diseño aprobado y [swingspin.gif](../../../public/arcade/references_temp/swingspin.gif) como referencia de movimiento del arma. No se utilizó CLI ni API alternativa.

- Arte de ejecución: [public/arcade/act-two/nightmare-combat-v11](../../../public/arcade/act-two/nightmare-combat-v11/).
- Fuentes elegidas: [sources](sources/). Los atlas del báculo y de explosión consumen las versiones `-spaced.png`; las fuentes iniciales se conservan como referencia.
- Instrucciones: [prompts.json](prompts.json) y [spacing-prompts.json](spacing-prompts.json).
- [Registro de tamaño, pies, alcance y palma](registration.json). Los efectos separados por transparencia se agrupan con su celda para conservar las puntas de arrastre y las volutas de humo.
- Empaquetador: `node scripts/arcade/pack-nightmare-combat.mjs`.
- Capturas: `node scripts/arcade/review-nightmare-combat.mjs`.
- Grabaciones y decodificación: `node scripts/arcade/review-nightmare-combat.mjs --videos`. Se puede limitar a una grabación mediante `--scene=nombre`.

| Recurso | Dibujos |
| --- | --- |
| `staff-sweep-2.webp`, `staff-sweep-3.webp` | 12 por fase: barrido, acrobacia y reverso |
| `boss-air.webp`, `boss-portraits.webp` | 28 por atlas: 24 anteriores y 4 de felicidad con esfuerzo |
| `purple-detonation.webp` | 8 pasos de fuego, explosión y humo |

Son 36 dibujos nuevos, además de las secuencias de las revisiones anteriores. El escenario y el torbellino aprobados se conservan.

## Evidencia

- [Báculo y acrobacias](../../../tests/artifacts/arcade/nightmare-combat-v11/staff-acrobatics.webm), [reproducción decodificada](../../../tests/artifacts/arcade/nightmare-combat-v11/staff-acrobatics-playback.jpg).
- [Ilusiones que atacan](../../../tests/artifacts/arcade/nightmare-combat-v11/attacking-illusions.webm), [reproducción decodificada](../../../tests/artifacts/arcade/nightmare-combat-v11/attacking-illusions-playback.jpg).
- [Explosión sin contrarrestar](../../../tests/artifacts/arcade/nightmare-combat-v11/uncountered-blast.webm), [reproducción decodificada](../../../tests/artifacts/arcade/nightmare-combat-v11/uncountered-blast-playback.jpg).
- [Derrota posible después de Encore doble](../../../tests/artifacts/arcade/nightmare-combat-v11/double-encore-can-lose.webm), [reproducción decodificada](../../../tests/artifacts/arcade/nightmare-combat-v11/double-encore-can-lose-playback.jpg).
- [Sorpresa cerca de perder y victoria con pulsaciones](../../../tests/artifacts/arcade/nightmare-combat-v11/near-defeat-surprise.webm), [reproducción decodificada](../../../tests/artifacts/arcade/nightmare-combat-v11/near-defeat-surprise-playback.jpg).
- [Coreografía elegida por la IA](../../../tests/artifacts/arcade/nightmare-combat-v11/ai-deck.webm), [reproducción decodificada](../../../tests/artifacts/arcade/nightmare-combat-v11/ai-deck-playback.jpg).
- [Capturas y estados](../../../tests/artifacts/arcade/nightmare-combat-v11/snapshots.json), [reporte del navegador](../../../tests/artifacts/arcade/nightmare-combat-v11/browser-report.json).

Las grabaciones reproducen la simulación con entradas preparadas y vida protegida para observar los ataques. Las pruebas de daño usan la simulación real sin esa protección y verifican por separado la muerte directa, el viento sin daño, las ilusiones físicas y la derrota tras Encore doble. Las capturas no sustituyen a las grabaciones decodificadas.

## Verificación

`tests/hexy-nightmare-combat.spec.js` añade trece casos sobre reglas del choque, última resistencia, daño, variedad real de la IA, ilusiones y continuidad de los nuevos dibujos.

- La suite amplia terminó con 95/96 pruebas aprobadas, incluyendo teclado, tacto, mando y movimiento reducido. El único fallo restante detectó que la respuesta cercana podía consumir el turno de un ataque de viento. [Registro](final-test-log.txt).
- Después de corregir ese turno y registrar la vida cero en el impacto, se ejecutaron completas las suites de combate e IA: **21/21 aprobadas**, incluyendo una nueva regresión que impide saltarse el viento. En conjunto quedan cubiertos los 97 casos actuales entre las dos ejecuciones. [Registro final](combat-and-ai-recheck-log.txt).
- **Seis grabaciones decodificadas y revisadas**, más capturas puntuales. El vídeo de selección de IA incluye el empuje de viento después de los barridos y la cadena de báculo.
- Navegador: **0 errores de página y 0 recursos de arcade ausentes**.
- Build final: **0 errores, 0 advertencias de Astro y 40 hints**, con `[build] Complete!`. Permanece el aviso informativo previo de Browserslist sobre su base local. [Registro final](complete-build-log.txt).
