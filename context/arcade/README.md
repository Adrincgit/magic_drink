# Hexy & the Lost Chorus

La idea general y las decisiones vigentes están en [DISENO_DEL_JUEGO.md](DISENO_DEL_JUEGO.md). La propuesta de actos, carpas distintas, Halloween y jefes de tres/cuatro fases se desarrolla en [CAMPANA.md](CAMPANA.md). Ambos documentos distinguen lo decidido, lo implementado y lo que todavía estamos proponiendo.

La revisión vigente construye el 1-3 y el 1-4 y amplía el [ultimate y choque de poderes del arlequín](grand-harlequin/clash.md): tres variantes de deterioro, escala 0,72, duelo exigente de hasta veinte segundos, retratos con expresiones, expulsión y caída de ambos personajes. Perder cuesta cuatro corazones; ganar inflige tres Encores. Caen cofres con Witchy Kiwii al pasar a las fases II y III. El suelo oscuro del centro del circo es definitivo en campaña y práctica; se retira el telón de primer plano. [Incendio, pista y perspectiva](grand-harlequin/inferno.md), [derrota y control del sonido del choque](grand-harlequin/finale.md).

**Ajustes visuales independientes:** el arcade guarda sus efectos en `magic-drink:arcade:illustrated-finish:v1`. Inicio, Hexy y bebidas conservan su preferencia común en `magic-drink:illustrated-finish:v1`. Blanco y negro, grano, aberración, viñeta y activación del acabado del juego no cambian la configuración de la web, ni al navegar ni entre pestañas. Las preferencias existentes de la web se conservan; no se copian al juego. También se corrige la capa monocromática: respeta su intensidad real en vez de aplicar siempre el 100%, conservando la transición automática de las escenas del recorrido. Comprobación: `tests/arcade-visual-isolation.spec.js`.

La revisión del acceso conecta el [final de 1-3 con la entrada al Gran Telón](grand-harlequin/entrance.md): muelle, fachada, cruce del umbral y breve recorrido interior antes de la aparición del arlequín. Incluye el inventario exacto de las cuatro pistas musicales reutilizadas. [grand-harlequin/README.md](grand-harlequin/README.md) documenta el jefe principal del 1-4, de un cono y tres fases: 720 de vida en normal, cartas, cintas rasantes, acometidas y ataques aéreos; sustituye el cuarto prototipo.

[harbor-barge/README.md](harbor-barge/README.md) documenta el 1-3: ribera de feria al anochecer, caminos sobre muelles, payasos buzos y la Barcaza del Redoble, minijefe mecánico de dos fases.

[encore-cutin/README.md](encore-cutin/README.md) documenta a Hexy de cuerpo completo entrando por la izquierda con la varita levantada y expresión de grito, entre dos bandas diagonales cortas. Se desvanece en ese costado al comenzar el rayo y deja libre el centro. Sustituye la franja transversal rechazada. [stage-polish/README.md](stage-polish/README.md) recoge el retroceso gradual del ultimate y su impacto de cámara, además del dash vulnerable a proyectiles, la retirada del follaje cercano difuminado y los árboles y la cámara corregidos de la segunda arena.

[river-depth/README.md](river-depth/README.md) recoge otro 15% de salud para ambos jefes, frenazo del organillo, dos puentes al doble de longitud, recorrido de 13.430 unidades, nuevas capas de montañas y valle, cascada y nubes animadas, dos corrientes de agua y cuatro primeros planos distintos.

[organ-momentum/README.md](organ-momentum/README.md) recoge el cuerpo vulnerable durante la descarga musical, proyectiles que crecen desde el 80%, onda conectada a la trompeta inferior, preparación de embestida más larga, velocidad un 15% mayor, deformación del cuerpo, recorrido hasta la esquina izquierda en segunda fase y payaso rojo básico un 15% más pequeño.

La revisión anterior está en [air-enemy-finish/README.md](air-enemy-finish/README.md): enemigos aéreos un 15% más pequeños y destrucción del zepelín con polvo que se disipa. [armor-rescue/README.md](armor-rescue/README.md) recoge el Bunny transportado, tres Bunnies en total, ruedas que bloquean daño, impactos de chispas, proyectiles musicales mayores y más notas frontales en la segunda fase. [circus-rush/README.md](circus-rush/README.md) recoge la embestida anticipada por las ruedas, polvo persistente, frames de disparo y caída, más salud para ambos jefes y el nuevo MP3 del jefe 1-2. La tienda de Miso queda al comienzo del nivel. El combate base está en [organ-pressure/README.md](organ-pressure/README.md); el bosque y el agua, en [riverwoods-polish/README.md](riverwoods-polish/README.md). Las manos y la máquina base están en [machine-and-grip/README.md](machine-and-grip/README.md); la reorganización y los ajustes previos, en [animation-refinement/README.md](animation-refinement/README.md). La estructura de código se explica en [src/components/arcade/README.md](../../src/components/arcade/README.md).

## Recursos activos

El juego descarga recursos desde `public/arcade/`. Los sprites publicados son WebP con transparencia. Las celdas de Hexy miden 320 px, con cuatro columnas y pivote de suelo `(160,300)`. La escala del cuerpo y las coordenadas de la punta de la varita se comparten entre dibujo y proyectiles. No se mide la altura de la varita elevada como si fuera parte del cuerpo.

| Carpeta | Contenido |
| --- | --- |
| `sprites/hexy` | Movimiento, apuntado, combate y reacciones. |
| `sprites/bunnies` | Compañeros y bunnies de la web. |
| `sprites/enemies`, `sprites/bosses` | Enemigos y máquinas del circo. |
| `sprites/effects`, `sprites/props`, `sprites/pickups` | Proyectiles, efectos, objetos y suministros. |
| `maps` | Escenarios y capas de parallax. |
| `music`, `sounds`, `texts` | Música, catálogo de efectos y textos bilingües. |

## Reglas para continuar

- Interfaz en React y CSS Modules; simulación y dibujo en módulos de JavaScript y Canvas. No convertir el bucle de juego en renders de React.
- Primero se decide si Hexy está en el aire; después, su dirección de apuntado. Sostener la mira conserva la mirada entre disparos. El segundo salto conserva su voltereta hasta disparar.
- Verificar las manos, la cabeza y el registro de todos los cuadros. Descartar dibujos que cambien de brazo o agreguen miembros. Usar una escala uniforme por secuencia; no ensanchar cuerpos para igualar cajas.
- Comprobar que cada proyectil nazca en la estrella de la varita, también al voltear la figura y durante magia fuerte.
- Capturas de pruebas en `tests/artifacts`, excluido de Git. Las nuevas capturas manuales usan JPEG. Conservar solamente las fuentes WebP necesarias para reproducir el arte vigente.
- Las reglas de economía, monedas persistentes, amuletos, bebida, audio y controles viven en `adventure/engine`, `adventure/ui` y `shared`; no recuperar valores de documentos históricos.

## Archivo externo

Los 19 historiales anteriores del Arcade están fuera del proyecto en:

`G:/TRABAJO/ASTRO/ADRINC_WEBS/_magicdrink_archive/2026-10-06-history/`

Allí se conservan también los historiales de `rediseno/` (2.674.082.410 bytes, 2.486 archivos). El traslado se verificó por número de archivos y bytes. El código previo a retirar el portal, junto con pruebas e historial del Arcade, tiene además una instantánea:

`G:/TRABAJO/ASTRO/ADRINC_WEBS/_magicdrink_archive/2026-10-06-animation-refinement.zip`

El archivo externo conserva los prompts, fuentes y comprobaciones anteriores de tienda, controles, globo, recorrido, progresión y acabado visual.
