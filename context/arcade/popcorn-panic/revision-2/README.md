# Popcorn Panic · derrotas de cañonazo

15 de octubre de 2026. Un golpe mortal de Popcorn activa una derrota propia. El daño, alcance y coste de la bebida siguen en 240/480 unidades y 45 de magia para el fuerte.

Los zombis alternan tres resultados estables por aparición: disolverse en humo violeta y confeti; soltar extremidades vestidas que giran, caen y se esfuman; o salir despedidos hacia atrás y aterrizar de lado, sin extremidades, antes de desaparecer. Se respetan los miembros que ya faltaban. Se ven puntas de hueso caricaturescas en el cuerpo y ropa, guantes y zapatos en los restos. No hay sangre ni gore.

Los payasos calabaza, brujas y otros enemigos comunes se evaporan conservando su propio aspecto durante el impacto. La derrota se activa exclusivamente por el proyectil mortal: no añade recompensas duplicadas ni genera manos o huesos hostiles desde estos restos. La liberación de fantasmas de los zombis sigue respetando su selección previa. Los ataques de otras bebidas mantienen sus derrotas habituales.

El atlas nuevo contiene ocho fotogramas de evaporación, cuatro poses de torso y cuatro de humo de impacto. Las piezas vestidas usan el atlas existente. Sus fuentes y prompts están en [la revisión del pueblo](../../village-5-2/revision-3/prompts.json); el original de la derrota se conserva en `sources/defeat.png`. Salida: `public/arcade/sprites/effects/popcorn-defeat-v2.webp`.

El sonido se reconstruyó en `src/components/arcade/shared/audio/popcornSound.js`: ataque de aire, cuerpo grave descendente, cola de presión y cuatro crujidos breves. La muerte y la caída tienen sonidos propios. Todas las capas pasan por el compresor y los controles de volumen existentes. Se exportó una muestra de cuatro segundos en `tests/artifacts/arcade/town-cannon/cannon-audio.wav`; las pruebas confirman ausencia de saturación y silencio absoluto al silenciar. No hubo escucha subjetiva disponible en este entorno.

Lógica: `engine/adventurePopcornDefeat.js`. Dibujo: `render/popcornDefeatCanvas.js`. Ambos dentro de `src/components/arcade/adventure/`.

Siete pruebas nuevas verifican golpes mortales reales, tres variantes, dirección del lanzamiento, gravedad, aterrizaje, desaparición, miembros ya ausentes, ausencia de recompensas o enemigos duplicados, derrotas normales y limpieza al reintentar. Se revisaron grabaciones decodificadas de todas las variantes. Evidencia y compilación: [revisión 3 del pueblo](../../village-5-2/revision-3/README.md).
