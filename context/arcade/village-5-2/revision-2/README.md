# Pueblo 5-2 · revisión 2

Implementado y verificado el 15 de octubre de 2026. Esta revisión amplía la primera entrega del pueblo según la petición de variedad de habitantes, continuidad con el cementerio, chispas de fuego y profundidad.

## Resultado jugable

- **21 440 unidades**, exactamente la longitud del cementerio 5-1. Salida del cementerio → camino entre huertos → primeras casas → plaza de la fuente → mercado de Halloween → plaza del refugio.
- **58 habitantes, 14 grupos y ocho diseños**: panadero, tendera, niño con capa naranja, niña con capucha de gato, anciano, abuela, herrero y florista. Los grupos mezclan edades y velocidades. El primero incluye ambos niños con adultos desde el inicio.
- Todos huyen hacia la izquierda, hasta las afueras en x=-180. No desaparecen por haber recorrido una distancia corta dentro del pueblo. Al reintentar se conservan las personas que ya huyeron, las transformadas y las que estaban huyendo.
- Cada diseño tiene ocho poses de carrera y cuatro de transformación. Los niños tienen tamaño, zancada, punto de mira y colisión propios. El rayo debe alcanzar su cuerpo; los disparos de Hexy no dañan habitantes.
- **Payaso con calabaza encendida en la cabeza**: aviso, exhalación de tres chispas, vuelo animado e impacto de fuego. Ocho celdas de vuelo, cuatro de impacto y cuatro de exhalación. Las chispas dañan por contacto, admiten la defensa normal y se pueden saltar.
- 38 enemigos iniciales: 13 zombis, nueve payasos calabaza, siete brujas y nueve fantasmas blancos originales. Las variantes de zombis y sus restos vestidos siguen funcionando.
- Cinco banderas de reaparición, siete cajas de bebida (tres garantizadas de nivel II), dos rescates y cinco tesoros. Las 49 estrellas anteriores conservan sus identificadores aunque cambien de posición; se añaden 12 en el camino inicial.
- La entrega termina al despejar el refugio, como en v1. No incluye un jefe nuevo. **Nunca se dibujan barras de salud de enemigos**.

## Profundidad y escenario

Nubes, montañas, bosque lejano, colinas con tejados, huertos con su propia tierra, fachadas y decoración del plano de juego, niebla y cercas/jardineras cercanas. Las capas lejanas tienen alturas fijas y continúan desplazándose hasta el final del nivel; no se detienen al agotar una panorámica.

La salida conserva el portón abierto y elementos del cementerio. Su paisaje retrocede espacialmente al avanzar. El suelo cambia gradualmente a empedrado entre x=4200 y x=5800. Las casas empiezan cerca de x=5500. Tres claros albergan una fuente, puestos de mercado y un quiosco/refugio, con calabazas, faroles, guirnaldas, bancos, flores y fantasmas de papel.

Las fachadas están plantadas en el terreno real. Los árboles decorativos pertenecen a imágenes de paisaje que ya contienen su propia tierra. El color de los elementos próximos se ajusta una vez en caché, evitando filtros costosos en cada cuadro.

## Arte, fuentes y reproducción

Generado con ImageGen integrado, usando referencias locales del arte existente; fondo transparente. Fuentes originales conservadas en `sources/`. Prompts completos en [prompts.json](prompts.json) y [environment-prompts.json](environment-prompts.json).

| Archivo final | Contenido |
| --- | --- |
| `public/arcade/sprites/enemies/village-children-v2.webp` | Dos niños, 24 celdas |
| `public/arcade/sprites/enemies/village-elders-v2.webp` | Dos mayores, 24 celdas |
| `public/arcade/sprites/enemies/village-neighbors-v2.webp` | Herrero y florista, 24 celdas |
| `public/arcade/sprites/enemies/village-fire-v2.webp` | 16 celdas de fuego |
| `public/arcade/maps/village/village-plazas-v2.webp` | Ocho elementos de plazas |
| `public/arcade/maps/village/town-bank-v2.webp` | Colinas y pueblo lejano |
| `public/arcade/maps/village/orchard-bank-v2.webp` | Huertos, muros y tierra intermedia |

`node scripts/arcade/pack-village-v2.mjs` encuentra los espacios transparentes, recorta y registra los cuadros, y empaqueta los atlas con Sharp. No redibuja los personajes. Los archivos v1 se conservan. El registro de recortes está en `registration.json`.

## Verificación realizada

- 27 pruebas de modelo/regresión aprobadas: 12 del pueblo y 15 del cementerio/Campanero. Incluyen longitud, terreno transitable, identificadores recogidos, familias al inicio, colisión infantil, rayo, interrupción, fuego que daña y se salta, reintento y victoria.
- Selector real de capítulos aprobado: entrar en 5-2, iniciar práctica, simular y jugar con teclado sin errores de página.
- Nueve escenas grabadas con el motor y renderizador de producción: inicio, huertos, entrada al pueblo, fuego, transformación adulta, transformación infantil, fuente, mercado y victoria. Revisadas las hojas de contacto decodificadas y los fotogramas completos. La invulnerabilidad sólo pertenece al montaje de estas grabaciones; el daño se verifica aparte en las pruebas de simulación.
- `tests/hexy-village-browser.spec.js` produce vídeos/estadísticas en `tests/artifacts/arcade/village-5-2/revision-2/`; `node scripts/arcade/review-village.mjs` decodifica los vídeos. Se puede seleccionar escenas con `VILLAGE_SCENES`.
- `npm run build`: 0 errores y `[build] Complete!` a las 00:09:56 del 15/10/2026. Registro en [build.log](build.log).
- Resumen de arte, hashes y tiempos de render en `verification.json`.

Para jugar: **Arcade → Elegir capítulo → 5-2 · El pueblo de los dulces → Práctica**, o continuar desde 5-1.
