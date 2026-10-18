# Opciones, cine clásico y ensayo de Hexy

El acabado del arcade convierte la imagen a gris **antes** de separar los canales ópticos. En Cine clásico, rojo y verde comparten desplazamiento y el azul se desplaza al lado contrario: el interior permanece monocromático y los contornos conservan bordes amarillos y azul/violeta. Grano, viñeta y aberración siguen siendo independientes, se guardan y admiten cero. El acabado de las páginas generales conserva su comportamiento anterior.

## Opciones

El panel tiene ancho máximo de 820 px, marco dibujado con CSS, tipografía BakeSoda y botones con bordes propios. El contenido se adapta o se desplaza dentro del marco. El encabezado y el pie no participan en el desplazamiento. Se elimina el botón de cierre superior.

LB/RB cambian Sonido, Mando e Imagen. La cruceta recorre filas; izquierda/derecha ajustan un volumen o efecto. Imagen comienza con Cine clásico, que recibe el foco al entrar. A elige, B/Volver regresan. La pestaña Mando permite seleccionar una acción y pulsar el nuevo botón. Los conflictos intercambian asignaciones; Menu y cruceta permanecen reservados. Mando predeterminado restaura la distribución inicial.

Las asignaciones se guardan en `magic-drink:arcade:gamepad-bindings:v1`, se aplican al juego y a las pruebas de la tienda y aparecen en las instrucciones del ensayo. El indicador del choque de poderes utiliza el botón de ataque elegido. La navegación de menús conserva A/B y LB/RB.

Se retiran Wonderpop y la firma inferior Magic Drink de la pantalla principal de Hexy.

## Cómo jugar

El ensayo tiene 11 lecciones: movimiento, agacharse, doble salto, planeo, apuntar quieta, disparo, rodar/dash, escudo, bebida/varita, magia fuerte y súper. El posavasos se aprende en las demos de mods de la tienda de Miso. La [revisión de patrullas, escudo y controles vintage](../rehearsal-cinema/README.md) recoge el comportamiento vigente.

Cada lección ejecuta una demostración con la física, los proyectiles y los sprites originales. Probar yo habilita teclado, mando y controles de pantalla, confirma el objetivo y reproduce los efectos de sonido. Esc/Menu devuelve a la demostración; LB/RB cambian lecciones cuando se está mirando. Cada simulación es independiente de la partida y de su economía.

## Evidencia

- `tests/hexy-options-rehearsal.spec.js`: acciones reales, reasignación y restauración, persistencia, navegación Xbox, contención del panel a 390/1440/2048 px y medición de interiores grises con contornos de color. Con aberración a cero, los contornos vuelven a gris.
- Regresiones de mando/audio y deriva de sticks: controles, volumen real, pantalla completa, desconexión y regreso desde la tienda.
- `tests/hexy-finish.spec.js`: comportamiento óptico de la página general.
- Última verificación: 24 pruebas aprobadas; compilación con 0 errores y 0 advertencias.
- Mando verificado mediante un dispositivo Xbox simulado. No se ha probado con hardware físico en esta sesión.

Capturas y videos en `tests/artifacts/arcade/options-rehearsal/`. `options-color.png` y `bindings-color.png` muestran el nuevo panel; `classic-title.png` muestra el acabado sobre el arte real. Los seis videos `tutorial-*.webm` se decodifican con `scripts/arcade/review-options-rehearsal.mjs` para inspeccionar sus fotogramas.
