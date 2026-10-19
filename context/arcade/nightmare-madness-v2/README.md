# La colección de Halloween y las tres fases

La [revisi?n a?rea v3](../nightmare-aerial-v3/README.md) sustituye la subida de tablones, la rueda del ultimate y la puesta en escena del choque descritas aqu?. Se conservan la personalidad, las tres fases, sus juegos y la colecci?n de dulces.

Revisión del 18/10/2026. Continúa la [ruta del castillo circo](../episode-two-v1/README.md). Los cambios del acto 2 permanecen locales; el checkpoint anterior a esa ampliación es `7a89d0f`, ya enviado a `origin/paralax`.

La arlequín de dos conos conserva la apariencia joven de la ilustración aprobada. Le encantan Halloween, los vampiros, los zombis, los disfraces y los dulces. Trata sus ilusiones y a los habitantes transformados como una colección de juguetes; se frustra cuando Hexy rompe las reglas de su juego. Su poder sigue siendo ilusiones y pesadillas. La piedra del viento continúa reservada para la arlequín de tres conos.

## Progresión del combate

1. **La anfitriona juega.** Expresión traviesa, máscaras, espejos, acometida y pesadillas de suelo anunciadas.
2. **Se rompe la función.** Cara impaciente y poses propias; tres salvas, salto con aterrizaje anunciado, espejos, murciélagos y suelo encantado.
3. **Mis reglas.** Ojos en espiral, sonrisa exagerada, cabello agitado e iluminación cian y magenta. Retrato HD en la transformación y al potenciar el ultimate. Cuatro salvas alternadas, doble salto, lluvia por columnas, copias y vampiros invocados.

Son tres tramos protegidos de 260 puntos en dificultad normal: 780 en total, frente a 720 del arlequín de fuego. Cada umbral obliga a realizar la transformación. La resistencia se acompaña de patrones nuevos, no sustituye sus ataques. Las salvas fijan la dirección al prepararse. Cada salto anuncia su aterrizaje; el segundo tiene otra anticipación de 0,85 s. La lluvia anuncia siete columnas y conserva una segura. Hay ventanas de recuperación de 1,1–1,45 s. El modo suave aumenta avisos y recuperaciones y reduce la velocidad de las máscaras.

Las acometidas aterrizan a un lado de Hexy para no quedarse superpuestas con su cuerpo y hacer que los disparos de la varita nazcan detrás del jefe. El encuentro sigue siendo superable con la varita básica. No hay barras de vida enemigas.

Se conserva **La caída del gran telón**, su rueda superior, el choque diagonal y una potenciación por participante. Los 260 puntos de una victoria de Encore doble pueden completar el último tramo. La ilustración de carga que eligió el usuario vuelve a usarse con su magia violeta; el retrato de la tercera fase es otro dibujo independiente.

## La bodega

Antes de la arena, la subida atraviesa la colección: estantes, cajas, calabazas y montones de dulces pintados. Una gorra roja, un delantal y un sombrero recuerdan a los vecinos de Villa Lumbre. Los subtítulos conectan esas pistas con la transformación del 2-2 y aclaran que aún pueden ser liberados. Tras vencer, se muestran los personajes liberados y envolturas abiertas. La escena no añade daño ni obliga a detenerse.

La cámara sigue el suelo de la subida, incluso al saltar. El dibujo de las tablas usa una transformación continua sobre la pendiente, sin las franjas verticales del muestreo anterior.

## Arte y reproducción

Ocho recursos activos en [`public/arcade/act-two/nightmare-madness-v2`](../../../../public/arcade/act-two/nightmare-madness-v2/): dos atlas de combate de 16 dibujos, dos marchas de 12, ocho elementos de la bodega, un fondo pintado y dos retratos de 1024 × 1536. Son **56 dibujos de personaje y ocho elementos de escenario**, con celdas aisladas de 512 px. Los retratos no proceden de ampliar sprites.

Arte creado con **ImageGen integrado**. [Prompts iniciales](prompts.json), [limpieza de atlas](cleanup-prompts.json), [poses y marcha adicionales](extra-prompts.json). [Manifest de fuentes](art-sources.json) y originales en `sources/`. Dos poses que se tocaban en la segunda fase se sustituyeron por dibujos completos separados, sin cortar el borde compartido. `node scripts/arcade/pack-nightmare-madness.mjs` reproduce los WebP y los puntos de salida de magia.

`node scripts/arcade/check-nightmare-madness.mjs` comprueba las 64 celdas, sus márgenes y los dos retratos HD. [Resultado](atlas-check.json).

## Verificación

Pruebas finales de combate, fases, Encore, rescates, recorrido, cámara y navegación: **36 aprobadas**. Incluyen la subida corriendo y saltando, el espacio seguro de la lluvia, la anticipación de ambos saltos y las poses de ataque bajo impactos. La ilustración de carga se comparó con el original: idénticas dimensiones y cero diferencias visibles de píxel. El build termina en `Complete!`, sin errores; conserva los avisos existentes del proyecto.

`node scripts/arcade/review-episode-two.mjs --madness` genera 15 composiciones reales. Añadir `--videos` registra bodega, juegos de las fases segunda y tercera, transiciones y Encore doble. Se decodifican las cinco grabaciones en hojas de fotogramas dentro de `tests/artifacts/arcade/nightmare-madness-v2/`, fuera de Git. `--only=candy-walk` repite un recorrido concreto. Las grabaciones usan invulnerabilidad y fases preparadas para revisar las acciones; no constituyen una partida humana de ajuste de dificultad.

Los diálogos con retratos grandes y caja de texto al estilo BlazBlue quedan como **trabajo posterior**, tal como indicó el usuario. Esta revisión no incorpora todavía ese sistema. Debe reutilizar ilustraciones HD específicas, expresiones por personaje y avance con teclado/mando, conservando la legibilidad de los subtítulos amarillos.
