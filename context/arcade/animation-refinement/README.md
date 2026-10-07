# Continuidad de animación y organización

Revisión del 6 de octubre de 2026.

La corrección posterior de manos, resplandor y el rediseño del Organillo están en [machine-and-grip](../machine-and-grip/README.md). Las fuentes de Hexy de esta carpeta ya contienen esas correcciones.

- El apuntado hacia arriba ya no reemplaza un salto por una pose de pie. La voltereta de segundo salto continúa si sólo se apunta; disparar la cambia por una pose de disparo aéreo.
- Se sustituyó la primera tanda rechazada de apuntado. Las secuencias se generaron por dirección: cabeza elevada en vertical, mirada dirigida al objetivo en ambas diagonales y brazo del fondo al disparar agachada. Se descartaron cuadros que cambiaban de brazo o añadían un miembro. Reposo y disparo usan la misma secuencia, con ojos abiertos.
- Escala uniforme por secuencia, sin estirar el ancho del cuerpo. Dos cuadros antiguos de disparo vertical hacia abajo en el aire estaban desplazados 39 px; ahora comparten registro. La posición de los proyectiles sigue las puntas medidas y la misma transformación que el dibujo.
- La magia fuerte también utiliza las poses corregidas en horizontal y agachada; no vuelve a seleccionar los brazos de las hojas anteriores. La estrella vertical se detecta por altura para no confundirla con una hebilla dorada.
- El diseño del Organillo de esta revisión fue reemplazado por una máquina de piezas independientes sin payasos; consultar la revisión posterior enlazada arriba.
- Notas de lluvia de 68 px en primera fase y 76 px en segunda, frente a 46 y 51. Su salida coincide con el cuadro de pulsación; suben fuera de cámara y después caen. Las bocas y el teclado tienen coordenadas compartidas con sus efectos.
- Vida de ambos minijefes +20% sobre la revisión anterior. Llamas del globo +15% en dibujo y radio, conservando el corredor de esquiva.
- HUD ampliado: corazones de hasta 45 px, fila de energía de hasta 44 px y latas de hasta 38 × 68 px. Los límites menores conservan el uso en pantallas pequeñas.
- 69 módulos del Arcade organizados por responsabilidad. Se retiran 181 archivos de código y estilos que no son dependencias de las páginas vigentes. Quedan index, Bebidas, Hexy, Arcade y la página técnica 404. Los enlaces de las páginas retiradas apuntan a secciones del index actual.

## Recursos finales

| Recurso | Uso |
| --- | --- |
| `public/arcade/sprites/hexy/air-aim.webp` | Doce cuadros aéreos: horizontal, diagonal superior y vertical. |
| `public/arcade/sprites/hexy/ground-aim.webp` | Dieciséis cuadros de apuntado y agachado. |
| `public/arcade/sprites/hexy/stand-fire.webp` | Disparo horizontal de pie. |
| `public/arcade/sprites/bosses/organ/` | Piezas de la máquina que reemplaza la hoja anterior. |

Se usó ImageGen integrado con referencias del proyecto. `prompts.json` conserva las especificaciones iniciales; `edits.json`, los ajustes de agarre y disparo horizontal; `directional-prompts.json`, las direcciones que sustituyen la primera tanda rechazada. Las fuentes seleccionadas se guardan como WebP. `scripts/arcade/pack-hexy-directional-art.mjs` selecciona cuadros válidos, registra el cuerpo y mide las puntas. `registration.json` conserva medidas y selección de cuadros.

La comprobación visual usa el mismo `drawHexy` que el juego. `tests/artifacts/arcade/animation-refinement/aim-review.jpg` compara sostener, disparar, retroceder y recuperar para ocho posturas. Los dibujos de apuntado hacia arriba no se encogen por incluir la varita dentro de su altura. En horizontal existe un pequeño impulso del hombro; no cambia la orientación de la mirada.

## Historial y limpieza

Los 19 directorios históricos del Arcade se trasladaron fuera del proyecto a:

`G:/TRABAJO/ASTRO/ADRINC_WEBS/_magicdrink_archive/2026-10-06-history/`

También se trasladó allí `context/rediseno`: 2.486 archivos, 2.674.082.410 bytes verificados antes y después.

También existe una instantánea verificada de código, historial y pruebas previa a retirar archivos:

`G:/TRABAJO/ASTRO/ADRINC_WEBS/_magicdrink_archive/2026-10-06-animation-refinement.zip`

El borrado del historial fue rechazado por la revisión automática. Se resolvió mediante traslado reversible. Las capturas nuevas de pruebas van a `tests/artifacts/arcade/`, excluido de Git. Los sprites publicados ya eran WebP, no PNG.

La instrucción sobre los bunnies quedó incompleta en el mensaje del usuario. Se solicitó aclaración; no se inventaron cambios de comportamiento.

## Validación final

- `tests-validated.log`: 89 pruebas aprobadas de animación, combate, globo, Organillo, recorrido, progresión, tienda, audio y mando.
- `tests-last-adjustment.log`: 33 pruebas aprobadas después de hacer que la magia fuerte use también las poses corregidas.
- `build.log`: `npm run build` completado; cuatro páginas públicas y 404.
- `git diff --check` sin errores. Los dibujos se inspeccionaron además en el renderizador real, incluyendo las ocho posturas de la comparativa y ambas fachadas del Organillo.
- Recursos publicados y fuentes vigentes en WebP. Cero PNG dentro de `public/arcade` y `context` tras archivar los historiales. Las capturas automáticas de fallos de Playwright permanecen solamente en su salida de pruebas excluida de Git.

El empaquetador de Hexy usa fuentes seleccionadas por dirección. `scripts/arcade/pack-organ-art.mjs` reconstruye únicamente la máquina. Los scripts de migración y preparación de la primera tanda rechazada están archivados fuera del proyecto para evitar regenerar accidentalmente esas poses.

Cambios locales; esta revisión no se ha desplegado.
