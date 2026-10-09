# 1-4 · La carpa del Gran Telón

**Última revisión:** [incendio global, pista ampliada, golpe al suelo y nueva música](inferno.md). Recoge las reglas y recursos vigentes.

Implementado el 7 de octubre de 2026 a petición del usuario: continuar con el jefe principal, caminar brevemente antes de su llegada, más vida y dificultad, y tres fases progresivas. Reemplaza el cuarto prototipo conservando su índice de guardado. No confirma ni migra el resto de la campaña.

La etiqueta de capítulo está escrita explícitamente como `1-4` para esta entrada; el cálculo antiguo de tres niveles por acto no la convierte en `2-1`.

## Recorrido y llegada

La llegada ahora conecta físicamente con el final de 1-3: muelle, fachada propia del Gran Telón, entrada y recorrido interior. La tienda está fuera. Hexy cruza el umbral con una animación de 2,05 segundos y recupera el control dentro en x=660; después camina unos tres segundos hasta la arena. No hay checkpoint interior. La presentación se activa en x=1.380. El arlequín entra con una caída acrobática de 4,5 segundos: aterriza entre fuego y humo, se incorpora, presenta el cristal y provoca antes de atacar. Al reintentar se vuelve fuera junto a Missi. [Secuencia, música y arte del acceso](entrance.md).

La pista tiene **2.840 unidades**, con muros de fuego en los límites físicos y espacio reservado para la expulsión del choque. La cámara se acerca al reunir a los personajes y se abre al separarlos, desde ambos lados, y mantiene el suelo a una altura visual estable. Es una batalla dedicada: no hay patrullas, jaulas ni cinco tesoros que buscar; se ocultan esos dos indicadores. Los tres primeros recorridos conservan sus rescates.

## Arlequín del Gran Telón

Primer arlequín, de **un solo cono**, con cascabel, traje de rombos rojo y azul petróleo, gola marfil, capa y magia de fuego. Conserva escala **0,72**: la reducción inicial del 20% y la posterior del 10%. Sus ataques normales tienen **24 cuadros en seis secuencias**, redibujados con líneas limpias y tres variantes de deterioro: 72 cuadros contando vestuario, no 72 movimientos distintos. Una hoja de 20 cuadros añade carga, brasas, golpe contra el suelo y caída; dispone de vestuario intermedio y final. La descarga jugable comparte los doce dibujos del choque. Hexy conserva ocho cuadros de caída y recibe doce dibujos de lanzamiento que se usan tanto en el retrato como en su ultimate normal. [Ultimate y choque de poderes vigente](clash.md).

Salud: **720 normal / 480 suave**. Recibe daño durante preparaciones, ataques y recuperaciones; llegada y transformaciones son pausas breves sin daño. Conserva el sonido y parpadeo de impacto. El dash de Hexy no concede inmunidad.

| Fase | Vida restante | Presión |
| --- | --- | --- |
| I | Más del 67% | Abanicos de tres cartas, cintas bajas, acometida y salto entre extremos. |
| II | 67% a 34% | Cartas más rápidas y frecuentes; el salto lanza pares y produce dos cintas al aterrizar. Añade levitación con lluvia de cartas. |
| III | 34% o menos | Traje rasgado, abanicos de cinco, lluvia de siete, saltos con tres cartas, acometida más rápida y menos recuperación. Ultimate ocasional con posibilidad de choque. |

Cada transformación dura 1,8 segundos y retira los proyectiles activos. Una barra discreta muestra los umbrales y la fase. En la segunda y tercera cae un cofre que se abre con un impacto: ambos contienen **Witchy Kiwii, viento**. Las ayudas se renuevan al reintentar sin duplicar objetos ni monedas.

## Ataques

- **Abanico:** muestra las cartas al pecho y estira el brazo; nacen de la mano hacia Hexy y se separan. No persiguen tras soltarse.
- **Cinta rasante:** recoge la cinta, echa el brazo atrás, barre y recupera la postura mediante cuatro dibujos. La cinta roja y dorada sale de la mano y desciende hasta el suelo en 0,24 segundos; se evita saltando.
- **Acometida:** se recoge antes de cruzar la pista a ras del suelo. Puede saltarse y deja fuego bajo temporal sobre su recorrido, con doce dibujos de zancada y capa. Preparación normal 1,2 / 1,1 / 1 segundos; velocidad 690 / 800 / 910 unidades/s por fase.
- **Salto acrobático:** cambia de extremo por un arco visible, dispara desde el aire y aterriza con un golpe. Desde fase II desprende dos cintas en sentidos opuestos al tocar suelo.
- **Lluvia del telón:** desde fase II se eleva en el centro, levanta los brazos y suelta abanicos descendentes con espacios entre cartas. Desciende antes de recuperar. La tercera fase aumenta cantidad y cadencia.
- **Brasas en arco:** desde fase II, prepara una bola de fuego y la lanza con el brazo por encima de la cabeza. Tres brasas en fase II y cuatro en III; siguen trayectorias balísticas hacia posiciones fijadas al soltarlas y se apagan al tocar suelo.
- **Llamaradas del suelo:** levanta el puño, se agacha y golpea la pista con doce dibujos de preparación, contacto y recuperación. Tres focos de fuego en fase II y cinco en III, separados por espacios seguros. Tras el contacto del puño y una pausa de al menos 0,8 s (1,05 s en suave), brotan las llamas tras iluminarse el suelo con calor rojo/naranja. No hay aros ni flechas. Alcanzan 420 unidades, se disipan sin encogerse y dejan fuego bajo durante 3,1 s. No persiguen a Hexy.
- **Gran Final:** sólo en fase III, carga durante 2,8 segundos con Hexy controlable a velocidad reducida y dispara una cinta de energía desde ambas manos. Encore durante esa carga inicia un duelo de pulsaciones. Se puede evitar el disparo sin usar Encore. Recuperación y enfriamiento impiden encadenarlo constantemente; [valores y controles](clash.md).

Gestos y sonidos anticipan el peligro; no hay flechas ni marcas de trayectoria. Los focos del escenario son decoración fija. Al perder por un golpe normal retrocede, cae con impacto, queda tumbado y finalmente se extingue entre fuego y humo antes de la salida de victoria. Si muere por el choque, conserva la caída que ya completó. El reintento restaura vida, fase y posición sin duplicar recompensas.

## Arte y audio

Panorama propio de gradas, telas marfil/burdeos y luces ámbar. Empieza a incendiarse globalmente en fase II y arde con mayor intensidad en III, conservando el encuadre y el centro legible. **El suelo oscuro del centro de la carpa es definitivo**, tanto en campaña como en práctica desde `/arcade`; no requiere el enlace experimental. La textura del suelo acompaña al mundo junto a los pies y conserva perspectiva hacia las gradas. La arquitectura responde al zoom del combate. La madera anterior permanece como recurso histórico. [Perspectiva y decisión del escenario](inferno.md).

**El telón de primer plano está retirado**, a petición del usuario. No se dibuja ni se carga el marco: queda visible el panorama del teatro. `arch.webp` permanece únicamente como fuente histórica.

Arte creado mediante la herramienta integrada `image_gen`, con alfa nativo. Archivos finales:

- `public/arcade/maps/grand-ring/background.webp` y `exterior.webp`.
- `public/arcade/sprites/bosses/harlequin/poses.webp`, `final.webp` y `effects.webp`.
- La ampliación añade `mid.webp`, `ultimate.webp`, `ultimate-portrait.webp`, `ultimate-effects.webp` y `ultimate-beam.webp`. [Prompts y originales de esta ampliación](clash-art.json), [inventario de salidas](clash-assets.json).
- La revisión de animación y choque añade `motion.webp`, `motion-mid.webp`, `motion-final.webp`, `clash-fall.webp`, `clash-portraits.webp` y `clash-effects.webp`; más la caída y los retratos de Hexy. [Prompts exactos vigentes](rework-art.json), [archivos finales](rework-assets.json). Se empaquetan con `scripts/arcade/pack-harlequin-rework.mjs`.
- **Revisión vigente de actuación y fuego:** redibuja las tres hojas `motion*` con cel shading limpio, añade `fire-actions.webp` (20 cuadros) y `super-cast.webp` para cada combatiente (12 cuadros). Actualiza `ui/hexy-clash-full.webp`: dientes apretados, esfuerzo intenso, preocupación extrema y grito ganador; cabello y falda con más viento. [Prompts exactos, originales y registros de empaquetado](fire-acting-art.json). El paso final de empaquetado es `node scripts/arcade/pack-fire-acting.mjs`; aísla cada silueta antes de recortarla para no capturar extremidades vecinas. Las hojas anteriores quedan como fuentes históricas.

[prompts.json](prompts.json) conserva los cinco prompts exactos; [sources.json](sources.json), los originales locales; [assets.json](assets.json), tamaños y salidas. `node scripts/arcade/pack-harlequin-art.mjs` extrae las poses completas por componentes alfa y las coloca en celdas de 512 px con escala y anclajes corporales compartidos. Los WebP finales están en el repositorio; los originales no son necesarios para jugar.

Se conserva la textura de madera del prototipo circense y `ring.ogg` para la aproximación. La batalla usa **`arlequin_fuego.mp3`**, suministrado por el usuario, desde la entrada del jefe. Los sonidos propios de preparación, cartas, fuego, salto, impacto, transición y desaparición usan la mezcla y los controles existentes.

## Comprobación

`tests/hexy-grand-harlequin.spec.js` comprueba entrada, vida, tres fases, vulnerabilidad, daño real, dash, salto, acometidas, lluvia, cámara, derrota, ultimate letal, reintento y alfa. Abre el nivel mediante el menú real en móvil y captura cada fase con el renderizador del juego.

`tests/hexy-effects-mix.spec.js` renderiza los nueve efectos y una mezcla con `OfflineAudioContext`. Se revisan también selección de mundos, progreso, río/organillo, profundidad y barcaza. Capturas y registros: `tests/artifacts/arcade/grand-harlequin/` y `tests/artifacts/harlequin-*.log`, excluidos de Git. La primera partida del usuario está pendiente para ajustar dificultad y duración.

La revisión actual está en [clash.md](clash.md) y [finale.md](finale.md). Incluye el duelo de hasta veinte segundos, sonido de energía sostenido, derrota final, humo del superviviente, caída física de ambos personajes y suministros. Los resultados anteriores describen cada prueba local; el historial de Git registra su integración y publicación posterior.

Revisión vigente de efectos y HUD: [efectos pintados, puntas, polvo, fuego y HUD](painted-effects.md).
