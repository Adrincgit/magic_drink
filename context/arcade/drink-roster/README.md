# Aqua y tres sabores nuevos — 2026-10-10

Continuación: [segunda tanda — Volt Lychee, Honey Mango y Orbit Orange](wave2.md).

Aqua Berry mantiene su disparo normal. Su fuerte (C) ahora abre un chorro continuo de 1,85 segundos, unido a la punta registrada de la varita. Arriba/abajo orientan el arco; Hexy puede caminar lentamente. El agua cae, salpica el suelo y produce vapor al apagar fuego. Esquivar, cubrirse, recibir daño o cambiar de bebida interrumpe el chorro. Cada lanzamiento cuesta una vez 5 disparos y 34,5 de magia; aplica agua por contacto sostenido, con un máximo de 4 dosis por incendio. Un foso grande necesita dos lanzamientos bien dirigidos.

| Sabor | Normal (Z) | Fuerte (C) |
| --- | --- | --- |
| Jelly Cherry | Gelatina con gravedad y hasta tres rebotes en terreno. | Resorte de 5 segundos, tres impulsos compartidos entre Hexy y payasos pequeños. No levanta maquinaria. |
| Prism Peach | Aguja rápida que refleja una vez al tocar terreno. | Prisma inmóvil durante 5,5 segundos: divide un disparo normal que lo cruza en tres, cada uno con 62 % del daño. Los hijos no se vuelven a dividir. |
| Echo Melon | Onda que atraviesa enemigos, se ensancha y pierde potencia con la distancia. | Silueta inmóvil que repite hasta seis tiros normales de los últimos dos segundos, con 65 % del daño. Si no hay historial, emite cuatro ondas. |

Una instalación de cada sabor puede permanecer activa. El eco no vuelve a grabar sus copias ni consume munición adicional. El resorte usa una plataforma real; si se coloca sobre un vacío sin suelo, cae. Entrada a tienda, cambio de sala y reintento limpian las instalaciones. El cargado usa el mismo coste que los otros sabores.

Los tres sabores aparecen progresivamente en el botín de contenedores y como sabores iniciales de tienda: Jelly desde el segundo capítulo, Prism desde el tercero y Echo desde el cuarto. Las latas salen al romper el contenedor. Se conserva la exclusión de Dragon Grape del botín aleatorio del 1-4 y la posibilidad de equiparlo desde la tienda.

## Arte

Generación con la herramienta integrada ImageGen, seis imágenes originales con transparencia. Las latas toman Aqua Berry como referencia de familia. Los prompts completos, los originales preservados y las rutas finales están en [art.json](art.json). `scripts/arcade/pack-drink-roster.mjs` empaqueta las latas a 480 píxeles de alto y los efectos en WebP; los efectos tienen 4 columnas × 3 filas (proyectil, instalación, impacto). No se sustituyó el arte existente.

Archivos finales:

- `public/arcade/sprites/pickups/jelly-cherry.webp`
- `public/arcade/sprites/pickups/prism-peach.webp`
- `public/arcade/sprites/pickups/echo-melon.webp`
- `public/arcade/sprites/effects/jelly-cherry.webp`
- `public/arcade/sprites/effects/prism-peach.webp`
- `public/arcade/sprites/effects/echo-melon.webp`

## Verificación

- `tests/hexy-drink-roster.spec.js`: consumo, cancelación, dosis, rebotes, impulso sin maquinaria, división limitada, repetición fija sin coste extra y botín de contenedores.
- `tests/hexy-drink-motion.spec.js`: escenas con teclado real y render del juego, las cuatro mecánicas, carga de todos los recursos y ausencia de errores del navegador.
- `tests/hexy-aqua-quench.spec.js`: gotas, pendientes, vapor y extinción de arbusto y foso desde el borde seguro.
- `tests/hexy-siege-water.spec.js`: regresión de agua, fuego, recorrido, fortaleza y entrada a carpa.

Capturas y vídeo de las escenas aisladas: `tests/artifacts/drink-roster/`; extinción con vapor: `tests/artifacts/aqua-quench/`. Revisados los fotogramas de animación y las capturas a resolución completa. Estas pruebas no sustituyen una partida completa para ajustar el balance de los tres sabores.
