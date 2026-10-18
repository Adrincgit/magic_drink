# Hexy: preparación, agotamiento y colisiones

**Revisión posterior:** la [restauración del Encore](../encore-repair/README.md) recupera la preparación clásica en el suelo, amplía la carga a 1,9 segundos, retira las expresiones cansadas de carrera y adapta la ilustración grande a cada postura. Las fuentes de esta carpeta se conservan como historial; esas decisiones posteriores tienen prioridad.

El ultimate usa cuatro dibujos de preparación durante 0,9 segundos y un ciclo distinto de descarga. Las diagonales y verticales tienen cuatro dibujos de viento por estado físico, a 12 dibujos por segundo. La horizontal estrena preparación y conserva sus ciclos de descarga aceptados y el choque con el Arlequín.

La varita corta permanece en el brazo habitual: al mirar a la derecha, el brazo del lado derecho del dibujo sostiene la varita y el cercano queda libre hacia atrás. Cabeza, pecho y mirada acompañan el objetivo. Hacia abajo en el aire, la varita apunta verticalmente y las rodillas se recogen fuera del rayo. La hoja estática `super-directional-v1` deja de cargarse y seleccionarse.

Los orígenes se miden sobre la estrella de cada dibujo. Las secuencias siguen el tiempo de la cinemática, aunque la simulación general esté congelada. El empaquetador extrae personajes completos para no cortar estrellas o botas en una cuadrícula aproximada y conserva una escala por fuente; no deforma una pose fija por código.

Assets finales con alfa, en `public/arcade/sprites/hexy/`:

- `super-horizontal-charge-v2.webp`.
- `super-diagonal-up-v2.webp` y `super-up-v2.webp`.
- `super-diagonal-down-v2.webp` y `super-down-v2.webp`.
- `tired-run-v1.webp`, `tired-run-fire-v1.webp` y `tired-run-diagonal-up-v1.webp`.

Son 108 celdas en ocho hojas. Las fuentes completas contienen celdas descartadas: las anticipaciones canónicas reemplazan las filas de preparación originales. Para vertical abajo se usan las primeras dos anticipaciones de `ultimate-down-charge-source.png`, las restantes y la descarga de suelo de `ultimate-down-correct-hand-source.png`, y la descarga aérea de `ultimate-down-air-vertical-source.png`. El empaquetador fija la selección exacta. [Prompts finales, herramienta integrada imagegen](prompts.md).

La condición de salud reducida del reposo selecciona también carrera, carrera disparando y carrera apuntando arriba con expresiones cansadas. Cada acción conserva doce dibujos elegidos por distancia y vuelve a los normales al recuperar salud. No se altera la velocidad ni se sustituye la marcha por reposo.

Volt descarta plataformas `gone` y trata obstáculos/escombros intactos como objetivos dañables. Al romperlos o liberar al vecino dejan de interceptar el rayo. Jelly, Prism, Honey y la colocación también descartan apoyos destruidos; sus efectos pierden ese apoyo.

El comienzo pintado del río (`river.y`) no es la línea de impacto. Los puentes de 1-2 y 1-3 definen `shotSurfaceY` a 159 unidades bajo el tablero: 25 por debajo del nadador y 16 por debajo de la lancha. El disparo alcanza primero al enemigo y, si falla, genera un único splash al cruzar esa línea. No depende de que queden enemigos en pantalla.

Las comprobaciones ampliadas detectaron que las botas comprobaban la elegibilidad del rebote después de derrotar al enemigo. El rebote se aplica ahora antes de marcarlo derrotado, conservando las restricciones contra maquinaria y pinchos.

Verificación:

- `node scripts/arcade/pack-hexy-acting.mjs`: hojas finales, `hexyActingAtlas.js` y `registration.json`.
- `MAGIC_DRINK_TEST_URL=http://127.0.0.1:4322 node scripts/arcade/review-hexy-acting.mjs`: motor/renderizador reales en Chrome, 23 grabaciones con reproducción decodificada en `review/`.
- `tests/hexy-acting-collision.spec.js`: fases, puntas sobre alfa real, marcha herida/curación, destrucción seguida de daño detrás, rebotes, nadadores/lanchas alcanzables y splash posterior.
- `tests-final.log`: 128 pruebas aprobadas en diez archivos. `build.log`: compilación completa.

Los `*-closeup.png` son recortes de grabaciones decodificadas para inspeccionar manos, expresiones, preparación y cabello. Las pruebas de estado y alfa no sustituyen la revisión visual. No se añaden barras de salud enemigas.
