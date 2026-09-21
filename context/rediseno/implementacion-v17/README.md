# v17 · Atrio y escaparates de WonderPop

La escena 6 recibe al visitante en un atrio con personajes animados por celdas, planos de vegetación, columnas próximas y un directorio. La escena 7 convierte las imágenes de marketplace en objetos para explorar dentro de una vitrina ilustrada. El scroll recorre ambos espacios; el mapa permite saltar entre ellos y elegir un escaparate concreto.

## Experiencia

- **06 / El atrio:** profundidad entre columnas, macetas, bunnies, luminarias y arquitectura; un Magic Bunny saluda al tocarlo. Seis dibujos con parpadeo y saludo, con los pies ajustados a una misma línea de apoyo. Bunnies sin ropa según la referencia del usuario.
- **Mapa:** dos paradas disponibles y accesos a Magic Drink, coleccionables y música. Muestra la ubicación, permite regresar y bloquea el desplazamiento del fondo mientras está abierto. Cierre con Escape, devolución del foco y uso con teclado.
- **07 / Los escaparates:** escenario de tienda nuevo, gabinete integrado sobre su mostrador, nueve piezas en tres categorías, flechas que vuelven al principio, ampliación de imágenes y enlaces a las páginas dedicadas. Ocho imágenes proceden del marketplace del usuario; la lata usa el arte existente. No se añadieron precios ni existencias.
- **Música:** se puede iniciar desde la galería sin reiniciar una reproducción ya activa. Notas y un indicador animado acompañan a la canción; se conserva la portada en el mini reproductor.
- **Paso entre salas:** la cámara avanza lateralmente detrás de una columna próxima que cubre el cambio de fondo. Funciona también al retroceder.
- **Navegación:** siete capítulos en el mismo indicador. Los primeros cinco conservan su distancia de scroll anterior tanto en escritorio como en móvil. El pie de enlaces se presenta después de los escaparates.

## Imagen y movimiento

La [referencia de Rick and Morty de 2019](https://www.awwwards.com/sites/rick-and-morty) aporta la idea de explorar objetos y pantallas dentro de una habitación ilustrada. WonderPop conserva su propia dirección de arte violeta, dorada y cálida.

Se usa una hoja real de seis poses para los bunnies. La cámara sigue el scroll de forma continua; los personajes y la luz tienen un reloj independiente. El shader Three.js se limita a la pantalla de la vitrina: al cambiar de pieza, una breve distorsión por bandas, separación de color y motas cálidas hace aparecer la imagen siguiente. El cambio dura 640 ms; la magia usa una cadencia de 12 pasos por segundo.

El shader se carga al aproximarse al atrio, limita su resolución y se detiene fuera del tramo y al ocultar la pestaña. Las imágenes HTML y los controles siguen disponibles si WebGL falla o pierde su contexto. Con movimiento reducido, las escenas pasan a un recorrido estático, el shader deja visible la imagen y se eliminan los bucles.

Arte generado con la herramienta integrada ImageGen:

- `public/image/journey/bunny-wave-v17.webp`
- `public/image/journey/wonderpop-gallery-v17.webp`
- `public/image/journey/plaza-pier-v17.webp`

[PROMPTS.md](PROMPTS.md) conserva los tres prompts y sus referencias. [assets.json](assets.json) relaciona fuentes, salidas y tamaños. Las copias PNG originales están en `arte-fuente/`, ignorada por Git. Se preservó el contenido original de `src/components/marketplace`; las ocho copias de producción están optimizadas en `public/image/journey/wonderpop-collection/`.

## Comprobación

La primera inspección detectó que el foco de un control podía desplazar internamente el escenario con `overflow: hidden`; ahora usa `overflow: clip`, de modo que sólo se desplaza la cámara. En móvil se reservaron espacios independientes para encabezado, vitrina, mapa, reproductor y navegación. En pantallas bajas la vitrina tiene su propio desplazamiento.

- `npm run build`: 187 archivos revisados, 0 errores, 0 advertencias y los 80 hints existentes del proyecto; nueve páginas generadas.
- **49 casos distintos de Playwright aprobados** entre los trece archivos de pruebas. Incluyen los cinco casos nuevos de mapa, selección de escaparate, fotogramas independientes, detalles, recuperación de WebGL, tamaños de pantalla y recorrido inverso.
- Primera pasada nueva: 11/12; el caso del Bunny buscaba con `getByRole` un botón que ya se había ocultado al abandonar su escena. Se corrigió el selector para comprobar que su animación se detiene fuera de pantalla.
- Regresión: 41/42. La comparación de píxeles del puente incluía agua dentro del arco; se movió la muestra a mampostería sólida, conservando la tolerancia. El caso pasó dos veces consecutivas sin cambiar el shader del agua.
- La inspección adicional a 800 px detectó que la categoría musical y el reproductor podían cubrir el encabezado y el regreso al atrio. Se reservó la altura de la vitrina, se amplió su anchura y se compactó el texto. La prueba final de controles pasó con 1440×900, 800×900, 390×844, 360×740 y 390×640.
- Revisión visual de escritorio, tableta, móvil, pantalla baja y formato 2559×1303: escenas 6/7, ambos lados del cambio de sala, columna de transición, ampliación, mapa y música. Los registros de captura no registraron errores de consola ni de página.
- [performance.json](performance.json): Chrome local, 390×844, DPR2, emulación táctil, CPU 4×, música activa y recursos decodificados. P95 de intervalos entre frames: 12,2 ms en el atrio, 30,3 ms durante el cruce y 18,2 ms en la galería; ninguna tarea larga registrada, sin desbordamiento horizontal. Es una medición local con recursos calientes, no una prueba de red ni de teléfono físico.

Los scripts `capture.cjs` y `performance.cjs` permiten reproducir las capturas y la medición local. Los registros, capturas y PNG de origen están ignorados por Git; se conserva el informe de rendimiento. Los originales de marketplace, las eliminaciones preexistentes y los otros archivos pendientes del usuario permanecen fuera de esta entrega.

Las escenas 8 y 9 (visitantes/testimonios y FAQ con cierre definitivo) siguen siendo la continuación prevista en v16. Esta entrega construye las escenas 6 y 7; conserva la guía breve de preguntas dentro del atrio.
