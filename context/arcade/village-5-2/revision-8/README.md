# Villa Lumbre: destrucción y rescates, revisión 8

15 de octubre de 2026. Continúa la revisión 7 con los nueve puntos del usuario: salida del rayo, rescates por disparos, escala de defensores, absorción visible, iluminación de proyectiles, carrera del herrero, captura de Hexy y una calle con obstáculos que se pueden saltar o destruir.

## Cambios jugables

- El rayo mantiene la cabeza registrada en la varita y revela su cola con una máscara de alfa gradual. Desaparece el recorte rectangular que dejaba una cara vertical junto a la mano.
- Los habitantes atrapados bajo los escombros se liberan al destruirlos con disparos. Permanecer cerca ya no los rescata. El rescate y su recompensa sólo suceden una vez.
- Panadero y herrero usan hojas nuevas de lanzamiento, con la misma escala de empaquetado que sus carreras. La piedra física nace en la mano vacía de la pose de salida. El herrero tiene una carrera de huida con inclinación, expresión de miedo, bombeo de brazos y fases aéreas; mantiene avance rápido.
- La absorción dibuja una corriente de dulces y chispas hacia el recipiente, un remolino en su boca, encendido naranja/cian y una descarga al lanzar la calabaza. El punto de llegada del dulce, la luz y la calabaza nueva comparten los centros medidos en las poses de la bruja.
- Una bruja cercana prioriza absorber a Hexy convertida desde sus estados de patrulla, preparación o recuperación, sin depender de que el contador de patrulla llegue a cero en un fotograma concreto. La animación de ataque recién iniciada puede terminar primero. Los golpes y la liberación con botones conservan sus interrupciones.
- Luces suaves de color acompañan a los proyectiles mágicos de Hexy y enemigos, con reflejos cerca del suelo. Se mantienen los efectos propios de las llamas y los rayos. No se ilumina la trayectoria de apuntado ni se añaden barras de vida enemigas.
- Ocho obstáculos principales: tres carretas volcadas vacías, tres pilas de carga y dos vigas con mampostería. Se añaden seis apoyos de carga junto a las carretas altas. Bloquean el paso por el suelo, tienen superficies superiores transitables y se destruyen mediante impactos reales. Sus perfiles siguen la silueta pintada de ruedas, tablas y cajas. Se puede avanzar saltando sobre los apoyos con el salto básico o disparando para despejar el frente.
- Dos grupos de tres habitantes quedan entre barricadas. Se detienen y forman una fila, permanecen expuestos a magia y vuelven a huir al romper el bloqueo occidental. Las brujas y calabazas apuntan a su posición detenida; sólo anticipan su movimiento cuando realmente corren.
- Cinco payasos calabaza adicionales están distribuidos por el pueblo. Cinco bloqueos activan parejas de refuerzos; dos permiten una segunda pareja si el combate se prolonga. Los refuerzos son limitados. Las roturas y oleadas ya resueltas se conservan al reintentar.
- Sólo una carroza con caballo cruza el comienzo, desde las afueras. Más adelante aparecen las carretas volcadas interactivas. Se conservan la longitud de 23.240 unidades, los 106 habitantes, las plazas, la entrada lateral y las capas de fondo.
- Pulido posterior de pisadas: pequeñas bocanadas de polvo coinciden con dos apoyos de cada ciclo de carrera. La carroza añade polvo en los cascos y el contacto de las ruedas. Es más visible sobre tierra, disminuye durante la transición y queda tenue en adoquines. Los vecinos bloqueados, detenidos o elevados sobre apoyos no emiten; las partículas permanecen en el mundo y se disipan en medio segundo. Se reutiliza el sprite existente `zeppelin-dust.webp`, sin nuevas imágenes ni descargas.

## Arte y registro

Generación con ImageGen integrado y la habilidad [imagegen](C:/Users/cabra/.codex/skills/.system/imagegen/SKILL.md). Fuentes seleccionadas en `sources/` y prompts completos en [prompts.json](prompts.json). La hoja del panadero se repitió después de que la primera llamada no entregara un archivo. Sharp sólo recorta, registra, ensambla y comprime las imágenes; no pinta extremidades ni sustituye los efectos por SVG.

`node scripts/arcade/pack-village-v8.mjs` produce seis archivos en `public/arcade/sprites/enemies/`:

| Archivo | Contenido |
| --- | --- |
| `village-obstacles-v8.webp` | 16 estados y piezas de destrucción |
| `village-absorb-fx-v8.webp` | 16 fases de corriente, remolino, encendido y lanzamiento |
| `village-baker-run-v8.webp` | 8 poses de carrera, registradas junto a las de lanzamiento |
| `village-baker-throw-v8.webp` | 8 poses de defensa |
| `village-blacksmith-run-v8.webp` | 8 poses de huida urgente |
| `village-blacksmith-throw-v8.webp` | 8 poses de defensa |

Las escalas y recortes están en [registration.json](registration.json). El mismo empaquetador mide la silueta superior de los objetos y genera `world/villageObstacleArt.js`, usado por las colisiones. Esto permite que el apoyo de los pies coincida con el arte.

## Verificación

`tests/hexy-village-revision-8.spec.js` verifica rescate por disparos y ausencia de rescate por cercanía, absorción de Hexy desde recuperación, bloqueo y aterrizaje sobre carga, acceso a la carreta con salto básico, caída al destruir el apoyo, vecinos atrapados y liberados, refuerzos limitados y persistencia de destrucción al reintentar.

Evidencia en `tests/artifacts/arcade/village-depth-v8/`: doce grabaciones del motor y renderer de producción, decodificadas en montajes y fotogramas completos. Incluyen rayos terrestres y aéreos, absorción de vecinos y Hexy, defensores, carrera del herrero, escombros, plataformas, destrucción con refuerzos, un grupo atrapado bajo magia y luz de disparos de Hexy. Las tomas de plataformas, fila y defensores se repitieron tras ajustar perfiles, colisiones y mano de salida.

La prueba del juego abre el selector real y el capítulo 5-2, recorre diez posiciones en ventanas de 1440×900 y 1920×1080, rompe una barricada con Z y verifica absorción y liberación de Hexy con el aviso sin contador.

Resultado final: 96 pruebas de modelo y regresión, una prueba del juego con teclado y una prueba de grabación con doce escenas aprobadas. Las repeticiones de escenas tras ajustes también pasaron. `npm run build` terminó con `[build] Complete!`: 0 errores, 0 advertencias y 29 sugerencias. Inventario y registros en [validation.json](validation.json).

El pulido de polvo se revisa con `node scripts/arcade/review-village-dust.mjs`: graba y decodifica tierra, adoquines y carroza, y comprueba que desaparezcan las partículas al cesar el movimiento. Grabaciones en `tests/artifacts/arcade/village-dust/`; además se repitieron 31 pruebas del pueblo, noche y revisión 8, todas aprobadas.

Muestras: [salto sobre la carreta](../../../../tests/artifacts/arcade/village-depth-v8/wagon-jump.webm), [destrucción y refuerzos](../../../../tests/artifacts/arcade/village-depth-v8/wagon-break.webm), [familia atrapada bajo magia](../../../../tests/artifacts/arcade/village-depth-v8/pocket.webm), [absorción e ignición](../../../../tests/artifacts/arcade/village-depth-v8/absorb-ground.webm), [absorción de Hexy](../../../../tests/artifacts/arcade/village-depth-v8/absorb-hexy.webm), [defensores](../../../../tests/artifacts/arcade/village-depth-v8/defenders.webm) y [carrera del herrero](../../../../tests/artifacts/arcade/village-depth-v8/sprint.webm).
