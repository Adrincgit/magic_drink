# Combate común: sonido, resistencias y ultimate aéreo

Revisión del 16/10/2026. Se aplica a los actores y ataques compartidos por los niveles.

## Roles y control de enemigos

La clasificación vive en `actors/enemies/adventureEnemyTraits.js`. `enemyClass(actor)` devuelve `basic`, `strong`, `miniboss` o `boss`. No depende de cuánta vida tenga el actor ni de la escala con que se dibuje. Los actores nuevos pueden declarar `combatClass`; `machine` y `large` también identifican enemigos fuertes.

| Rol | Actores actuales | Respuesta a control |
| --- | --- | --- |
| Básico | Payasos de a pie, acróbatas, buzos, zombis normales, calabazas y brujas comunes | Pueden recibir los controles que admite cada arma. La miel también ralentiza zombis básicos y Jelly puede levantarlos. |
| Fuerte | Lanzador de payasos, zepelín, bote, carro de fuego, globo de brasas, gigante y armadura poseída | Resisten burbuja, levantamiento, inmovilización, empuje y frenado eléctrico. Conservan el daño y los impactos admitidos por su propia armadura. |
| Minijefe | Campanero, Cosechador del pueblo y encuentros finales de recorrido | No se encierran en burbujas ni reciben el control de un enemigo básico. |
| Jefe | Arlequines y encuentros marcados como `bossOnly` | Conservan sus reglas de vulnerabilidad, fases y reacciones. |

`canControlEnemy(actor, effect)` centraliza los permisos. Lo utilizan Bubble Tape, Honey Mango, Jelly Cherry, el control de Ribbon, los empujes de Aqua, el remolino de Kiwi, la ralentización eléctrica y los rebotes sobre enemigos. Ribbon mantiene además su lista de actores con coreografía compatible; clasificar un actor como básico no inventa animaciones de agarre.

La absorción de una bruja es una acción comprometida: durante `absorb` / `absorb-player` no puede atraparse, ralentizarse ni interrumpirse mediante estos controles. Todavía recibe daño y puede ser derrotada. Se evita que la recuperación genérica cambie accidentalmente esa fase a `recover`.

La captura de proyectiles de Bubble Tape sigue siendo independiente de la clasificación de actores. Las burbujas fuertes dañan a máquinas y minijefes aunque estos no puedan quedar atrapados. Un contacto resistido muestra un estallido pequeño, sin simular una envoltura alrededor del enemigo. Si la burbuja lleva proyectiles capturados conserva su explosión de área. Tampoco se carbonizan con la animación genérica de un enemigo básico al morir electrocutados.

## Sonidos e impactos

`adventureImpactFeedback.js` conecta el contacto aceptado con su sonido y dibujo. Los canales sostenidos comparten una breve espera por objetivo para no disparar sonido y salpicaduras en cada fotograma.

| Acción | Respuesta común |
| --- | --- |
| Fuego | Contacto de llama, llamitas ya existentes en enemigos compatibles y estallido con aire, cuerpo y crepitación. |
| Agua | Salpicadura pintada, gotas, contacto húmedo; el mismo sistema cubre el suelo y la extinción. |
| Miel | Impacto viscoso, salpicadura y charco pintados; ralentiza a básicos, sin inmovilizar maquinaria o jefes. |
| Jelly | Impacto de gelatina y rebote elástico; el trampolín respeta los permisos de levantamiento. |
| Burbujas | Sonidos distintos para contacto, captura y estallido. |
| Aros, pelotas y serpentinas enemigos | Sonido al crear el proyectil real, con una sola emisión por abanico desde el mismo punto. |
| Buzos y botes | Lanzamiento de agua y salpicaduras al emerger, sumergirse, saltar o caer al agua. |
| Cañones | Golpe de presión, aire, cuerpo grave y cola corta en la boca que dispara. Incluye el lanzador de payasos y los morteros. |

Los sonidos nuevos se construyen con capas de texturas y resonancias en `shared/audio/materialCombatSound.js`, conectadas al bus FX, su compresor y los controles existentes. Se colocan en estéreo según el origen y se atenúan con la distancia. Se conserva el sonido básico de Hexy y el banco grabado de voces, con su volumen independiente.

La desaparición de sonidos lejanos es deliberada: una prueba de desembarco que quiera comprobar la salpicadura debe colocar a Hexy dentro de su alcance audible.

## Ultimate aéreo

La comprobación de estado aéreo precede ahora a la selección de la pose de descarga de suelo. Hay cuatro dibujos de carga y cuatro de descarga sostenida con piernas flexionadas, puño recogido y cabello desplazado por el disparo. La estrella de la varita está registrada por celda; durante la descarga mantiene un punto fijo relativo a Hexy, también al voltear. El retroceso, coste, duración, ocho pulsos, enfriamiento y pose épica de suelo se conservan. Al terminar, la física vuelve a controlar la caída.

Arte creado con **ImageGen integrado**, sin CLI alternativo. [Prompt exacto](air-ultimate-prompt.txt), [fuente elegida](air-ultimate-source.png), [medidas y registro](air-ultimate-registration.json).

- `public/arcade/sprites/hexy/air-super-v2.webp`
- `public/arcade/sprites/hexy/air-super-release-v2.webp`

Empaquetado reproducible: `node scripts/arcade/pack-air-ultimate.mjs`. Se conservan completas las figuras y se usa escala uniforme; no se combinan torsos y piernas recortados.

## Evidencia

- [Descarga a la derecha](air-right-release.png), [a la izquierda](air-left-release.png).
- Grabaciones decodificadas: [ultimate derecho](air-right-playback.png), [izquierdo](air-left-playback.png), [fuego](fire-playback.png), [agua](water-playback.png), [Jelly](jelly-playback.png), [miel](honey-playback.png). Los `.webm` correspondientes están en esta carpeta.
- [Resistencia a la burbuja](bubble-resistance.png), [estado medido](bubble-resistance.json), capturados después de disiparse el impacto: el básico conserva `trap > 0`; carro, gigante y minijefe tienen `trap: 0` y todos reciben el punto de daño del contacto.
- [Audio de los materiales](audio-materials.wav), [mezcla con varias acciones](audio-mix.wav), [medidas de salida](audio-levels.json). Render del grafo de sonido real: 32 kHz, dos canales, picos aproximados de 0,618 y 0,570, sin muestras no finitas. FX en cero o silencio producen cero; voces en cero conservan estos efectos. Estas medidas no constituyen una valoración auditiva humana del timbre.
- [121 pruebas dirigidas aprobadas](tests-final.log): roles, colisiones reales, inmunidades, daño a jefes, registros de varita, regreso a la caída, audio, controles de volumen y regresiones de combate, cinta, burbuja y enemigos acuáticos.
- [33 comprobaciones finales de burbuja y especiales aprobadas](tests-bubble-final.log): verifican también el estallido pequeño del contacto resistido y la explosión de proyectiles capturados. Las pruebas antiguas usan ahora básicos para comprobar inmovilización, colocan sus blancos dentro de la cámara y usan un enemigo volador para probar la búsqueda aérea de Sparkle; no se modifica el balance de ese ataque.
- [Errores de ejecución del renderer](runtime-errors.json): ninguno. [Compilación](build.log).

Reproducción visual: iniciar el servidor en el puerto 4322 y ejecutar `node scripts/arcade/review-global-combat-polish.mjs`.
