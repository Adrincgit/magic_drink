# Arlequina: báculo, impulso y torbellino

## Resultado

- Contraataque de báculo al acercarse a 185 unidades: destino comprometido detrás de Hexy, anticipación de 0.55 s, desaparición y reaparición a los 0.18 s de ataque. La arlequina levanta el báculo antes del golpe activo entre 0.52 y 0.72 s; después queda vulnerable. Saltar o salir del alcance permite esquivarlo. Tiene enfriamiento de 5.2 s y no añade enemigos ni proyectiles invisibles.
- Dos hojas de **ocho dibujos de báculo** para ojos normales y fase de espirales, con puntos de seguimiento del remate. La última fase conserva los ojos cian con espiral magenta.
- La carga del refuerzo enemigo frena la textura, el flujo y el frente durante **1.25 s**. En el instante de descarga se dispara el impacto manga, comienza el avance, vuelve a correr el contador y el poder se expande durante **0.85 s**. No hay otro impacto manga al terminar esa expansión.
- Encore doble frena durante **0.85 s** de carga y después devuelve el frente al **punto medio exacto entre ambas manos** durante 0.28 s. La resistencia vuelve a la normal y se conserva la pulsación posterior para ganar.
- Las dieciséis celdas aéreas recibieron una edición de ojos y otra de manos: palmas abiertas con **cuatro dedos y pulgar**. Los seis frames de carga elevados se revisaron ampliados en el atlas final, no solo en la imagen generada.
- El cuerpo y retrato continuos mantienen la palma extendida durante el choque. La pose que toca la mejilla aparece en un corte separado y breve antes de la descarga. La resistencia tras Encore doble conserva los mismos ojos y la misma mano emisora.
- El torbellino nace de una salida estrecha en la palma y se ensancha suavemente hacia el choque. El estrechamiento se prepara por columnas de un píxel y se cachea por cel para evitar escalones al acercar la cámara.
- Nuevas lunas y estelas de energía violeta para la arlequina, distintas de las estrellas y notas de Hexy. Ráfagas helicoidales, fragmentos, polvo y viento inverso acompañan al refuerzo.
- Globos con bordes pintados y texto localizado. El escenario pintado y las cortinas oscilan con el viento; la amplitud aumenta con el ataque y el suelo conserva su plano de contacto. Movimiento reducido omite esa oscilación.

## Arte y reproducción

Se utilizó **ImageGen integrado**. Se conservaron los originales, prompts, referencias y ediciones seleccionadas en esta carpeta:

- [prompts.json](./prompts.json): báculo, esfuerzo, energía y globos.
- [eye-prompt.json](./eye-prompt.json): continuidad de ojos cian/magenta en las dieciséis poses aéreas.
- [hand-prompt.json](./hand-prompt.json): corrección anatómica de las palmas abiertas.
- `sources/`: imágenes originales seleccionadas; `aerial-five-fingers.png` es la fuente aérea final.

`node scripts/arcade/pack-nightmare-storm.mjs` produce los siete atlas de `public/arcade/act-two/nightmare-storm-v8/` y `nightmareStormRegistration.js`. El empaquetado registra los puntos de palma y báculo; no inventa cuadros ni repinta dedos. Las celdas aéreas se separan por su alfa sólido y se conserva una franja de antialias alrededor de cada componente, evitando halos de otras celdas.

Los cambios mantienen el registro corporal de la revisión v7 y la referencia de altura de pie de un 15 % sobre Hexy. La ampliación de los retratos es cinematográfica e independiente de esa estatura.

## Evidencia

- `tests/hexy-nightmare-storm.spec.js`: pausa completa, impacto manga en la descarga, retorno al medio, contraataque por ambos lados, evasión y palma estable entre expresiones.
- La suite de regresión terminó con **66 pruebas aprobadas**. El build terminó con `[build] Complete!`, **0 errores, 0 advertencias y 36 sugerencias**. Los resultados se conservan en `test-log.txt` y `build-log.txt` de esta carpeta.
- `scripts/arcade/review-nightmare-storm.mjs --beats`: capturas antes, durante y después de cada descarga, y del golpe de báculo; `beats.json` conserva los estados y tiempos reales.
- `scripts/arcade/review-nightmare-storm.mjs --videos`: grabaciones y hojas decodificadas del doble Encore, del báculo y de la fase tres. Se revisaron las tres hojas finales; `browser-report.json` terminó sin errores del navegador ni recursos faltantes.
- `tests/artifacts/arcade/nightmare-storm-v8/five-fingers-review.jpg`: los seis frames de carga del atlas usado por el juego, ampliados para revisar las manos.

No se añadieron barras de vida enemigas ni se hizo commit o publicación de esta revisión.
