# Auditoría de animación de la arlequín 2-5

18/10/2026. Auditoría de la implementación local vigente, sin modificar el combate ni reemplazar sus recursos. Se instrumentaron **36 secuencias a 120 pasos por segundo**, se revisaron los nueve atlas activos de la arlequín, sus galerías, las grabaciones actuales del choque y las fases 2/3, y dos grabaciones nuevas de fase 1 y transiciones. [Mediciones completas](measurements.json).

## Dictamen

El choque y la carga aérea tienen ciclos de sprites; la mayor parte del combate ordinario sigue montada con poses mantenidas. La caminata tiene suficientes dibujos, pero su escala no coincide con la de reposo y lanzamiento. Por tanto, la pelea **todavía no tiene una secuencia de animación uniforme** comparable a la del arlequín de fuego. El problema principal está en la continuidad, la normalización y el reparto de dibujos entre movimientos.

## Hallazgos, por prioridad

### Alta: cambia el tamaño del personaje al cambiar de animación

Los atlas se ajustaron por separado a sus límites de alto/ancho. Con la misma celda de 512 y el mismo tamaño de dibujo del juego, la fase 2 pasa de una silueta de 316 px en reposo a 405–426 px en los primeros pasos; la fase 3, de 308 a 398–416 px. El disparo de fase 3 ocupa 279 px. Son alturas de la **silueta pintada**, que también dependen de la pose; la [comparación a escala idéntica](../../../tests/artifacts/arcade/nightmare-animation-audit/scale-comparison.jpg) muestra además la diferencia de tamaño de cabeza y torso.

En el cielo es más marcado: los primeros cels de risa ocupan 262–272 px de alto, mientras que el refuerzo nuevo ocupa aproximadamente 440–442 px; el código sigue dibujando ambos a tamaño 280. Al responder Hexy se vuelve al grupo pequeño. No hay una transformación corporal explícita que prepare ese cambio.

Origen: [selección y tamaño de las hojas](../../../src/components/arcade/adventure/actors/bosses/adventureActTwoBosses.js), [normalización independiente de fases y caminatas](../../../scripts/arcade/pack-nightmare-madness.mjs), y [mezcla de cels aéreos antiguos con el nuevo grupo normalizado a 442 px](../../../scripts/arcade/pack-nightmare-sprites.mjs).

**Corrección propuesta:** establecer una escala anatómica común por personaje y anclas de cabeza, torso, mano y apoyo. Comprobar el paso caminar → preparar → lanzar → recuperar y el paso risa aérea → refuerzo → contraataque. No calcular una escala independiente para cada hoja a partir del espacio que ocupa el pelo o una mano extendida.

### Alta: varias técnicas distintas comparten una preparación y una descarga estáticas

Abanico, espiral, ráfaga cortante y carriles usan el cel 4 durante la preparación, el 5 durante la descarga y el 7 durante la recuperación. La lluvia cambia la preparación al cel 6, pero vuelve a los mismos 5 y 7. En la espiral, el personaje permanece **1,76 segundos en un único cel de disparo**; en la lluvia, **1,81 segundos**. El movimiento de los proyectiles no anima el cuerpo, la mano o el cabello que los lanza.

La recuperación permanece en una pose entre **1,1 y 1,46 segundos** en estos movimientos. Fuente: [selección de cels](../../../src/components/arcade/adventure/actors/bosses/adventureActTwoBosses.js), mediciones `spiral-volley-3`, `nightmare-rain-3` y `wind-shear-3`. [Ejemplo de secuencia de la espiral](../../../tests/artifacts/arcade/nightmare-animation-audit/spiral-volley-3.jpg).

**Corrección propuesta:** cadenas de 8–12 dibujos por familia de lanzamiento: anticipación, liberación, bucle de esfuerzo y recuperación. Dar gestos diferentes al abanico con bastón, la espiral con la palma, la lluvia y el corte de viento. No acelerar las poses actuales 4/5/7 como si fueran intermedios: son gestos completos, y alternarlos rápidamente reproduciría los saltos visuales que el usuario ya señaló.

### Alta: el salto corto y el doble salto tienen dos poses en total

La anticipación y la recuperación usan el cel 7. Casi todo el vuelo usa el 11; se cambia por la altura del cuerpo, sin dibujos propios de impulso, punto alto, descenso y absorción de la caída. El doble salto repite el mismo par. [Secuencia medida del salto de fase 2](../../../tests/artifacts/arcade/nightmare-animation-audit/moon-hop-2.jpg).

**Corrección propuesta:** 8–10 cels coherentes por salto, repartidos entre compresión, impulso, ascenso, punto alto, descenso y aterrizaje. El segundo salto puede reutilizar parte de la secuencia con otro gesto facial o dirección, manteniendo su aviso independiente.

### Media: la ilusión tiene buen aviso, pero no una secuencia corporal propia

La desaparición oculta el personaje durante 0,3 s. Después reaparece usando directamente el mismo cel 5 de disparo, que mantiene unos 1,26 s. La advertencia, el destino comprometido y la espera antes del proyectil funcionan, pero la disolución y reaparición dependen de efectos externos. [Secuencia de la ilusión](../../../tests/artifacts/arcade/nightmare-animation-audit/wind-blink-3.jpg).

**Corrección propuesta:** 6–8 dibujos para ruptura en viento, ausencia, reconstrucción, gesto previo a disparar y salida. Conservar la batalla 1 contra 1 y el aviso del destino.

### Media: entrada y cambios de fase se sostienen con un solo dibujo

La entrada usa un cel durante **1,8 s**. Cada transformación mantiene un único cel durante **2,01 s**. La tercera fase añade el retrato de locura y efectos, pero ese retrato de transformación también es una imagen fija. Las poses de reposo 0–3 cambian cada **1,1 s** en fases 1/2 y **0,8 s** en fase 3; en las últimas fases son gestos bastante distintos, no un ciclo continuo de respiración o cabello.

**Corrección propuesta:** entrada de 6–8 dibujos, transiciones de 8–12 y un reposo coherente de 6–8 cels. Los gestos largos de burla pueden ser acciones ocasionales con sus propios intermedios. [Grabación de transiciones](../../../tests/artifacts/arcade/nightmare-animation-audit/phase-transitions.webm).

### Media: la derrota tras el choque repite la caída

La medición del choque ganado registra: vuelo aéreo con cels 14/15 → aterrizaje con 14/15 de la fase 3 → pose de recuperación 2 durante un paso → secuencia de muerte 12/13/14/15. Cuando la arlequín ya está tendida, vuelve a dibujos anteriores de daño y caída. El vuelo, además, solo usa dos dibujos y mantiene el segundo aproximadamente un segundo.

**Corrección propuesta:** continuar desde el estado tendido hacia una derrota propia; evitar reproducir otra caída completa. Añadir 4–6 dibujos de expulsión aérea y 3–4 de contacto/reacción en el suelo. Fuentes: [dibujo durante vuelo y aterrizaje](../../../src/components/arcade/adventure/actors/bosses/nightmareUltimate.js), [salida del choque](../../../src/components/arcade/adventure/engine/nightmarePowerClash.js) y [tira cronológica](../../../tests/artifacts/arcade/nightmare-animation-audit/ultimate-clash.jpg). La tira muestra también estados lógicos que el renderer puede ocultar al finalizar; no debe interpretarse la pose lógica `defeated` como un personaje visible después de desaparecer.

## Reparto actual de dibujos

| Movimiento | Sprites que usa ahora | Evaluación |
| --- | --- | --- |
| Caminar, cada fase | 12 | Base coherente; corregir escala frente a otras acciones |
| Reposo, cada fase | 4 gestos, pausas de 0,8–1,1 s | Intermedios insuficientes en fases 2/3 |
| Reacción al golpe | 2 poses breves en reposo | La anticipación conserva su gesto y usa destello para mantener legible el ataque |
| Entrada | 1 durante 1,8 s | Estática |
| Abanico / espiral / carriles / corte | 1 preparar + 1 lanzar + 1 recuperar | Escasa actuación y gestos compartidos |
| Lluvia | 1 preparar + 1 lanzar + 1 recuperar | Otra técnica con la misma descarga |
| Salto / doble salto | 2 poses | El vuelo mueve un único dibujo |
| Ilusión | 1 preparar + ocultación + 1 lanzar + 1 recuperar | Efectos suficientes para leerla; falta actuación corporal |
| Cambios de fase | 1 durante unos 2 s | Falta transformación dibujada |
| Salto extremo | 4 en 1,45 s | Ampliable a 8–10 para suavizar el impulso |
| Carga aérea | 6 a 12 cambios/s | Buena base; revisar el enlace con la liberación |
| Cuerpo en el choque | 4 por grupo, 12 dibujos visibles distintos | Refuerzo y dominio comparten el mismo grupo; corregir la escala |
| Retratos del choque | 4 por expresión, 16 dibujos distintos | La actuación más desarrollada de la pelea |
| Expulsión tras choque ganado | 2 durante 1,46 s | Insuficiente para la duración y el recorrido |
| Muerte ordinaria | 4 en 2,7 s | Hay progresión, pero holds largos; corregir primero su enlace tras el choque |

Los nueve atlas contienen **132 celdas y 128 imágenes distintas por píxel visible**. Eso no equivale a 128 fotogramas de una misma secuencia ni demuestra fluidez. Los RGB ocultos por alfa cero se excluyen de la comparación: de lo contrario, WebP haría parecer distintas algunas celdas repetidas. Se conservaron los hashes de archivos y cels en las mediciones.

## Comparación medida con el arlequín de fuego

La comparación usa el selector y el motor reales de ambos personajes. En el abanico de fuego se observaron **4 cels de anticipación y 7 durante la descarga**, frente a 1 y 1 en la espiral de viento. En el salto de fuego se observaron **7 durante el ataque**, frente a 2 en el salto corto de la arlequín. La carrera de fuego conserva 12 cels de impulso/aviso y 12 de desplazamiento en su acción de carrera. Esto explica por qué el conjunto de la pelea de fuego se siente más animado, aunque el choque de viento tenga retratos nuevos.

## Orden de trabajo recomendado

1. Unificar escala y anclas; es un defecto de continuidad que añadir sprites no arreglaría por sí solo.
2. Animar las familias de lanzamiento y su recuperación; son las poses mantenidas que más se repiten.
3. Completar salto, doble salto e ilusión con intermedios.
4. Dar secuencias propias a entrada, cambios de fase y derrota final.
5. Conservar caminatas, carga y retratos útiles, afinando sus enlaces y manteniendo la progresión de locura.

Los presupuestos de fotogramas propuestos son objetivos artísticos para esta pelea, no una regla universal. La dificultad y la diversión requieren jugarla; esta auditoría evalúa continuidad y cobertura visual.

## Evidencia y reproducción

```powershell
node scripts/arcade/audit-nightmare-animation.mjs
node scripts/arcade/review-nightmare-animation-audit.mjs --videos
```

[Galerías y tiras de cada movimiento](../../../tests/artifacts/arcade/nightmare-animation-audit/). [Comparativa de tamaños](../../../tests/artifacts/arcade/nightmare-animation-audit/scale-comparison.jpg). [Fase 1 grabada](../../../tests/artifacts/arcade/nightmare-animation-audit/phase-one-moves.webm). [Fase 2 vigente](../../../tests/artifacts/arcade/nightmare-sprites-v6/phase-two-moves.webm). [Fase 3 vigente](../../../tests/artifacts/arcade/nightmare-sprites-v6/phase-three-moves.webm). [Choque vigente](../../../tests/artifacts/arcade/nightmare-sprites-v6/double-reversal.webm).

Las grabaciones usan arranques controlados e invulnerabilidad para inspección. La grabación de transiciones fuerza únicamente el daño necesario para alcanzar cada fase. El navegador de auditoría no registró errores. No se ha cambiado código de producción, balance, sprites ni publicaciones en esta auditoría; las 58 pruebas y el build de v6 son la verificación anterior, no una ejecución nueva atribuida a este informe.
