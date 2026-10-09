# Incendio de la carpa y pista ampliada · 8 de octubre de 2026

Revisión vigente del 1-4, solicitada por el usuario. Mantiene el arlequín de un cono y escala 0,72, los tres estados del traje y la identidad de fuego. El reintento sigue fuera, junto a Missi.

## Pista y cámara

La arena pasa de 1.400 a **2.840 unidades**, desde x=700 hasta x=3.540; el mapa completo mide 4.560. El jefe aparece tras la caminata, en x=2.760. El combate habitual usa posiciones separadas de las paredes por 780 unidades para reservar suelo al lanzamiento del perdedor del choque.

Los límites físicos están marcados por **muros de fuego animado** que se alzan más que un salto doble. Se apoyan en el mismo suelo oscuro que los personajes, en ambos extremos reales de la arena. No son postes ni un marco delante del escenario. Desaparecen al vencer al jefe. La cámara abre el encuadre durante la ruptura del choque, antes de la expulsión, y mantiene a ambos luchadores y el suelo dentro de la pantalla.

La expulsión recorre hasta **880 unidades en 1,3 segundos**, con un empuje inicial fuerte y un arco de 210 unidades. Se limita antes del muro para que la caída ocurra dentro de la pista. Conserva la incorporación lenta de quien sobrevive y la derrota tendida de quien agota sus corazones.

## Fases e incendio

- Fase I: panorama original intacto.
- Fase II: empiezan a arder las gradas y los bordes de las telas; el arlequín adquiere un aura de calor y brasas ascendentes.
- Fase III: el incendio alcanza más tela superior y gradas, con bordes carbonizados y mayor intensidad de brasas.

**El panorama global cambia.** Las dos variantes comparten tamaño, encuadre y transformación de parallax con el fondo original. Se mezclan durante 1,4 segundos en cada transición, sin mover la arquitectura. Al reintentar vuelve el fondo intacto.

**Corrección posterior del usuario:** se retiran las columnas decorativas añadidas al fondo y las tiras verticales de fuego pintadas sobre los pilares. Las variantes `v2` sitúan el incendio en los pliegues y bordes de las telas y sobre las gradas. La animación de resplandor y convección usa los propios píxeles cálidos del incendio pintado, conservando el registro de la arquitectura. Hay brasas ascendentes detrás y otras **cayendo delante de los luchadores**, a distintas velocidades y tamaños. Movimiento reducido conserva el panorama estático y reduce las brasas.

## Prueba de suelo oscuro

**Decisión posterior del usuario: el suelo oscuro queda definitivo.** El 1-4 usa el centro pintado de la carpa en el flujo normal de `/arcade`, tanto al continuar desde el 1-3 como al seleccionar el capítulo o practicar. Comienza fuera, junto a Missi, y se entra caminando. Se retira la selección y el arranque automático por `circus-floor`: los enlaces de comparación antiguos abren el título normal sin alterar el progreso. La madera se conserva como recurso histórico y para comparaciones internas del renderizador, pero no es el terreno habitual. Las capturas de la prueba anterior permanecen en `tests/artifacts/arcade/inferno/`.

**Corrección de perspectiva:** ocultar las tablas sin ajustar el panorama hacía que los personajes parecieran flotar; el suelo pintado se desplazaba como un fondo lejano. La vista oscura coloca ahora el apoyo de los pies en y=476 del encuadre de 960×540 y centra la carpa sobre la arena, con la escala de arquitectura afinada tras la prueba inicial. El suelo se proyecta por filas usando su propia textura pintada: junto a los pies sigue exactamente la velocidad de la cámara, y cerca de las gradas se desplaza más lentamente. El fondo responde al zoom del combate. Se refuerzan las sombras de contacto y se retiran de esta vista los conos geométricos de iluminación, aprovechando la luz pintada del panorama. Personajes, columnas, rayos, polvo y caída usan la misma cámara de renderizado; la arena física y sus distancias siguen siendo las mismas. El encuadre se revisa corriendo, acercándose al jefe, alejándose, saltando y durante la expulsión del choque. Este es el encuadre aprobado para el escenario definitivo.

## Actuación y dificultad

**Ajuste de escala y caos, revisión posterior del usuario:** en el suelo oscuro el apoyo de los personajes sube de y=496 a **y=476**, dejando más margen bajo sus pies. La altura de la arquitectura pasa de `max(680,1000 × zoom)` a `max(590,760 × zoom)`: se aprecia más circo a la misma distancia, conservando el suelo y las sombras que acompañan el movimiento. Se conserva este ajuste al convertirlo en el escenario definitivo.

Desde fase II caen ocasionalmente **fragmentos de telón ardiendo**. Su posición se fija al desprenderse, caen por gravedad y se pueden esquivar sin indicadores añadidos. Al tocar la pista quedan brevemente como tela quemándose y se desintegran en humo, ceniza y brasas durante 1,2 segundos. La fase III acorta el intervalo entre desprendimientos. No sustituyen las brasas decorativas que ya cruzan el primer plano.

El aura usa ocho dibujos nuevos de fuego con centro transparente. Se deforma y deja chispas hacia atrás según la velocidad y dirección real de la embestida, y vuelve gradualmente a su forma vertical al detenerse. La carrera alcanza **870 / 1.015 / 1.160 unidades por segundo** en las tres fases y se acerca más a los extremos, dejando una estela que exige saltar y sostener el planeo para esperar a que se enfríe.

**Corrección de continuidad de las columnas:** su base comienza a arder desde la erupción, como un fuego independiente en el mismo punto. Cuando desaparece la columna alta no se reinicia su animación ni aparece un segundo fuego después de una pausa; la base conserva su edad y permanece otros 3,1 segundos. El calentamiento previo sigue siendo inocuo.

Se añaden **24 dibujos por vestuario**: doce preparaciones consecutivas de embestida y doce del golpe al suelo, con capa cambiante. Hay 72 celdas nuevas contando las tres variantes, no 72 acciones diferentes. El puño llega al piso antes de la explosión y del calentamiento de las columnas. La preparación de la carrera recorre las doce poses sin sostener una imagen estática.

Las columnas alcanzan **420 unidades**. Conservan el calentamiento natural rojo/naranja del suelo, la pausa de 0,8 segundos en normal y 1,05 en suave, y la separación de los focos; no tienen aros, flechas ni indicadores geométricos. Su base arde desde la erupción y continúa en la misma posición durante **3,1 segundos** después de disiparse la columna. Ese fuego se puede saltar y se desvanece con brasas, sin encogerse.

Los abanicos avanzan a 335 / 383 / 431 unidades por segundo; las descargas y la lluvia se vuelven más frecuentes y las recuperaciones más cortas por fase. Las brasas balísticas son tres en fase II y cuatro en III. La dificultad se comprobará también con partidas del usuario.

Las transiciones y la desaparición final usan explosiones de fuego y humo oscuro. El antiguo confeti verde queda reservado como recurso para otro arlequín. La barra de salud conserva relleno limpio.

## Hexy y choque

**Iluminación y descarga sin contraataque, revisión posterior:** proyectiles, columnas, bases, aura, explosiones y rayos proyectan resplandor cálido sobre el suelo. La luz sigue sus posiciones reales, pierde alcance cuando el proyectil se aleja del piso y se apaga con el efecto. Durante el choque, el tramo de Hexy ilumina en rosa/dorado y el del arlequín en naranja. Las puntas pintadas y el punto de contacto recuperan una corona luminosa. Los muros laterales tienen una base ancha de llamas sobre la misma línea de apoyo, además de reflejo en la pista. No se añaden marcadores de futuros ataques.

Desde fase II, la estela de la carrera nace con llamas altas inmediatamente detrás del arlequín. Cada foco disminuye gradualmente durante sus 2,1 segundos de vida: también baja su altura de colisión para que el daño corresponda a la llama visible. Esta reducción solo se aplica a la estela de carrera; la base de una columna conserva su tamaño mientras la columna se disipa.

El ultimate sin contraataque tiene avance visible de 0,28 segundos, punta de fuego luminosa, partículas y fuego sobre el piso que ya recorrió. La dirección se fija al cargar: Hexy puede saltar o ponerse detrás del lanzador. Un rayo bajo termina al golpear el suelo y uno alto no incendia carriles lejanos debajo de él. El final de la descarga genera explosión y humo; un impacto sobre Hexy también produce explosión grande, humo y empuje. Si el golpe es mortal, el rayo continúa avanzando durante la caída lenta y se disipa antes de cerrar la derrota. El fuego residual permanece 3,1 segundos desde que nace.

El choque conserva las oleadas enemigas, el máximo vigente de veinte segundos y el mínimo de seis para su resolución por empuje. **Cada pulsación aporta un 7,5% más de fuerza**: 0,0215 en normal y 0,02795 en suave. Se mantienen el límite de una pulsación cada 75 ms y la obligación de soltar y pulsar; sostener el botón no suma repeticiones. Una cadencia sostenida de ocho pulsaciones por segundo puede llevar el rayo hasta el rival antes del límite; una cadencia menor aún puede decidirse por la distancia final. El arlequín también puede resolver por empuje antes de los veinte segundos.

La carga de Encore atrae notas, estrellas y chispas desde el encuadre hasta la **punta medida de la varita**, tanto en el aire como mirando a cualquier lado. El botón ilustrado del choque reproduce sus ocho cuadros en 0,22 segundos, con compresión y rebote; su zona táctil permanece estable. Movimiento reducido elimina esa sacudida.

El impacto del choque usa una explosión mayor y humo amplio. Un arlequín que sobrevive queda chamuscado y emite hollín además del desgaste de fase. Ambos cofres de cambio de fase contienen **Witchy Kiwii, viento**. El duelo vigente admite veinte segundos, cuatro corazones de daño al perder y 192 de daño al ganar. [Derrota y nueva mezcla de energía](finale.md).

## Música y recursos

La batalla usa la grabación suministrada por el usuario, `public/arcade/music/for replace/arlequin_fuego.mp3`, copiada sin recodificar a `public/arcade/music/bosses/arlequin_fuego.mp3`. La entrada del jefe inicia ese tema en bucle; la aproximación mantiene `ring.ogg`. Volumen, silencio, pausas y jingles usan los controles existentes.

Se elimina el límite fijo del **48%** que reducía la música incluso con volumen general y música al máximo. Con ambos al 100%, la reproducción normal usa ahora volumen **1,0**, sin recodificar ni amplificar el MP3 por encima del original. Se conservan los controles independientes y reducciones breves durante cargas y escenas.

Arte creado con la herramienta integrada **`image_gen.imagegen`**, con alfa nativo para sprites. [Prompts exactos, originales y registro](inferno-art.json).

La revisión de caos añade `public/arcade/sprites/effects/painted-duel/circus-chaos.webp`: **24 cuadros pintados**, ocho de tela cayendo, ocho de desintegración y ocho de aura. [Prompt exacto, original y registro de estas secuencias](chaos-art.json). El empaquetador `scripts/arcade/pack-circus-chaos.mjs` conserva el alfa y una escala común durante la desintegración, para que las cenizas no crezcan al encuadrarlas.

- `public/arcade/sprites/bosses/harlequin/inferno.webp`, `inferno-mid.webp`, `inferno-final.webp`: 24 celdas de 512 px por hoja.
- `public/arcade/sprites/effects/painted-duel/inferno-scene.webp`: fuego de madera y aura animados. Sus cuatro bocetos iniciales de postes no se usan; el usuario eligió muros de fuego.
- `public/arcade/maps/grand-ring/background-burning-v2.webp` y `background-inferno-v2.webp`: panoramas vigentes de 2.172 × 724 px. Las variantes anteriores permanecen como originales de comparación, sin cargarse en el juego.

El empaquetador `scripts/arcade/pack-inferno-acting.mjs` recorta siluetas por alfa y registra los pies, sin redibujar. Los panoramas se convierten mecánicamente a WebP y conservan las dimensiones originales.

## Verificación

**Integración del suelo definitivo:** 33 pruebas diferentes aprobadas entre acceso, perspectiva y choque. El menú normal abre el 1-4 con suelo oscuro en aventura de escritorio, aventura de móvil y práctica. Se conserva el progreso anterior y la recogida normal de estrellas; los enlaces retirados no arrancan partidas ni recuperan por su cuenta una sesión interrumpida. Se revisan capturas de ambos tamaños, movimiento, zoom, salto y expulsión. Los controles reales de teclado, mando y táctil siguen pasando. Compilación correcta: 0 errores y 0 advertencias del comprobador, con 22 sugerencias existentes. Capturas del acceso habitual: `tests/artifacts/arcade/inferno/normal-dark-1280-adventure.jpg` y `normal-dark-390-adventure.jpg`.

`tests/hexy-inferno.spec.js` verifica extinción y daño del fuego restante, doce poses de preparación, contacto del puño previo a las columnas, presión creciente, ayudas de viento, muros junto a los límites físicos, convergencia en la varita, chamuscado, expulsión en ambos sentidos, encuadre, registro de los panoramas, transición y restauración al reintentar. Incluye capturas y un vídeo del renderizador real en `tests/artifacts/arcade/inferno/`, excluidos de Git.

Se revisan además los controles reales de teclado, mando y pantalla táctil, el choque, la caída, los ataques y el cambio de música al llegar al jefe. Se comprueban tanto el acceso habitual mediante el menú como los enlaces directos de práctica; las capturas cubren ambas opciones de suelo y los tres estados del incendio. Se comprueba que el fuego del panorama cambia en movimiento, que el telón central conserva el registro y que la opción de movimiento reducido permanece estable. Los resultados finales de esta ejecución se documentan al completar la comprobación.

Resultado final: **44 pruebas aprobadas** en incendio, acceso, mundos y choque, incluida la reproducción y decodificación del nuevo MP3. La revisión más amplia anterior aprobó 83 pruebas y detectó dos fallos de estabilidad del área táctil, corregidos moviendo la animación al dibujo interior; ambos controles reales volvieron a pasar. Compilación Astro con **0 errores y 0 advertencias del comprobador**, y 22 sugerencias existentes. Se revisaron capturas de ambas superficies y vídeos del renderizador real.

Histórico de la prueba de acceso directo, ahora retirada: comprobadas **22 pruebas** de acceso al circo, inicio habitual y enlace de comparación. En esa revisión, el enlace de suelo oscuro iniciaba el 1-4 en escritorio y móvil; el de madera hacía lo mismo para comparar. Se verificaron una campaña todavía bloqueada, la recuperación de una sesión interrumpida, la conservación de monedas y progreso, y la salida al título sin reinicio automático. Captura de aquella prueba: `tests/artifacts/arcade/inferno/direct-dark-floor.jpg`. Compilación correcta, con 0 errores y 0 advertencias del comprobador.

Corrección de perspectiva: comprobadas **18 pruebas** de suelo, acceso directo e incendio. La textura a la altura de los pies acompaña exactamente el desplazamiento de la cámara; el encuadre conserva el apoyo al acercarse, alejarse y saltar. Se capturan las tres fases, un choque real y la expulsión posterior. Revisión en movimiento: `tests/artifacts/arcade/inferno/perspective/running-and-zoom.webm`; capturas en la misma carpeta. Compilación correcta, con 0 errores y 0 advertencias del comprobador y las 22 sugerencias existentes.

`wood-and-dark-comparison.jpg` muestra la misma fase, cámara y posiciones: madera a la izquierda y suelo oscuro a la derecha. `motion-review.webm` muestra las nuevas preparaciones y la carga; `clash-flight-review.webm`, la expulsión y caída de ambos luchadores sobre el suelo oscuro. Las hojas de contacto reúnen dieciséis cuadros decodificados de cada vídeo.

Afinación de escala, caos y volumen: **50 pruebas diferentes aprobadas** entre perspectiva, acceso de escritorio y móvil, controles y audio, fuego, recuperación y el nuevo caos. La primera ejecución detectó una comparación que suponía el mismo orden de creación de las bases; se corrigió para verificar sus posiciones, ya que ahora nacen con las erupciones escalonadas. Las 18 pruebas de incendio y caos volvieron a pasar tras el ajuste final del aura y la caída. Se verifica continuidad del fuego, daño y esquiva de la tela, desintegración y limpieza al reintentar, y salto doble con planeo que aterriza después de enfriarse la estela. Compilación correcta: **0 errores, 0 advertencias del comprobador y 22 sugerencias existentes**.

Revisión visual vigente: `tests/artifacts/arcade/chaos/fire-chaos.webm`, sus doce cuadros decodificados en `motion-contact.jpg`, capturas de aura en ambas direcciones, sala cercana/lejana, caída, cenizas y columnas con base simultánea. Se comprobó además la entrada real desde Missi y la reproducción de `arlequin_fuego.mp3` con volumen **1,0**, sin silencio, activa y con datos decodificados; evidencia en `battle-audio.json` y `real-battle.jpg`, en esa misma carpeta excluida de Git.

La revisión de iluminación y ultimate comprueba **49 pruebas aprobadas** de fuego, caos, choque, derrota, controles reales de teclado/mando/táctil y renderizado. Incluye fuego de carrera con altura decreciente, luz que sigue a un proyectil, reducción de movimiento sin parpadeo, avance del rayo y estela sin adelantarse a la punta, impactos mortales y supervivencia. Se verifica la resolución por empuje a 30, 60 y 120 Hz, desde ambos lados, con pulsación rápida o ausencia de respuesta. Capturas y vídeo de la descarga en `tests/artifacts/arcade/inferno-light/`.

Se revisaron doce cuadros decodificados de `solo-fire-review.webm`, reunidos en `motion-contact.jpg`: punta luminosa, avance, piso que arde detrás, esquiva aérea, explosión final, humo y extinción. Compilación Astro completada correctamente después de estas pruebas; se conservan las sugerencias existentes del proyecto.
