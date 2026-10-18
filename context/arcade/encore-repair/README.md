# Restauración del Encore y correcciones comunes

**Revisión posterior:** [identidad y brazo de Hexy, ilustraciones dedicadas y duración de impacto](../hexy-down-repair/README.md). Sustituye el atlas de ilustraciones recortadas por nueve dibujos individuales de alta resolución y ajusta el manga al mismo intervalo de 0,105 segundos que el contacto con el Arlequín. Las descripciones de esa versión anterior se conservan como historial.

La preparación horizontal en el suelo vuelve a usar los cuatro dibujos originales de `super-charge.webp`: Hexy termina erguida, con la varita levantada por encima de la cabeza. La ilustración original `hexy-encore-full.webp` permanece intacta para ese lanzamiento. Las variantes direccionales y aéreas conservan sus propias secuencias; no sustituyen el Encore clásico.

Se retiraron de la selección y carga del juego las tres variantes `tired-run-*` rechazadas por el usuario. La carrera y el disparo en carrera vuelven a sus dibujos aceptados, también con poca salud. Se conserva el reposo de salud anterior a esas variantes.

La ilustración grande elige ahora entre el original clásico y nueve poses según suelo/aire y dirección. `public/arcade/sprites/ui/hexy-encore-poses-v1.webp` contiene recortes con alfa a partir de las fuentes de mayor resolución ya seleccionadas, sin regenerar personajes. `render/hexyEncorePortraits.js` registra sus celdas y límites. Los personajes se muestran completos y se reflejan cuando el lanzamiento apunta hacia la izquierda. El choque de poderes conserva su presentación propia.

La carga dura ahora 1,9 segundos, un segundo adicional. Las 48 partículas hacen un solo recorrido escalonado, con estela curva, núcleo claro y resplandor aditivo. Todas llegan a la punta real de la varita antes del último intervalo de 0,2 segundos; no reaparecen en el perímetro. La ilustración mantiene su pausa y se desvanece durante los últimos 0,24 segundos de preparación. El arpegio y el crescendo acompañan la nueva duración. La descarga conserva sus 2,25 segundos, coste, recarga y ocho pulsos de daño.

La presión de la carga y el lanzamiento levanta polvo pintado y pequeños fragmentos de la superficie real: hierba en terreno herboso, tierra, arena, astillas sobre madera o fragmentos discretos de piedra. Este efecto tiene su propio tiempo dentro de la cinemática congelada; no aparece al estar en el aire. Contra el Arlequín, el manga se mantiene únicamente al contacto de los rayos, sin adelantarlo al lanzamiento.

**Corrección visual posterior:** el lanzamiento normal mantiene 0,7 segundos completos de blanco y negro sólido sobre la escena terminada: personaje, terreno, fondo, primer plano, proyectiles y bordes. La imagen a color vuelve al terminar el intervalo. Durante esos cuadros se omite la capa violeta de oscurecimiento; el corte de sombras se adapta a la escena y conserva el contraste local de las texturas, también en el nivel nocturno. La pantalla y su HUD se desaturan juntos mientras dura el efecto. El acabado sigue las referencias de negros y blancos marcados proporcionadas por el usuario. Se conserva la duración y el momento de impacto ya existentes del duelo.

La referencia del usuario para «radial blur» es un desenfoque de zoom: las texturas se estiran desde el punto de fuerza hacia los bordes, con estelas más largas lejos del centro. Esta aclaración define el efecto para ajustes posteriores; esta corrección modifica el manga.

La fila de fuego de `clown-element-hits.webp` contiene fragmentos de la fila anterior entre los píxeles 20 y 23 de la celda. El renderizador omite solo sus primeros 28 píxeles, manteniendo el tamaño y anclaje de botas y cuerpo. No se borra ni se vuelve a dibujar la reacción original.

El payaso calabaza no intenta volver a seleccionar a Hexy cuando ya es dulce. Sin vecinos vulnerables cerca, recorre una ronda corta con su marcha de doce dibujos. Cuando Hexy se libera o aparece un vecino, vuelve a seleccionar objetivos y atacar. La liberación automática de Hexy a los 30 segundos y la absorción de las brujas siguen funcionando.

Verificación reproducible:

- `node scripts/arcade/pack-hexy-acting.mjs`: conserva las hojas de juego y empaqueta los nueve recortes de ilustración.
- `tests/hexy-encore-repair.spec.js`: preparación original, ilustraciones por postura/dirección, retirada de expresiones, ronda del payaso y reanudación de ataques, llegada completa de estrellas, presión según superficie/aire, tiempos de manga y comparación de píxeles del render real para los cuatro cuadros de fuego.
- `node scripts/arcade/review-encore-repair.mjs`: diecisiete grabaciones del motor/renderizador real en Chrome, con reproducción decodificada y capturas en tiempos fijos de simulación en `review/`.
- `tests-charge.log`, `tests-render.log`, `tests-regression.log` y `tests-final-charge.log`: 119 pruebas distintas comprobadas entre los grupos. Dos renderizados agotaron el tiempo en paralelo y pasaron al repetirlos de forma secuencial; la expectativa del final de audio se actualizó a la carga nueva y volvió a pasar. `tests-final.log` conserva la revisión anterior a la ampliación de carga.
- `build.log`: compilación completa sin errores. `tests/artifacts/arcade/effects-mix/encore.json`: envolvente de audio real, sin valores inválidos ni recorte digital.

La corrección de pantalla completa se verifica en `tests-manga-screen.log` y `tests-manga-final.log`: cada uno de los nueve sectores de la pantalla contiene tinta y blanco en cinco momentos del impacto, sin píxeles cromáticos, en pradera, puente y aldea nocturna. También se comprueba el filtro del HUD y la vuelta al color. `manga-screen/` contiene cuatro grabaciones nuevas, reproducciones decodificadas y capturas; el informe registra cero errores. `build-manga-screen.log` completa la compilación con cero errores y cero advertencias de diagnóstico.

Los cambios anteriores de contacto con agua y escombros destruidos se mantienen. No se añaden barras de salud a enemigos.
