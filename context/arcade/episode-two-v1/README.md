# El camino hasta el castillo circo

Revisión vigente del 18/10: [personalidad de la arlequín, dibujos propios para las fases segunda y tercera y la bodega de los dulces de Villa Lumbre](../nightmare-madness-v2/README.md). Conserva la ruta y el choque descritos aquí.

Implementación iniciada el 17/10 y verificada el 18/10/2026, aprobada por el usuario tras la propuesta de continuidad del acto 2. Antes de editar se creó y subió el checkpoint `7a89d0f` a `origin/paralax`.

El castillo circo de dos conos aparece en el horizonte del cementerio, Villa Lumbre y el maizal. Los payasos fugitivos y los habitantes de la granja son personajes de escena sin colisión hostil. Los comentarios son subtítulos amarillos legibles. La arlequín conserva su identidad de ilusiones y pesadillas; las ráfagas son parte de su puesta en escena. La piedra del viento permanece reservada para la arlequín de tres conos del acto 3.

El maizal conserva sus 15.600 unidades, sus dos formas del Rey de Paja y el elenco anime cartoon anterior. El antiguo castillo de piedra se retiró del panorama. A partir de la hondonada, el atardecer falso se desvanece para revelar la noche; retroceder no restaura la ilusión. Los vecinos se encuentran junto al granero.

## 2-4: El castillo del gran telón

Recorrido de 15.200 unidades: jardines, entrada, galería de máscaras, salón de baile, estructuras detrás de las paredes y encuentro superior. Hay una ruta inferior continua y galerías opcionales con tres rescates. La puerta hace un fundido negro real de 1,15 segundos, conserva salud, energía, monedas y enemigos derrotados, y descubre el interior de lona y maquinaria teatral. No añade checkpoints.

El Conde y la Condesa del Telón comparten un encuentro con dos fases. El Conde persigue, lanza magia y cruza la pista convertido en murciélagos. En la segunda fase, la Condesa alterna sus abanicos y candelabros con las pausas del Conde. Los candelabros avisan durante 1,15 segundos y dejan de hacer daño al quedar rotos en el suelo. La Condesa desciende durante su recuperación y puede recibir disparos. La cámara incluye a ambos anfitriones.

## 2-5: La función de las pesadillas

Recorrido de 4.400 unidades, con una subida breve por las estructuras de la carpa y combate dedicado en la cúpula. Tres fases, límites de daño para que ninguna transformación se omita, copias nacidas de espejos destructibles, ataques de máscaras, acometidas y pesadillas de suelo anunciadas que conservan una franja segura. Las plataformas de refugio permanecen desde la segunda fase.

En la última fase, la arlequín reúne máscaras iluminadas sobre la arena y prepara durante 2,8 segundos **La caída del gran telón**. Sin respuesta, cae una rueda de máscaras; puede esquivarse y no desaparece por un disparo fuerte corriente. Al responder con Encore durante la carga, Hexy apunta al ataque superior y lo sostiene en un choque diagonal. La fase ofrece una recarga de Encore una sola vez para poder responder sin depender de compras.

El pulso comienza con diez segundos y puede terminar desde los 6,8. Cuando pierde terreno, la arlequín hace una única potenciación: ilustración HD, una segunda corona y cuatro segundos adicionales, conservando parte del avance del jugador. Se habilita **Encore doble**: volver a pulsar ultimate tras soltarlo carga durante 0,85 segundos y amplifica el poder sin gastar otra reserva ni más magia. Hay una respuesta por participante en cada choque. El botón está disponible también para controles táctiles. Mantener el primer ultimate no lo activa accidentalmente.

La amplificación aumenta el cuerpo del disparo, la rueda, los fragmentos del suelo y la onda expansiva. El radial blur copia y amplía la escena completa alrededor del contacto. Cada impacto manga usa exactamente los mismos 0,105 segundos del choque de fuego, con blanco y negro en el cuadro completo. Una derrota conserva el coste existente de cuatro corazones. Ganar rompe el ataque, expulsa a la arlequín y libera a los payasos y habitantes de la escena final. No hay barras de salud enemigas.

## Arte y reproducción

La referencia de calidad y estilo es el payaso básico existente. Se crearon atlas nuevos para la arlequín, ambos anfitriones, vampiros y armaduras; sus marchas siguen la distancia recorrida. Son siete atlas con 104 celdas completas de 512 px, incluidos efectos y utilería. Las dos ilustraciones de potenciación son dibujos independientes de 1024 × 1536; no son ampliaciones de celdas de juego. La pose aérea de Hexy usa las ilustraciones direccionales HD ya aprobadas.

Los catorce recursos activos están en [`public/arcade/act-two/episode-two-v1`](../../../../public/arcade/act-two/episode-two-v1/). Arte creado con **ImageGen integrado**, no con CLI. Prompts: [escenarios y personajes](prompts.json), [ilustraciones](portrait-prompts.json), [limpieza](cleanup-prompts.json), [marchas](walk-prompts.json), [utilería y enemigos](prop-minion-prompts.json), [cielos del maizal](corn-sky-prompts.json). Los originales seleccionados se conservan en `sources/`; `pack-episode-two.mjs` usa esas copias locales para reproducir los atlas.

Comprobaciones: 64 pruebas aprobadas de campaña, maizal, Encore, energía y choque de fuego; después de los ajustes finales, otras 29 comprobaciones de campaña y el episodio nuevo aprobadas. `node scripts/arcade/check-episode-two-art.mjs` valida las 104 celdas; `npm run build` termina en `Complete!`. La [medición de las celdas](atlas-check.json) comprueba transparencia, contenido y márgenes. Las cinco grabaciones y las catorce composiciones no registraron errores del navegador ni recursos ausentes.

Revisión visual: `node scripts/arcade/review-episode-two.mjs` genera composiciones reales. Añadir `--videos` registra recorrido, pareja de vampiros, tres fases y Encore doble; después decodifica las grabaciones en hojas de fotogramas. Todo se guarda en `tests/artifacts/arcade/episode-two/`, fuera de Git. Las grabaciones usan invulnerabilidad y umbrales de fase forzados para observar las acciones; no equivalen a una partida humana completa de ajuste de dificultad.
