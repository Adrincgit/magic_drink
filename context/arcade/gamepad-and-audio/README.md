# Mando Xbox y mezcla de audio

Implementación del 5 de octubre de 2026 para **Hexy & the Lost Chorus** (`/arcade`).

## Uso

Conecta un mando reconocido por Windows mediante USB o Bluetooth y pulsa un botón con la página activa. Se usan mandos que el navegador expone con distribución `standard`. En **⚙**, en la pausa y en la tienda se abre un panel ilustrado dentro del marco 16:9 del juego.

| Control Xbox | Acción |
| --- | --- |
| Palanca izquierda o cruceta | Mover, apuntar, agacharse y diagonales |
| A | Saltar; otra pulsación permite el doble salto; sostener al caer permite planear |
| X o RT | Disparo normal sostenido |
| B | Rodar en el suelo / dash en el aire |
| Y | Magia fuerte |
| **LB sostenido** | **Fijar la posición para apuntar sin caminar** |
| **LT sostenido** | **Bloquear con el escudo musical** |
| **RB** | **Ultimate / Encore estelar** |
| View ⧉ | Entrar en la tienda cuando Hexy está junto a ella |
| Menu ☰ | Pausar / continuar |

En menús, palanca/cruceta mueve el foco, **A** elige y **B** vuelve. En un volumen seleccionado, izquierda/derecha cambia el nivel en pasos de cinco. Los botones conservan los costes, tiempos de recuperación y condiciones de las acciones originales.

## Audio

- **Volumen general**, **Música** y **Efectos de sonido**, cada uno de 0 a 100 %.
- Silenciar todo conserva los tres niveles; reactivar recupera esa mezcla.
- Probar sonido y restablecer valores iniciales.
- Guardado local automático en `magic-drink-arcade-audio-v1`; los valores no alteran la partida, las monedas ni los Mods.
- La música se escucha mientras se ajusta. Abrir ajustes durante una partida la pausa; cerrar vuelve a la pausa. Dentro de la tienda se conserva su música.
- El 100 % conserva el nivel anterior del juego. Se mantienen la mezcla más suave de la tienda y la bajada de música durante el súper.
- Si el navegador exige interacción directa para activar el audio, aparece un botón que permite habilitarlo con un clic.

## Integración

`adventureGamepad.js` interpreta el esquema estándar y la navegación del foco. `useAdventureGamepad.js` lee el estado actual en cada frame, mantiene un mando activo y usa una zona muerta de 0,24. El mando aporta una entrada separada del teclado/táctil: soltar una fuente no borra la otra.

Desconectar el mando activo o perder acceso a él pausa la partida y libera sus acciones. Reconectarlo no reanuda por sí solo. Las pulsaciones sostenidas al cambiar de pantalla se ignoran hasta soltarlas, sin bloquear otros controles nuevos. Perder el foco de la ventana también libera la entrada.

`AdventureSettings.jsx` reutiliza el papel, botones pintados y gema existentes. No se sustituyeron recursos gráficos ni música. Los controles mantienen el marco del juego en escritorio, móvil y pantalla completa.

`arcadeAudioSettings.js` valida y guarda preferencias; el audio musical usa el volumen general multiplicado por el de música y por la mezcla de la escena. `audio/sounds.js` aplica general × efectos al nodo de ganancia con una transición breve, conservando el silencio incluso si el contexto todavía no se había creado.

Referencias consultadas: [Gamepad API de MDN](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API) y [distribución estándar W3C](https://w3c.github.io/gamepad/#remapping).

## Verificación

Se comprobaron **42 casos distintos** entre mando/audio, tienda, movimiento, súper, música y el arcade de bunnies:

- [tests-final.log](tests-final.log): 39 de 40. La prueba de compra de un accesorio leía el saldo antes de finalizar su transacción asíncrona. Ahora espera el saldo esperado, sin cambiar la compra.
- [tests-verified.log](tests-verified.log): 15 de 16, incluidos todos los casos de bunnies y los dos nuevos casos de permiso de mando/audio. La prueba restante podía saltarse el dash de 0,34 s por el intervalo creciente del comprobador.
- [tests-dash.log](tests-dash.log): ambas repeticiones pasaron al observar ese estado breve en cada frame. Se verificaron los botones de salto, planeo, dash, magia y el ultimate sin repetirlo al sostener RB.

Los mandos se **simularon en el navegador** mediante la API estándar; no se ha probado un dispositivo físico. Se comprobaron la ganancia real de efectos, el volumen del elemento musical, silencio independiente, persistencia, errores de acceso, desconexión, mezcla con teclado y ausencia de errores de JavaScript.

Capturas revisadas:

- [Audio, escritorio](audio-1440.png) · [Audio, móvil](audio-390.png)
- [Guía del mando](controller-1440.png) · [Guía en móvil](controller-390.png)
- [Ajustes en pantalla completa](fullscreen.png)

La compilación está registrada en [build.log](build.log). Los resultados consolidados están en [verification.json](verification.json). `before/` conserva los archivos anteriores a esta revisión.
