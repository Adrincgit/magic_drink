# Sonido de Encore y mezcla de efectos

La invocación combina siete campanillas ascendentes y un soplo filtrado que crece hasta la descarga. El rayo entra con un acorde resonante y cada uno de sus ocho impactos tiene un pulso grave con destellos cristalinos. Los eventos existentes `superCharge`, `superCast` y `superPulse` sincronizan el sonido con la ilustración y el combate. Las voces se sintetizan localmente con Web Audio; no hay descargas adicionales.

`shared/audio/encoreSound.js` contiene el hechizo. `shared/audio/effectsBus.js` eleva todos los FX antes de un compresor que reduce los picos al coincidir disparos, impactos y explosiones. Los controles de volumen general, efectos y silencio actúan después de la compresión. La música mantiene su control independiente y la atenuación que ya tenía durante el ultimate.

Validación: seis pruebas distintas de audio aprobadas. Tres renderizan el grafo real con `OfflineAudioContext`: los disparos y el salto de la muestra aumentaron 10,8 dB RMS frente a la mezcla anterior; el ataque usa los eventos emitidos por la simulación; una ráfaga con explosiones simultáneas quedó por debajo de 0,9 de amplitud máxima. Los valores cero y silencio producen una salida nula. Las otras tres comprueban valores iniciales y controles reales de la interfaz a 390 y 1440 píxeles, incluyendo persistencia e independencia entre música y efectos.

Pruebas: `tests/hexy-effects-mix.spec.js`, casos de mezclador en `tests/hexy-gamepad-audio.spec.js` y valores iniciales en `tests/hexy-shop-navigation.spec.js`. Las muestras `encore.wav`, `combat.wav` y las mediciones se guardan en `tests/artifacts/arcade/effects-mix`, excluido de Git. La compilación de producción terminó con 0 errores, 0 advertencias y 18 sugerencias del proyecto.
