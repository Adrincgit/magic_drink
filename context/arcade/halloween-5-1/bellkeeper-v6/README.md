# El Campanero Hueco — dos fases

El mini jefe de 5-1 conserva sus 184 puntos de vida. La primera mitad corresponde a la campana; al llegar a 92, la cubierta se rompe durante una secuencia de 2,04 segundos y deja salir al mismo personaje en forma espectral.

- **Campana:** invoca dos fantasmas, alterna campanadas bajas y altas, embiste protegido y se levanta antes de golpear el suelo. Ese golpe produce dos ondas bajas que se pueden saltar. Después de los ataques queda una pausa vulnerable.
- **Espectro:** lanza dos abanicos de almas hacia una posición fijada al comenzar el ataque, prepara una embestida señalada en el suelo y mantiene sus invocaciones. La embestida no persigue a Hexy después de arrancar.
- **Rotura:** disparos básicos, especiales, explosiones de burbujas y pulsos del súper respetan el límite de la primera fase. Durante la transformación se limpian los proyectiles y se disuelven las invocaciones del jefe; no se activa la victoria.
- **Derrota:** el espectro se deshace, cae su sombrero y desaparecen los enemigos restantes. La salida y la celebración esperan a que termine la secuencia. Reintentar restaura el jefe completo.

## Arte integrado

Se usó el generador integrado `image_gen`, con la lámina original del Campanero como referencia. Los prompts están en [prompts.json](prompts.json) y [dash-prompt.json](dash-prompt.json). Las fuentes originales se conservan en `sources/`.

| Archivo en `public/arcade/sprites/enemies/` | Fotogramas | Uso |
| --- | ---: | --- |
| `nightmare-bell-v6.webp` | 32 | Flotación, campanadas, anticipación, golpe, invocación y recuperación |
| `nightmare-break-v6.webp` | 12 | Grietas, fragmentos y aparición del espectro |
| `nightmare-wraith-v6.webp` | 32 | Flotación, conjuro, embestida y derrota |

Son 76 celdas frente a las 12 anteriores. Los extremos de la transformación reutilizan exactamente las poses de las otras láminas para conservar la identidad. Se sustituyeron cuatro poses de embestida tras detectar un recorte de estela. El empaquetador conserva una escala común dentro de cada secuencia y alinea esas embestidas por la parte superior del cuerpo.

Empaquetado reproducible: `node scripts/arcade/pack-bellkeeper-v6.mjs`. Las celdas finales son de 320 px y los sprites se dibujan a 350 px, con espacio transparente para brazos, estelas y fragmentos.

## Verificación

Las pruebas específicas están en `tests/hexy-bellkeeper-v6.spec.js`. Cubren una pelea completa desde 184 puntos con disparos básicos, transición con sobre-daño y súper, invocaciones limitadas, salto de ondas, destino fijo de embestida, victoria única y reinicio.

Se grabaron cuatro escenas con el modelo y el render reales: primera fase, rotura, segunda fase y derrota con enemigos presentes. La captura usa cámara y simulación de producción; Hexy es invulnerable para observar los ataques. La prueba separada de ondas usa daño real. Se decodifican mediante `node scripts/arcade/review-bellkeeper-v6.mjs`.

Grabaciones, fotogramas y mediciones: `tests/artifacts/arcade/bellkeeper-v6/`. Los registros finales de pruebas y compilación quedan junto a este documento; `verification.json` recoge sus resultados y las huellas de los archivos compilados.

Resultado final: 49 pruebas del jefe/nivel, 10 de magia y súper, una prueba con cuatro grabaciones y tres del selector/entrada real al nivel pasaron (63 en total). `npm run build` terminó con cero errores y `[build] Complete!`; las tres láminas en `public/` y `dist/` tienen SHA-256 idéntico.

En la ampliación de regresión fallan dos pruebas antiguas de `hexy-specials`: duración de captura por burbuja y daño de estrellas teledirigidas. Se reprodujeron los mismos resultados en una copia aislada restaurando las rutas compartidas de daño anteriores a este cambio; ver `prior-magic-control.log`. No se modificó ese comportamiento. Los videos son silenciosos: se revisaron animaciones, ataques y transición; no constituyen una revisión auditiva de las nuevas campanadas.
