# Dirección de animación y referencias

**Decidido por el usuario, 16/10/2026.** Magic Drink conserva su estilo **anime caricaturesco**. Las referencias de Metal Slug sirven para estudiar movimiento, peso y puesta en escena, especialmente en maquinaria. El nivel de detalle se elige según la acción y su importancia; no es una exigencia para todos los personajes, objetos o efectos.

Se desarrollan diseños, dibujos y efectos propios. La referencia ayuda a entender cómo funciona una animación; no se copia su trabajo artístico ni se cambia la identidad visual del juego para imitarlo.

## Criterios de trabajo

- Priorizar poses expresivas, siluetas claras y una acción divertida de leer. Añadir detalle cuando ayude a sentir el peso, el ataque o la destrucción.
- En maquinaria, estudiar cómo actúan las piezas: apoyos, articulaciones, ruedas, tubos, paneles y armas. No todas necesitan moverse continuamente ni con la misma cantidad de cuadros.
- Dar preparación, descarga y recuperación a las acciones que lo necesiten. Las pausas y el retroceso también comunican fuerza; aumentar los FPS por sí solo no mejora una animación.
- Conectar el efecto con su origen real: el chorro nace de la boquilla, el disparo de la varita o el cañón y el impacto ocurre donde llega. Si el arma cambia de posición, su punto de salida la acompaña. Separar el proyectil del cuerpo para que un dibujo de ataque no muestre otra descarga desincronizada.
- Hacer legibles los cambios importantes: una rotura local puede soltar una pieza, presión, humo o chispas; una transformación debe mostrar cómo llega al nuevo estado. Reservar las secuencias más elaboradas para las situaciones que lo merezcan.
- Sincronizar sonidos y efectos con la acción visible. Revisar el resultado en movimiento dentro del juego, a su escala habitual y durante el combate.

Estos criterios orientan el pulido. No establecen una cantidad fija de sprites, FPS o fases para todos los enemigos.

## Cadencia medida de las referencias locales

Archivos entregados por el usuario en `public/arcade/references_temp/`. Se conservan como referencias locales de análisis, sin incorporarlos como arte del juego.

Medición de los tiempos codificados de cada cuadro mediante `sharp(archivo, { animated: true }).metadata()`: duración del ciclo = suma de `delay`; FPS medios = cantidad de cuadros × 1000 / duración en milisegundos.

| Referencia | Archivo | Cuadros por ciclo | Ciclo | FPS de reproducción |
| --- | --- | ---: | ---: | ---: |
| Nave con rayos hacia abajo | `0f8de7cbaac4b50a5c0511ae63e12a80.gif` | 75 | 2,25 s | 33,33 |
| Objeto volador esférico | `1o3l2wfvs5fd1.gif` | 24 | 1,20 s | 20 |
| Mecanismo eléctrico expuesto | `a2auk1ldq5fd1.gif` | 12 | 0,48 s | 25 |
| Máquina grande sobre orugas | `de577d6ede69e0eaab9bfce941cfa309.gif` | 24 | 0,96 s | 25 |
| Máquina caminante con patas | `G06avKF.gif` | 16 | 1,60 s | 10 |
| Máquina cangrejo disparando | `metal-slug-boss-gif.gif` | 12 | 0,84 s | 14,29 |
| Robot con barrido de rayos | `tb7v1g6f4t491.gif` | 56 | 1,80 s | 31,11 de media |
| Explosión del cañón, chispas y humo | `tumblr_99e2863f2802b4fcddc5c69b562d8279_d4b7f730_400.webp` | 24 | 0,72 s | 33,33 |

El robot con barrido alterna cuadros de 30 y 60 ms; los demás archivos usan una duración constante por cuadro. La hoja estática `40204.png` no contiene tiempos y no permite medir FPS.

**Alcance de la medición:** estas cifras describen la reproducción de los GIF y del WebP. No demuestran los FPS del juego original ni cuántos dibujos distintos por segundo usa cada pieza. El cuerpo puede mantener una pose mientras un cañón, un destello o el humo cambian. Tampoco son una cadencia obligatoria para Magic Drink: se elige el ritmo que necesite cada acción.
