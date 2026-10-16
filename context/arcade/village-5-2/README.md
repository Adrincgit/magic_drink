# 5-2 · El pueblo de los dulces

Estado actual: [revisión 10, 15/10/2026](revision-10/README.md): catorce vecinos se acumulan ante un derrumbe resistente e intentan trepar mientras la cámara se aleja y llegan brujas y calabazas. Los dulces se liberan automáticamente a los 30 segundos; las advertencias miran a Hexy y sólo ocurren antes del pueblo. Se conservan los séquitos, escondites y reparto de blancos de la [revisión 9](revision-9/README.md), los obstáculos, rescates, absorción, luces y polvo de la [revisión 8](revision-8/README.md), y las correcciones anteriores.

## Historial: primera entrega

Primera versión jugable, 14 de octubre de 2026. Continúa directamente después del cementerio 5-1. El prototipo 6-1 conserva su ID y queda después del pueblo. No hay barras de vida de enemigos.

## Dirección confirmada

- Llegada a un pueblo durante una fiesta de Halloween que está siendo invadida.
- Vecinos huyendo, payasos zombis y brujas que convierten a los habitantes en dulces mediante un rayo.
- La aclaración del usuario reemplaza la primera interpretación: los payasos llevan una **calabaza encendida en la cabeza**, no una calabaza en las manos.
- Aquí vuelven los fantasmas blancos originales (`nightmare-ghost`, `ghostForm: 'sheet'`). Los zombis conservan sus muñones con hueso visible y las piezas desprendidas con ropa de las revisiones anteriores.

## Recorrido y mecánicas

11 000 unidades de calle continua, con pendientes suaves: afueras, entrada del pueblo, calle de los faroles, barrio bajo el hechizo y plaza del refugio. Tres puntos de reaparición. Cuatro cajas de bebidas, dos garantizadas de nivel II. Dos rescates de bunnies y cinco tesoros; no cambian los identificadores de estrellas anteriores.

18 habitantes distribuidos en seis grupos, con dos diseños y ciclos de huida. Se activan cerca del jugador, corren hacia la salida de su barrio y quedan registrados como a salvo al escapar. Los hechizados pasan por cuatro poses durante 1,2 segundos y permanecen como dulces. Los disparos de Hexy no dañan a los vecinos. Los resultados resueltos se conservan al reintentar desde una bandera; los habitantes aún en peligro se reinician.

Las brujas avisan durante 1,1 segundos con la varita y una trayectoria violeta. Fijan el destino al empezar, anticipando el desplazamiento del vecino; el rayo viaja y requiere una colisión real. Pueden fallar. Un golpe a la bruja interrumpe la preparación. El primer cuerpo alcanzado intercepta el rayo, por lo que Hexy puede ponerse entre ambos y usar su defensa habitual. La transformación sólo sucede una vez por vecino.

Los payasos con cabeza de calabaza iluminan su rostro antes de exhalar tres brasas de corto alcance. Hay nueve zombis, siete payasos con calabaza, seis brujas y cinco fantasmas originales al crear el nivel. La plaza se abre al derrotar a sus enemigos; esta primera versión termina con el saludo de victoria y continúa al capítulo siguiente. No se añadió otro jefe a esta entrega.

## Arte y profundidad

Panorama de montañas, nubes y tejados; casas lejanas a menor contraste y velocidad; fachadas ancladas al terreno; calle de adoquines con borde difuminado; cercas y jardineras cercanas, faroles, banderines, calabazas y neblina suave. Las casas del fondo no recalculan su altura a partir de las pendientes inmediatas.

72 celdas nuevas de personajes: 24 de habitantes (16 de carrera y ocho de transformación), 24 de bruja y 24 de payaso con cabeza de calabaza. Ocho edificios y ocho elementos de decoración. Animaciones dibujadas como personajes enteros.

Archivos finales:

- `public/arcade/sprites/enemies/village-villagers-v1.webp`
- `public/arcade/sprites/enemies/village-witch-v1.webp`
- `public/arcade/sprites/enemies/village-pumpkin-v1.webp` — calabaza puesta en la cabeza.
- `public/arcade/maps/village/panorama-v1.webp`
- `public/arcade/maps/village/street-v1.webp`
- `public/arcade/maps/village/village-houses-v1.webp`
- `public/arcade/maps/village/village-decor-v1.webp`

Generación con la herramienta ImageGen integrada, modo generación con referencias de estilo. Prompts completos en [prompts.json](prompts.json), [pumpkin-head-prompt.txt](pumpkin-head-prompt.txt) y [decor-prompt.txt](decor-prompt.txt). El prompt inicial `pumpkin` de `prompts.json` está descartado y se conserva como antecedente; el atlas final usa `sources/pumpkin-head.png`. Fuentes originales conservadas en `sources/`. Sharp sólo realiza recorte, registro, empaquetado y compresión técnica mediante `scripts/arcade/pack-village-v1.mjs`; el juego no referencia archivos de la carpeta personal de generación.

## Verificación

- `tests/hexy-village.spec.js`: progresión y migración de partidas, huida, piezas de zombis, anticipación/interrupción, colisión del rayo, brasas, derrota con disparos básicos, reintentos, salida y selector real.
- `tests/hexy-village-browser.spec.js`: grabaciones con el motor y renderizador de producción: llegada, transformación, ida/vuelta por la calle y victoria en el refugio. La invulnerabilidad sólo se usa en estas escenas de revisión.
- `scripts/arcade/review-village.mjs`: decodifica los vídeos y produce hojas de contacto y fotogramas completos. Revisados visualmente, incluida la bruja disparando, la envoltura mágica y el dulce final.
- Regresión: cementerio, muñones y restos vestidos, esqueletos y las dos formas del Campanero.
- Logs de pruebas, compilación y revisión en esta carpeta; vídeos y fotogramas en `tests/artifacts/arcade/village-5-2/`.

Para probar: Arcade → Elegir capítulo → **5-2 · El pueblo de los dulces** → Práctica. También sigue al 5-1 en la campaña normal.
