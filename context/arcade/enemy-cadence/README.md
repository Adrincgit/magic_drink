# Revisión de ciclos de enemigos, del 1-1 al 2-2

Revisión del 16/10/2026. Aplica la [dirección de animación](../DIRECCION_DE_ANIMACION.md) a los enemigos y jefes de los siete niveles trabajados: 1-1, 1-2, 1-3, 1-4, 1-5, 2-1 y 2-2. Sus IDs internos son 0, 1, 2, 5, 3, 6 y 7. Los prototipos del 2-3 en adelante conservan su comportamiento anterior.

## Criterio aplicado

La carrera de Hexy conserva sus doce dibujos y su ritmo habitual de unos veinte cambios por segundo. Los enemigos comparten la coherencia entre apoyo, desplazamiento, preparación, descarga y recuperación; cada acción mantiene la cantidad de dibujos que necesita. Las marchas nuevas tienen doce dibujos completos. Se conservan ciclos útiles de cuatro, seis y ocho cuadros, y las transformaciones pueden tener secuencias más largas que una marcha.

Un ciclo de piernas representa un paso de cada pie. El avance real controla su fase; detenerse o quedar atrapado deja de avanzar ese ciclo. El reloj se reserva para respiración, vuelo y efectos sostenidos. La locomoción revisada tiene un máximo de 24 cambios de dibujo por segundo; la física, el movimiento de cámara y el desplazamiento continuo siguen independientes de esa cadencia.

## Revisión por familia

| Enemigo o jefe | Ciclos y comprobación |
| --- | --- |
| Payaso rojo, incluido el que cae del globo o sale del cañón | Ocho dibujos de marcha, un ciclo completo cada 47,5 unidades. Se elimina la selección que recorría dos veces la hoja por cada unidad de fase. Conserva su cadencia de marcha normal, sus poses aéreas y su aterrizaje. |
| Acróbatas azul y rojo | Ocho dibujos completos; zancadas propias de 44 y 56 unidades. Se conservan salto físico, preparación y apoyo al caer. La marcha se detiene durante la puntería y las inmovilizaciones. |
| Malabarista de pelotas | Ocho dibujos de cuerpo completo, zancada de 64 unidades; mantiene las dos piernas unidas al cuerpo. Suelta cada pelota con su pose y conserva el descanso entre lanzamientos. |
| Payaso de globo y bombardero del bosque | Ciclos de vuelo de cuatro dibujos y fases propias de preparación y descarga. Se conservan su balanceo y sus poses aéreas. |
| Cañón lanzapayaso y zepelín | Poses por estado y por lanzamiento, sin imponer un ciclo de piernas a la maquinaria. Se revisan salida del pasajero, fogonazo, retroceso y vuelo. |
| Buzo | Seis dibujos de marcha y seis de natación. Se corrige la vuelta doble de seis celdas mediante un multiplicador de doce y la suma adicional al salir de la barcaza. El retroceso vuelve a comenzar con cada tiro de la ráfaga. |
| Barquita con tripulación | Dos poses de retroceso ligadas al tiempo transcurrido desde el disparo; antes alternaban según un reloj ajeno al tiro. Mantiene navegación, balanceo y hundimiento. |
| Escupefuego y payaso de antorcha | Ocho dibujos de marcha y acciones separadas. La selección secundaria del escupefuego también usa ocho celdas por ciclo. Se conservan inhalación, salida del fuego y lanzamiento de antorcha. |
| Carreta de fuego | Poses de preparación, descarga y recuperación. Conserva sus tiempos de lanzamiento y el anclaje de la boca del cañón. |
| Payaso de paraguas | Cuatro dibujos de pasos, zancada de 48 unidades. Preparación, cierre, disparo y reapertura conservan sus poses propias. |
| Zombies enteros, mutilados y reptantes | Ocho dibujos de locomoción, por distancia y con límite de cadencia en la acometida. Conservan las poses específicas de mordida, salto, pérdida de extremidad, recuperación y derrota. |
| Fantasmas, incluidas sus dos apariencias | Vuelo de cuatro dibujos y acciones breves propias. Se conservan desaparición, aparición y acometida; no se convierten en una marcha terrestre. |
| Enemigo alto del cementerio | Doce dibujos nuevos de pasos. Antes avanzaba alternando dos poses de reposo. Usa la marcha al caminar o salir andando de una cripta y vuelve a una pose plantada al detenerse. |
| Esqueleto | Ocho dibujos de marcha, extracción de hueso, lanzamiento y recuperación por fases. Se conserva la mano abierta que coincide con el nacimiento del hueso. |
| Mano y fragmentos animados | Se normaliza la selección de la mano a sus cuatro celdas de apoyo; se conservan caída, salto y animación de las piezas. |
| Payaso calabaza | Doce dibujos nuevos de marcha, con cambios de apoyo visibles. Se corrige la suma doble de fase del motor general y del comportamiento del pueblo. Conserva sus dibujos de carga, boca de lanzamiento, recuperación y derrota. |
| Bruja terrestre, voladora y con escolta | La terrestre recibe doce dibujos nuevos de pasos. Las poses de reposo y vuelo mantienen cuatro dibujos. Varita, daño, absorción y proyectiles conservan sus anclajes. Los refuerzos que llegan al bloqueo también avanzan sus piernas durante la entrada. |
| Calabazas voladoras y orbitales | Cuatro dibujos por ciclo de vuelo, con preparación y descarga propias. Cada una conserva su movimiento orbital y reloj de ataque. |
| Minijefe del globo, 1-1 | Se revisan el casco y los tres tripulantes independientes: objeto sostenido, mano, liberación y apoyo en la cesta. Se conserva la preparación existente. |
| Organillo, 1-2 | Se revisan ruedas por desplazamiento, fuelle, retroceso y bocas compartidas con las notas. Sus piezas conservan movimientos independientes. |
| Barcaza, 1-3 | El operario del tambor pasa a mostrar la pose de golpe durante la liberación real del mecanismo. Conserva el martillo, los cañones, las olas y la preparación acuática de la revisión anterior. |
| Fortaleza, 1-4 | Se revisan sirvientes, cañones, despliegue y respiraderos con sus fases actuales. No se les impone una marcha ni un reloj común a todas las piezas. |
| Arlequín, 1-5 | Conserva doce dibujos de carrera. Su zancada visual pasa de 276 a 580 unidades: 18, 21 y 24 cambios por segundo en las fases I, II y III, en vez de aproximadamente 38, 44 y 50. Conserva velocidad, colisión, advertencias y separación física del fuego. |
| Arlequín: cartas, cintas, salto y reposo | La descarga recorre cuatro poses durante sus 0,3 segundos. La siguiente preparación usa el intervalo real de la salva. Cartas, cintas y salto conservan dos poses de recuperación antes de volver al reposo; éste cambia a cuatro dibujos por segundo. La erupción usa un reloj local al ataque. La carrera respeta la reducción de movimiento. |
| Campanero, 2-1 | Se revisan ambas formas: doce dibujos de reposo, acciones por fase y secuencias completas de rotura y derrota. Los desplazamientos y liberaciones conservan sus tiempos. |
| Bruja cosechadora, 2-2 | Doce dibujos nuevos de marcha terrestre, separados de reposo, daño y ataque. La recuperación recorre las poses 9–11. Conserva su identidad, calabaza, llegada de escoba, subida, vuelo y absorción no interrumpible. |

## Arte integrado

Las cuatro hojas se generaron con la herramienta integrada de imágenes. Se conservan sus diseños de referencia. Cada hoja tiene doce celdas completas en una cuadrícula de cuatro por tres, transparencia nativa, una escala uniforme y apoyo en la fila 250. El empaquetado registra la cara con el personaje anterior y conserva las proporciones, sin deformar o separar extremidades.

| Personaje | Sprite publicado | Fuente y prompt |
| --- | --- | --- |
| Enemigo alto | [nightmare-tall-walk-v1.webp](../../../public/arcade/sprites/enemies/nightmare-tall-walk-v1.webp) | [Fuente](tall-walk-source.png), [prompt](tall-walk-prompt.txt), [registro](tall-walk-registration.json). |
| Payaso calabaza | [village-pumpkin-walk-v1.webp](../../../public/arcade/sprites/enemies/village-pumpkin-walk-v1.webp) | [Fuente](pumpkin-walk-source.png), [prompt](pumpkin-walk-prompt.txt), [registro](pumpkin-walk-registration.json). |
| Bruja terrestre | [village-witch-walk-v1.webp](../../../public/arcade/sprites/enemies/village-witch-walk-v1.webp) | [Fuente](witch-walk-source.png), [prompt inicial](witch-walk-prompt.txt), [refinamiento](witch-walk-refinement-prompt.txt), [registro](witch-walk-registration.json). |
| Bruja cosechadora | [harvester-walk-v1.webp](../../../public/arcade/sprites/bosses/harvester-walk-v1.webp) | [Fuente](harvester-walk-source.png), [prompt](harvester-walk-prompt.txt), [registro](harvester-walk-registration.json). |

[Comparación de reposo, acción y nuevas marchas](walk-comparison.png). Empaquetado reproducible: `node scripts/arcade/pack-enemy-cadence.mjs ruta-a-fuente.png tall`, sustituyendo el último argumento por `pumpkin`, `witch` o `harvester` según corresponda. Las hojas originales de ataque se conservan.

## Comprobación

- `tests-final.log`: 222 pruebas aprobadas de combate, apoyos, inmovilización, máquinas, fases, absorción, derrotas, reintentos y selección real de capítulos.
- `tests-walk-final.log`: 81 pruebas aprobadas tras integrar las tres últimas marchas; incluyen los nuevos dibujos, refuerzos, absorción y anclajes de disparo. Son 229 pruebas diferentes entre ambas ejecuciones, sin sumar dos veces los casos repetidos.
- `tests-arlequin-final.log`: 47 casos aprobados después de reservar tres poses de preparación, en vez de comprimir cuatro, durante los intervalos más cortos de la fase III. No se altera su frecuencia de disparo.
- Las pruebas históricas que seguían exigiendo checkpoints, cofres automáticos entre fases o la antigua pose aérea del ultimate se actualizan a las decisiones vigentes. La prueba de extremidades espera ahora su desprendimiento visible a los 0,24 segundos y completa la reacción antes de exigir el reptante. La caída de cajas se comprueba con una caja explícita de prueba, sin restaurar la antigua ayuda automática del Arlequín.
- `scripts/arcade/review-enemy-cadence.mjs` graba el motor y dibujo reales en Chrome, y luego decodifica los vídeos para revisar cuadros. [Informe](review/report.json), [errores de ejecución](review/runtime-errors.json). Los recorridos de prueba de las familias usan suelo plano y posiciones controladas para inspeccionar los apoyos; los jefes se dibujan en sus arenas reales con cámara de revisión.
- Vídeos y hojas decodificadas en `review/`: familias del prado, enemigos aéreos, río, bosque, cementerio, pueblo, los siete jefes, las tres fases del Arlequín y marchas aisladas. Ejemplos: [Arlequín I](review/arlequin-1-playback.png), [II](review/arlequin-2-playback.png), [III](review/arlequin-3-playback.png), [pueblo](review/village-walk-playback.png), [cosechadora](review/harvester-walk-playback.png).
- Compilación con `npm run build`; comprobador y salida guardados en `build.log`.

Esta revisión comprueba animación y coherencia con el combate existente; no declara terminados el diseño ni el balance de los prototipos posteriores.
