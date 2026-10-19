# Dirección visual del arcade

- Los movimientos de personajes deben usar secuencias de dibujos coherentes: anticipación, acción y recuperación. No desplazar un único frame durante todo un salto ni sustituir la animación por deformación de malla.
- Mantener proporciones, vestuario, número de extremidades y registro de pies/manos entre celdas. La arlequina mide de pie un 15 % más que Hexy.
- El escenario debe tener capas de parallax y animación real mediante sprites. La ondulación adicional se permite en la tela de la carpa; nunca debe deformar la ciudad, la luna, los pilares o el suelo. No aplicar una onda a la imagen completa.
- Para esta pelea, usar efectos pintados y animados. Evitar gráficos con aspecto de SVG, líneas geométricas o cintas paralelas que parezcan pentagramas. Las ráfagas de desplazamiento son viento rápido, sin notas ni iconos.
- Conservar el torbellino Halloween aprobado, con fantasmas y calabazas integrados. La prohibición de máscaras sueltas en ataques no implica retirar esos elementos del torbellino. No rediseñar un efecto aprobado para corregir un recorte: preservar todo su contorno.
- El contacto sostenido entre rayos debe representar energía y presión; no usar explosiones de confeti, lunas o iconos como bucle de contacto.
- Las expresiones responden a sucesos: la arlequina no pasa a esfuerzo o desesperación antes de que se descargue Encore doble. Mantener la mano emisora firme y cambiar de expresión con continuidad.
- La potenciación sorpresa del choque ocurre cuando el rayo está a punto de alcanzar a la arlequina; si vence el reloj mientras Hexy avanza, ella puede resistirse en ese instante. El reloj nunca decide una derrota: solo se pierde cuando el contacto llega realmente al extremo de Hexy. Encore doble recentra el choque, pero todavía exige pulsaciones y permite perder.
- Reservar el ultimate aéreo para el último tramo de vida (15 %), con ataques ordinarios entre lanzamientos. La presión del choque representa su posición real: 0 es la varita de Hexy y 1 la palma de la arlequina. Al impacto letal el HUD marca cero corazones; la caída y el aterrizaje se completan antes de mostrar el resultado.
- El ultimate sin contrarrestar viaja más rápido. Su impacto directo es letal; la explosión tiene fuego/humo púrpura y una onda de viento que empuja y tumba sin quitar vida. Las ilusiones deben desplazarse y lanzar ataques telegrafiados, como extensiones del mismo enemigo, sin invocar minions ni tener barras de vida.
- Los barridos fuertes del báculo deben mostrar agarre cerca del extremo, mayor alcance y dibujos de arrastre/smear durante el movimiento; conservar cuerpo y cara, no estirar globalmente el personaje.
- Los globos de diálogo deben tener una cola visible dirigida hacia quien habla. Los cortes temporales de expresión deben ser grandes e integrados, sin pequeños cuadros flotantes.
- Nunca añadir barras de vida de enemigos. Conservar el HUD de vida de Hexy.
- Validar los cambios visuales mediante capturas y grabaciones decodificadas, además de pruebas y `npm run build` sin errores.
