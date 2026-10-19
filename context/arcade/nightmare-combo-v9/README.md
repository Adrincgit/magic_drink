# Arlequina: combo, espejismos y frente completo del choque

La revisión v9 amplía los ataques de la arlequina y corrige el borde del torbellino. Conserva los sprites aprobados de Hexy, los ojos cian/magenta en la última fase y el retorno exacto a la mitad al soltar Encore doble.

## Comportamiento

- El combo de báculo golpea por detrás, reaparece enfrente y después arriba. Cada continuación fija su destino durante una anticipación visible. La caída usa ocho dibujos nuevos por variante; el punto registrado de la luna toca el mismo lugar que la onda del suelo y las doce nubes de polvo. Alejarse o saltar permite esquivar; después queda una apertura vulnerable.
- Los contraataques cercanos alternan el golpe breve y el combo desde la segunda fase. El combo también forma parte de la rotación de ataques de las fases dos y tres.
- Dos movimientos de viento atraen o empujan a Hexy sin quitar vida. Se integran en el movimiento normal, con límites del escenario; bloquear, saltar o esquivar reduce el desplazamiento.
- El espejismo muestra cuatro copias ópticas con los mismos dibujos animados de la arlequina y aplica una transición de color neón al mundo. Las copias no tienen cuerpos de combate, vida ni emisores: solo dispara la arlequina real. El efecto termina con el movimiento y conserva una variante suave para movimiento reducido.
- Tras Encore doble, al llegar a un 82 % de presión a favor de Hexy, la arlequina puede resistir una sola vez durante 1.2 s. Muestra su expresión frustrada y «¿¡MÁS MAGIA!?». El impulso es finito y se puede vencer manteniendo las pulsaciones; no vuelve a habilitar el refuerzo inicial ni otra carga de Encore.
- «¡Serás mi dulce!» tiene un corte horizontal que entra desde el borde derecho. La pose de la mejilla no sustituye la mano emisora del personaje en el mundo.
- El flash manga de la explosión comienza al recibir el golpe el personaje que pierde, después del avance del rayo. Conserva el detalle en tinta y papel y se omite en movimiento reducido.
- Los ataques, avisos y partículas ambientales de esta pelea ya no usan el atlas de máscaras. El nuevo torbellino contiene viento violeta, lunas y cristales, sin caras, fantasmas ni calabazas. Se dibuja la celda completa, sin el recorte intermedio que producía el borde recto en el choque.

## Arte

Se usó **ImageGen integrado**. El conjunto exacto de prompts y referencias está en [prompts.json](./prompts.json). Las tres imágenes seleccionadas se conservaron en `sources/`:

- `staff-down-2.png`: ocho dibujos del golpe descendente con ojos normales.
- `staff-down-3.png`: ocho dibujos con espirales cian/magenta.
- `moon-storm.png`: ocho dibujos del torbellino sin rostros y con todo su contorno visible.

`node scripts/arcade/pack-nightmare-combo.mjs` genera los tres atlas de `public/arcade/act-two/nightmare-combo-v9/` y los puntos de registro de `nightmareComboRegistration.js`. El empaquetado conserva el alfa original, el cuerpo completo y márgenes transparentes entre celdas. No inventa poses ni deforma las extremidades.

## Comprobación

- `tests/hexy-nightmare-combo.spec.js` comprueba los tres avisos, las dos orientaciones, el contacto real del báculo con el suelo, la evasión, las fuerzas sin daño, las copias ópticas, la resistencia finita, el flash al recibir la explosión y la ausencia del recorte intermedio.
- `node scripts/arcade/review-nightmare-combo.mjs` captura los momentos concretos y sus estados y tiempos en `tests/artifacts/arcade/nightmare-combo-v9/`.
- `node scripts/arcade/review-nightmare-combo.mjs --videos` graba y decodifica el combo, el espejismo con las dos fuerzas y el doble Encore.
- La regresión terminó con **75 pruebas aprobadas**, incluidos teclado, mando y móvil. El build terminó con **0 errores, 0 advertencias, 36 sugerencias** y `[build] Complete!`. Los resultados se conservan en `test-log.txt` y `build-log.txt`.
- Se revisaron las 22 capturas de momentos concretos y las tres hojas decodificadas de los videos finales. La grabación del doble Encore termina con la arlequina derrotada. `browser-report.json` terminó sin errores ni recursos faltantes.

No se añadieron barras de vida enemigas. Esta revisión no incluye commit ni publicación.
