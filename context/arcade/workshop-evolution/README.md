# Taller de Miso y mejoras funcionales

## Comportamiento

- Dos pestañas: **Tienda y patio de pruebas** y **Equipamiento**. Prioridad de composición: escritorio ancho, comprobado a 1920×1080 y 2560×1440.
- Equipamiento ofrece búsqueda, filtro de propiedad y cuatro familias. Cada una empieza con un espacio: Bebidas (máximo 3), Botas (3), Sombrero (3), Habilidades (5). No existe un límite global de cinco mods.
- Ampliaciones independientes: 60, 140, 220 y 300 estrellas, según espacio; los siguientes rangos de campaña desbloquean las ampliaciones posteriores. No se sustituye un mod equipado silenciosamente cuando su familia está llena.
- Dos espacios de Bebidas habilitan dos latas, con munición independiente y un máximo de dos sabores iniciales. El tercer espacio permite añadir Funda de reserva. **Q / R3** intercambia: R3 es pulsar el stick derecho.
- Se conservan las compras antiguas, niveles, monedas y equipo válido. Los espacios globales anteriores se distribuyen entre familias; Doble fondo comprado se transforma en el segundo espacio de Bebidas y Funda de reserva. Ampliaciones y mejoras usan transacciones con valor esperado, impidiendo cobrar dos veces una solicitud repetida.
- El patio ejecuta el motor real en un estado separado. Los payasos patrullan; al derrotarlos salen reemplazos de la carpa, uno cada 1,4 s hasta recuperar tres. Hexy no pierde vida ni recibe interrupciones de daño. La prueba no modifica el equipo, las estrellas ni la partida en curso.
- En la práctica de Prism, el selector cambia la bebida compañera. Prism permanece en el bolsillo opuesto al alternar. Las latas vacías se reponen en la práctica, no en la campaña.

## Nuevos mods

| Mod | Familia | Nivel I | Siguiente mejora |
| --- | --- | --- | --- |
| Picado de cometa | Botas | Abajo + dash en el aire: picado vertical | II: admite diagonales abajo |
| Doble impulso | Botas | Dos dash por vuelo; intervalo 0,4 s | II: intervalo 0,34 s; se recargan en suelo real |
| Paso ligero | Botas | Caminar/correr +6% | II: +10%; III: +14% |
| Ala protectora | Sombrero | Arriba + escudo protege sobre la cabeza | II: admite diagonales; mantiene coste y lados expuestos |
| Funda de reserva | Bebidas | Capacidad de todas las latas +15% | II: +25%; III: +35%; equipar nunca rellena munición gastada |

## Sabores

Las bebidas creativas conservan el doble de reserva inicial en sus tres niveles; sus mejoras se concentran en funciones. La maestría comprada sirve también para latas recogidas. Los sabores originales conservan su progresión anterior de reserva.

| Sabor | I | II | III |
| --- | --- | --- | --- |
| Echo Melon | 1 eco, copia al 50% | 2 ecos, 32% cada uno | 3 ecos, 25% cada uno; retrasos escalonados |
| Prism Peach | 1 prisma, 5,5 s | 2 prismas, 7 s | 3 prismas, 7 s |
| Ribbon Raspberry | Velocidad normal | Balanceo +12% | +22%; el lazo se cierra antes |
| Honey Mango | 6 gotas, 2,65 s | 8 gotas, 3,3 s | 10 gotas menores, panal 12% más ancho; daño total igual a II |
| Jelly Cherry | 3 rebotes, 5 s | Las cerezas rebotan sobre el trampolín | 4 rebotes, 6 s |
| Volt Lychee | Daño tras 0,34 s de contacto | Arranque a 0,28 s | Mayor distancia de cadena; mismos límites de objetivos y daño máximo |
| Orbit Orange | 3 satélites, 4,2 s | Duración 5 s | 4 satélites menores, mismo daño total de 12 |

Prism se coloca siguiendo la puntería, incluidas vertical y diagonales, y separa los prismas cercanos. Cada división conserva el 55% del daño por rama; máximo tres visitas distintas, sin ciclos. Su coste cargado es 28 de magia para poder colocar tres. Volt mantiene consumo desde el primer toque, tres objetivos básicos y cinco cargados.

## Arte y empaquetado

Modo utilizado: **built-in imagegen**. Los prompts completos, referencias e iteraciones están en [prompts.json](./prompts.json); fuentes originales y rutas de todos los resultados en [assets.json](./assets.json).

- `public/arcade/sprites/effects/volt-beam-v2.webp`: cuatro fases de rayo, cuatro de descarga fuerte y cuatro impactos.
- `public/arcade/sprites/effects/ribbon-satin.webp`: cinta de satén y golpes dibujados por fotogramas.
- `public/arcade/sprites/hexy/ribbon-swing.webp`: ocho poses de balanceo con pies y punta de varita registrados.
- `public/arcade/sprites/ui/`: iconos de los cinco mods; `skills-emblem.webp` queda como recurso adicional.
- Empaquetador: `scripts/arcade/pack-workshop-evolution.mjs`; conserva transparencia y genera `hexyRibbonAtlas.js`. Para repetirlo se necesitan los PNG originales indicados en el manifiesto.

La trayectoria de colisión de Ribbon comparte la transformación de su imagen y se recorta al tocar terreno. El rayo se divide en tramos pintados que conectan con cada objetivo, con descarga y contacto animados.

## Verificación

- Pruebas del motor: categorías/migración, dos latas, munición sin relleno por cambios de equipo, respawns e inmunidad del patio, Prism direccional, Echo, Honey, Ribbon y ocho poses, Jelly/Orbit/Volt, picado/doble dash y escudo superior.
- Pruebas de navegador: tienda/equipamiento a 1920 y 2560, compras/expansiones, seis mods simultáneos, Q breve, selector compañero, invulnerabilidad, reposición de enemigos y aislamiento del guardado. Mando verificado mediante entrada Xbox estándar simulada; no se probó un mando físico.
- Capturas y grabación real: `tests/artifacts/arcade/workshop-evolution/`, incluidos `equipment-1920.png`, `shop-2560.png`, `previews.webm` y `motion-contact.png`.
- Registros: `regression.log`, `final-regression.log` y `build.log` en esa carpeta. Se mantiene un solo trabajador de navegador.
- Resultado: 72 casos distintos aprobados entre las dos tandas. La primera dejó dos expectativas del sistema antiguo; ambas se actualizaron y pasaron en la tanda final de 10 casos. `npm run build` completó con 0 errores, 0 advertencias del chequeo y 23 hints existentes. El empaquetador informa adicionalmente sobre Browserslist antiguo.

La revisión visual incluyó capturas y secuencias de fotogramas del juego. El equilibrio a lo largo de toda la campaña queda abierto al playtesting; estas pruebas no lo sustituyen.
