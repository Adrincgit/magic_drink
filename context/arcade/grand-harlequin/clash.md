# Gran Final y choque de poderes

**Ampliación vigente:** [derrota final, humo del superviviente y sonido sostenido](finale.md), sobre la [recuperación lenta y partículas en retratos](impact-polish.md). El límite solicitado es ahora de 20 segundos; se mantienen cuatro corazones y tres ultimates de daño.

Revisión del 8 de octubre de 2026 para el arlequín del 1-4. Sustituye el duelo corto anterior por un choque sostenido, con actuación de ambos personajes y consecuencias físicas sobre la pista. Los siguientes arlequines todavía no están construidos.

## Animación y tamaño

El arlequín conserva la reducción inicial del 20% y recibe otro **10% de reducción** respecto a esa versión. Dibujo, colisión y manos comparten la escala **0,72** del original.

Los ataques normales usan **24 cuadros**, organizados en seis secuencias de cuatro: espera y capa; preparación/lanzamiento/recuperación de cartas; recogida y barrido de cinta baja; carrera; salto acrobático; y conjuro de lluvia. Las tres hojas se redibujaron con líneas limpias y sombras planas, conservando distinto deterioro: intacto, desgaste intermedio y traje/capa rasgados. Son 72 cuadros contando vestuario, no 72 movimientos diferentes. Una hoja nueva de 20 cuadros reúne cuatro de carga, cuatro de lanzamiento de brasas, cuatro de golpe contra el suelo y ocho de caída/recuperación. La descarga jugable usa los mismos doce dibujos del choque.

La cinta rasante nace de la mano durante el barrido dibujado y desciende hasta el suelo en 0,24 segundos. Ya no aparece por delante de una pose estática de carrera. La carrera cambia de zancada y de capa; el salto alterna recogida, lanzamiento, giro y aterrizaje.

Cada personaje dispone de **ocho cuadros de expulsión, caída y reincorporación**, más doce dibujos de lanzamiento: cuatro expresiones y tres dibujos de viento por expresión. Hexy sostiene la varita con **una sola mano**. Esos dibujos también son su descarga jugable habitual, en cualquier nivel y desde el aire. La varita tiene una salida medida por cuadro. El arlequín también usa sus dibujos de choque durante la descarga real.

Hexy aprieta los dientes en equilibrio; redobla el esfuerzo al bajar del 43% y sólo muestra preocupación por debajo del 18%. Por encima del 55% abre la boca en un grito heroico, sin sonrisa. Una remontada no la hace gritar mientras sigue perdiendo. El arlequín sonríe con una ventaja de 60% frente a 40%, se enfurece durante sus oleadas y se preocupa al estar muy superado. Cabello, falda y capa alternan los tres dibujos a 18 pasos por segundo.

## Carga y respuesta

- Sólo fase III, después de al menos tres ataques normales y prepara su propia separación: salta durante 0,85 segundos hasta el extremo opuesto a Hexy antes de cargar. Enfriamiento inicial: 8 segundos; entre usos: 28 segundos de simulación, además del ataque.
- Desde el comienzo de la carga hay vibración y partículas rojas/negras que convergen desde el perímetro hacia las manos, acompañadas de rumble grave de terremoto. Carga enemiga de 2,8 segundos reales. Oscurece el escenario, presenta al arlequín en el lado que ocupa realmente y reduce el mundo al 34% de velocidad. Hexy sigue controlable.
- Sin respuesta, dispara durante 0,95 segundos hacia la posición fijada al comenzar la carga. Se puede saltar o cambiar de lado. Causa dos corazones mediante las protecciones normales, una vez por descarga. Recuperación: 2,4 segundos.
- Encore durante la carga consume una carga y magia normales, orienta a Hexy hacia el jefe e inicia su preparación de 0,9 segundos. Funciona desde ambos lados y desde el aire. Sigue un avance de rayos de **0,34 segundos**, separado del impacto: sólo al tocarse comienzan las chispas, la presión y el reloj de veinte segundos.
- El arlequín recibe disparos normales durante su carga y descarga. Sólo el duelo compartido suspende el daño ordinario.

## Duelo de pulsaciones

La lucha dura **como máximo 20 segundos**. Puede terminar a partir del segundo 6 si uno de los rayos llega prácticamente al rival. Al agotarse los veinte segundos gana quien haya avanzado más hacia el contrario; un empate exacto favorece a Hexy.

Se pulsa ataque repetidamente: mantenerlo pulsado sólo cuenta una vez. Se limita la frecuencia válida a una pulsación cada 75 ms. En normal, ocho pulsaciones por segundo pueden ganar por empuje antes del límite; siete ganan y seis pierden por distancia al agotar los veinte segundos. El arlequín empuja en cuatro oleadas de 1,45 s que empiezan a los 2,3 / 5,5 / 9,2 / 12,1 s, con descansos para remontar, rumble y mayor vibración. En suave son tres oleadas más débiles de 1,15 s a los 3,1 / 8,2 / 12,4 s. La resistencia se integra por tiempo, comprobada a 30, 60 y 120 Hz.

Durante el forcejeo, los retratos muestran rostro y torso sobre las bandas diagonales, con un desvanecimiento suave que evita un corte rectangular. Cada retrato reserva espacio para el personaje y el recorrido del rayo: puede ocupar la esquina superior o inferior de su lado y reducirse cuando hace falta. Se mantiene la figura completa durante la presentación. El resplandor enemigo tiñe progresivamente al personaje y su retrato cuando pierde terreno: naranja sobre Hexy y rosa/dorado sobre el arlequín. Siete plumas de polvo por combatiente salen detrás de sus zapatos; Hexy sólo levanta polvo si está apoyada en el suelo.

| Resultado | Consecuencia |
| --- | --- |
| Gana Hexy | **192 de daño**, equivalentes a tres Encores completos de 64. El jefe superviviente queda vulnerable durante tres segundos. |
| Pierde Hexy | **Cuatro corazones**, al terminar la caída. Esta penalización no la absorben el escudo, la gracia de impacto ni la sobrecarga. Puede ser letal. |

El centro de contacto sigue físicamente el progreso entre la varita y las manos del arlequín. El medidor y el contador muestran la presión y el tiempo restante.

## Resolución física

Durante 0,35 segundos el poder vencedor atraviesa al perdedor. Después ocurre una explosión local, el personaje sale despedido hasta 620 unidades y describe un arco de 1,1 segundos. Aterriza con polvo dibujado y sonido de impacto. Sigue un segundo de caída/reincorporación. **Si Hexy tenía cuatro corazones o menos, permanece completamente tendida en el cuadro 4 de `clash-fall`**: no pasa al cuadro sentado ni a los de levantarse, y la partida termina en derrota. Sólo se reincorpora si sobrevive con al menos un corazón. El reintento explícito restablece sus animaciones normales.

La cámara abre suavemente para seguir a ambos sin mostrar los límites del mapa ni desplazar artificialmente el suelo. Si Hexy cae en el tramo de acceso puede regresar caminando; no se la teletransporta al borde de la arena. El jefe muerto conserva su pose tendida hasta desaparecer. Reintentar limpia estos estados.

## Presentación y sonido

Los dos retratos permanecen en los costados durante el choque, lanzando sus poderes. Cambian según quién cede terreno o remonta; la resolución ganadora de Hexy fija su grito heroico final hasta empezar a desvanecerse durante la expulsión. El centro queda libre para los rayos. Bandas y figuras intercambian lados según su posición real. Las bandas diagonales llevan estrellas para Hexy y rombos para el arlequín, sin recuadros ni bordes rectos al recortar el torso. La sonrisa del arlequín comienza con 60% frente a 40% (20 puntos de ventaja). Hexy expresa un esfuerzo heroico. Los matices rosa/dorado y rojo/naranja se unen en el contacto, acompañando su avance.

Se combinan coronas de colisión dibujadas, ondas expansivas, vibración acotada, destellos cortos de contacto/explosión y chispas luminosas que salen despedidas. El viento dibuja curvas que nacen en el choque, caen fragmentos de madera a distintas profundidades y el polvo se mantiene anclado al suelo. Caen fragmentos de madera con distinta profundidad, el polvo se ancla al suelo y el viento se curva desde el impacto. Las hojas nuevas incluyen cuatro cuadros de colisión, cuatro de explosión y cuatro de polvo. La colisión se rehízo para eliminar los extremos rectangulares de la versión inicial.

Movimiento reducido desactiva sacudidas, destellos, escombros, viento y ondas expansivas, reduce las partículas y estabiliza dibujos y botón. La presión, las expresiones y las reglas no cambian.

El audio combina ruido grave filtrado y subgraves de terremoto, aire de descarga, rugido sostenido, explosión y golpe contra la pista. No se limita a timbres chiptune. Diez FX propios del ultimate/choque usan el mezclador y el compresor existentes. La música baja durante la carga y el choque; las melodías del nivel no cambian.

## Controles

Encore: **R** o RB/R1. En el duelo: **Z/J**, **X** de Xbox, **□** de PlayStation, **Y** de Switch o el botón táctil **TAP**. El botón caricaturesco se hunde y suelta rápidamente, responde a las pulsaciones y sigue el dispositivo activo. Se retiraron el título obvio del choque y la cápsula estática; la instrucción accesible permanece. Desconectar el mando pausa la partida sin consumir el tiempo.

## Suministros y escenario

Al pasar a las fases II y III cae un cofre cerca de Hexy, una sola vez por fase e intento. Se abre con un impacto y garantiza **Dragon Grape** en la segunda fase y **Sparkle Soda** en la tercera. Si se rompe en el aire, la lata cae desde allí hasta la pista. No entrega monedas. Un reintento restaura estas dos ayudas sin duplicar cofres ni latas del intento anterior.

Se retiró por completo el telón de primer plano solicitado por el usuario. El panorama pintado del teatro queda visible; el antiguo archivo del marco se conserva como fuente histórica y no se carga en el juego.

## Arte y reproducción

Arte creado con la herramienta integrada **image_gen**, con transparencia nativa. [Prompts exactos y originales locales](rework-art.json); [inventario final](rework-assets.json). La hoja final de efectos sustituye al primer resultado de esta revisión.

Archivos nuevos:
- `public/arcade/sprites/bosses/harlequin/motion.webp`, `motion-mid.webp`, `motion-final.webp`.
- En esa misma carpeta: `clash-fall.webp`, `clash-full.webp`, `clash-effects.webp`.
- `public/arcade/sprites/hexy/clash-fall.webp`.
- `public/arcade/sprites/ui/hexy-clash-full.webp`.

`node scripts/arcade/pack-harlequin-rework.mjs` recorta y registra las figuras completas; los efectos conservan proporción y márgenes transparentes. No pinta anatomía ni reconstruye miembros. Los WebP finales están en el repositorio; los originales locales sólo se necesitan para repetir el empaquetado. El [arte previo del ultimate](clash-art.json) sigue documentado por separado.

## Verificación

Las pruebas de `hexy-clash-spectacle`, `hexy-power-clash` y `hexy-grand-harlequin` cubren duración, frecuencia de entrada, resultado por distancia, daño, caída, cámara, regreso a pista, suministro por fase, gestos de lanzamiento, transparencia y controles reales. Se revisan capturas del renderizador de ambas caídas y de las expresiones.

`hexy-effects-mix` renderiza los sonidos reales y la mezcla con `OfflineAudioContext`, verificando señal audible y ausencia de recorte digital. Capturas y WAV: `tests/artifacts/arcade/clash-spectacle/`, `power-clash/` y `effects-mix/`, fuera de Git. La valoración final de dificultad y sensaciones queda pendiente de la partida del usuario.

Resultado: **102 casos distintos comprobados**. La pasada amplia dio 100/102: dos pruebas aún exigían la hoja antigua de poses y el telón eliminado. Se actualizaron para comprobar la animación vigente y la capa de parallax que sigue activa en el quinto prototipo. La pasada final de esos seis casos y los diez del choque dio **16/16**, incluidos ambos sentidos de expulsión y el regreso a la arena. Astro check terminó con cero errores, cero advertencias y 22 sugerencias; la compilación final completó las cinco páginas. La mezcla del choque alcanzó un pico de 0,607 sin recorte digital. Se inspeccionaron las capturas de gestos, expresiones, explosiones, caídas y aterrizajes; no se ha publicado remotamente esta revisión.

Corrección posterior de agarre y derrota: **29 casos del choque comprobados**, con captura de los retratos nuevos y de la pantalla real de derrota. Se comprueba cuadro a cuadro que con 1, 2, 3 o 4 corazones Hexy nunca entra en las poses de recuperación; con 5 sí sobrevive y se levanta. Esta revisión retira todos los checkpoints interiores; la prueba ya no necesita simular una bandera adquirida. Compilación correcta; prompts de ambas iteraciones del retrato conservados en `rework-art.json`.


## Revisión cinematográfica del 8 de octubre

La cámara encuadra a ambos personajes según la distancia, también con posiciones invertidas. La pista se prolonga hasta x=3.480 para dejar espacio a la expulsión del extremo derecho, sin cambiar los límites normales de combate. Un jefe que sobrevive fuera de la arena vuelve con un salto visible después de recuperarse. Perder reinicia en el exterior junto a Missi, sin bandera ni retorno oculto interior.

Los 24 dibujos nuevos se generaron con la herramienta integrada image_gen y se empaquetaron conservando alfa. [Prompts, referencias y originales](cinematic-art.json); empaquetador `scripts/arcade/pack-clash-cinematics.mjs`. La versión anterior se conserva como fuente histórica y ya no se carga en el juego.

Comprobación de esta revisión: 61 casos distintos del encuentro, acceso, secuencia cinematográfica, pulsación y mezcla de audio; compilación Astro sin errores. Capturas de carga, preparación, viaje, contacto y forcejeo en ambas orientaciones: `tests/artifacts/arcade/clash-cinematic/`. Las doce figuras de cada hoja se extraen por sus siluetas alfa y huecos medidos, con anclaje común de pies; no se corta la hoja nativa con una cuadrícula supuesta.
