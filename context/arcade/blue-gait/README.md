# Carrera del arlequín azul — 13 octubre 2026

La hoja anterior tenía 16 cuadros con variaciones pequeñas de la misma pisada. Además, una elevación sinusoidal alternaba dibujos de carrera y salto por reloj, incluso cerca de las poses de ataque. La combinación hacía que pareciera deslizarse o saltarse pasos.

## Cambio integrado

- `acrobat-run-fluid.webp`: ocho dibujos con apoyos, rodillas y balanceo de brazos distintos. Sustituye la hoja de carrera anterior en el renderer. Una sola escala, nariz en x=68 y suelas en y=250 registran el ciclo; no se estiran partes del personaje ni se usan deformaciones durante la carrera.
- La fase de carrera sigue la distancia recorrida. Un ciclo ocupa 44 píxeles en el azul normal y 56 en su variante rápida. Al pararse, la animación de pies se detiene; los que salen de una carpa también usan dibujos de carrera.
- Velocidad del azul normal: 66 → 74 píxeles/s. Variante rápida: 100 → 108. El payaso rojo permanece en 40.
- El salto tiene 0,10 s de preparación, vuelo con gravedad y 0,16 s de aterrizaje. El azul normal despega a -300 píxeles/s y la variante rápida a -435; gravedad de 900. Se conserva el atlas de salto que ya estaba en uso.
- El salto conserva su dirección al pasar por el límite de patrulla; gira sobre el terreno después de aterrizar. El ataque espera a que los pies estén apoyados y mantiene los aros originales.

La física está en `actors/enemies/adventureAcrobat.js`; se invoca desde el actualizador de enemigos y sus estados seleccionan los dibujos. No se crean actores adicionales.

## Arte y reproducción

Se usó la habilidad imagegen con la herramienta integrada. Prompts completos en `art-prompts.json`. Referencias de identidad: `acrobat-motion.webp` y `acrobat-rings.webp`. La guía de postura solo se usó como entrada de generación y no se carga en el juego.

`sources/run-painted.png` es la propuesta seleccionada. Los dos borradores que seguían repitiendo la pisada y el borrador con extremidades sin terminar se conservaron como historial; no se usan en ejecución. Empaquetado técnico: `node scripts/arcade/pack-blue-gait.mjs`. Medidas y escala en `run-registration.json`.

## Verificación

`tests/hexy-blue-gait.spec.js` comprueba el ciclo completo durante desplazamiento real, velocidad respecto al rojo, saltos y aterrizajes en pendientes en ambos sentidos, giro después de aterrizar, espera del ataque, inmovilización y salida de carpas. Las regresiones del impulsor y de la tripulación del primer jefe acompañan la revisión.

Grabaciones del renderer de producción en `tests/artifacts/arcade/blue-gait/`: carrera en ambos sentidos, carrera con salto normal y variante rápida. La cámara permanece fija para incluir todo el recorrido; las escenas de carrera aislada posponen el salto para poder revisar las ocho pisadas. Las escenas ágiles conservan los saltos y ataques. `node scripts/arcade/review-blue-gait.mjs` decodifica los vídeos en montajes para inspección visual.

Resultado: 30 pruebas de carrera, impulsor y tripulación del globo aprobadas, más tres regresiones del dibujo y ataque del azul. Las cuatro grabaciones se decodificaron y revisaron visualmente, incluyendo las ocho pisadas en ambos sentidos. Compilación: 0 errores, 0 advertencias y 28 sugerencias. Registros: `validation.log` y `build.log` dentro de la carpeta de evidencia.
