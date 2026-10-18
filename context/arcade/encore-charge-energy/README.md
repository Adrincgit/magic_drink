# Energía de carga del Encore

Se elimina el arco violeta de progreso que rodeaba la punta de la varita. En su lugar se concentra luz cálida y rosada con las ocho fases pintadas de la energía del Encore y destellos irregulares. El núcleo se dibuja delante de Hexy, unido a la punta registrada de cada pose; no usa contornos circulares.

La preparación pasa de 1,9 a **1,7 segundos**. Un reloj común acelera proporcionalmente los recorridos y estelas de las 48 estrellas, sus dibujos animados, la concentración de luz, la entrada y salida de las ilustraciones, la presión sobre el terreno y el audio de carga. Las cuatro poses de preparación conservan su secuencia completa. Todas las estrellas terminan su recorrido unos 0,197 segundos antes de la descarga.

La descarga mantiene sus 2,25 segundos y ocho pulsos. Se conservan las ilustraciones independientes de alta resolución, la preparación clásica con la varita en alto y el intervalo manga de 0,105 segundos compartido con el contacto del Arlequín.

Verificación:

- `tests.log`: continuidad y llegada de estrellas, disparo a los 1,7 segundos, poses, ilustraciones, superficies, renderizado y choque de poderes.
- `tests-audio.log`: envolvente de audio del Encore y margen durante combate intenso.
- `review/`: grabaciones del motor real, reproducciones decodificadas, capturas y sus tiempos de simulación.
- `build.log`: comprobación de 370 archivos con cero errores y cero advertencias de diagnóstico; compilación completa, salida 0.

Se comprobaron 27 pruebas distintas. En la primera ejecución pasaron 24 de 25; la captura del duelo agotó el tiempo al cargar también la pantalla React y otra copia de los recursos. Los dos escenarios de captura ahora usan una página vacía con el renderizador real. La repetición de ambos, junto con las dos pruebas de audio, terminó con cuatro aprobadas. Las tres grabaciones cubren la carga clásica en pradera, la carga clásica nocturna y el lanzamiento aéreo hacia abajo, con cero errores de ejecución. Los acercamientos `*-wand.png` permiten revisar la concentración de energía sin el arco de progreso.
