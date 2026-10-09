# Derrota final y energía sostenida

Revisión solicitada el 8 de octubre de 2026. El usuario amplía el choque a **20 segundos como máximo** para probar la sensación y pide una derrota final con más peso, más humo del superviviente y sonido energético propio.

## Derrota

El último golpe normal ya no cambia inmediatamente al dibujo tumbado ni activa la fanfarria `bossDown`. Una secuencia independiente conserva la música de batalla, con volumen atenuado, hasta que termina:

- Reacción inicial breve y retroceso de hasta 170 unidades. Caída de 1,65 segundos, desde el suelo o desde la altura del golpe, usando los cuatro dibujos de caída existentes.
- Contacto real con el piso: postura tumbada, vibración, explosión a ras de suelo, humo y sonido grave.
- Reposo con hollín; a los 3,25 segundos se extingue en una explosión de fuego mayor con humo amplio y un acento luminoso breve. Movimiento reducido omite ese destello.
- A los 4,9 segundos se concede una sola recompensa, se abren los límites y comienza la salida de Hexy con la música de victoria.

Si el choque ya produjo una caída letal, la extinción comienza desde la postura tumbada. No vuelve a levantarse ni repite el vuelo. La secuencia reaprovecha `fire-actions.webp`; no se afirma haber creado nuevos dibujos.

Al sobrevivir a un choque, el traje pierde un 28% de luminosidad en el primer impacto, acumulable hasta un 40%. Emite pequeñas volutas pintadas de hollín durante diez segundos desde el impacto, incluyendo el vuelo y la recuperación. Los humos suben y conservan su posición en el mundo al moverse el jefe; se apagan gradualmente. El reintento restaura su aspecto y elimina esa emisión.

## Duelo y audio

El máximo de 20 segundos cuenta desde el contacto de los rayos. Se mantiene la resolución anticipada a partir del segundo 6, el empuje por pulsaciones, sus oleadas, el ajuste anterior del 7,5%, el daño y la protección contra mantener pulsado el botón. No se obliga a que todos los duelos duren veinte segundos.

`shared/audio/energyVoice.js` crea una mezcla original en Web Audio: ruido estéreo con turbulencia y crepitación, retumbo grave y resonancia modulada. Fuego y cristal tienen materiales distintos; la presión cambia su peso y las oleadas aumentan aspereza y registro. La panorámica sigue el lado del arlequín. La capa continua acompaña carga, lanzamiento y forcejeo; los acentos llevan ataque rápido y cola de explosión. Encore mantiene sus notas de identidad y suma una descarga con más cuerpo.

La voz sostenida se detiene al terminar, pausar, silenciar o desmontar el juego; al continuar vuelve a sincronizarse con la fase visual. Usa el compresor y los controles existentes de volumen general y efectos. Cada pulsación dispara un acento corto, sin acumular bucles de larga duración.

**Ajuste posterior del sonido:** el usuario percibe el rayo eléctrico y pide distinguir salida, contacto y lucha, además de cortar su sonido al alcanzar al perdedor. Se corrige un fallo real: los estados de vuelo y recuperación caían en la selección del ultimate normal porque `superCinematic` seguía activo. Ahora el choque posee toda su secuencia sonora y esos estados no pueden reactivar un rayo.

La salida tiene un frente de descarga y empuje grave; el primer contacto añade un crujido seco, golpe central y dos reflexiones cortas. La capa continua baja momentáneamente durante esos acentos para que no los tape. Durante el forcejeo aparecen arcos eléctricos breves, con timbres alternados e intervalos irregulares, más próximos en las oleadas. Al abrirse paso hacia el rival se apaga el tono eléctrico sostenido, y al impactar se cortan sus fuentes con una rampa de 40 ms para evitar clics. Quedan la explosión y el aterrizaje; no un bucle eléctrico durante la caída. Esta regla vale al ganar o perder.

Síntesis de los nuevos acentos: `shared/audio/energyTransients.js`, sin grabaciones externas. Se mantienen la duración máxima, las pulsaciones y el daño. La sensación final del timbre sigue requiriendo la audición del usuario.

Referencias del usuario: `Beam Clash (DBZ Sound Effect) - Luiz El Sonidista.mp3` y `Beam Fire (DBZ Sound Effect) - SaneSFX.mp3`, en Downloads. Se decodificaron para analizar dinámica y bandas: el material concentra energía en graves y medios, con textura amplia sostenida. No se copiaron, transformaron ni incorporaron esas grabaciones al juego. La herramienta de esta sesión no admite escuchar directamente el audio; la validación sonora aquí es técnica, y la sensación final requiere la audición del usuario.

## Revisión

Pruebas de derrota, golpe aéreo, daño real, premio único, choque letal sin reincorporación y humo persistente: `tests/hexy-harlequin-finale.spec.js`. Comprueba además en la interfaz real que la música de batalla continúa durante la caída y sólo entonces cambia a victoria.

`tests/hexy-energy-audio.spec.js` renderiza la mezcla real durante todo el duelo, comprueba ausencia de recorte, pausa/continuación y silencio mediante los tres controles. `tests/hexy-clash-spectacle.spec.js` comprueba los veinte segundos y el ganador por distancia desde ambos lados a 30, 60 y 120 Hz.

`tests/hexy-energy-transitions.spec.js` reproduce el corte con la simulación real, despacha los mismos eventos y actualiza el audio en el mismo orden que la interfaz. Antes del arreglo comprobó un pico de 0,458 del rayo durante el vuelo; después exige silencio de la capa sostenida durante vuelo y recuperación, aun con el ultimate visual activo. Verifica también el orden de salida/contacto/impacto, los arcos limitados al forcejeo y la presencia de ataques audibles sobre el sonido continuo. Mezcla WAV y registros en `tests/artifacts/arcade/energy-transitions/`, excluidos de Git.

Artefactos de revisión locales, excluidos de Git, en `tests/artifacts/arcade/finale/`: vídeo `ordinary-defeat.webm`, doce cuadros decodificados en `defeat-motion.jpg`, capturas de hollín con movimiento normal/reducido, informe técnico de referencias y mezcla original `original-energy-duel.wav`. Se revisaron visualmente el movimiento de caída, el impacto, el reposo, la explosión final y el humo del superviviente.

Resultado de esta revisión: **81 casos distintos aprobados** entre nueve archivos de pruebas, tras actualizar expectativas antiguas de derrota instantánea y ajustar la comprobación de silencio para esperar a que termine la cola de aterrizaje. Incluye controles reales de teclado, mando y táctil. La mezcla nueva alcanza un pico de 0,672, sin recorte digital, y queda en silencio al terminar sus colas. Compilación Astro completada correctamente; se conservan las sugerencias existentes del proyecto.

Ideas propuestas, todavía sin implementar: grietas luminosas en el cristal al ceder terreno y una pausa sonora muy breve antes del impacto final. Deben reforzar el resultado sin ocultar a los personajes ni ocupar el centro con UI.
