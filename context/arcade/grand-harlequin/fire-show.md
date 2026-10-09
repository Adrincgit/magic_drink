# Carrera, impactos y entrada de fuego · 8 de octubre de 2026

Revisión solicitada por el usuario para reforzar la identidad de fuego del arlequín del primer acto.

Registro histórico. La [revisión de incendio y pista ampliada](inferno.md) actualiza la preparación de la carrera, el golpe, las columnas, el fondo y la música.

- La barra de salud mantiene el marco ilustrado y un relleno limpio. La textura animada del rayo sólo se utiliza en el medidor del choque.
- Los impactos de proyectiles contra Hexy, el escudo, un ataque cargado o el suelo usan ocho dibujos de explosión naranja, brasas y humo oscuro. Los aterrizajes acrobáticos también usan ese efecto. En la revisión posterior, transformaciones y despedida usan también fuego; el confeti queda reservado para otro arlequín.
- La embestida tiene doce poses nuevas de zancada y capa, con tres variantes de desgaste: 36 dibujos. La velocidad normal es 690 / 800 / 910 unidades por segundo, un 15% menos en suave. La animación avanza con la distancia recorrida.
- Cada 68 unidades deja fuego bajo detrás de los pies. Dura 2,1 segundos; comienza a dañar a los 120 ms y deja de hacerlo durante los últimos 450 ms. Se puede saltar. Se apaga perdiendo intensidad y soltando brasas, sin encogerse.
- **Cambio expreso respecto de la revisión anterior:** antes de las columnas se ilumina y calienta la madera con ocho dibujos pintados. No hay aros, flechas ni retículas. El aviso central dura 0,8 segundos, o 1,05 en suave; los siguientes focos se escalonan a 0,19 segundos. El fuego causa daño sólo cuando ha brotado y se ha formado. Los objetivos quedan fijados al soltar el ataque.
- Entrada de 4,5 segundos con doce dibujos: caída acrobática y giro, aterrizaje, compresión, incorporación, presentación del cristal y provocación. El impacto ocurre a los 1,6 segundos, con explosión, humo, brasas y vibración. No hay cuerda dibujada ni pose sentada. La introducción no causa daño.
- Tres efectos de audio adicionales: presagio grave de entrada, aterrizaje y explosión de fuego. Utilizan el volumen y la compresión de la mezcla del juego.

## Arte

Creado con la herramienta integrada `image_gen.imagegen` y alfa nativo. [Prompts exactos, originales y registro por cuadro](fire-show-art.json).

- `public/arcade/sprites/bosses/harlequin/sprint.webp`, `sprint-mid.webp`, `sprint-final.webp` y `arrival.webp`: cuatro hojas de 12 dibujos.
- `public/arcade/sprites/effects/painted-duel/fire-show.webp`: 8 dibujos de explosión, 8 de fuego bajo y 8 de calentamiento de madera.

Empaquetado: `node scripts/arcade/pack-fire-show.mjs`. Aísla las siluetas de los personajes, conserva una escala común por secuencia y registra los pies al mismo nivel. El código de empaquetado no redibuja el arte.

## Historia abierta

La idea de las piedras elementales capturadas, con una estrella amarilla dentro, está registrada en [DISENO_DEL_JUEGO.md](../DISENO_DEL_JUEGO.md). Su función de estabilizar la Tierra procede de la propuesta del usuario. La relación exacta con Hexy, los captores, los elementos y el cristal del arlequín siguen abiertos.

Como posible hilo de los actos, cada captura podría desequilibrar su región y cada carpa podría contener una prisión distinta para su cristal. Esto es una propuesta, todavía no canon definitivo ni una misión implementada.

## Verificación

`tests/hexy-fire-show.spec.js` verifica barra, impactos, velocidad, fuego persistente desde ambos lados, daño y extinción, calentamiento previo, aterrizaje único y registro de los sprites. Captura la entrada, carrera y columnas mediante el renderizador real, además de un vídeo que avanza según el tiempo real del navegador.

Resultado: **47 pruebas aprobadas** entre esta revisión, combate, efectos pintados, actuación de fuego, recuperación y mezcla de audio. Compilación Astro completa con **0 errores y 0 advertencias del comprobador**; conserva 22 sugerencias existentes. Se inspeccionaron las capturas y 16 cuadros decodificados del vídeo real para verificar el aterrizaje, la zancada, el fuego sobre la madera y las columnas.

Capturas, vídeo y registros locales: `tests/artifacts/arcade/fire-show/`, excluidos de Git. `motion-review.webm` muestra la secuencia y `video-contact-sheet.jpg` reúne los cuadros inspeccionados.
