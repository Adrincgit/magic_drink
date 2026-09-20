# Magic Drink — cartel, concierto y jardín (v9)

Integrado en los componentes React del portal Astro, en la rama `paralax`.
Punto de partida guardado: `168f550`; servidor local corregido en `f6c88d5`.
Sitio de trabajo: http://localhost:4321/.

## Resultado

- Cartel: cuatro poses de Hexy y los bunnies, con cambio cada 3,2 segundos y
  una disolución breve. Espera la decodificación, omite imágenes fallidas y
  pausa al salir del tramo, ocultar la pestaña o activar movimiento reducido.
- WonderPop deja de aparecer en las primeras tres escenas y detrás del concierto.
- Concierto: cuatro filas nuevas de público con velocidades distintas, además
  de la figuración lejana. Hexy y el escenario comparten su geometría y quedan
  cerca del centro. Calle con margen suficiente para evitar el borde vertical.
  Dirigible publicitario ilustrado con Hexy y la Original; deriva ambiental
  independiente del scroll. Se conservan los haces móviles y el confeti.
- Jardín: terreno propio, edificio centrado, vegetación distante, dos pares de
  árboles frondosos, arco y luces. La cámara avanza sin encoger previamente el
  edificio. El terreno se regeneró para alinear el final del camino con la entrada.
- El paso 4→5 usa follaje con un centro opaco y contorno irregular. El cambio de
  escena ocurre dentro de la oclusión; también funciona al retroceder.
- El paso a la escena 6 usa la luz cálida de la entrada para cubrir la disolución.
  **El rediseño de la escena 6 queda pendiente**, conforme a la instrucción del usuario.
  En particular, su lata, partículas y barra siguen siendo los de v8.

## Arte y reproducción

Se utilizó **ImageGen integrado** con referencias del proyecto. No hubo CLI ni
API externa de generación. Se produjeron 13 imágenes; 12 se integran como nuevos
WebP en `public/image/journey/`, con un peso conjunto de aproximadamente 4,44 MB.
La primera versión del terreno quedó descartada y archivada localmente.

[assets-manifest.json](assets-manifest.json) contiene los prompts completos,
referencias, originales y salidas. Los PNG se conservan en `arte-fuente/` local,
además de las rutas originales de generación. `export-assets.cjs` solo convierte
a WebP y publica cada archivo completo mediante un cambio de nombre atómico.

La entrada sigue siendo `src/pages/index.astro` → `IndexExperience.jsx` →
`IndexJourney.jsx`. El nuevo cartel vive en `BillboardSequence.jsx`; las escenas
4 y 5 en `IndexWorldTail.jsx`, con cámara en `worldMotion.js`. Las filas y el
dirigible tienen sus estilos en `festivalDepth.module.css`.

## Validación

- `npm run build`: 9 páginas, 0 errores, 0 advertencias y 79 sugerencias existentes.
- `npx playwright test --workers=1 --reporter=line`: 16 pruebas aprobadas.
- Chrome 153: capturas de 1440×900 y 390×844, sin errores de página ni recursos
  fallidos ni desbordamiento horizontal. `capture.cjs` reproduce el recorrido.
- Regresiones: avance y retroceso; edificio que solo aumenta; público con distinta
  profundidad; encuadre del escenario; cartel con un fotograma fallido; movimiento
  reducido; navegación, idioma y audio; hidratación en localhost y 127.0.0.1.
- La cobertura del cambio de escena se compara con fondos rojo y azul detrás del
  follaje en 2560×1300 y 390×844. Diferencia máxima permitida: 2 niveles RGB.

[performance.json](performance.json): Chrome sin interfaz, 390×844, DPR 2,
emulación táctil, CPU ralentizada 4×, imágenes ya decodificadas y servidor local.
Mediana de intervalo entre frames: 6,1 ms; percentil 95: 18,2 ms; un frame sobre
50 ms, sin tareas largas ni desbordamiento. Es una comprobación emulada: no mide
un teléfono físico ni la descarga con una conexión móvil.

Las capturas, originales de trabajo y logs quedan fuera de Git. Se conservan
los archivos de contexto anteriores del usuario. Este avance no se ha publicado.
