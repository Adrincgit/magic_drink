# Escala, vegetación y mirador — 10 de octubre de 2026

Esta revisión responde al rechazo del panorama magnificado, los árboles desproporcionados, el suelo inicial sin hierba y las capas cercanas que parecían flotar. Sustituye la composición de la revisión anterior; sus capturas no representan el resultado actual.

## Composición

- Panoramas nuevos de bosque sano y quemado, con árboles más pequeños y profundidad pintada. Se conservan sus proporciones y se dibujan a 1.320 unidades de ancho. El borde inferior continúa detrás del suelo de la arena, también con zoom 0,5. Repetición con solapamiento suave de 100 unidades, sin árboles reflejados.
- Árboles decorativos de 250–294 unidades, antes 420–508. Sus raíces se calculan en coordenadas del terreno y llevan vegetación baja con bordes suavizados. Los árboles transitables conservan el tamaño necesario para sus ramas.
- Suelo inicial con hierba y sendero. Más seco de 4.200 a 10.700; carbonización gradual hasta 28.000. Las máscaras se calculan por posición del mundo, sin saltos entre piezas.
- Retiradas las franjas y matas pegadas a cámara. Los elementos plantados se desplazan con el terreno; el bosque distante, humo y brasas usan velocidades menores, sin depender del salto, la altura de cámara o el zoom del fuerte.
- El bosque se abre entre 7.900 y 10.600. La cima muestra el valle del incendio; el dosel vuelve gradualmente entre 14.500 y 17.900. No hay árboles decorativos tapando el mirador entre 9.000 y 15.500.
- Cinco bandadas recurrentes en la vista de la cima, con más de 25 siluetas legibles durante todo el ciclo. Vuelan a la izquierda y su altura no sigue a Hexy.
- Columnas de humo, humo extendido y niebla baja; hasta 115 brasas de fondo y 32 delante del mundo. El modo de movimiento reducido conserva menor densidad.

## Contacto de fuego

`igniteEmberFromAttack` se ejecuta para ataques de Hexy y enemigos. Usa la trayectoria recorrida por cada proyectil y las áreas existentes de llamarada, explosión y fuego de suelo. Permite incendiar al ascender, sin esperar a la caída. La propagación desde fuego nuevo espera 0,65 s. Los ataques apagados, el agua, las estrellas y los cuadros finales de humo no encienden arbustos.

## Evidencia

- `tests/hexy-forest-vista.spec.js`: 25 casos, incluidos disparos reales de Dragon Grape, ciclos completos de los cuatro enemigos de fuego, casos negativos, bandadas, capturas y recorrido grabado.
- `tests/hexy-stable-forest.spec.js`: cuatro comprobaciones de raíces, fondo, cámara del fuerte y traslación idéntica del suelo trasero/delantero.
- 72 regresiones del bosque, recuperación, pozos, ramas, combate, burbujas, fortaleza y animaciones. Las cuatro de estabilidad están incluidas también en este grupo.
- Capturas del render real, vídeo de movimiento por tramos, hoja de fotogramas y traza de cámara en `tests/artifacts/arcade/forest-vista/`. El vídeo incluye avance y retroceso al inicio, apertura del mirador, descenso, ignición con Dragon Grape y aproximación/retirada del fuerte. No es una partida completa de las 36.000 unidades.
- Registros: `regressions.log`, `final-tests.log`, `build.log`. Las pruebas numéricas acompañan la inspección visual; no equivalen a una aprobación subjetiva del usuario.

Arte integrado: [fuentes y salidas](vista-art.json), [prompts](vista-prompts.json). Empaquetado reproducible en `scripts/arcade/pack-forest-vista.mjs`.
