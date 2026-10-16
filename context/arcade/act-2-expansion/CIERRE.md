# Cierre del trabajo — 16 de octubre de 2026

Guardado local en la rama `paralax`, sobre `4de58a3`. No se ha creado un commit ni realizado un push en esta ampliación. Se conservan las modificaciones locales anteriores.

## Entregado

- [Guía de campaña](../CAMPANA.md): seis actos, treinta niveles y sus jefes; Halloween pasa al acto 2.
- [Guía de Magic Drinks y amuletos](../MAGIC_DRINKS_Y_AMULETOS.md): habilidades, mejoras, equipamiento y catálogo actual de Miso.
- Niveles jugables 2-3, 2-4 y 2-5, con arte propio, colisiones, rutas, obstáculos, rescates, enemigos, jefes, tres fases del arlequín, audio existente, progresión y migración de partidas.
- [Descripción de la ampliación y recursos](README.md), originales, prompts, atlas registrados, capturas y grabaciones revisadas.

## Comprobaciones

- **101 pruebas aprobadas** en [final-tests.log](final-tests.log). Incluyen las diecisiete pruebas nuevas, las aperturas reales de 2-1 a 2-5 y regresiones del pueblo, absorción, Cosechera, Campanero, Popcorn, Volt y otras bebidas.
- **Compilación completada y cero errores**: [build.log](build.log).
- Tres grabaciones del motor de producción decodificadas e inspeccionadas. [validation.json](validation.json) registra las fases, posiciones, proyectiles y eventos; no registra recursos ausentes ni errores de navegador. Incluye capturas específicas del nacimiento del disparo desde las puntas medidas de los jefes.
- Se corrigieron durante la revisión la caída indebida al piso inferior de la mansión, recortes de armas/capas entre celdas, colocación inicial de los jefes, texto de entrada y banda sólida en la superficie del maizal. Las texturas vecinas se reflejan para que las juntas compartan el mismo borde.

## Pruebas antiguas encontradas al ampliar la revisión

La primera ejecución exploratoria de 118 casos terminó con 111 aprobados y siete fallos: [tests.log](tests.log). Dos aperturas de nivel coincidieron con un reinicio del servidor; ambas pasan en la ejecución final. La prueba táctil antigua pasa al repetirla: [legacy-browser-recheck.log](legacy-browser-recheck.log).

Se reprodujeron **tres fallos de aserción iguales** en una copia aislada de `4de58a3`, antes de esta ampliación: [baseline-tests.log](baseline-tests.log).

1. Prueba antigua de desembarco: espera `deploy` cuando el buzo está en `exit`.
2. Prueba antigua de burbujas: espera proyectiles retenidos tras su explosión y encuentra cero.
3. Prueba antigua de Sparkle: espera reducir la salud del objetivo a catorce o menos y recibe dieciocho.

También persiste una aserción visual antigua de la barcaza: espera cero píxeles modificados lejos del tambor al activar su flash y encuentra cambios. No se ha establecido su situación en el código base anterior; queda documentada para una revisión propia. Estas incidencias no se presentan como pruebas aprobadas ni se han debilitado sus aserciones para ocultarlas.

El checkout temporal de comparación fue retirado al terminar. No se tocó el checkout experimental `magicdrink-scroll-lab`.

## Límites de la revisión

Se verificaron la navegación mediante entradas reales del motor, combate, cambios de fase, derrota, carga en navegador y salida de capítulos. El equilibrio final de dificultad todavía puede pulirse con una sesión humana completa. Las pistas y FX se reutilizan del juego; no se hizo escucha humana ni se generaron voces nuevas.

## Apagado

El usuario pidió expresamente apagar la PC al terminar y confirmó haber cerrado sus aplicaciones. El apagado se programa únicamente después de guardar las entregas y completar las últimas verificaciones. El resultado de la orden queda en [apagado.json](apagado.json); programarlo no acredita por sí solo que el hardware ya se haya apagado.
