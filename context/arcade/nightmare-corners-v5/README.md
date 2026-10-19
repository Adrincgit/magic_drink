# Choque de pesadillas: esquinas manga y actuación continua

Revisión archivada. [v6](../nightmare-sprites-v6/README.md) sustituye la deformación del dibujo mantenido por ciclos de fotogramas dibujados y añade el duelo individual y la preparación dramática del refuerzo. No volver a ejecutar el exportador de v5 sobre el registro activo de v6.

Revisión local del 18/10/2026. Sustituye la presentación de [v4](../nightmare-pressure-v4/README.md) a partir del montaje de Photoshop del usuario y de su corrección de la dirección del brazo. Conserva la arena abierta, las tres fases, el salto alto, el refuerzo rival, Encore doble, el medidor propio y las reglas de victoria/derrota. No añade salud enemiga al HUD.

## Presentación

Dos paneles triangulares ocupan esquinas opuestas: Hexy abajo y la arlequín arriba. Cada borde negro une dos bordes adyacentes de la pantalla; ninguna raya atraviesa el centro del combate. Los fondos pintados rosa y violeta se desplazan detrás de los personajes, con partículas que recorren cada panel. El brazo y la varita de Hexy sobresalen del panel para mantener legible su gesto de disparo.

Las frases son globos de una o dos líneas, con cola hacia quien habla. Aparecen durante momentos breves: contacto inicial, refuerzo rival, apuro y respuesta con Encore doble. El combate sostenido deja el centro sin rótulo. Se conservan el control de pulsación y el botón de refuerzo reales. El HUD cambia de lado en el choque invertido para dejar libre la cara de la arlequín.

## Coherencia de movimiento

Hexy usa las poses aprobadas de [disparo](sources/hexy-parallel.png), [sorpresa](sources/hexy-shock.png) y [apoyo](sources/hexy-support.png). El brazo apunta más bajo y acompaña la mirada hacia el choque. Se mantienen la cara joven, las proporciones compactas, la posición de la varita y los dos brazos. El apoyo se registra 32 px más abajo respecto a su archivo original para conservar el encuadre de cabeza y pies.

Cada gesto se mantiene: no se alternan ilustraciones distintas a 14 Hz. Una malla continua anima cabello, ropa, mandíbula y tensión de brazos, protegiendo la cara y la dirección del disparo. Los estados de apoyo, esfuerzo y Encore doble comparten la misma ilustración aprobada y cambian su intensidad de movimiento. La arlequín conserva un cuerpo y un encuadre únicos; su reacción final usa solamente la región de ojos generada, sin sustituir silueta, cabeza o manos. La reacción se retiene al alcanzarse para impedir que las oscilaciones del medidor alternen sus expresiones.

Los atlas de juego mantienen celdas repetidas por compatibilidad con los actores; no representan veinte o dieciséis dibujos diferentes. Los retratos usan recortes nativos de las ilustraciones grandes, independientes de los atlas de 320 px del juego. No se amplía un sprite pequeño para el retrato.

## Cámara y suelo

El salto conserva su revelación completa. Al comenzar el choque, la cámara se centra en la colisión; después la sigue y se acerca cuando el frente alcanza a cualquiera de los dos personajes. Un pequeño margen lateral deja espacio al retrato correspondiente. La perspectiva del suelo toma su nueva altura proyectada: su profundidad conserva escala y períodos positivos durante el desplazamiento vertical de la cámara.

## Arte y validación

Se utilizó **ImageGen integrado**. Los originales y máscaras de transparencia quedan en [sources](sources/). Prompts: [iniciales](initial-prompts.json), [dirección paralela](parallel-aim-prompt.json), [sorpresa y apoyo](reaction-prompts.json), [ojos de reacción](boss-face-prompt.json) y [transparencia](alpha-prompts.json). La exportación conserva el color del dibujo aprobado y aplica la transparencia de la limpieza; Sharp recorta, registra y empaqueta, sin repintar anatomía.

La [selección de originales](selection.json) identifica las poses aprobadas, sus máscaras y el dibujo sustituido. La limpieza registra las máscaras con la estrella de la varita, conserva los RGB originales y elimina la neblina de fondo; las zonas físicas del rostro, los brazos y la ropa quedan opacas. El [control de exportación](art-check.json) comprueba muestras opacas, fondo transparente y registro de la estrella; la anatomía se revisa en las capturas reales.

Recursos de ejecución: [public/arcade/act-two/nightmare-corners-v5](../../../public/arcade/act-two/nightmare-corners-v5/). El medidor pintado se conserva desde v4.

```powershell
node scripts/arcade/pack-nightmare-corners.mjs
node scripts/arcade/check-nightmare-corners.mjs
node scripts/arcade/review-nightmare-corners.mjs
node scripts/arcade/review-nightmare-corners.mjs --videos --only=double-reversal,candy-loss
npx playwright test tests/hexy-nightmare-pressure.spec.js tests/hexy-nightmare-aerial.spec.js tests/hexy-episode-two.spec.js tests/hexy-nightmare-madness.spec.js tests/hexy-clash-spectacle.spec.js tests/hexy-encore-repair.spec.js --workers=2 --reporter=line
npm run build
```

Las capturas y grabaciones del renderer real están en [tests/artifacts/arcade/nightmare-corners-v5](../../../tests/artifacts/arcade/nightmare-corners-v5/). Los vídeos se decodifican a hojas de revisión; las capturas de controles vienen de la interfaz real en escritorio y ventana de 780 px. Los resultados finales se registran en [validation.json](validation.json). El arranque controlado y la invulnerabilidad de revisión permiten inspeccionar imagen, movimiento y desenlaces; no sustituyen una valoración humana de dificultad o diversión.

Revisión final: **56 pruebas de regresión aprobadas**, más la repetición de las **9 pruebas de presión y controles** con los atlas definitivos. `npm run build` terminó en `[build] Complete!`, con cero errores y cero advertencias del diagnóstico de Astro (37 sugerencias; se conservan los avisos existentes de Browserslist y tamaño del bundle). El navegador no registró errores ni recursos de arcade ausentes.

Grabaciones finales: [respuesta con Encore doble](../../../tests/artifacts/arcade/nightmare-corners-v5/double-reversal.webm) y [desenlace de derrota](../../../tests/artifacts/arcade/nightmare-corners-v5/candy-loss.webm). Además de las hojas de ambos vídeos, se inspeccionó una [secuencia de 24 muestras cercanas](../../../tests/artifacts/arcade/nightmare-corners-v5/held-motion-playback.jpg), separadas 0,12 segundos, para comprobar continuidad de dibujo y gesto.

Los cambios siguen locales, sin otro commit ni push.
